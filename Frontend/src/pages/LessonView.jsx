import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';

function LessonView() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    api.get(`/lessons/${lessonId}`).then((res) => {
      if (!mounted) return;
      setLesson(res.data.lesson);
      setProgress(res.data.progress);
    }).catch((err) => {
      console.error(err);
      if (mounted) setError('Failed to load lesson');
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [lessonId]);

  const handleComplete = async () => {
    try {
      await api.post(`/lessons/${lessonId}/complete`);
      setProgress((prev) => ({ ...prev, isCompleted: true, status: 'completed' }));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to mark lesson complete');
    }
  };

  if (loading) return <div className="page"><PageHeader title="Lesson" /><div className="grid"><SkeletonCard /><SkeletonCard /></div></div>;

  return (
    <div className="page">
      <PageHeader title={lesson?.title || 'Lesson'} />
      {error && !lesson && <p className="form-error">{error}</p>}
      {lesson && <div className="card lesson-shell">{lesson.videoUrl && <div className="video-wrapper"><video src={lesson.videoUrl} controls width="100%" /></div>}<div className="lesson-body"><p className="stat-label">{lesson.lessonType || 'Lesson'} • {lesson.durationMinutes || 0} minutes</p><h3>{lesson.title}</h3><p>{lesson.description || lesson.content}</p>{lesson.attachmentUrl ? <a className="btn btn-secondary" href={lesson.attachmentUrl} target="_blank" rel="noreferrer">Open Attachment</a> : null}</div><div className="card-actions">{progress?.isCompleted || progress?.status === 'completed' ? <span className="badge badge-success">Lesson Completed</span> : <button className="btn btn-primary" onClick={handleComplete}>Mark as Complete</button>}</div></div>}
    </div>
  );
}

export default LessonView;
