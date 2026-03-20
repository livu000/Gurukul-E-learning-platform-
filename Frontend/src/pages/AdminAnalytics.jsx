import { useEffect, useState } from 'react';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';
import { pushNotification } from '../utils/notifications';

const exportOptions = [
  { label: 'Top Courses CSV', value: 'top-courses' },
  { label: 'Revenue CSV', value: 'revenue' },
  { label: 'Completions CSV', value: 'completions' }
];

function MetricCard({ label, value, hint }) {
  return (
    <div className="card stat-tile">
      <p className="stat-label">{label}</p>
      <h3>{value}</h3>
      {hint ? <p className="stat-hint">{hint}</p> : null}
    </div>
  );
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [exportType, setExportType] = useState('top-courses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/dashboard/admin'), api.get('/dashboard/admin/analytics')])
      .then(([dashboardRes, analyticsRes]) => {
        setDashboard(dashboardRes.data || null);
        setAnalytics(analyticsRes.data || null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load admin analytics');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    try {
      const response = await api.get(`/dashboard/admin/analytics?format=csv&exportType=${exportType}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${exportType}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      pushNotification({ title: 'Analytics Exported', message: `${exportType} export downloaded successfully.` });
    } catch (err) {
      console.error(err);
      setError('Failed to export analytics');
    }
  };

  if (loading) {
    return <div className="page"><PageHeader title="Admin Analytics" /><div className="grid"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div></div>;
  }

  return (
    <div className="page">
      <PageHeader
        title="Admin Analytics"
        action={
          <div className="page-action">
            <select className="form-select" value={exportType} onChange={(event) => setExportType(event.target.value)}>
              {exportOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <button className="btn btn-primary" type="button" onClick={handleExport}>Export</button>
          </div>
        }
      />
      {error && <p className="form-error">{error}</p>}

      <div className="grid">
        <MetricCard label="Revenue" value={`₹${dashboard?.revenue?.total || 0}`} hint="Successful payments" />
        <MetricCard label="Active Students" value={dashboard?.activity?.activeStudents || 0} hint="Current active enrollments" />
        <MetricCard label="Certificates" value={dashboard?.activity?.certificatesIssued || 0} hint="Issued completion certificates" />
        <MetricCard label="Pending Reviews" value={dashboard?.courses?.pendingReview || 0} hint="Courses awaiting approval" />
      </div>

      <div className="grid-2 analytics-layout">
        <div className="card">
          <h3>Revenue Trend</h3>
          <div className="trend-list">
            {(analytics?.revenueTrend || []).map((item) => (
              <div key={item.month} className="trend-row">
                <span>{item.month}</span>
                <strong>₹{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Enrollment Trend</h3>
          <div className="trend-list">
            {(analytics?.enrollmentTrend || []).map((item) => (
              <div key={item.month} className="trend-row">
                <span>{item.month}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2 analytics-layout">
        <div className="card">
          <h3>Top Courses</h3>
          {(analytics?.topCourses || []).length ? analytics.topCourses.map((course) => (
            <div key={course.id} className="list-row">
              <div>
                <strong>{course.title}</strong>
                <p>{course.teacherName} • {course.category || 'General'}</p>
              </div>
              <div className="analytics-inline-stats">
                <span className="badge badge-info">{course.enrollCount} enrollments</span>
                <span className="badge badge-neutral">{course.avgRating} rating</span>
              </div>
            </div>
          )) : <p>No course analytics available yet.</p>}
        </div>

        <div className="card">
          <h3>Recent Completions</h3>
          {(analytics?.recentCompletions || []).length ? analytics.recentCompletions.map((item) => (
            <div key={item.enrollmentId} className="list-row">
              <div>
                <strong>{item.studentName}</strong>
                <p>{item.courseTitle}</p>
              </div>
              <div className="analytics-inline-stats">
                <span className="badge badge-success">{item.progressPercentage}%</span>
                <span className={`badge ${item.certificateIssued ? 'badge-success' : 'badge-warning'}`}>
                  {item.certificateIssued ? 'Certificate issued' : 'Awaiting certificate'}
                </span>
              </div>
            </div>
          )) : <p>No completed enrollments recorded yet.</p>}
        </div>
      </div>
    </div>
  );
}
