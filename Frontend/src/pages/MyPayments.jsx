import { useEffect, useState } from 'react';
import { getMyPayments } from '../services/payment.service';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';

export default function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { getMyPayments().then((data) => setPayments(data || [])).catch((err) => { console.error(err); setError('Failed to load payments'); }).finally(() => setLoading(false)); }, []);
  return <div className="page"><PageHeader title="My Payments" />{error && <p className="form-error">{error}</p>}{loading ? <div className="grid"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div> : <div className="grid">{payments.map((payment) => <div key={payment.id} className="card"><p className="stat-label">{payment.course?.title || `Course ${payment.courseId}`}</p><h3>₹{payment.amount}</h3><p>Status: <span className="badge badge-info">{payment.status}</span></p><p>Provider: {payment.paymentProvider || 'mock'}</p><p>Reference: {payment.transactionRef || 'Pending'}</p>{payment.invoice?.invoiceNumber ? <p><strong>Invoice:</strong> {payment.invoice.invoiceNumber}</p> : null}</div>)}{!payments.length && <div className="card-muted">No payments found.</div>}</div>}</div>;
}
