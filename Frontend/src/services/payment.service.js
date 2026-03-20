import api from './api';

export const createPayment = async (courseId) => {
  const res = await api.post('/payments/create', { courseId });
  return res.data;
};

export const verifyPayment = async (paymentId) => {
  const res = await api.post('/payments/verify', {
    paymentId,
    gatewayData: {
      payment_id: 'FRONTEND_MOCK_' + Date.now()
    }
  });

  return res.data;
};

export const getMyPayments = async () => {
  const res = await api.get('/payments/my');
  return res.data;
};

export const getAllPayments = async () => {
  const res = await api.get('/payments/admin');
  return res.data;
};

export const refundPayment = async (paymentId, reason) => {
  const res = await api.post(`/payments/${paymentId}/refund`, { reason });
  return res.data;
};

export const downloadInvoice = async (paymentId) => {
  const res = await api.get(`/payments/${paymentId}/invoice`, {
    responseType: 'blob'
  });
  return res.data;
};
