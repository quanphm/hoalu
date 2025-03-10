-- Custom SQL migration file, put your code below! --
INSERT INTO "fx_rate" (
  "from_currency",
  "to_currency",
  "exchange_rate",
  "inverse_rate",
  "valid_from",
  "valid_to"
) VALUES
  ('USD', 'USD', 1.000000, 1.000000, '1990-01-01', '2999-01-01'),
  ('USD', 'VND', 25505.000000, 0.000039, CURRENT_DATE, CURRENT_DATE + INTERVAL '5 days'),
  ('USD', 'SGD', 1.328900, 0.751340, CURRENT_DATE, CURRENT_DATE + INTERVAL '5 days')
ON CONFLICT DO NOTHING;
