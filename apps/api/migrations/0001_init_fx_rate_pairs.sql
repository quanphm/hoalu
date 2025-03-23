INSERT INTO "fx_rate" (
  "from_currency",
  "to_currency",
  "exchange_rate",
  "inverse_rate",
  "valid_from",
  "valid_to"
) VALUES
  ('USD', 'USD', 1, 1, '1990-01-01', '2999-01-01'),
  ('USD', 'EUR', 0.9247, 1.08144, CURRENT_DATE, CURRENT_DATE + INTERVAL '5 days'),
  ('USD', 'VND', 25605, 0.000039, CURRENT_DATE, CURRENT_DATE + INTERVAL '5 days'),
  ('USD', 'SGD', 1.3361, 0.748391, CURRENT_DATE, CURRENT_DATE + INTERVAL '5 days')
ON CONFLICT DO NOTHING;
