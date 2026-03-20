# Gurukul System Requirements

Generated from the provided requirements on 2026-03-20.

## Database Update

- Previous DB: `elearnindb`
- Current DB: `gurukul_db`

## Platform Scope

Roles:

- `admin`
- `teacher`
- `student`

Core capabilities:

- Secure auth with role-based access
- Course lifecycle: create -> review -> approve -> publish
- Structured curriculum: course -> module -> lesson
- Quiz and assignment workflows
- Free and paid enrollments
- Progress tracking and resume learning
- Certificates, billing, session security, and audit logs

## Database Blueprint

All tables use `BIGINT UNSIGNED` primary/foreign keys, `InnoDB`, `utf8mb4`, and support app-layer validation with Sequelize-friendly string fields instead of DB enums.

### Tables and intent

1. `users`
   - Core auth and identity table
   - Important fields: `name`, `email`, `password`, `role`, `status`, `profile_image`, `bio`, `phone`, `last_login_at`, `deleted_at`
   - Role values: `admin`, `teacher`, `student`
   - Status supports block/unblock and active lifecycle

2. `courses`
   - Teacher-owned course with admin approval workflow
   - Important fields: `teacher_id`, `title`, `subtitle`, `description`, `status`, `approval_status`, `approved_by`, `approved_at`, `rejection_reason`, `price`, `is_paid`, `currency`, `category`, `level`, `language`, `thumbnail_url`, `total_duration_minutes`, `avg_rating`, `rating_count`, `enroll_count`, `deleted_at`
   - Workflow values:
     - `status`: `draft`, `review`, `published`, `rejected`
     - `approval_status`: `pending`, `approved`, `rejected`
   - Search: full-text on `title`, `subtitle`, `description`

3. `modules`
   - Course sections with drag-and-drop order
   - Important fields: `course_id`, `title`, `description`, `sort_order`, `is_published`, `total_duration_minutes`, `lesson_count`, `deleted_at`

4. `lessons`
   - Delivery layer for learning content
   - Important fields: `module_id`, `title`, `description`, `content`, `video_url`, `attachment_url`, `lesson_type`, `duration_minutes`, `is_preview`, `sort_order`, `is_published`, `video_provider`, `video_duration_seconds`, `deleted_at`
   - Lesson types: `video`, `text`, `file`, future `live`

5. `quizzes`
   - Course-level assessments
   - Important fields: `course_id`, `created_by`, `title`, `description`, `time_limit_minutes`, `total_marks`, `passing_marks`, `max_attempts`, `allow_retake`, `shuffle_questions`, `show_results_immediately`, `is_published`, `available_from`, `available_to`, `deleted_at`

6. `quiz_questions`
   - Important fields: `quiz_id`, `question_text`, `question_type`, `correct_text_answer`, `explanation`, `marks`, `sort_order`, `is_required`, `deleted_at`
   - Types: `mcq`, `true_false`, `short_answer`

7. `quiz_options`
   - Important fields: `question_id`, `option_text`, `is_correct`, `sort_order`, `deleted_at`
   - Supports single-correct and multi-correct options

8. `assignments`
   - Practical evaluation entry point
   - Important fields: `course_id`, `created_by`, `title`, `description`, `instructions`, `allow_text_submission`, `allow_file_submission`, `max_file_size_mb`, `max_marks`, `passing_marks`, `due_date`, `late_submission_allowed`, `late_penalty_percent`, `max_attempts`, `is_published`, `deleted_at`

9. `assignment_submissions`
   - Important fields: `assignment_id`, `student_id`, `attempt_number`, `answer_text`, `file_url`, `status`, `submitted_at`, `is_late`, `marks_awarded`, `graded_at`
   - Statuses: `submitted`, `late`, `graded`, `resubmitted`

10. `assignment_grades`
   - Important fields: `submission_id`, `graded_by`, `marks_awarded`, `feedback`, `rubric_json`, `status`, `graded_at`, `last_updated_at`, `version`, `deleted_at`
   - One active grade per submission

11. `payments`
   - Important fields: `user_id`, `course_id`, `amount`, `currency`, `payment_provider`, `provider_order_id`, `provider_payment_id`, `status`, `transaction_ref`, `refunded_at`
   - Statuses: `pending`, `success`, `failed`, `refunded`

12. `transactions`
   - Raw gateway/webhook logging
   - Important fields: `payment_id`, `provider`, `event_type`, `provider_order_id`, `provider_payment_id`, `provider_event_id`, `request_payload`, `response_payload`, `status`, `error_message`, `error_code`, `is_processed`, `processed_at`

13. `invoices`
   - GST-ready billing document
   - Important fields: `payment_id`, `user_id`, `course_id`, `invoice_number`, `invoice_date`, `billing_name`, `billing_email`, `billing_address`, `billing_state`, `billing_country`, `billing_pincode`, `gst_number`, `is_gst_applied`, `base_amount`, `gst_rate`, `gst_amount`, `total_amount`, `currency`, `invoice_url`, `status`

14. `enrollments`
   - Course access, progress, and certificate linkage
   - Important fields: `user_id`, `course_id`, `is_paid`, `payment_id`, `status`, `progress_percentage`, `last_accessed_lesson_id`, `completed_at`, `certificate_issued`, `enrolled_at`, `deleted_at`
   - Statuses: `active`, `completed`, `cancelled`, `refunded`

