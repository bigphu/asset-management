-- SQL dump generated using DBML (dbml.dbdiagram.io)
-- Database: PostgreSQL
-- Generated at: 2026-09-20T07:26:14.529Z

CREATE TYPE "account_status" AS ENUM (
  'active',
  'temporarily_locked',
  'disabled',
  'password_reset_required'
);

CREATE TYPE "asset_lifecycle_status" AS ENUM (
  'draft',
  'active',
  'retired',
  'disposed'
);

CREATE TABLE "fw_users" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "email" varchar(320) UNIQUE NOT NULL,
  "display_name" varchar(255) NOT NULL,
  "status" account_status NOT NULL DEFAULT 'active',
  "password_hash" varchar(512) NOT NULL,
  "password_changed_at" timestamptz NOT NULL DEFAULT (now()),
  "token_version" integer NOT NULL DEFAULT 1,
  "failed_login_count" integer NOT NULL DEFAULT 0,
  "locked_until" timestamptz,
  "last_login_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "fw_roles" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" uuid NOT NULL,
  "description" varchar(255),
  "permissions" text[] NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "locations" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "code" varchar(32) UNIQUE NOT NULL,
  "name" varchar(255) NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "asset_categories" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "code" varchar(32) UNIQUE NOT NULL,
  "name" varchar(255) NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "assets" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "asset_tag" varchar(64) UNIQUE NOT NULL,
  "name" varchar(255) NOT NULL,
  "category_id" uuid NOT NULL,
  "lifecycle_status" asset_lifecycle_status NOT NULL DEFAULT 'active',
  "purchase_date" date,
  "location_id" uuid,
  "notes" text,
  "deleted_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "created_by_user_id" uuid,
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_by_user_id" uuid
);

CREATE TABLE "asset_loans" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "asset_id" uuid NOT NULL,
  "borrower_name" varchar(255) NOT NULL,
  "borrowed_at" timestamptz NOT NULL DEFAULT (now()),
  "due_at" timestamptz,
  "returned_at" timestamptz,
  "note" text,
  "created_by_user_id" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "asset_events" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "asset_id" uuid NOT NULL,
  "event_type" varchar(32) NOT NULL,
  "occurred_at" timestamptz NOT NULL DEFAULT (now()),
  "actor_user_id" uuid,
  "description" text NOT NULL,
  "details" jsonb
);

CREATE TABLE "export_profiles" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "owner_user_id" uuid NOT NULL,
  "name" varchar(100) NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  "deleted_at" timestamptz
);

CREATE TABLE "export_profile_columns" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "profile_id" uuid NOT NULL,
  "field_key" varchar(64) NOT NULL,
  "ordinal" integer NOT NULL,
  "header_label" varchar(255),
  "date_format" varchar(64),
  "number_format" varchar(64)
);

CREATE INDEX ON "fw_users" ("status");

CREATE INDEX ON "fw_roles" ("user_id");

CREATE INDEX ON "fw_roles" ("user_id", "is_active");

CREATE INDEX ON "locations" ("is_active");

CREATE INDEX ON "locations" ("name");

CREATE INDEX ON "asset_categories" ("is_active");

CREATE INDEX ON "asset_categories" ("name");

CREATE INDEX ON "assets" ("lifecycle_status");

CREATE INDEX ON "assets" ("category_id");

CREATE INDEX ON "assets" ("location_id");

CREATE INDEX ON "assets" ("purchase_date");

CREATE INDEX ON "assets" ("deleted_at");

CREATE INDEX ON "assets" ("name");

CREATE INDEX ON "asset_loans" ("asset_id");

CREATE INDEX ON "asset_loans" ("returned_at");

CREATE INDEX ON "asset_loans" ("due_at");

CREATE INDEX ON "asset_loans" ("asset_id", "returned_at");

CREATE INDEX ON "asset_events" ("asset_id", "occurred_at");

CREATE INDEX ON "asset_events" ("event_type");

CREATE INDEX ON "asset_events" ("actor_user_id");

CREATE UNIQUE INDEX ON "export_profiles" ("owner_user_id", "name");

CREATE INDEX ON "export_profiles" ("owner_user_id");

CREATE UNIQUE INDEX ON "export_profile_columns" ("profile_id", "ordinal");

CREATE INDEX ON "export_profile_columns" ("field_key");

COMMENT ON TABLE "fw_users" IS 'Không public self-registration. Admin tạo account với mật khẩu tạm và
status password_reset_required; user bắt buộc đổi ở lần login đầu.
JWT stateless: mọi request kiểm tra token_version; đổi password/disable
tăng token_version nên token cũ hết hiệu lực (thay cho session store).
Disable account giữ nguyên lịch sử thao tác (không xóa user).
Admin không đọc được password; role nằm ở fw_roles.
';

COMMENT ON COLUMN "fw_users"."email" IS 'Sign-in identifier. Case-insensitive cần citext hoặc unique index lower(email).';

COMMENT ON COLUMN "fw_users"."password_hash" IS 'Salted adaptive one-way hash. Không bao giờ plaintext, không log.';

COMMENT ON COLUMN "fw_users"."token_version" IS 'Nhúng vào JWT claim. Tăng khi đổi password, disable account hoặc đổi role → token cũ bị vô hiệu.';

COMMENT ON COLUMN "fw_users"."locked_until" IS 'Temporary lock; threshold/duration là câu hỏi mở.';

COMMENT ON TABLE "fw_roles" IS 'RBAC đơn giản: role gắn trực tiếp per-user, permission là array.
Không có bảng permissions/role_permissions/user_roles, không có scope.
Effective permissions = union array của các row is_active = true.
Permission code hợp lệ kiểm tra ở app (constant list).
Default templates (System Administrator, Asset Manager, Read-only Reporter)
là hằng số trong code khi tạo row, không phải bảng.
';

