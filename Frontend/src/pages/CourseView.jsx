import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { enrollInCourse, getCourseById, getCourseProgress } from '../services/course.service';
import { issueCertificate } from '../services/certificate.service';
import { createPayment, verifyPayment } from '../services/payment.service';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';

function CourseView() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      const courseData = await getCourseById(id);
      setCourse(courseData);
      if (user?.role === 'student' && courseData?.isEnrolled) setProgress(await getCourseProgress(id)); else setProgress(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [id, user?.role]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  const handleFreeEnrollment = async () => {
    try { setWorking(true); await enrollInCourse(id); await loadCourse(); } catch (err) { alert(err.response?.data?.message || 'Enrollment failed'); } finally { setWorking(false); }
  };
  const handleBuyCourse = async () => {
    try { setWorking(true); const payment = await createPayment(id); await verifyPayment(payment.id); await loadCourse(); } catch (err) { alert(err.response?.data?.message || 'Payment failed'); } finally { setWorking(false); }
  };
  const handleGetCertificate = async () => {
    try { const data = await issueCertificate(id); setCertificate(data); await loadCourse(); } catch (err) { alert(err.response?.data?.message || 'Certificate could not be issued yet'); }
  };

  if (loading) return <div className="page"><PageHeader title="Course Details" /><div className="grid"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div></div>;

  return (
    <div className="page">
      <PageHeader title={course?.title || 'Course Details'} action={course?.canManage ? <Link className="btn btn-secondary" to={`/teacher/course/${id}/builder`}>Open Builder</Link> : null} />
      {error && <p className="form-error">{error}</p>}
      {course && <>
        <div className="card hero-card">
          <div className="hero-card-copy">
            <p className="stat-label">{course.category || 'General'} • {course.level || 'All Levels'} • {course.language || 'English'}</p>
            <h1>{course.title}</h1>
            <p>{course.subtitle || course.description || 'Build mastery through structured modules, lessons, quizzes, and assignments.'}</p>
            <div className="course-meta">
              <span className="badge badge-info">{course.status}</span>
              <span className="badge badge-neutral">{course.isPaid ? `Paid • ₹${course.price}` : 'Free Course'}</span>
              <span className="badge badge-neutral">Teacher: {course.teacher?.name || 'Unknown'}</span>
            </div>
            <div className="card-actions">
              {course.canManage ? <span className="badge badge-success">Teacher/Admin access</span> : course.isEnrolled ? <span className="badge badge-success">Enrolled</span> : user?.role === 'student' ? (course.isPaid ? <button className="btn btn-primary" onClick={handleBuyCourse} disabled={working}>{working ? 'Processing...' : `Buy Course • ₹${course.price}`}</button> : <button className="btn btn-primary" onClick={handleFreeEnrollment} disabled={working}>{working ? 'Enrolling...' : 'Enroll for Free'}</button>) : <span className="badge badge-warning">Preview Mode</span>}
              {course.isEnrolled && <><Link className="btn btn-secondary" to={`/courses/${id}/assignments`}>Assignments</Link><Link className="btn btn-secondary" to={`/courses/${id}/quizzes`}>Quizzes</Link></>}
              {course.canManage && <Link className="btn btn-secondary" to={`/teacher/courses/${id}/assignments`}>Manage Assignments</Link>}
            </div>
          </div>
        </div>

        {user?.role === 'student' && course.isEnrolled && progress && <div className="card"><div className="section-head"><h3>Your Progress</h3><span className="badge badge-info">{progress.percentage}%</span></div><p>{progress.completedLessons} of {progress.totalLessons} lessons completed.</p><div className="progress-bar"><div className="progress-fill" style={{ width: `${progress.percentage}%` }} /></div>{progress.percentage === 100 && <div className="card-actions"><button className="btn btn-primary" onClick={handleGetCertificate}>Issue Certificate</button>{certificate && <a className="btn btn-secondary" href={`/verify/${certificate.certificateUid}`} target="_blank" rel="noreferrer">Verify Certificate</a>}</div>}</div>}

        <div className="grid-2">
          <div className="card"><h3>Curriculum</h3>{course.modules?.length ? course.modules.map((module) => <div key={module.id} className="module-block"><div className="module-heading"><strong>{module.title}</strong><span>{module.lessonCount || module.lessons?.length || 0} lessons</span></div><p>{module.description || 'Structured module content.'}</p><ul>{(module.lessons || []).map((lesson) => <li key={lesson.id}>{course.hasAccess || course.canManage || lesson.isPreview ? <Link to={`/lessons/${lesson.id}`}>{lesson.title}</Link> : <span>{lesson.title} <em>(locked)</em></span>}{lesson.isPreview ? ' • Preview' : ''}</li>)}</ul></div>) : <p>No modules added yet.</p>}</div>
          <div className="card"><h3>Instructor</h3><p><strong>{course.teacher?.name || 'Unknown'}</strong></p><p>{course.teacher?.bio || 'Teacher profile will appear here.'}</p><h3 style={{ marginTop: 24 }}>Course Snapshot</h3><p>Total duration: {course.totalDurationMinutes || 0} minutes</p><p>Enrollments: {course.enrollCount || 0}</p><p>Rating: {course.avgRating || 0} ({course.ratingCount || 0} reviews)</p>{certificate && <div className="card-muted"><strong>Certificate UID</strong><p>{certificate.certificateUid}</p></div>}</div>
        </div>
      </>}
    </div>
  );
}

export default CourseView;
