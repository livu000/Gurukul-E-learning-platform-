import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const LessonView = () => {
  const { lessonId } = useParams();

  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // prevents state updates on unmounted component

    const fetchLesson = async () => {
      try {
        const res = await api.get(`/lessons/${lessonId}`);
        if (!isMounted) return;

        setLesson(res.data.lesson);
        setProgress(res.data.progress);
      } catch (err) {
        console.error('Lesson fetch failed:', err);
        if (!isMounted) return;

        setError('Failed to load lesson');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLesson();

    return () => {
      isMounted = false;
    };
  }, [lessonId]);

  const handleComplete = async () => {
    try {
      await api.post(`/lessons/${lessonId}/complete`, {
        courseId: lesson.moduleId // TEMP
      });

      setProgress({ status: 'completed' });
    } catch (err) {
      console.error('Complete failed:', err);
      alert('Failed to mark lesson complete');
    }
  };


  // Render states

  if (loading) {
    return <p>Loading lesson...</p>;
  }

  if (error && !lesson) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!lesson) {
    return <p>Lesson not found</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>{lesson.title}</h2>

      {lesson.videoUrl && (
        <video
          src={lesson.videoUrl}
          controls
          width="100%"
          style={{ marginBottom: '20px' }}
        />
      )}

      <p>{lesson.content}</p>

      <hr />

      {progress?.status === 'completed' ? (
        <p style={{ color: 'green', fontWeight: 'bold' }}>
           Lesson Completed
        </p>
      ) : (
        <button onClick={handleComplete}>
          Mark as Complete
        </button>
      )}
    </div>
  );
};

export default LessonView;
