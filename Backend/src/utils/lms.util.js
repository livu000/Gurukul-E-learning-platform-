const { Op } = require('sequelize');
const {
  Assignment,
  Course,
  Enrollment,
  Lesson,
  LessonProgress,
  Module,
  Quiz,
  QuizQuestion
} = require('../models');

function canManageCourse(user, course) {
  if (!user || !course) return false;
  return user.role === 'admin' || (user.role === 'teacher' && Number(course.teacherId) === Number(user.id));
}

async function syncModuleStats(moduleId) {
  const lessons = await Lesson.findAll({
    where: { moduleId },
    attributes: ['durationMinutes']
  });

  const totalDurationMinutes = lessons.reduce(
    (sum, lesson) => sum + Number(lesson.durationMinutes || 0),
    0
  );

  await Module.update(
    {
      lessonCount: lessons.length,
      totalDurationMinutes
    },
    { where: { id: moduleId } }
  );

  const module = await Module.findByPk(moduleId, { attributes: ['courseId'] });
  if (module?.courseId) {
    await syncCourseStats(module.courseId);
  }
}

async function syncCourseStats(courseId) {
  const modules = await Module.findAll({
    where: { courseId },
    attributes: ['id', 'totalDurationMinutes']
  });

  const totalDurationMinutes = modules.reduce(
    (sum, module) => sum + Number(module.totalDurationMinutes || 0),
    0
  );

  await Course.update(
    {
      totalDurationMinutes
    },
    { where: { id: courseId } }
  );
}

async function syncQuizTotalMarks(quizId) {
  const questions = await QuizQuestion.findAll({
    where: { quizId },
    attributes: ['marks']
  });

  const totalMarks = questions.reduce(
    (sum, question) => sum + Number(question.marks || 0),
    0
  );

  await Quiz.update({ totalMarks }, { where: { id: quizId } });
}

async function syncEnrollmentProgress(userId, courseId, lastLessonId = null) {
  const totalLessons = await Lesson.count({
    where: { isPublished: true },
    include: [{ model: Module, as: 'module', where: { courseId } }]
  });

  const completedLessons = await LessonProgress.count({
    where: { userId, courseId, isCompleted: true }
  });

  const progressPercentage = totalLessons
    ? Number(((completedLessons / totalLessons) * 100).toFixed(2))
    : 0;

  const enrollment = await Enrollment.findOne({
    where: {
      userId,
      courseId,
      status: { [Op.in]: ['active', 'completed'] }
    }
  });

  if (!enrollment) {
    return null;
  }

  const isCompleted = progressPercentage >= 100 && totalLessons > 0;
  await enrollment.update({
    progressPercentage,
    lastAccessedLessonId: lastLessonId || enrollment.lastAccessedLessonId,
    status: isCompleted ? 'completed' : 'active',
    completedAt: isCompleted ? (enrollment.completedAt || new Date()) : null
  });

  return enrollment;
}

async function validateCourseForReview(course) {
  const issues = [];
  if (!course?.title?.trim()) issues.push('Course title is required.');
  if (!course?.description?.trim()) issues.push('Course description is required.');
  if (!course?.category?.trim()) issues.push('Course category is required.');
  if (course?.isPaid && Number(course?.price || 0) <= 0) issues.push('Paid courses require a valid price.');

  const modules = await Module.findAll({
    where: { courseId: course.id },
    include: [{ model: Lesson, as: 'lessons' }],
    order: [['sortOrder', 'ASC']]
  });

  if (!modules.length) {
    issues.push('At least one module is required.');
  }

  const lessonCount = modules.reduce(
    (sum, module) => sum + (module.lessons?.length || 0),
    0
  );

  if (!lessonCount) {
    issues.push('At least one lesson is required.');
  }

  return {
    isValid: issues.length === 0,
    issues,
    modules,
    lessonCount
  };
}

async function publishCourseContent(courseId, isPublished = true) {
  const modules = await Module.findAll({
    where: { courseId },
    attributes: ['id']
  });

  const moduleIds = modules.map((module) => module.id);
  await Module.update({ isPublished }, { where: { courseId } });

  if (moduleIds.length) {
    await Lesson.update({ isPublished }, { where: { moduleId: { [Op.in]: moduleIds } } });
  }
}

async function getNextSortOrder(Model, where) {
  const latest = await Model.findOne({
    where,
    order: [['sortOrder', 'DESC'], ['id', 'DESC']],
    attributes: ['sortOrder']
  });

  return Number(latest?.sortOrder || 0) + 1;
}

async function getActiveEnrollment(userId, courseId) {
  return Enrollment.findOne({
    where: {
      userId,
      courseId,
      status: { [Op.in]: ['active', 'completed'] }
    }
  });
}

async function getAssignmentContext(assignmentId) {
  return Assignment.findByPk(assignmentId, {
    include: [{ model: Course, as: 'course' }]
  });
}

module.exports = {
  canManageCourse,
  getActiveEnrollment,
  getAssignmentContext,
  getNextSortOrder,
  publishCourseContent,
  syncCourseStats,
  syncEnrollmentProgress,
  syncModuleStats,
  syncQuizTotalMarks,
  validateCourseForReview
};
