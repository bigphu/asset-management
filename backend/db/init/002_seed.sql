-- Seed reference data tối thiểu để test filter/export.
-- Chạy tự động một lần khi container Postgres khởi tạo volume lần đầu.

INSERT INTO locations (code, name) VALUES
  ('HQ', 'Trụ sở chính'),
  ('KHO-A', 'Kho A'),
  ('VP-2', 'Văn phòng 2');

INSERT INTO asset_categories (code, name) VALUES
  ('LAPTOP', 'Máy tính xách tay'),
  ('MONITOR', 'Màn hình'),
  ('PRINTER', 'Máy in');
