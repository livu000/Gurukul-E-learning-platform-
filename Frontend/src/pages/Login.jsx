import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    if (!email.trim() || !password.trim()) return setError('Email and password are required');
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email: email.trim(), password: password.trim(), deviceInfo: navigator.userAgent });
      const { accessToken, refreshToken, user } = res.data || {};
      if (!accessToken || !user) throw new Error('Invalid login response');
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel auth-panel-art">
        <p className="auth-eyebrow">Gurukul Platform</p>
        <h1>Build courses, guide learners, and manage your LMS from one workspace.</h1>
        <p>Admin, teacher, and student journeys are all connected through one secure learning platform.</p>
        <div className="auth-badges">
          <span>Course Review</span>
          <span>Assignments</span>
          <span>Certificates</span>
          <span>Payments</span>
        </div>
      </div>
      <div className="auth-panel auth-panel-form">
        <div className="card login-card">
          <p className="auth-eyebrow">Secure Access</p>
          <h2>Sign in to Gurukul</h2>
          <p className="auth-copy">Use your authorized credentials to enter the correct role workspace.</p>
          {error && <p className="form-error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>{loading ? 'Signing In...' : 'Login'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
