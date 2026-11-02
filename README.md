# Slotly

Multi-tenant SaaS онлайн-записи для малого бизнеса: салоны, СТО, стоматологии.

**Стек:** pnpm workspaces, NestJS, React + Vite, PostgreSQL 16 + Prisma, Redis, Docker Compose, GitHub Actions.

## Требования

- Node.js 24+
- pnpm 11 (`corepack enable`)
- Docker

## Запуск

```bash
cp .env.example .env
```

```bash
pnpm install
```

```bash
pnpm db:up
```

```bash
pnpm db:migrate
```

```bash
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:3000/api/health

Postgres проброшен на порт **5433**, чтобы не конфликтовать с локально установленным сервером.

## Команды

| Команда           | Что делает                                      |
| ----------------- | ----------------------------------------------- |
| `pnpm dev`        | запускает shared, API и web в режиме watch      |
| `pnpm db:up`      | поднимает Postgres и Redis и ждёт их готовности |
| `pnpm db:migrate` | применяет и создаёт миграции (`migrate dev`)    |
| `pnpm lint`       | ESLint и проверка форматирования Prettier       |
| `pnpm format`     | форматирует код через Prettier                  |
| `pnpm test`       | все тесты, нужна запущенная БД с миграциями     |
| `pnpm build`      | сборка всех пакетов                             |

## Структура

- `apps/api` — NestJS API, Prisma-схема и миграции
- `apps/web` — React-приложение
- `packages/shared` — общие Zod-схемы и типы DTO

## Защита от двойного бронирования

Пересечения записей к одному мастеру запрещены на уровне БД через `EXCLUDE USING gist`
(см. миграцию `booking_no_overlap`), поэтому гарантия держится и при гонке параллельных запросов,
когда проверка в коде приложения не помогла бы. Поведение проверяется на реальной БД в
`apps/api/test/booking-overlap.spec.ts`.
