import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  getLessonsByModule,
  getModulesByCourse,
  updateLesson,
  updateModule
} from '../services/course.service';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';
import { pushNotification } from '../utils/notifications';

function reorderItems(items, sourceId, targetId) {
  const sourceIndex = items.findIndex((item) => Number(item.id) === Number(sourceId));
  const targetIndex = items.findIndex((item) => Number(item.id) === Number(targetId));
  if (sourceIndex === -1 || targetIndex === -1) return items;
  const next = [...items];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next.map((item, index) => ({ ...item, sortOrder: index + 1 }));
}

function CourseBuilder() {
  const { courseId } = useParams();
  const [modules, setModules] = useState([]);
  const [lessonsByModule, setLessonsByModule] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
  const [lessonForms, setLessonForms] = useState({});
  const [dragState, setDragState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadModules = useCallback(async () => {
    try {
      setLoading(true);
      const moduleData = await getModulesByCourse(courseId);
      const normalizedModules = (moduleData || []).sort((a, b) => a.sortOrder - b.sortOrder);
      setModules(normalizedModules);
      const lessonEntries = await Promise.all(normalizedModules.map(async (module) => [module.id, await getLessonsByModule(module.id)]));
      const nextLessons = Object.fromEntries(lessonEntries.map(([moduleId, lessonList]) => [moduleId, (lessonList || []).sort((a, b) => a.sortOrder - b.sortOrder)]));
      setLessonsByModule(nextLessons);
      setExpandedModules(Object.fromEntries(normalizedModules.map((module) => [module.id, true])));
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load course builder data');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  const lessonCounts = useMemo(() => Object.fromEntries(Object.entries(lessonsByModule).map(([moduleId, items]) => [moduleId, items.length])), [lessonsByModule]);

  const persistModuleOrder = async (orderedModules) => {
    await Promise.all(orderedModules.map((module) => updateModule(module.id, { sortOrder: module.sortOrder })));
    setModules(orderedModules);
    pushNotification({ title: 'Module Order Updated', message: 'Curriculum module order saved successfully.' });
  };

  const persistLessonOrder = async (moduleId, orderedLessons) => {
    await Promise.all(orderedLessons.map((lesson) => updateLesson(lesson.id, { sortOrder: lesson.sortOrder })));
    setLessonsByModule((prev) => ({ ...prev, [moduleId]: orderedLessons }));
    pushNotification({ title: 'Lesson Order Updated', message: 'Lesson order saved successfully.' });
  };

  const handleCreateModule = async (event) => {
    event.preventDefault();
    if (!moduleForm.title.trim()) return;
    try {
      await createModule(courseId, moduleForm.title.trim(), { description: moduleForm.description.trim(), sortOrder: modules.length + 1 });
      setModuleForm({ title: '', description: '' });
      pushNotification({ title: 'Module Created', message: `${moduleForm.title.trim()} added to the curriculum.` });
      await loadModules();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create module');
    }
  };

  const handleCreateLesson = async (moduleId, event) => {
    event.preventDefault();
    const form = lessonForms[moduleId] || {};
    if (!form.title?.trim()) return;
    try {
      const lessonCount = lessonsByModule[moduleId]?.length || 0;
      await createLesson(moduleId, {
        title: form.title.trim(),
        description: form.description?.trim(),
        content: form.content?.trim(),
        videoUrl: form.videoUrl?.trim(),
        attachmentUrl: form.attachmentUrl?.trim(),
        lessonType: form.videoUrl ? 'video' : 'text',
        durationMinutes: Number(form.durationMinutes || 0),
        isPreview: Boolean(form.isPreview),
        sortOrder: lessonCount + 1
      });
      setLessonForms((prev) => ({ ...prev, [moduleId]: {} }));
      pushNotification({ title: 'Lesson Created', message: `${form.title.trim()} added to the module.` });
      await loadModules();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create lesson');
    }
  };

  const handleModuleSave = async (module) => {
    try {
      await updateModule(module.id, { title: module.title, description: module.description });
      pushNotification({ title: 'Module Updated', message: `${module.title} saved successfully.` });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update module');
    }
  };

  const handleLessonSave = async (lesson) => {
    try {
      await updateLesson(lesson.id, lesson);
      pushNotification({ title: 'Lesson Updated', message: `${lesson.title} saved successfully.` });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update lesson');
    }
  };

  const handleModuleDelete = async (moduleId) => {
    if (!window.confirm('Delete this module and all its lessons?')) return;
    try {
      await deleteModule(moduleId);
      pushNotification({ title: 'Module Deleted', message: 'Module removed from the curriculum.' });
      await loadModules();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete module');
    }
  };

  const handleLessonDelete = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await deleteLesson(lessonId);
      pushNotification({ title: 'Lesson Deleted', message: 'Lesson removed from the curriculum.' });
      await loadModules();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete lesson');
    }
  };

  if (loading) {
    return <div className="page"><PageHeader title="Course Builder" /><div className="grid"><SkeletonCard /><SkeletonCard /></div></div>;
  }

  return (
    <div className="page">
      <PageHeader title="Course Builder" />
      {error && <p className="form-error">{error}</p>}

      <form className="card" onSubmit={handleCreateModule}>
        <h3>Add Module</h3>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">Module Title</label><input className="form-input" value={moduleForm.title} onChange={(event) => setModuleForm((prev) => ({ ...prev, title: event.target.value }))} /></div>
          <div className="form-group full-width"><label className="form-label">Description</label><textarea className="form-textarea" rows={3} value={moduleForm.description} onChange={(event) => setModuleForm((prev) => ({ ...prev, description: event.target.value }))} /></div>
        </div>
        <button className="btn btn-primary" type="submit">Create Module</button>
      </form>

      <div className="grid-2">
        {modules.map((module) => (
          <div
            key={module.id}
            className="card builder-module-card"
            draggable
            onDragStart={() => setDragState({ type: 'module', id: module.id })}
            onDragOver={(event) => event.preventDefault()}
            onDrop={async () => {
              if (dragState?.type !== 'module' || Number(dragState.id) === Number(module.id)) return;
              const reordered = reorderItems(modules, dragState.id, module.id);
              setDragState(null);
              await persistModuleOrder(reordered);
            }}
          >
            <div className="section-head">
              <h3>{module.title}</h3>
              <div className="card-actions">
                <span className="badge badge-neutral">{lessonCounts[module.id] || 0} lessons</span>
                <button className="btn btn-outline" type="button" onClick={() => setExpandedModules((prev) => ({ ...prev, [module.id]: !prev[module.id] }))}>{expandedModules[module.id] ? 'Collapse' : 'Expand'}</button>
              </div>
            </div>

            <div className="form-group"><label className="form-label">Module Title</label><input className="form-input" value={module.title} onChange={(event) => setModules((prev) => prev.map((entry) => entry.id === module.id ? { ...entry, title: event.target.value } : entry))} /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={3} value={module.description || ''} onChange={(event) => setModules((prev) => prev.map((entry) => entry.id === module.id ? { ...entry, description: event.target.value } : entry))} /></div>
            <div className="card-actions"><button className="btn btn-primary" type="button" onClick={() => handleModuleSave(module)}>Save Module</button><button className="btn btn-danger" type="button" onClick={() => handleModuleDelete(module.id)}>Delete Module</button></div>

            {expandedModules[module.id] && (
              <div className="builder-lessons">
                {(lessonsByModule[module.id] || []).map((lesson) => (
                  <div
                    key={lesson.id}
                    className="card-muted builder-lesson-card"
                    draggable
                    onDragStart={() => setDragState({ type: 'lesson', moduleId: module.id, id: lesson.id })}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={async () => {
                      if (dragState?.type !== 'lesson' || Number(dragState.moduleId) !== Number(module.id) || Number(dragState.id) === Number(lesson.id)) return;
                      const reordered = reorderItems(lessonsByModule[module.id] || [], dragState.id, lesson.id);
                      setDragState(null);
                      await persistLessonOrder(module.id, reordered);
                    }}
                  >
                    <strong>{lesson.title}</strong>
                    <div className="form-grid">
                      <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={lesson.title} onChange={(event) => setLessonsByModule((prev) => ({ ...prev, [module.id]: (prev[module.id] || []).map((entry) => entry.id === lesson.id ? { ...entry, title: event.target.value } : entry) }))} /></div>
                      <div className="form-group"><label className="form-label">Duration (minutes)</label><input className="form-input" type="number" min="0" value={lesson.durationMinutes || 0} onChange={(event) => setLessonsByModule((prev) => ({ ...prev, [module.id]: (prev[module.id] || []).map((entry) => entry.id === lesson.id ? { ...entry, durationMinutes: event.target.value } : entry) }))} /></div>
                      <div className="form-group"><label className="form-label">Video URL</label><input className="form-input" value={lesson.videoUrl || ''} onChange={(event) => setLessonsByModule((prev) => ({ ...prev, [module.id]: (prev[module.id] || []).map((entry) => entry.id === lesson.id ? { ...entry, videoUrl: event.target.value, lessonType: event.target.value ? 'video' : 'text' } : entry) }))} /></div>
                      <div className="form-group"><label className="form-label">Attachment URL</label><input className="form-input" value={lesson.attachmentUrl || ''} onChange={(event) => setLessonsByModule((prev) => ({ ...prev, [module.id]: (prev[module.id] || []).map((entry) => entry.id === lesson.id ? { ...entry, attachmentUrl: event.target.value } : entry) }))} /></div>
                      <div className="form-group full-width"><label className="form-label">Content</label><textarea className="form-textarea" rows={4} value={lesson.content || ''} onChange={(event) => setLessonsByModule((prev) => ({ ...prev, [module.id]: (prev[module.id] || []).map((entry) => entry.id === lesson.id ? { ...entry, content: event.target.value } : entry) }))} /></div>
                    </div>
                    <div className="card-actions"><button className="btn btn-primary" type="button" onClick={() => handleLessonSave(lesson)}>Save Lesson</button><button className="btn btn-danger" type="button" onClick={() => handleLessonDelete(lesson.id)}>Delete Lesson</button></div>
                  </div>
                ))}

                <form className="card-muted" onSubmit={(event) => handleCreateLesson(module.id, event)}>
                  <strong>Add Lesson</strong>
                  <div className="form-grid">
                    <div className="form-group"><label className="form-label">Lesson Title</label><input className="form-input" value={lessonForms[module.id]?.title || ''} onChange={(event) => setLessonForms((prev) => ({ ...prev, [module.id]: { ...prev[module.id], title: event.target.value } }))} /></div>
                    <div className="form-group"><label className="form-label">Duration (minutes)</label><input className="form-input" type="number" min="0" value={lessonForms[module.id]?.durationMinutes || ''} onChange={(event) => setLessonForms((prev) => ({ ...prev, [module.id]: { ...prev[module.id], durationMinutes: event.target.value } }))} /></div>
                    <div className="form-group"><label className="form-label">Video URL</label><input className="form-input" value={lessonForms[module.id]?.videoUrl || ''} onChange={(event) => setLessonForms((prev) => ({ ...prev, [module.id]: { ...prev[module.id], videoUrl: event.target.value } }))} /></div>
                    <div className="form-group"><label className="form-label">Attachment URL</label><input className="form-input" value={lessonForms[module.id]?.attachmentUrl || ''} onChange={(event) => setLessonForms((prev) => ({ ...prev, [module.id]: { ...prev[module.id], attachmentUrl: event.target.value } }))} /></div>
                    <div className="form-group full-width"><label className="form-label">Content</label><textarea className="form-textarea" rows={3} value={lessonForms[module.id]?.content || ''} onChange={(event) => setLessonForms((prev) => ({ ...prev, [module.id]: { ...prev[module.id], content: event.target.value } }))} /></div>
                  </div>
                  <button className="btn btn-primary" type="submit">Add Lesson</button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseBuilder;

