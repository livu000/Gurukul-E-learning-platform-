import { useEffect, useState } from 'react';
import { addQuizOptions, addQuizQuestion, createQuiz, getQuizQuestions, getTeacherQuizzes, publishQuiz } from '../services/quiz.service';
import { getCourses } from '../services/course.service';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';
import { pushNotification } from '../utils/notifications';

const emptyQuestionState = {
  questionText: '',
  questionType: 'mcq',
  marks: 1,
  correctTextAnswer: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 'optionA'
};

function TeacherQuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [quizForm, setQuizForm] = useState({ courseId: '', title: '', description: '', timeLimitMinutes: 0, passingMarks: 0, maxAttempts: 1 });
  const [questionForm, setQuestionForm] = useState(emptyQuestionState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizData, courseData] = await Promise.all([getTeacherQuizzes(), getCourses()]);
      setQuizzes(quizData || []);
      setCourses(courseData || []);
      setError('');
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadQuestions = async (quizId) => {
    try {
      const data = await getQuizQuestions(quizId);
      setQuestions(data || []);
      setSelectedQuizId(quizId);
    } catch (err) {
      console.error('Failed to load quiz questions:', err);
      alert('Failed to load quiz questions');
    }
  };

  const handleQuizCreate = async (event) => {
    event.preventDefault();
    if (!quizForm.courseId || !quizForm.title.trim()) return;
    try {
      setWorking(true);
      await createQuiz({
        courseId: Number(quizForm.courseId),
        title: quizForm.title.trim(),
        description: quizForm.description.trim(),
        timeLimitMinutes: Number(quizForm.timeLimitMinutes || 0),
        passingMarks: Number(quizForm.passingMarks || 0),
        maxAttempts: Number(quizForm.maxAttempts || 1)
      });
      pushNotification({ title: 'Quiz Created', message: `${quizForm.title.trim()} is ready for question authoring.` });
      setQuizForm({ courseId: '', title: '', description: '', timeLimitMinutes: 0, passingMarks: 0, maxAttempts: 1 });
      await loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setWorking(false);
    }
  };

  const handleQuestionCreate = async (event) => {
    event.preventDefault();
    if (!selectedQuizId || !questionForm.questionText.trim()) return;

    try {
      setWorking(true);
      const question = await addQuizQuestion({
        quizId: selectedQuizId,
        questionText: questionForm.questionText.trim(),
        questionType: questionForm.questionType,
        marks: Number(questionForm.marks || 1),
        correctTextAnswer: questionForm.questionType === 'short_answer' ? questionForm.correctTextAnswer.trim() : null
      });

      if (questionForm.questionType !== 'short_answer') {
        const options = [
          { key: 'optionA', optionText: questionForm.optionA },
          { key: 'optionB', optionText: questionForm.optionB },
          { key: 'optionC', optionText: questionForm.optionC },
          { key: 'optionD', optionText: questionForm.optionD }
        ].filter((item) => item.optionText.trim()).map((item, index) => ({
          optionText: item.optionText.trim(),
          isCorrect: item.key === questionForm.correctOption,
          sortOrder: index + 1
        }));

        await addQuizOptions({ questionId: question.id, options: options.length >= 2 ? options : [
          { optionText: 'True', isCorrect: questionForm.correctOption === 'optionA', sortOrder: 1 },
          { optionText: 'False', isCorrect: questionForm.correctOption === 'optionB', sortOrder: 2 }
        ] });
      }

      pushNotification({ title: 'Question Added', message: 'Quiz question saved successfully.' });
      setQuestionForm(emptyQuestionState);
      await loadQuestions(selectedQuizId);
      await loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to add question');
    } finally {
      setWorking(false);
    }
  };

  const handlePublish = async (quizId, isPublished) => {
    try {
      await publishQuiz(quizId, isPublished);
      pushNotification({ title: isPublished ? 'Quiz Published' : 'Quiz Unpublished', message: 'Quiz visibility updated for students.' });
      setQuizzes((prev) => prev.map((quiz) => quiz.id === quizId ? { ...quiz, isPublished } : quiz));
    } catch (err) {
      console.error('Failed to update quiz publish state:', err);
      alert(err.response?.data?.message || 'Failed to update quiz');
    }
  };

  return (
    <div className="page">
      <PageHeader title="Quiz Hub" />
      {error && <p className="form-error">{error}</p>}

      <div className="grid-2">
        <form className="card" onSubmit={handleQuizCreate}>
          <h3>Create Quiz</h3>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Course</label><select className="form-select" value={quizForm.courseId} onChange={(event) => setQuizForm((prev) => ({ ...prev, courseId: event.target.value }))} required><option value="">Select course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={quizForm.title} onChange={(event) => setQuizForm((prev) => ({ ...prev, title: event.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">Time Limit (minutes)</label><input className="form-input" type="number" min="0" value={quizForm.timeLimitMinutes} onChange={(event) => setQuizForm((prev) => ({ ...prev, timeLimitMinutes: event.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Passing Marks</label><input className="form-input" type="number" min="0" value={quizForm.passingMarks} onChange={(event) => setQuizForm((prev) => ({ ...prev, passingMarks: event.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Max Attempts</label><input className="form-input" type="number" min="1" value={quizForm.maxAttempts} onChange={(event) => setQuizForm((prev) => ({ ...prev, maxAttempts: event.target.value }))} /></div>
            <div className="form-group full-width"><label className="form-label">Description</label><textarea className="form-textarea" rows={4} value={quizForm.description} onChange={(event) => setQuizForm((prev) => ({ ...prev, description: event.target.value }))} /></div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={working}>{working ? 'Saving...' : 'Create Quiz'}</button>
        </form>

        <form className="card" onSubmit={handleQuestionCreate}>
          <h3>Question Builder</h3>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Selected Quiz</label><select className="form-select" value={selectedQuizId || ''} onChange={(event) => loadQuestions(Number(event.target.value))}><option value="">Choose quiz</option>{quizzes.map((quiz) => <option key={quiz.id} value={quiz.id}>{quiz.title}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Question Type</label><select className="form-select" value={questionForm.questionType} onChange={(event) => setQuestionForm((prev) => ({ ...prev, questionType: event.target.value }))}><option value="mcq">MCQ</option><option value="true_false">True / False</option><option value="short_answer">Short Answer</option></select></div>
            <div className="form-group"><label className="form-label">Marks</label><input className="form-input" type="number" min="1" value={questionForm.marks} onChange={(event) => setQuestionForm((prev) => ({ ...prev, marks: event.target.value }))} /></div>
            <div className="form-group full-width"><label className="form-label">Question Text</label><textarea className="form-textarea" rows={3} value={questionForm.questionText} onChange={(event) => setQuestionForm((prev) => ({ ...prev, questionText: event.target.value }))} /></div>
            {questionForm.questionType === 'short_answer' ? <div className="form-group full-width"><label className="form-label">Correct Text Answer</label><input className="form-input" value={questionForm.correctTextAnswer} onChange={(event) => setQuestionForm((prev) => ({ ...prev, correctTextAnswer: event.target.value }))} /></div> : <><div className="form-group"><label className="form-label">Option A</label><input className="form-input" value={questionForm.optionA} onChange={(event) => setQuestionForm((prev) => ({ ...prev, optionA: event.target.value }))} placeholder={questionForm.questionType === 'true_false' ? 'True' : ''} /></div><div className="form-group"><label className="form-label">Option B</label><input className="form-input" value={questionForm.optionB} onChange={(event) => setQuestionForm((prev) => ({ ...prev, optionB: event.target.value }))} placeholder={questionForm.questionType === 'true_false' ? 'False' : ''} /></div>{questionForm.questionType === 'mcq' && <><div className="form-group"><label className="form-label">Option C</label><input className="form-input" value={questionForm.optionC} onChange={(event) => setQuestionForm((prev) => ({ ...prev, optionC: event.target.value }))} /></div><div className="form-group"><label className="form-label">Option D</label><input className="form-input" value={questionForm.optionD} onChange={(event) => setQuestionForm((prev) => ({ ...prev, optionD: event.target.value }))} /></div></>}<div className="form-group"><label className="form-label">Correct Option</label><select className="form-select" value={questionForm.correctOption} onChange={(event) => setQuestionForm((prev) => ({ ...prev, correctOption: event.target.value }))}><option value="optionA">Option A</option><option value="optionB">Option B</option>{questionForm.questionType === 'mcq' && <><option value="optionC">Option C</option><option value="optionD">Option D</option></>}</select></div></>}
          </div>
          <button className="btn btn-primary" type="submit" disabled={working || !selectedQuizId}>{working ? 'Saving...' : 'Add Question'}</button>
        </form>
      </div>

      <div className="grid">
        {loading && <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>}
        {!loading && quizzes.length === 0 && <div className="card-muted">No quizzes created yet.</div>}
        {!loading && quizzes.length > 0 && quizzes.map((q) => (
          <div key={q.id} className="card">
            <h4>{q.title}</h4>
            <p className="card-muted">Total Marks: {q.totalMarks} • Attempts: {q.maxAttempts || 1}</p>
            <span className={q.isPublished ? 'badge badge-success' : 'badge badge-warning'}>{q.isPublished ? 'Published' : 'Draft'}</span>
            <div className="card-actions">
              <button className="btn btn-secondary" type="button" onClick={() => loadQuestions(q.id)}>Edit Questions</button>
              <button className="btn btn-secondary" type="button" onClick={() => handlePublish(q.id, !q.isPublished)}>{q.isPublished ? 'Unpublish' : 'Publish'}</button>
            </div>
          </div>
        ))}
      </div>

      {selectedQuizId && <div className="card">
        <h3>Quiz Questions</h3>
        {questions.length ? questions.map((question) => <div key={question.id} className="module-block"><div className="module-heading"><strong>{question.questionText}</strong><span>{question.marks} marks</span></div><p>{question.questionType}</p>{question.options?.length ? <ul>{question.options.map((option) => <li key={option.id}>{option.optionText}{option.isCorrect ? ' • correct' : ''}</li>)}</ul> : null}</div>) : <p>No questions added yet.</p>}
      </div>}
    </div>
  );
}

export default TeacherQuizList;
