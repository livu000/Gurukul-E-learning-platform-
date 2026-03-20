import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { verifyCertificate } from '../services/certificate.service';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';

export default function VerifyCertificate() {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { verifyCertificate(id).then((data) => setCert(data || null)).catch((err) => { console.error(err); setError('Certificate not found or invalid'); }).finally(() => setLoading(false)); }, [id]);
  return <div className="page"><PageHeader title="Certificate Verification" />{error && <p className="form-error">{error}</p>}{loading ? <div className="grid"><SkeletonCard /></div> : cert && <div className="card"><span className="badge badge-success">Verified</span><div className="grid"><div><p className="stat-label">Certificate UID</p><p>{cert.certificateUid}</p></div><div><p className="stat-label">Learner</p><p>{cert.userNameSnapshot || cert.user?.name || 'Student'}</p></div><div><p className="stat-label">Course</p><p>{cert.courseTitleSnapshot || cert.course?.title || 'Course'}</p></div><div><p className="stat-label">Issued At</p><p>{cert.issuedAt ? new Date(cert.issuedAt).toLocaleString() : 'Unknown'}</p></div><div><p className="stat-label">Verification Code</p><p>{cert.verificationCode}</p></div><div><p className="stat-label">Status</p><p>{cert.isValid ? 'Valid' : 'Revoked'}</p></div></div></div>}</div>;
}
