# Slotly

Multi-tenant SaaS онлайн-записи для малого бизнеса (салоны, СТО, стоматологии). Pet project для перехода
из Angular-фронтенда в Full Stack, поэтому важны чистая архитектура, тесты и решения, которые можно
объяснить на собеседовании.

Роли: OWNER (настраивает бизнес, мастеров, услуги, видит аналитику), STAFF (своё расписание),
CLIENT (записывается без регистрации, отменяет и переносит по ссылке с подписанным токеном).

## Стек

- pnpm workspaces: `apps/api` (NestJS 12), `apps/web` (React 19, Vite, TanStack Query), `packages/shared` (Zod-схемы и типы DTO)
- PostgreSQL 16 + Prisma 7, Redis + BullMQ, Docker Compose, GitHub Actions
- Планируется по мере необходимости: React Hook Form и shadcn/ui (этап 1), BullMQ (этап 5)

Команды запуска описаны в README.

## Этапы

0. Каркас (сделан)
1. Auth, бизнесы, роли и guards
2. Каталог услуг и мастеров
3. Расчёт слотов и бронирование
4. Публичная страница записи
5. Уведомления (BullMQ + Telegram)
6. Кабинет владельца с календарём и аналитикой
7. Деплой

## Соглашения

- **Модули:** весь код на ESM. В импортах `apps/api` и `packages/shared` нужно расширение `.js`.
- **Контракт API:** схемы запросов и ответов живут в `packages/shared`, web и api используют одни и те же.
- **Env:** валидируется Zod-схемой в `apps/api/src/config/env.ts`. Новую переменную добавлять туда и в `.env.example`.
- **Тенанты:** у каждой таблицы есть `businessId`, кроме глобальной `User`. Каждый запрос фильтруется по нему.
- **Время:** в БД `timestamptz` в UTC, у бизнеса свой `timezone`. Исключение: `WorkingHours.start/end` хранят локальное время бизнеса.
- **Деньги:** только `Decimal(10,2)`. `Booking.price` фиксирует цену на момент записи.
- **Цена и длительность мастера:** `staffService.price ?? service.price`, так же для `durationMin`.
- **Схема БД:** колонки и таблицы в snake_case через `@map`/`@@map`.
- **Миграции:** ограничения, которых Prisma не умеет описывать (`EXCLUDE`, `CHECK`), пишутся SQL-миграцией через `prisma migrate dev --create-only`. Применённые миграции не редактируются.
- **Тесты:** Vitest. Ограничения БД проверяются на реальном Postgres, а не на моках.

## Подводные камни

- Postgres проброшен на порт 5433: на 5432 на машине разработчика работает системный PostgreSQL.
- Prisma закреплена на точной версии 7.10.1: тег `latest` в npm указывает на `8.0.0-rc`.
- TypeScript остаётся на 6.0: `typescript-eslint` пока не поддерживает 7.x.
- `packages/shared` импортируется из `dist`, поэтому перед тестами и dev нужна его сборка. Корневые `pnpm dev` и `pnpm test` делают её сами.
- Клиент Prisma генерируется в `apps/api/src/generated` (в `.gitignore`) на postinstall. После правки схемы запускать `prisma generate` или `migrate dev`.
- pnpm 11 блокирует build-скрипты зависимостей: разрешённые перечислены в `allowBuilds` в `pnpm-workspace.yaml`.
