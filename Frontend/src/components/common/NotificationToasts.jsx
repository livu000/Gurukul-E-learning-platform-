import { useEffect, useState } from 'react';
import { getNotifications, subscribeNotifications } from '../../utils/notifications';

function NotificationToasts() {
  const [notifications, setNotifications] = useState(getNotifications().slice(0, 3));

  useEffect(() => subscribeNotifications((next) => setNotifications((next || []).slice(0, 3))), []);

  if (!notifications.length) {
    return null;
  }

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {notifications.map((item) => (
        <div key={item.id} className="toast-card">
          <strong>{item.title}</strong>
          <p>{item.message}</p>
          <small>{new Date(item.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

export default NotificationToasts;
