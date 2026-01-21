import { useState } from 'react';
import api, { setToken } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault();
    const res = await api.post('/auth/login',{ email, password });
    setToken(res.data.token);
    localStorage.setItem('token', res.data.token);
    nav('/dashboard');
  };

  return (
    <form onSubmit={submit}>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
      <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="password" />
      <button>Login</button>
    </form>
  );
}
