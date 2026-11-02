-- btree_gist позволяет использовать `=` по uuid внутри GiST-индекса вместе с `&&` по диапазону
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Пустой диапазон ни с чем не пересекается, поэтому бронь нулевой длины обошла бы EXCLUDE
ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_ends_after_starts" CHECK (ends_at > starts_at);

-- Защита от двойного бронирования на уровне БД, в том числе при гонке параллельных запросов.
-- tstzrange по умолчанию [): запись, которая начинается в момент окончания другой, разрешена.
ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_no_overlap"
  EXCLUDE USING gist (staff_id WITH =, tstzrange(starts_at, ends_at) WITH &&)
  WHERE (status IN ('PENDING', 'CONFIRMED'));
