import { useEffect, useState } from "react";
import { getMyCertificates } from "../services/certificate.service";
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';

export default function MyCertificates() {

  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD CERTIFICATES
  ========================= */
  useEffect(() => {
    const loadCertificates = async () => {
      try {
        const data = await getMyCertificates();
        setCerts(data);
      } catch (err) {
        console.error("Failed to load certificates", err);
      } finally {
        setLoading(false);
      }
    };

    loadCertificates();
  }, []);

  return (
    <div className="page">

      <PageHeader title="My Certificates" />

      {/* =========================
          SKELETON LOADING
      ========================= */}
      {loading && (
        <div className="grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* =========================
          EMPTY STATE
      ========================= */}
      {!loading && certs.length === 0 && (
        <p>No certificates available.</p>
      )}

      {/* =========================
          CERTIFICATE GRID
      ========================= */}
      {!loading && certs.length > 0 && (
        <div className="grid">

          {certs.map((c) => (
            <div key={c.certificate_id} className="card">

              <p>
                <strong>Course ID:</strong> {c.course_id}
              </p>

              <p>
                <strong>Certificate ID:</strong> {c.certificate_id}
              </p>

              <div className="card-actions">
                <a
                  href={`/verify/${c.certificate_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                >
                  Verify
                </a>
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}
