import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/common/BrandLogo';

function Landing() {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken') || null;

  const handleEnter = () => {
    if (accessToken) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-wrapper">
      <div className="landing-container">
        <header className="landing-header">
          <BrandLogo size="md" subtitle="Online learning platform" className="landing-brand" />
          <div>
            <Link
              to="/login"
              className="btn btn-outline"
            >
              Login
            </Link>
          </div>
        </header>

        <section className="landing-hero">
          <h2>Role-Based Learning Platform</h2>
          <p className="card-muted">
            Courses • Lessons • Quizzes • Assignments • Certificates
          </p>
          <button
            className="btn btn-primary"
            onClick={handleEnter}
          >
            Enter Platform
          </button>
        </section>

        <section className="landing-features grid">
          <div className="card">
            <h3>Structured Courses</h3>
            <p className="card-muted">
              Module-based learning system connected
              to backend curriculum.
            </p>
          </div>

          <div className="card">
            <h3>Progress Tracking</h3>
            <p className="card-muted">
              Backend-driven lesson completion and
              certification workflow.
            </p>
          </div>

          <div className="card">
            <h3>Teacher & Student Roles</h3>
            <p className="card-muted">
              Role-based experience powered by
              JWT authentication.
            </p>
          </div>
        </section>

        <footer className="landing-footer">
          <BrandLogo size="sm" subtitle="Minimal enterprise system" className="landing-footer-brand" />
        </footer>
      </div>
    </div>
  );
}

export default Landing;
