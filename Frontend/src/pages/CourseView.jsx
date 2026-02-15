import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getModulesByCourse, getLessonsByModule } from '../services/course.service';
import { issueCertificate } from '../services/certificate.service';
import { createPayment, verifyPayment } from '../services/payment.service';
import { getCourseById } from '../services/course.service';

import api from '../services/api';

function CourseView() {
  const { id } = useParams(); // courseId

  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState({});
  const [progress, setProgress] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [course, setCourse] = useState(null);
  useEffect(() => {
    const loadCourse = async () => {
      try {
        const data = await getCourseById(id);
        setCourse(data);
      } catch {
        console.error('Failed to load course info');
      }
    };

    loadCourse();
  }, [id]);

  // ==========================
  // LOAD MODULES
  // ==========================
  useEffect(() => {
    setLoading(true);

    getModulesByCourse(id)
      .then((data) => {
        setModules(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load modules');
        setLoading(false);
      });
  }, [id]);

  // ==========================
  // LOAD COURSE PROGRESS
  // (Detect enrollment safely)
  // ==========================
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get(`/progress/course/${id}`);

        setProgress(res.data);
        // 🔥 ONLY paid courses use enrollment detection
        if (course?.isPaid) {
          setIsEnrolled(true);
        }

      } catch (error) {
        if (error?.response?.status === 403) {
          setIsEnrolled(false);
        } else {
          console.error('Progress error:', error);
        }
      }
    };
    if (course) {
      fetchProgress();
    }
  }, [id, course]);

  // ==========================
  // LOAD LESSONS PER MODULE
  // ==========================
  const loadLessons = async (moduleId) => {
    if (lessons[moduleId]) return;

    try {
      const data = await getLessonsByModule(moduleId);
      setLessons((prev) => ({ ...prev, [moduleId]: data }));
    } catch {
      setError('Failed to load lessons');
    }
  };

  // ==========================
  // CERTIFICATE GENERATION
  // ==========================
  const handleGetCertificate = async () => {
    try {
      const data = await issueCertificate(id);
      setCertificate(data);
      alert('Certificate generated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating certificate');
    }
  };

  // ==========================
  // PAYMENT HANDLER
  // ==========================
  const handleBuyCourse = async () => {
    try {
      setPaying(true);

      const payment = await createPayment(id);

      alert('Payment intent created. Verifying...');

      await verifyPayment(payment.id);

      alert('Payment successful! Course unlocked.');

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <p>Loading course...</p>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '30px auto' }}>
      <h2>Course Curriculum</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* ==========================
          SMART BUY BUTTON
      ========================== */}
      <div style={{ marginBottom: 20 }}>
        {!isEnrolled ? (
          <button onClick={handleBuyCourse} disabled={paying}>
            {paying ? 'Processing Payment...' : 'Buy Course'}
          </button>
        ) : (
          <div style={{ color: 'green', fontWeight: 'bold' }}>
            Purchased ✅
          </div>
        )}
      </div>

      {/* ==========================
          PROGRESS BAR
      ========================== */}
      {isEnrolled && progress && (
        <div style={{ marginBottom: 25 }}>
          <p>
            Progress: {progress.completedLessons} / {progress.totalLessons} lessons
          </p>

          <div
            style={{
              width: '100%',
              height: 18,
              backgroundColor: '#eee',
              borderRadius: 10,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${progress.percentage}%`,
                height: '100%',
                backgroundColor:
                  progress.percentage >= 50 ? '#4caf50' : '#ff9800',
                transition: 'width 0.4s ease'
              }}
            />
          </div>

          <p style={{ marginTop: 6, fontWeight: 'bold' }}>
            {progress.percentage}%
          </p>

          {progress.percentage === 100 && (
            <div style={{ marginTop: 15 }}>
              <button onClick={handleGetCertificate}>
                Get Certificate
              </button>

              {certificate && (
                <p style={{ marginTop: 10, color: 'green' }}>
                  Certificate ID: {certificate.certificate_id}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==========================
          MODULES & LESSONS
      ========================== */}
      {modules.map((m) => (
        <div
          key={m.id}
          style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}
        >
          <h4
            onClick={() => loadLessons(m.id)}
            style={{ cursor: 'pointer' }}
          >
            {m.title}
          </h4>

          {lessons[m.id] && (
            <ul>
              {lessons[m.id].map((l) => (
                <li key={l.id}>
                  <Link to={`/lessons/${l.id}`}>{l.title}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default CourseView;
