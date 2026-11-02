import { existsSync } from 'node:fs';
import { PrismaPg } from '@prisma/adapter-pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { BookingStatus, PrismaClient } from '../src/generated/prisma/client.js';

if (existsSync('../../.env')) process.loadEnvFile('../../.env');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const at = (time: string) => new Date(`2030-01-15T${time}:00Z`);

describe('bookings_no_overlap constraint', () => {
  let businessId: string;
  let staffId: string;
  let otherStaffId: string;
  let serviceId: string;
  let customerId: string;

  const book = (
    startsAt: Date,
    endsAt: Date,
    status: BookingStatus = 'CONFIRMED',
    staff = staffId,
  ) =>
    prisma.booking.create({
      data: {
        businessId,
        staffId: staff,
        serviceId,
        customerId,
        startsAt,
        endsAt,
        status,
        price: '100.00',
        cancelToken: crypto.randomUUID(),
      },
    });

  beforeAll(async () => {
    const business = await prisma.business.create({
      data: {
        name: 'Test',
        slug: `test-${crypto.randomUUID()}`,
        timezone: 'Europe/Kyiv',
        address: 'Khreshchatyk 1, Kyiv',
        phone: '+380501234567',
      },
    });
    businessId = business.id;
    const [staff, otherStaff, service, customer] = await Promise.all([
      prisma.staff.create({ data: { businessId, name: 'A' } }),
      prisma.staff.create({ data: { businessId, name: 'B' } }),
      prisma.service.create({
        data: { businessId, name: 'Cut', durationMin: 60, price: '100.00' },
      }),
      prisma.customer.create({ data: { businessId, name: 'C', phone: '+380670000000' } }),
    ]);
    staffId = staff.id;
    otherStaffId = otherStaff.id;
    serviceId = service.id;
    customerId = customer.id;
  });

  afterEach(() => prisma.booking.deleteMany({ where: { businessId } }));

  afterAll(async () => {
    await prisma.customer.deleteMany({ where: { businessId } });
    await prisma.service.deleteMany({ where: { businessId } });
    await prisma.staff.deleteMany({ where: { businessId } });
    await prisma.business.delete({ where: { id: businessId } });
    await prisma.$disconnect();
  });

  it('rejects an overlapping booking for the same staff', async () => {
    await book(at('10:00'), at('11:00'));
    await expect(book(at('10:30'), at('11:30'))).rejects.toThrow(/bookings_no_overlap|23P01/);
    expect(await prisma.booking.count({ where: { businessId } })).toBe(1);
  });

  it('lets only one of two concurrent overlapping bookings through', async () => {
    const results = await Promise.allSettled([
      book(at('10:00'), at('11:00')),
      book(at('10:00'), at('11:00')),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
  });

  it('treats a PENDING booking as occupying the slot', async () => {
    await book(at('10:00'), at('11:00'), 'PENDING');
    await expect(book(at('10:30'), at('11:30'))).rejects.toThrow(/bookings_no_overlap|23P01/);
  });

  it('allows a booking that starts exactly when the previous one ends', async () => {
    await book(at('10:00'), at('11:00'));
    await expect(book(at('11:00'), at('12:00'))).resolves.toBeDefined();
  });

  it('allows the same time for a different staff', async () => {
    await book(at('10:00'), at('11:00'));
    await expect(book(at('10:00'), at('11:00'), 'CONFIRMED', otherStaffId)).resolves.toBeDefined();
  });

  it('does not count a cancelled booking', async () => {
    await book(at('10:00'), at('11:00'), 'CANCELLED');
    await expect(book(at('10:00'), at('11:00'))).resolves.toBeDefined();
  });

  it('rejects a zero-length booking', async () => {
    await expect(book(at('10:00'), at('10:00'))).rejects.toThrow(
      /bookings_ends_after_starts|23514/,
    );
  });
});
