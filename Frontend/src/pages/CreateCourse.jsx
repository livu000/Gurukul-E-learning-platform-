import { useState } from 'react';
import { createCourse } from '../services/course.service';

function CreateCourse() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await createCourse({ title, description });
      setMessage('Course created successfully');
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
      setMessage('Not authorized or error occurred');
    }
  };

  return (
    <div>
      <h2>Create Course</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Course Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <br /><br />

        <textarea
          placeholder="Course Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <br /><br />

        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default CreateCourse;
