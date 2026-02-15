import { useEffect, useState } from "react";
import { getMyPayments } from "../services/payment.service";

export default function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================
  // FETCH PAYMENTS (React 19 Safe)
  // ==========================
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

  if (loading) {
    return <p>Loading payments...</p>;
  }

  return (
    <div style={{ maxWidth: 700, margin: "30px auto" }}>
      <h2>My Payments</h2>

      {payments.length === 0 && <p>No payments found</p>}

      {payments.map((p) => (
        <div
          key={p.id}
          style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
        >
          <p><strong>Course ID:</strong> {p.courseId}</p>
          <p><strong>Amount:</strong> ₹{p.amount}</p>
          <p><strong>Status:</strong> {p.status}</p>
        </div>
      ))}
    </div>
  );
}
