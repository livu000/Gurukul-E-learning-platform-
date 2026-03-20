import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';
import { pushNotification } from '../utils/notifications';

function storageRead(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function storageWrite(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function LessonView() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState('');
  const [questions, setQuestions] = useState([]);
  const [questionDraft, setQuestionDraft] = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const videoRef = useRef(null);
  const lastSyncedSecond = useRef(0);

  const notesKey = `gurukul-notes-${lessonId}`;
  const qaKey = `gurukul-qa-${lessonId}`;
  const bookmarkKey = 'gurukul-bookmarked-lessons';

  const loadLesson = useCallback(async () => {
    try {
      const res = await api.get(`/lessons/${lessonId}`);
      setLesson(res.data.lesson);
      setProgress(res.data.progress);
      setCourse(res.data.course || null);
      setCurriculum(res.data.curriculum || []);
      setNotes(localStorage.getItem(notesKey) || '');
      setQuestions(storageRead(qaKey, []));
      const bookmarkedLessons = storageRead(bookmarkKey, []);
      setBookmarked(bookmarkedLessons.includes(Number(lessonId)));
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  }, [bookmarkKey, lessonId, notesKey, qaKey]);

  useEffect(() => {
    loadLesson();
  }, [loadLesson]);

  useEffect(() => {
    if (!videoRef.current || !progress?.lastWatchedSecond) return;
    if (progress.lastWatchedSecond > 0) {
      videoRef.current.currentTime = progress.lastWatchedSecond;
    }
  }, [progress]);

  const flatLessons = useMemo(() => curriculum.flatMap((module) => module.lessons || []), [curriculum]);
  const currentIndex = useMemo(() => flatLessons.findIndex((entry) => Number(entry.id) === Number(lessonId)), [flatLessons, lessonId]);
  const nextLesson = currentIndex >= 0 ? flatLessons[currentIndex + 1] : null;

  const syncProgress = async ({ second, completed = false }) => {
    try {
      const payload = {
        lastWatchedSecond: Math.floor(second),
        totalWatchedSeconds: Math.max(Math.floor(second), progress?.totalWatchedSeconds || 0),
        isCompleted: completed
      };
      const res = await api.post(`/lessons/${lessonId}/progress`, payload);
      if (res.data?.progress) {
        setProgress(res.data.progress);
      }
    } catch (err) {
      console.error('Failed to sync lesson progress', err);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const second = Math.floor(videoRef.current.currentTime || 0);
    if (second - lastSyncedSecond.current >= 10) {
      lastSyncedSecond.current = second;
      syncProgress({ second });
    }
  };

  const handleVideoEnded = async () => {
    if (!videoRef.current) return;
    const second = Math.floor(videoRef.current.currentTime || 0);
    lastSyncedSecond.current = second;
    await syncProgress({ second, completed: true });
    setProgress((prev) => ({ ...prev, isCompleted: true }));
    pushNotification({ title: 'Lesson Completed', message: `${lesson?.title || 'Lesson'} finished successfully.` });
  };

  const handleComplete = async () => {
    try {
      await api.post(`/lessons/${lessonId}/complete`);
      setProgress((prev) => ({ ...prev, isCompleted: true, status: 'completed' }));
      pushNotification({ title: 'Lesson Completed', message: `${lesson?.title || 'Lesson'} marked complete.` });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to mark lesson complete');
    }
  };

  const handleSaveNotes = () => {
    localStorage.setItem(notesKey, notes);
    pushNotification({ title: 'Notes Saved', message: 'Your lesson notes were saved locally in this browser.' });
  };

  const handleToggleBookmark = () => {
    const bookmarkedLessons = storageRead(bookmarkKey, []);
    const nextBookmarks = bookmarkedLessons.includes(Number(lessonId))
      ? bookmarkedLessons.filter((id) => id !== Number(lessonId))
      : [...bookmarkedLessons, Number(lessonId)];
    storageWrite(bookmarkKey, nextBookmarks);
    setBookmarked(nextBookmarks.includes(Number(lessonId)));
    pushNotification({ title: nextBookmarks.includes(Number(lessonId)) ? 'Lesson Bookmarked' : 'Bookmark Removed', message: lesson?.title || 'Lesson bookmark updated.' });
  };

  const handleAskQuestion = () => {
    if (!questionDraft.trim()) return;
    const nextQuestions = [
      {
        id: `${Date.now()}`,
        text: questionDraft.trim(),
        createdAt: new Date().toISOString()
      },
      ...questions
    ];
    storageWrite(qaKey, nextQuestions);
    setQuestions(nextQuestions);
    setQuestionDraft('');
    pushNotification({ title: 'Question Saved', message: 'Your lesson question was added to the study log.' });
  };

  if (loading) {
    return <div className="page"><PageHeader title="Lesson" /><div className="grid"><SkeletonCard /><SkeletonCard /></div></div>;
  }

  return (
    <div className="page">
      <PageHeader
        title={lesson?.title || 'Lesson'}
        action={<div className="page-action">{nextLesson ? <Link className="btn btn-secondary" to={`/lessons/${nextLesson.id}`}>Next Lesson</Link> : null}<button className="btn btn-secondary" type="button" onClick={handleToggleBookmark}>{bookmarked ? 'Remove Bookmark' : 'Bookmark Lesson'}</button></div>}
      />
      {error && !lesson && <p className="form-error">{error}</p>}

      {lesson && <div className="lesson-layout">
        <div className="card lesson-shell lesson-main-panel">
          {lesson.videoUrl && (
            <div className="video-wrapper">
              <video ref={videoRef} src={lesson.videoUrl} controls width="100%" onTimeUpdate={handleTimeUpdate} onEnded={handleVideoEnded} />
            </div>
          )}

          <div className="lesson-body">
            <p className="stat-label">{lesson.lessonType || 'Lesson'} • {lesson.durationMinutes || 0} minutes • {course?.title || 'Course'}</p>
            <h3>{lesson.title}</h3>
            <p>{lesson.description || lesson.content}</p>
            {lesson.attachmentUrl ? <a className="btn btn-secondary" href={lesson.attachmentUrl} target="_blank" rel="noreferrer">Open Attachment</a> : null}
          </div>

          <div className="card-actions">
            {progress?.isCompleted || progress?.status === 'completed'
              ? <span className="badge badge-success">Lesson Completed</span>
              : <button className="btn btn-primary" onClick={handleComplete}>Mark as Complete</button>}
            <span className="badge badge-info">Resume at {progress?.lastWatchedSecond || 0}s</span>
          </div>

          <div className="lesson-tabs">
            <button type="button" className={`tab-button ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>Notes</button>
            <button type="button" className={`tab-button ${activeTab === 'qa' ? 'active' : ''}`} onClick={() => setActiveTab('qa')}>Q&A</button>
            <button type="button" className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Lesson Overview</button>
          </div>

          {activeTab === 'notes' && <div className="card-muted"><textarea className="form-textarea" rows={7} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Capture key insights, reminders, and revision notes here." /><div className="card-actions"><button type="button" className="btn btn-primary" onClick={handleSaveNotes}>Save Notes</button></div></div>}
          {activeTab === 'qa' && <div className="card-muted"><div className="form-group"><label className="form-label">Ask a study question</label><textarea className="form-textarea" rows={3} value={questionDraft} onChange={(event) => setQuestionDraft(event.target.value)} placeholder="Write a concept question or doubt for this lesson." /></div><div className="card-actions"><button type="button" className="btn btn-primary" onClick={handleAskQuestion}>Save Question</button></div><div className="notification-list">{questions.map((item) => <div key={item.id} className="notification-item"><strong>Question</strong><p>{item.text}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div>)}{!questions.length && <p>No lesson questions saved yet.</p>}</div></div>}
          {activeTab === 'overview' && <div className="card-muted"><p><strong>Course:</strong> {course?.title || 'Unknown course'}</p><p><strong>Lesson Type:</strong> {lesson.lessonType || 'text'}</p><p><strong>Duration:</strong> {lesson.durationMinutes || 0} minutes</p><p><strong>Video Provider:</strong> {lesson.videoProvider || 'n/a'}</p></div>}
        </div>

        <aside className="card lesson-sidebar-panel">
          <div className="section-head"><h3>Course Content</h3><span className="badge badge-neutral">{flatLessons.length} lessons</span></div>
          {curriculum.map((module) => <div key={module.id} className="module-block"><div className="module-heading"><strong>{module.title}</strong><span>{module.lessons?.length || 0} lessons</span></div><ul>{(module.lessons || []).map((entry) => <li key={entry.id}>{Number(entry.id) === Number(lessonId) ? <strong>{entry.title}</strong> : <Link to={`/lessons/${entry.id}`}>{entry.title}</Link>}</li>)}</ul></div>)}
        </aside>
      </div>}
    </div>
  );
}

