export const roleMenus = {
  student: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Browse Courses', path: '/courses' },
    { label: 'Certificates', path: '/my-certificates' },
    { label: 'Payments', path: '/my-payments' }
  ],
  teacher: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Courses', path: '/courses' },
    { label: 'Create Course', path: '/create-course' },
    { label: 'Quiz Hub', path: '/teacher/quizzes' }
  ],
  admin: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Course Review', path: '/courses' },
    { label: 'Create Course', path: '/create-course' },
    { label: 'Users', path: '/admin/users' }
  ]
};
