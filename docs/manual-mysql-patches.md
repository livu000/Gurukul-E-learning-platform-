# Gurukul Manual MySQL Patch Runbook

This project now treats MySQL as a manually managed external dependency.
Do not recreate the removed `Database/` folder as a source of truth.

Run these statements manually in MySQL before deploying the matching backend code.
Apply them in a non-production environment first and take a backup before touching live data.

## 1. Course table alignment

```sql
ALTER TABLE courses
  MODIFY COLUMN status ENUM('draft', 'review', 'published') NOT NULL DEFAULT 'draft';

ALTER TABLE courses
  ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER teacher_id,
  ADD COLUMN is_paid TINYINT(1) NOT NULL DEFAULT 0 AFTER price;

UPDATE courses
SET price = COALESCE(price, 0),
    is_paid = CASE WHEN COALESCE(price, 0) > 0 THEN 1 ELSE 0 END;
```

## 2. Enrollment table

```sql
CREATE TABLE IF NOT EXISTS enrollments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  enrolled_at DATETIME NULL,
  UNIQUE KEY uq_enrollments_user_course (user_id, course_id),
  KEY idx_enrollments_course (course_id),
  KEY idx_enrollments_status (status)
);
```

## 3. Refresh tokens

```sql
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_refresh_tokens_user (user_id),
  KEY idx_refresh_tokens_expires_at (expires_at)
);
```

## 4. Payments and transactions

```sql
CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  status ENUM('pending', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  payment_provider VARCHAR(50) NULL,
  provider_order_id VARCHAR(255) NULL,
  provider_payment_id VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_payments_user (user_id),
  KEY idx_payments_course (course_id),
  KEY idx_payments_status (status),
  UNIQUE KEY uq_payments_provider_payment_id (provider_payment_id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  payment_id BIGINT UNSIGNED NOT NULL,
  gateway_response JSON NULL,
  status VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_transactions_payment (payment_id)
);

CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  payment_id BIGINT UNSIGNED NOT NULL,
  invoice_number VARCHAR(100) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  issued_at DATETIME NULL,
  UNIQUE KEY uq_invoices_payment (payment_id),
  UNIQUE KEY uq_invoices_number (invoice_number)
);
```

## 5. Audit logs

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  role VARCHAR(50) NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) NULL,
  entity_id BIGINT UNSIGNED NULL,
  old_data JSON NULL,
  new_data JSON NULL,
  ip_address VARCHAR(100) NULL,
  user_agent TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_logs_user (user_id),
  KEY idx_audit_logs_entity (entity_type, entity_id),
  KEY idx_audit_logs_created_at (created_at)
);
```

## 6. Assignment grading safety

```sql
ALTER TABLE assignment_grades
  ADD COLUMN graded_at DATETIME NULL;

CREATE UNIQUE INDEX uq_assignment_grades_submission
  ON assignment_grades (submission_id);
```

## 7. Verification checklist

Run these checks after patching:

```sql
SHOW COLUMNS FROM courses;
SHOW TABLES LIKE 'enrollments';
SHOW TABLES LIKE 'refresh_tokens';
SHOW TABLES LIKE 'payments';
SHOW TABLES LIKE 'transactions';
SHOW TABLES LIKE 'invoices';
SHOW TABLES LIKE 'audit_logs';

SELECT status, COUNT(*) FROM courses GROUP BY status;
SELECT COUNT(*) AS enrollments_count FROM enrollments;
SELECT COUNT(*) AS payments_count FROM payments;
SELECT COUNT(*) AS refresh_token_count FROM refresh_tokens;
```

## 8. Application smoke checks

After applying the SQL and deploying the code:

1. Log in and refresh the token. Confirm the returned access token preserves the real user role.
2. Create a free course and a paid course. Confirm the paid course stores `price` and `is_paid`.
3. Enroll a student in a free course and verify duplicate enrollment is blocked.
4. Create and verify a payment for a paid course. Confirm enrollment and invoice creation.
5. Open teacher dashboard, student dashboard, and admin dashboard.
6. Issue and download a certificate for a fully completed course.
