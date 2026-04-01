import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';
import { pushNotification } from '../utils/notifications';
import { downloadCsv, formatDateTime, openPrintReport } from '../utils/reporting';

const exportOptions = [
  { label: 'System Overview', value: 'system-overview' },
  { label: 'Revenue Trend', value: 'revenue' },
  { label: 'Enrollment Trend', value: 'enrollment' },
  { label: 'Top Courses', value: 'top-courses' },
  { label: 'Recent Completions', value: 'completions' }
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

function buildRows(exportType, dashboard, analytics) {
  switch (exportType) {
    case 'revenue':
      return (analytics?.revenueTrend || []).map((item) => ({
        month: item.month,
        revenueInInr: item.value
      }));
    case 'enrollment':
      return (analytics?.enrollmentTrend || []).map((item) => ({
        month: item.month,
        enrollments: item.value
      }));
    case 'top-courses':
      return (analytics?.topCourses || []).map((course) => ({
        course: course.title,
        teacher: course.teacherName,
        category: course.category || 'General',
        status: course.status,
        enrollments: course.enrollCount,
        avgRating: course.avgRating,
        priceInInr: course.price
      }));
    case 'completions':
      return (analytics?.recentCompletions || []).map((item) => ({
        student: item.studentName,
        email: item.studentEmail,
        course: item.courseTitle,
        completedAt: formatDateTime(item.completedAt),
        progressPercentage: item.progressPercentage,
        certificateIssued: item.certificateIssued ? 'Yes' : 'No'
      }));
    case 'system-overview':
    default:
      return [
        {
          metric: 'Total Revenue',
          value: `INR ${dashboard?.revenue?.total || 0}`,
          note: 'Successful course payments'
        },
        {
          metric: 'Active Students',
          value: dashboard?.activity?.activeStudents || 0,
          note: 'Current active enrollments'
        },
        {
          metric: 'Certificates Issued',
          value: dashboard?.activity?.certificatesIssued || 0,
          note: 'Completion certificates generated'
        },
        {
          metric: 'Pending Course Reviews',
          value: dashboard?.courses?.pendingReview || 0,
          note: 'Courses waiting for admin approval'
        },
        {
          metric: 'Total Users',
          value: dashboard?.users?.total || 0,
          note: `${dashboard?.users?.activeUsers || 0} active accounts`
        },
        {
          metric: 'Published Courses',
          value: dashboard?.courses?.published || 0,
          note: 'Visible to learners'
        }
      ];
  }
}

function buildPdfReport(exportType, dashboard, analytics) {
  const generatedAt = formatDateTime(new Date().toISOString());

  switch (exportType) {
    case 'revenue':
      return {
        title: 'Revenue Trend Report',
        subtitle: `Generated on ${generatedAt}`,
        sections: [
          {
            title: 'Monthly Revenue',
            description: 'Successful payment totals grouped by month.',
            columns: [
              { key: 'month', label: 'Month' },
              { key: 'value', label: 'Revenue (INR)' }
            ],
            rows: (analytics?.revenueTrend || []).map((item) => ({
              month: item.month,
              value: item.value
            }))
          }
        ]
      };
    case 'enrollment':
      return {
        title: 'Enrollment Trend Report',
        subtitle: `Generated on ${generatedAt}`,
        sections: [
          {
            title: 'Monthly Enrollments',
            description: 'Learner enrollment volume grouped by month.',
            columns: [
              { key: 'month', label: 'Month' },
              { key: 'value', label: 'Enrollments' }
            ],
            rows: (analytics?.enrollmentTrend || []).map((item) => ({
              month: item.month,
              value: item.value
            }))
          }
        ]
      };
    case 'top-courses':
      return {
        title: 'Top Courses Report',
        subtitle: `Generated on ${generatedAt}`,
        sections: [
          {
            title: 'Top Performing Courses',
            description: 'Courses ranked using enrollment and rating performance.',
            columns: [
              { key: 'title', label: 'Course' },
              { key: 'teacherName', label: 'Teacher' },
              { key: 'category', label: 'Category' },
              { key: 'status', label: 'Status' },
              { key: 'enrollCount', label: 'Enrollments' },
              { key: 'avgRating', label: 'Avg Rating' },
              { key: 'price', label: 'Price (INR)' }
            ],
            rows: (analytics?.topCourses || []).map((course) => ({
              title: course.title,
              teacherName: course.teacherName,
              category: course.category || 'General',
              status: course.status,
              enrollCount: course.enrollCount,
              avgRating: course.avgRating,
              price: course.price
            }))
          }
        ]
      };
    case 'completions':
      return {
        title: 'Completion Report',
        subtitle: `Generated on ${generatedAt}`,
        sections: [
          {
            title: 'Recent Course Completions',
            description: 'Latest completed enrollments and certificate issuance status.',
            columns: [
              { key: 'studentName', label: 'Student' },
              { key: 'studentEmail', label: 'Email' },
              { key: 'courseTitle', label: 'Course' },
              { key: 'completedAt', label: 'Completed At' },
              { key: 'progressPercentage', label: 'Progress %' },
              { key: 'certificateIssued', label: 'Certificate' }
            ],
            rows: (analytics?.recentCompletions || []).map((item) => ({
              studentName: item.studentName,
              studentEmail: item.studentEmail || 'N/A',
              courseTitle: item.courseTitle,
              completedAt: formatDateTime(item.completedAt),
              progressPercentage: item.progressPercentage,
              certificateIssued: item.certificateIssued ? 'Issued' : 'Pending'
            }))
          }
        ]
      };
    case 'system-overview':
    default:
      return {
        title: 'Education Management System Overview',
        subtitle: `Generated on ${generatedAt}`,
        sections: [
          {
            title: 'Platform KPI Summary',
            description: 'Current high-level admin metrics from the Gurukul platform.',
            columns: [
              { key: 'metric', label: 'Metric' },
              { key: 'value', label: 'Value' },
              { key: 'note', label: 'Note' }
            ],
            rows: buildRows('system-overview', dashboard, analytics)
          },
          {
            title: 'Revenue Trend',
            columns: [
              { key: 'month', label: 'Month' },
              { key: 'value', label: 'Revenue (INR)' }
            ],
            rows: (analytics?.revenueTrend || []).map((item) => ({
              month: item.month,
              value: item.value
            }))
          },
          {
            title: 'Enrollment Trend',
            columns: [
              { key: 'month', label: 'Month' },
              { key: 'value', label: 'Enrollments' }
            ],
            rows: (analytics?.enrollmentTrend || []).map((item) => ({
              month: item.month,
              value: item.value
            }))
          },
          {
            title: 'Top Courses',
            columns: [
              { key: 'title', label: 'Course' },
              { key: 'teacherName', label: 'Teacher' },
              { key: 'enrollCount', label: 'Enrollments' },
              { key: 'avgRating', label: 'Avg Rating' }
            ],
            rows: (analytics?.topCourses || []).map((course) => ({
              title: course.title,
              teacherName: course.teacherName,
              enrollCount: course.enrollCount,
              avgRating: course.avgRating
            }))
          },
          {
            title: 'Recent Completions',
            columns: [
              { key: 'studentName', label: 'Student' },
              { key: 'courseTitle', label: 'Course' },
              { key: 'completedAt', label: 'Completed At' },
              { key: 'certificateIssued', label: 'Certificate' }
            ],
            rows: (analytics?.recentCompletions || []).map((item) => ({
              studentName: item.studentName,
              courseTitle: item.courseTitle,
              completedAt: formatDateTime(item.completedAt),
              certificateIssued: item.certificateIssued ? 'Issued' : 'Pending'
            }))
          }
        ]
      };
  }
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [exportType, setExportType] = useState('system-overview');
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

  const selectedLabel = useMemo(
    () => exportOptions.find((item) => item.value === exportType)?.label || 'Report',
    [exportType]
  );

  const handleCsvExport = () => {
    try {
      setError('');
      const rows = buildRows(exportType, dashboard, analytics);
      downloadCsv(`${exportType}.csv`, rows);
      pushNotification({
        title: 'CSV Export Ready',
        message: `${selectedLabel} CSV downloaded successfully.`
      });
    } catch (err) {
      console.error(err);
      setError('Failed to export analytics as CSV');
    }
  };

  const handlePdfExport = () => {
    try {
      setError('');
      const opened = openPrintReport(buildPdfReport(exportType, dashboard, analytics));
      if (!opened) {
        setError('Pop-up blocked. Allow pop-ups to export PDF reports.');
        return;
      }

      pushNotification({
        title: 'PDF Export Opened',
        message: `${selectedLabel} opened in a print-friendly view. Choose Save as PDF in the print dialog.`
      });
    } catch (err) {
      console.error(err);
      setError('Failed to export analytics as PDF');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Admin Analytics" />
        <div className="grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="Admin Analytics"
        action={
          <div className="page-action">
            <select className="form-select" value={exportType} onChange={(event) => setExportType(event.target.value)}>
              {exportOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <button className="btn btn-secondary" type="button" onClick={handleCsvExport}>
              Export CSV
            </button>
            <button className="btn btn-primary" type="button" onClick={handlePdfExport}>
              Export PDF
            </button>
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
