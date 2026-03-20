import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';

function StatTile({ label, value, hint }) { return <div className="card stat-tile"><p className="stat-label">{label}</p><h3>{value}</h3>{hint ? <p className="stat-hint">{hint}</p> : null}</div>; }

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [courses, setCourses] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    api.get('/courses').then((res) => setCourses(res.data || [])).catch(() => setError('Failed to load courses')).finally(() => setLoadingCourses(false));
    const endpoint = user?.role === 'teacher' ? '/dashboard/teacher' : user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/student';
    api.get(endpoint).then((res) => setDashboard(res.data || null)).catch(() => setError('Failed to load dashboard')).finally(() => setLoadingDashboard(false));
  }, [user?.role]);

  return (
    <div className="page">
      <PageHeader title="Dashboard" action={(user?.role === 'teacher' || user?.role === 'admin') ? <Link to="/create-course" className="btn btn-primary">Create Course</Link> : null} />
      {error && <p className="form-error">{error}</p>}

      {loadingDashboard ? <div className="grid"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div> : user?.role === 'student' && dashboard && (
        <>
          <div className="grid">
            <StatTile label="Enrolled Courses" value={dashboard.enrolledCourses?.length || 0} hint="Track your active learning." />
            <StatTile label="Pending Assignments" value={dashboard.pendingAssignments?.length || 0} hint="Stay ahead of deadlines." />
            <StatTile label="Certificates" value={dashboard.certificates?.length || 0} hint="Completion milestones earned." />
            <StatTile label="Weekly Learning" value={`${dashboard.weeklyProgress?.lessonsCompleted || 0} lessons`} hint="Last 7 days." />
          </div>
          <div className="grid-2">
            <div className="card"><h3>Continue Learning</h3>{dashboard.enrolledCourses?.length ? dashboard.enrolledCourses.map((course) => <div key={course.id} className="list-row"><div><strong>{course.title}</strong><p>{course.instructor}</p></div><div><span className="badge badge-info">{course.progressPercentage}%</span><Link to={`/courses/${course.id}`} className="btn btn-secondary">Open</Link></div></div>) : <p>No enrolled courses yet.</p>}</div>
            <div className="card"><h3>Recommended Courses</h3>{dashboard.recommendedCourses?.length ? dashboard.recommendedCourses.map((course) => <div key={course.id} className="list-row"><div><strong>{course.title}</strong><p>{course.category || 'General'}</p></div><Link to={`/courses/${course.id}`} className="btn btn-secondary">View</Link></div>) : <p>Recommendations will appear here.</p>}</div>
          </div>
        </>
      )}

      {!loadingDashboard && user?.role === 'teacher' && dashboard && (
        <>
          <div className="grid">
            <StatTile label="My Courses" value={dashboard.summary?.totalCourses || 0} hint="All created courses." />
            <StatTile label="Published" value={dashboard.summary?.publishedCourses || 0} hint="Visible to students." />
            <StatTile label="Pending Review" value={dashboard.summary?.reviewCourses || 0} hint="Awaiting admin action." />
            <StatTile label="Quiz Attempts" value={dashboard.quizStats?.totalAttempts || 0} hint={`Avg score ${dashboard.quizStats?.averageScore || 0}`} />
          </div>
          <div className="card"><h3>Teaching Pipeline</h3>{dashboard.courses?.length ? dashboard.courses.map((course) => <div key={course.courseId} className="list-row"><div><strong>{course.title}</strong><p>{course.studentCount} learners</p></div><div><span className="badge badge-info">{course.status}</span><Link to={`/teacher/course/${course.courseId}/builder`} className="btn btn-secondary">Builder</Link></div></div>) : <p>No courses created yet.</p>}</div>
        </>
      )}

      {!loadingDashboard && user?.role === 'admin' && dashboard && (
        <>
          <div className="grid">
            <StatTile label="Total Users" value={dashboard.users?.total || 0} hint={`${dashboard.users?.activeUsers || 0} active`} />
            <StatTile label="Published Courses" value={dashboard.courses?.published || 0} hint={`${dashboard.courses?.pendingReview || 0} pending review`} />
            <StatTile label="Active Students" value={dashboard.activity?.activeStudents || 0} hint={`${dashboard.activity?.certificatesIssued || 0} certificates`} />
            <StatTile label="Revenue" value={`₹${dashboard.revenue?.total || 0}`} hint="Successful payments only." />
          </div>
          <div className="card"><h3>Pending Course Reviews</h3>{dashboard.recentReviews?.length ? dashboard.recentReviews.map((course) => <div key={course.id} className="list-row"><div><strong>{course.title}</strong><p>Instructor: {course.teacher?.name || 'Unknown'}</p></div><Link to={`/courses/${course.id}`} className="btn btn-secondary">Review</Link></div>) : <p>No pending reviews right now.</p>}</div>
        </>
      )}

      <div className="page-section">
        <div className="section-head"><h3>{user?.role === 'student' ? 'Published Courses' : 'Course Library'}</h3><Link to="/courses" className="btn btn-secondary">Open Full List</Link></div>
        {loadingCourses ? <div className="grid"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div> : <div className="grid">{courses.slice(0, 6).map((course) => <div key={course.id} className="card"><p className="stat-label">{course.category || 'General'}</p><h3>{course.title}</h3><p>{course.subtitle || course.description || 'Structured learning experience.'}</p><div className="card-actions"><span className="badge badge-info">{course.status}</span><Link to={`/courses/${course.id}`} className="btn btn-secondary">View</Link></div></div>)}</div>}
      </div>
    </div>
  );
}

export default Dashboard;
