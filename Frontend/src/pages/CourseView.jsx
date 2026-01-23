import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getModulesByCourse, getLessonsByModule } from '../services/course.service';

function CourseView() {
  const { id } = useParams(); // courseId
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    getModulesByCourse(id)
      .then(setModules)
      .catch(() => setError('Failed to load modules'));
  }, [id]);

  const loadLessons = async (moduleId) => {
    if (lessons[moduleId]) return; // already loaded
    const data = await getLessonsByModule(moduleId);
    setLessons(prev => ({ ...prev, [moduleId]: data }));
  };

  return (
    <div style={{ maxWidth: 800, margin: '30px auto' }}>
      <h2>Course Curriculum</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {modules.map((m) => (
        <div key={m.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
          <h4 onClick={() => loadLessons(m.id)} style={{ cursor: 'pointer' }}>
            {m.title}
          </h4>

          {lessons[m.id] && (
            <ul>
              {lessons[m.id].map(l => (
                <li key={l.id}>{l.title}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default CourseView;
