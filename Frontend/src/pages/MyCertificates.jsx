import { useEffect, useState } from 'react';
import { downloadCertificate, getMyCertificates } from '../services/certificate.service';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';
import { pushNotification } from '../utils/notifications';

export default function MyCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleDownload = async (certificateUid) => {
    try {
      const blob = await downloadCertificate(certificateUid);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificateUid}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      pushNotification({ title: 'Certificate Downloaded', message: `Certificate ${certificateUid} downloaded successfully.` });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to download certificate');
    }
  };

  useEffect(() => {
    getMyCertificates()
      .then((data) => setCerts(data || []))
      .catch((err) => {
        console.error(err);
        setError('Failed to load certificates');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <PageHeader title="My Certificates" />
      {error && <p className="form-error">{error}</p>}
      {loading ? <div className="grid"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div> : <div className="grid">{certs.map((cert) => <div key={cert.certificateUid} className="card"><p className="stat-label">Certificate</p><h3>{cert.course?.title || cert.courseTitleSnapshot || 'Completed Course'}</h3><p>Issued on {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : 'Unknown date'}</p><p><strong>UID:</strong> {cert.certificateUid}</p><div className="card-actions"><a href={`/verify/${cert.certificateUid}`} target="_blank" rel="noreferrer" className="btn btn-secondary">Verify</a><button type="button" onClick={() => handleDownload(cert.certificateUid)} className="btn btn-primary">Download PDF</button></div></div>)}{!certs.length && <div className="card-muted">No certificates available yet.</div>}</div>}
    </div>
  );
}
