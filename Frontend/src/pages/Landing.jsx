import { Link, useNavigate } from "react-router-dom";

function Landing() {

  const navigate = useNavigate();

  const accessToken = localStorage.getItem("accessToken");

  const handleEnter = () => {
    if (accessToken) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="landing-wrapper">
    <div className="landing-container">

      {/* ======================
          HEADER
      ====================== */}
      <header className="landing-header">
        <h1>Gurukul</h1>
        <div>
          <Link to="/login" className="btn-outline">
            Login
          </Link>
        </div>
      </header>

      {/* ======================
          HERO SECTION
      ====================== */}
      <section className="landing-hero">
        <h2>Minimal Learning Platform</h2>

        <p>
          Courses • Lessons • Quizzes • Assignments • Certificates
        </p>

        <button className="btn-primary" onClick={handleEnter}>
          Enter Platform
        </button>
      </section>

      {/* ======================
          FEATURES
      ====================== */}
      <section className="landing-features">

        <div className="feature-card">
          <h3>Structured Courses</h3>
          <p>Module-based learning system connected to backend curriculum.</p>
        </div>

        <div className="feature-card">
          <h3>Progress Tracking</h3>
          <p>Backend driven lesson completion & certification flow.</p>
        </div>

        <div className="feature-card">
          <h3>Teacher & Student Roles</h3>
          <p>Role-based experience powered by JWT authentication.</p>
        </div>

      </section>

      {/* ======================
          FOOTER
      ====================== */}
      <footer className="landing-footer">
        <p>Gurukul LMS — Minimal Enterprise System</p>
      </footer>

    </div>
    </div>
  );
}

export default Landing;
