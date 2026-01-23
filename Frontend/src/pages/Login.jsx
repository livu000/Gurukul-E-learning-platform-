import { useState } from 'react';
import api, { setToken } from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('All fields required');
      return;
    }

    try {
      const res = await api.post('/auth/login', { email, password });

      const token = res.data.token;

      // ✅ 1. Save token permanently
      localStorage.setItem('token', token);

      // ✅ 2. Save user info
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // ✅ 3. Attach token to axios immediately
      setToken(token);

      // ✅ 4. Redirect
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto' }}>
      <h2>Login</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <br /><br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
