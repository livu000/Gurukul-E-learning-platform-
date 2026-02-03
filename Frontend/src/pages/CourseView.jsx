import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getModulesByCourse, getLessonsByModule } from '../services/course.service';
import api from '../services/api';

function CourseView() {
  const { id } = useParams(); // courseId

  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState({});
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);


  // Load modules

  useEffect(() => {
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


  // Load course progress

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get(`/progress/course/${id}`);
        setProgress(res.data);
      } catch (err) {
        console.error('Failed to load progress', err);
        // no alert – progress is optional UI
      }
    };

    fetchProgress();
  }, [id]);


  // Lazy load lessons per module

  const loadLessons = async (moduleId) => {
    if (lessons[moduleId]) return; // already loaded

    try {
      const data = await getLessonsByModule(moduleId);
      setLessons((prev) => ({ ...prev, [moduleId]: data }));
    } catch {
      setError('Failed to load lessons');
    }
  };

  if (loading) {
    return <p>Loading course...</p>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '30px auto' }}>
      <h2>Course Curriculum</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}


      {/* Progress Bar */}

      {progress && (
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
        </div>
      )}


      {/* Modules & Lessons */}

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
                  <Link to={`/lessons/${l.id}`}>
                    {l.title}
                  </Link>
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
