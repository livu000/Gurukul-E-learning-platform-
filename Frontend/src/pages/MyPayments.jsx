import { useEffect, useState } from "react";
import { getMyPayments } from "../services/payment.service";
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';

export default function MyPayments() {

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH PAYMENTS
  ========================= */
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await getMyPayments();
        setPayments(data);
      } catch (err) {
        console.error("Failed to load payments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  /* =========================
     STATUS BADGE HELPER
  ========================= */
  const getStatusClass = (status) => {
    if (!status) return "status-badge";

    const s = status.toLowerCase();

    if (s === "completed" || s === "success" || s === "paid")
      return "status-badge status-success";

    if (s === "pending")
      return "status-badge status-warning";

    if (s === "failed" || s === "cancelled")
      return "status-badge status-danger";

    return "status-badge";
  };

  return (
    <div className="page">

      <PageHeader title="My Payments" />

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
      {!loading && payments.length === 0 && (
        <p>No payments found.</p>
      )}

      {/* =========================
          PAYMENT LIST
      ========================= */}
      {!loading && payments.length > 0 && (
        <div className="grid">

          {payments.map((p) => (
            <div key={p.id} className="card">

              <p>
                <strong>Course ID:</strong> {p.courseId}
              </p>

              <p>
                <strong>Amount:</strong> ₹{p.amount}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span className={getStatusClass(p.status)}>
                  {p.status}
                </span>
              </p>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}
