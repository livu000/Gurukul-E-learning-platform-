import { useEffect, useState } from 'react';
import api from '../services/api';

export default function CourseList(){
  const [courses, setCourses] = useState([]);
  useEffect(()=>{
    api.get('/courses').then(r=>setCourses(r.data));
  },[]);
  return (
    <div>
      {courses.map(c => <div key={c.id}>{c.title}</div>)}
    </div>
  );
}
