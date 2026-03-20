export const roleMenus = {
  student: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Browse Courses', path: '/courses' },
    { label: 'Certificates', path: '/my-certificates' },
    { label: 'Payments', path: '/my-payments' },
    { label: 'Settings', path: '/settings' }
  ],
  teacher: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Courses', path: '/courses' },
    { label: 'Create Course', path: '/create-course' },
    { label: 'Quiz Hub', path: '/teacher/quizzes' },
    { label: 'Settings', path: '/settings' }
  ],
  admin: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Course Review', path: '/courses' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Analytics', path: '/admin/analytics' },
    { label: 'Settings', path: '/settings' }
  ]
};
