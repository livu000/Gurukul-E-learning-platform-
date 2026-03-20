import { useEffect, useState } from 'react';
import api from '../services/api';
import { getIssuedCertificates, revokeCertificate } from '../services/certificate.service';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';
import { pushNotification } from '../utils/notifications';

function AdminCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [certificateData, completionData] = await Promise.all([
        getIssuedCertificates(),
        api.get('/enrollments/completions')
      ]);

      setCertificates(certificateData || []);
      setCompletions(completionData.data || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load certificates and completion records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRevoke = async (certificateUid) => {
    try {
      await revokeCertificate(certificateUid);
      pushNotification({
        title: 'Certificate Revoked',
        message: `Certificate ${certificateUid} was marked invalid.`
      });
      await loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to revoke certificate');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Certificates & Completions" />
        <div className="grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="Certificates & Completions"
        action={<button className="btn btn-secondary" type="button" onClick={loadData}>Refresh</button>}
      />
      {error && <p className="form-error">{error}</p>}

      <div className="grid-2">
        <div className="card">
          <div className="section-head">
            <h3>Issued Certificates</h3>
            <span className="badge badge-info">{certificates.length} issued</span>
          </div>
          {certificates.length ? certificates.map((certificate) => (
            <div key={certificate.certificateUid} className="list-row">
              <div>
                <strong>{certificate.courseTitleSnapshot || certificate.course?.title || 'Course'}</strong>
                <p>{certificate.userNameSnapshot || certificate.user?.name || 'Learner'} • {certificate.certificateUid}</p>
              </div>
              <div className="analytics-inline-stats">
                <span className={`badge ${certificate.isValid ? 'badge-success' : 'badge-warning'}`}>
                  {certificate.isValid ? 'Valid' : 'Revoked'}
                </span>
                {certificate.isValid ? (
                  <button className="btn btn-danger" type="button" onClick={() => handleRevoke(certificate.certificateUid)}>
                    Revoke
                  </button>
                ) : null}
              </div>
            </div>
          )) : <p>No certificates issued yet.</p>}
        </div>

        <div className="card">
          <div className="section-head">
            <h3>Completion Records</h3>
            <span className="badge badge-neutral">{completions.length} learners</span>
          </div>
          {completions.length ? completions.map((entry) => (
            <div key={entry.id} className="list-row">
              <div>
                <strong>{entry.user?.name || 'Learner'}</strong>
                <p>{entry.course?.title || 'Course'}</p>
              </div>
              <div className="analytics-inline-stats">
                <span className="badge badge-info">{Number(entry.progressPercentage || 0)}%</span>
                <span className={`badge ${entry.certificateIssued ? 'badge-success' : 'badge-warning'}`}>
                  {entry.certificateIssued ? 'Certificate issued' : 'Pending certificate'}
                </span>
              </div>
            </div>
          )) : <p>No completion records available.</p>}
        </div>
      </div>
    </div>
  );
}

export default AdminCertificates;
