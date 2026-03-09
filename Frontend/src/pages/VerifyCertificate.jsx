import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { verifyCertificate } from "../services/certificate.service";

import PageHeader from "../components/common/PageHeader";
import SkeletonCard from "../components/common/SkeletonCard";

export default function VerifyCertificate() {

  const { id } = useParams();

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     VERIFY CERTIFICATE
  ========================= */

  useEffect(() => {

    const loadCertificate = async () => {

      try {

        const data = await verifyCertificate(id);

        setCert(data || null);

      } catch (err) {

        console.error("Certificate verification failed:", err);

        setError("Certificate not found or invalid");

      } finally {

        setLoading(false);

      }

    };

    loadCertificate();

  }, [id]);

  return (

    <div className="page">

      <PageHeader title="Certificate Verification" />

      {error && <p className="form-error">{error}</p>}

      {/* =========================
          LOADING STATE
      ========================= */}

      {loading && (

        <div className="grid">
          <SkeletonCard />
        </div>

      )}

      {/* =========================
          CERTIFICATE CARD
      ========================= */}

      {!loading && cert && (

        <div className="card">

          <span className="badge badge-success">
            Verified
          </span>

          <div className="grid">

            <div>
              <p className="card-label">Certificate ID</p>
              <p>{cert.certificate_id}</p>
            </div>

            <div>
              <p className="card-label">User ID</p>
              <p>{cert.user_id}</p>
            </div>

            <div>
              <p className="card-label">Course ID</p>
              <p>{cert.course_id}</p>
            </div>

            <div>
              <p className="card-label">Issued At</p>
              <p>
                {cert.issued_at
                  ? new Date(cert.issued_at).toLocaleString()
                  : "Unknown"}
              </p>
            </div>

          </div>

        </div>

      )}

    </div>

  );

}