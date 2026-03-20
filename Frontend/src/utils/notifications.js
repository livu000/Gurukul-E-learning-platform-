const STORAGE_KEY = 'gurukul-notifications';
const EVENT_NAME = 'gurukul:notifications';

export function getNotifications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function pushNotification(notification) {
  const nextItem = {
    id: notification.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: notification.title || 'Update',
    message: notification.message || '',
    createdAt: notification.createdAt || new Date().toISOString()
  };

  const nextList = [nextItem, ...getNotifications()].slice(0, 12);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: nextList }));
  return nextItem;
}

export function clearNotifications() {
  localStorage.setItem(STORAGE_KEY, '[]');
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: [] }));
}

export function subscribeNotifications(callback) {
  const handler = (event) => callback(event.detail || getNotifications());
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
