import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { verifyCertificate } from "../services/certificate.service";

export default function VerifyCertificate() {
  const { id } = useParams();
  const [cert, setCert] = useState(null);

  useEffect(() => {
    verifyCertificate(id).then(setCert);
  }, [id]);

  if (!cert) return <p>Loading...</p>;

  return (
    <div>
      <h2>Certificate Verified ✅</h2>
      <p>Certificate ID: {cert.certificate_id}</p>
      <p>User ID: {cert.user_id}</p>
      <p>Course ID: {cert.course_id}</p>
      <p>Issued At: {cert.issued_at}</p>
    </div>
  );
}
