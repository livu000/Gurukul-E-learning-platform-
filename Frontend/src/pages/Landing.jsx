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
            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
          </div>
        </header>


        {/* ======================
            HERO SECTION
        ====================== */}
        <section className="landing-hero">

          <h2>Minimal Learning Platform</h2>

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


        {/* ======================
            FEATURES GRID
        ====================== */}
        <section className="landing-features grid">

          <div className="card">
            <h3>Structured Courses</h3>
            <p className="card-muted">
              Module-based learning system connected to backend curriculum.
            </p>
          </div>

          <div className="card">
            <h3>Progress Tracking</h3>
            <p className="card-muted">
              Backend driven lesson completion & certification flow.
            </p>
          </div>

          <div className="card">
            <h3>Teacher & Student Roles</h3>
            <p className="card-muted">
              Role-based experience powered by JWT authentication.
            </p>
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
