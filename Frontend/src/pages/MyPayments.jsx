import { useEffect, useState } from 'react';
import { downloadInvoice, getMyPayments } from '../services/payment.service';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';
import { pushNotification } from '../utils/notifications';

export default function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyPayments()
      .then((data) => setPayments(data || []))
      .catch((err) => {
        console.error(err);
        setError('Failed to load payments');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInvoiceDownload = async (paymentId, invoiceNumber) => {
    try {
      const blob = await downloadInvoice(paymentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoiceNumber || `invoice-${paymentId}`}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      pushNotification({ title: 'Invoice Downloaded', message: `Invoice ${invoiceNumber || paymentId} downloaded successfully.` });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to download invoice');
    }
  };

  return (
    <div className="page">
      <PageHeader title="My Payments" />
      {error && <p className="form-error">{error}</p>}
      {loading ? <div className="grid"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div> : <div className="grid">{payments.map((payment) => <div key={payment.id} className="card"><p className="stat-label">{payment.course?.title || `Course ${payment.courseId}`}</p><h3>₹{payment.amount}</h3><p>Status: <span className="badge badge-info">{payment.status}</span></p><p>Provider: {payment.paymentProvider || 'mock'}</p><p>Reference: {payment.transactionRef || 'Pending'}</p>{payment.invoice?.invoiceNumber ? <p><strong>Invoice:</strong> {payment.invoice.invoiceNumber}</p> : null}<div className="card-actions">{payment.invoice?.invoiceNumber ? <button type="button" className="btn btn-secondary" onClick={() => handleInvoiceDownload(payment.id, payment.invoice.invoiceNumber)}>Download Invoice</button> : <span className="badge badge-warning">Invoice pending</span>}</div></div>)}{!payments.length && <div className="card-muted">No payments found.</div>}</div>}
    </div>
  );
}