15. `lesson_progress`
   - Per-lesson resume and completion tracking
   - Important fields: `user_id`, `course_id`, `lesson_id`, `last_watched_second`, `total_watched_seconds`, `is_completed`, `completed_at`, `last_accessed_at`
16. `quiz_attempts`
   - Important fields: `quiz_id`, `student_id`, `attempt_number`, `status`, `started_at`, `submitted_at`, `time_spent_seconds`, `score`, `total_marks`, `is_passed`, `evaluated_at`
   - Statuses: `in_progress`, `submitted`, `evaluated`, `expired`

17. `quiz_answers`
   - Important fields: `attempt_id`, `question_id`, `selected_option_id`, `answer_text`, `is_correct`, `marks_awarded`, `answered_at`

18. `certificates`
   - Important fields: `certificate_uid`, `user_id`, `course_id`, `enrollment_id`, `issued_at`, `certificate_url`, `verification_code`, `is_valid`, `user_name_snapshot`, `course_title_snapshot`

19. `refresh_tokens`
   - Important fields: `user_id`, `token_hash`, `device_info`, `ip_address`, `user_agent`, `expires_at`, `revoked_at`, `replaced_by_token_hash`
   - Store only token hashes, never raw tokens

20. `audit_logs`
   - Important fields: `user_id`, `role`, `action`, `entity_type`, `entity_id`, `old_data`, `new_data`, `ip_address`, `user_agent`, `status`, `created_at`
   - Supports admin, teacher, student, and system-level logs

## Table Creation Order

1. `users`
2. `courses`
3. `modules`
4. `lessons`
5. `quizzes`
6. `quiz_questions`
7. `quiz_options`
8. `assignments`
9. `assignment_submissions`
10. `assignment_grades`
11. `payments`
12. `transactions`
13. `invoices`
14. `enrollments`
15. `lesson_progress`
16. `quiz_attempts`
17. `quiz_answers`
18. `certificates`
19. `refresh_tokens`
20. `audit_logs`

## Functional Requirements

### Admin

- Secure login with authorized credentials
- Admin dashboard for platform governance
- User management
- Course review and approval
- Publish approved courses
- Monitor certificates and completion records
- View platform analytics

### Teacher

- Secure login with assigned credentials
- Teacher dashboard
- Create free and paid courses
- Add modules and lessons
- Create quizzes and assignments
- Submit courses for admin review
- Grade student submissions with feedback

### Student

- Secure login with registered credentials
- Student dashboard
- Browse published courses
- View curriculum and modules
- Learn lessons and mark them complete
- Attempt quizzes
- Submit assignments
- Track progress
- Download certificates after completion
- Enroll in paid courses

## UX and Product Blueprint

### UX principles

- Minimal cognitive load
- Progressive disclosure
- Consistency across roles
- Feedback-driven UI
- Mobile-first responsiveness
- Accessibility-friendly design

### Global layout

- Sidebar + top navbar + breadcrumb + content area
- Shared component system for cards, tables, forms, tabs, progress bars, modals, and toast feedback

### Design system

- Primary colors: black / dark grey
- Secondary colors: white / light grey
- Accent: blue
- Success: green
- Error: red

### Admin UX

- Dashboard cards: total users, total courses, active students, revenue
- Charts: enrollments and revenue trends
- Recent activity feed
- User table with actions: view, block/activate, delete
- Course review page with course preview, curriculum viewer, instructor info, approve/reject actions
- Analytics page with charts, filters, and export support

### Teacher UX

- Dashboard: my courses, earnings, student count, pending reviews
- Step-based course wizard:
  1. Basic Info
  2. Curriculum
  3. Pricing
  4. Publish
- Curriculum builder with drag/drop modules and lessons
- Lesson editor with video, text, and attachments
- Quiz builder for MCQ, true/false, short answer
- Assignment builder with deadline and evaluation options
- Grading interface with submission preview, marks, and feedback

### Student UX

- Dashboard: enrolled courses, progress, certificates, recommendations
- Course browsing with search, price/category/rating filters, and course cards
- Course details with header, curriculum, instructor info, reviews, and enroll button
- Learning page with player/content area, course sidebar, and tabs for lessons/notes/Q&A
- Quiz page with timer, question navigation, and submit action
- Certificate page with preview and download

### Responsive and advanced UX expectations

- Desktop >= 1024px
- Tablet >= 768px
- Mobile <= 480px
- Mobile sidebar becomes drawer, tables collapse into cards
- Include skeleton loaders, lazy loading, infinite course listing, dark mode, notifications, bookmark lessons, and resume playback

## Frontend Architecture Target

- Stack: React + Vite + Tailwind CSS + React Router + Redux or Zustand
- Preferred folders:
  - `src/components`
  - `src/pages`
  - `src/layouts`
  - `src/services`
  - `src/store`
  - `src/hooks`
  - `src/utils`

## Implementation Directive

1. Keep the existing project structure and extend it.
2. Update backend models, routes, controllers, middleware, `app.js`, `server.js`, and related files to match the LMS requirements.
3. Update frontend pages, components, services, layouts, and routing to support admin, teacher, and student flows.
4. After stabilization, prepare:
   - development report
   - backend testing report
   - frontend testing report
