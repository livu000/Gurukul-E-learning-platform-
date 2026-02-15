import api from "./api";

// ==========================
// CREATE PAYMENT INTENT
// ==========================
export const createPayment = async (courseId) => {
  const res = await api.post("/payments/create", { courseId });
  return res.data;
};

// ==========================
// VERIFY PAYMENT (MOCK FLOW)
// ==========================
export const verifyPayment = async (paymentId) => {
  const res = await api.post("/payments/verify", {
    paymentId,
    gatewayData: {
      payment_id: "FRONTEND_MOCK_" + Date.now()
    }
  });

  return res.data;
};

// ==========================
// GET MY PAYMENTS
// ==========================
export const getMyPayments = async () => {
  const res = await api.get("/payments/my");
  return res.data;
};
