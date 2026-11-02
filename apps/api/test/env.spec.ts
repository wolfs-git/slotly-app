import { describe, expect, it } from 'vitest';
import { validateEnv } from '../src/config/env.js';

describe('validateEnv', () => {
  it('applies defaults and coerces PORT', () => {
    const env = validateEnv({ DATABASE_URL: 'postgresql://u:p@localhost:5432/db', PORT: '4000' });
    expect(env).toMatchObject({ PORT: 4000, NODE_ENV: 'development' });
  });

  it('rejects missing DATABASE_URL', () => {
    expect(() => validateEnv({})).toThrow();
  });
});
