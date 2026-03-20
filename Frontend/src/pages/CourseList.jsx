import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourses, submitCourse, updateCourseStatus } from '../services/course.service';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';
import { pushNotification } from '../utils/notifications';

const PAGE_SIZE = 6;

function CourseList() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ q: '', category: '', isPaid: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.q.trim()) params.q = filters.q.trim();
      if (filters.category.trim()) params.category = filters.category.trim();
      if (filters.isPaid) params.isPaid = filters.isPaid;
      const data = await getCourses(params);
      setCourses(data || []);
      setVisibleCount(PAGE_SIZE);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    if (!sentinelRef.current) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setVisibleCount((count) => Math.min(count + PAGE_SIZE, courses.length));
      }
    }, { threshold: 0.3 });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [courses.length]);

  const visibleCourses = useMemo(() => courses.slice(0, visibleCount), [courses, visibleCount]);

  const handleAction = async (courseId, action, rejectionReason) => {
    try {
      if (action === 'submit') {
        await submitCourse(courseId);
        pushNotification({ title: 'Course Submitted', message: 'Your course has been sent for admin review.' });
      } else {
        await updateCourseStatus(courseId, action, rejectionReason);
        pushNotification({ title: 'Course Status Updated', message: `Course status changed to ${action}.` });
      }
      await loadCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="page">
      <PageHeader title={user?.role === 'admin' ? 'Course Review Queue' : 'Course Library'} action={<button className="btn btn-secondary" onClick={loadCourses}>Refresh</button>} />
      <div className="card filter-bar">
        <input className="form-input" placeholder="Search courses, subtitles, descriptions" value={filters.q} onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))} />
        <input className="form-input" placeholder="Category" value={filters.category} onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))} />
        <select className="form-select" value={filters.isPaid} onChange={(e) => setFilters((prev) => ({ ...prev, isPaid: e.target.value }))}><option value="">All pricing</option><option value="false">Free</option><option value="true">Paid</option></select>
        <button className="btn btn-primary" onClick={loadCourses}>Apply</button>
      </div>
      {error && <p className="form-error">{error}</p>}
      {loading ? <div className="grid"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div> : <div className="grid">{visibleCourses.map((course) => <div key={course.id} className="card course-card"><p className="stat-label">{course.category || 'General'}{course.teacher?.name ? ` • ${course.teacher.name}` : ''}</p><h3>{course.title}</h3><p>{course.subtitle || course.description || 'No description available.'}</p><div className="course-meta"><span className="badge badge-info">{course.status}</span><span className="badge badge-neutral">{course.isPaid ? `Paid • ₹${course.price}` : 'Free'}</span></div><div className="card-actions"><button className="btn btn-secondary" onClick={() => navigate(`/courses/${course.id}`)}>Open</button>{user?.role === 'teacher' && <button className="btn btn-secondary" onClick={() => navigate(`/teacher/course/${course.id}/builder`)}>Builder</button>}{user?.role === 'teacher' && course.status === 'draft' && <button className="btn btn-primary" onClick={() => handleAction(course.id, 'submit')}>Submit for Review</button>}{user?.role === 'admin' && course.status === 'review' && <><button className="btn btn-primary" onClick={() => handleAction(course.id, 'approved')}>Approve</button><button className="btn btn-secondary" onClick={() => handleAction(course.id, 'published')}>Publish</button><button className="btn btn-danger" onClick={() => handleAction(course.id, 'rejected', 'Rejected during admin review')}>Reject</button></>}</div></div>)}{!courses.length && <div className="card-muted">No courses matched your current filters.</div>}</div>}
      {!loading && visibleCount < courses.length && <div ref={sentinelRef} className="card-muted centered-note">Loading more courses as you scroll...</div>}
    </div>
  );
}

export default CourseList;
