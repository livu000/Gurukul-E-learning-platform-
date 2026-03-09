import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* =========================
     LOGIN HANDLER
  ========================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (loading) return;

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("All fields required");
      return;
    }

    setLoading(true);
    setError("");

    try {

      const res = await api.post("/auth/login", {
        email: cleanEmail,
        password: cleanPassword
      });

      const { accessToken, refreshToken, user } = res.data || {};

      if (!accessToken || !user) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");

    } catch (err) {

      console.error("Login failed:", err);

      setError(
        err.response?.data?.message ||
        "Login failed"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="login-wrapper">

      <div className="card login-card">

        <h2>Login</h2>

        {error && (
          <p className="form-error">{error}</p>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label className="form-label">
              Email
            </label>

            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>

          <div className="form-group">

            <label className="form-label">
              Password
            </label>

            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Login"}
          </button>

        </form>

      </div>

    </div>

  );

}

export default Login;