COMMENT ON COLUMN "fw_roles"."user_id" IS 'Role gán trực tiếp cho user; một user có thể có nhiều row.';

COMMENT ON COLUMN "fw_roles"."permissions" IS 'Array permission code, ví dụ {assets.view, assets.create, exports.run}.';

COMMENT ON TABLE "locations" IS 'Reference data: đã dùng thì deactivate (is_active = false), không xóa, để filter/report/history giữ nguyên nghĩa.';

COMMENT ON TABLE "asset_categories" IS 'Thay cho assets.type text. Category-specific attributes vẫn là mở rộng sau.';

COMMENT ON TABLE "assets" IS 'Sáu field S-01: asset_tag, name, category (type), status (→ lifecycle_status),
purchase_date, location.
Tag không sửa được để bảo đảm no-reuse; nếu sau này cần đổi tag thì thêm
bảng tag history/registry.
Soft delete (ADR-0002): không hard-delete, không giải phóng tag; mọi read
path (list, export, duplicate-tag check) phải lọc deleted_at IS NULL.
Concurrency (ADR-0004 tentative): LWW, không có cột version.
Search tag/name dùng pg_trgm GIN (DBML không biểu diễn).
';

COMMENT ON COLUMN "assets"."asset_tag" IS 'Immutable sau khi tạo → không tái sử dụng tag, kể cả sau soft delete.';

COMMENT ON COLUMN "assets"."category_id" IS 'FK asset_categories; thay cho type text.';

COMMENT ON COLUMN "assets"."lifecycle_status" IS 'Vocabulary Gate 1. condition/availability tách riêng sẽ thêm khi mở rộng.';

COMMENT ON COLUMN "assets"."purchase_date" IS 'Date-only, không timezone. Nullable.';

COMMENT ON COLUMN "assets"."location_id" IS 'FK locations; thay cho location text.';

COMMENT ON COLUMN "assets"."deleted_at" IS 'Soft delete theo ADR-0002: NULL = active; list/export lọc deleted_at IS NULL. Restore = set NULL.';

COMMENT ON TABLE "asset_loans" IS 'Mượn/trả đơn giản: mỗi row là một lần cho mượn.
Đang mượn = returned_at IS NULL. Overdue = due_at < now() AND returned_at IS NULL.
Một asset tối đa một row đang mượn: partial unique (asset_id)
WHERE returned_at IS NULL — DBML không biểu diễn được.
';

COMMENT ON COLUMN "asset_loans"."borrower_name" IS 'Người mượn; có thể không có user account.';

COMMENT ON COLUMN "asset_loans"."due_at" IS 'Hạn trả dự kiến; null nếu không hẹn.';

COMMENT ON COLUMN "asset_loans"."returned_at" IS 'NULL = đang mượn.';

COMMENT ON COLUMN "asset_loans"."created_by_user_id" IS 'User ghi nhận giao dịch.';

COMMENT ON TABLE "asset_events" IS 'Lịch sử/audit của asset, append-only (không UPDATE/DELETE).
Không audit authentication/RBAC.
';

COMMENT ON COLUMN "asset_events"."event_type" IS 'created | updated | borrowed | returned | deleted | restored';

COMMENT ON COLUMN "asset_events"."actor_user_id" IS 'Ai thực hiện; null cho system.';

COMMENT ON COLUMN "asset_events"."description" IS 'Mô tả ngắn; mốc thời gian và người liên quan nằm ở cột riêng, không nhét vào đây.';

COMMENT ON COLUMN "asset_events"."details" IS 'Dữ liệu có cấu trúc: before/after khi updated, loan_id khi borrowed/returned.';

COMMENT ON TABLE "export_profiles" IS 'Private theo user, không share. One-time override khi export không tự update profile trừ khi user save. Profile không mở rộng quyền xem dữ liệu.';

COMMENT ON COLUMN "export_profiles"."deleted_at" IS 'Private config; hard delete cũng chấp nhận được.';

COMMENT ON COLUMN "export_profile_columns"."field_key" IS 'asset_tag | name | category | lifecycle_status | purchase_date | location; validate ở app.';

COMMENT ON COLUMN "export_profile_columns"."header_label" IS 'Null = dùng label mặc định.';

COMMENT ON COLUMN "export_profile_columns"."number_format" IS 'Number formatting cần xác nhận có thuộc MVP không.';

ALTER TABLE "fw_roles" ADD FOREIGN KEY ("user_id") REFERENCES "fw_users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "assets" ADD FOREIGN KEY ("category_id") REFERENCES "asset_categories" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "assets" ADD FOREIGN KEY ("location_id") REFERENCES "locations" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "assets" ADD FOREIGN KEY ("created_by_user_id") REFERENCES "fw_users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "assets" ADD FOREIGN KEY ("updated_by_user_id") REFERENCES "fw_users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "asset_loans" ADD FOREIGN KEY ("asset_id") REFERENCES "assets" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "asset_loans" ADD FOREIGN KEY ("created_by_user_id") REFERENCES "fw_users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "asset_events" ADD FOREIGN KEY ("asset_id") REFERENCES "assets" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "asset_events" ADD FOREIGN KEY ("actor_user_id") REFERENCES "fw_users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "export_profiles" ADD FOREIGN KEY ("owner_user_id") REFERENCES "fw_users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "export_profile_columns" ADD FOREIGN KEY ("profile_id") REFERENCES "export_profiles" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
