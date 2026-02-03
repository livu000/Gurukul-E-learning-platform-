import { useEffect, useState } from "react";
import { getMyCertificates } from "../services/certificate.service";

export default function MyCertificates() {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    getMyCertificates().then(setCerts);
  }, []);

  return (
    <div>
      <h2>My Certificates</h2>
      {certs.map((c) => (
        <div key={c.certificate_id}>
          <p>Course ID: {c.course_id}</p>
          <p>Certificate ID: {c.certificate_id}</p>
          <a href={`/verify/${c.certificate_id}`} target="_blank">
            Verify
          </a>
        </div>
      ))}
    </div>
  );
}
