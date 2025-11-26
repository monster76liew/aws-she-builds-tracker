// Create notification
async function createNotification(userId, type, title, message, relatedId) {
  await db.collection('notifications').add({
    userId,
    type,
    title,
    message,
    relatedId,
    read: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// Listen to real-time notifications
function subscribeToNotifications(userId, onUpdate) {
  return db.collection('notifications')
    .where('userId', '==', userId)
    .where('read', '==', false)
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      const notifications = [];
      snapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() });
      });
      onUpdate(notifications);
    });
}

// Mark notification as read
async function markNotificationRead(notificationId) {
  await db.collection('notifications').doc(notificationId).update({
    read: true
  });
}

// Usage in dashboard:
const user = auth.currentUser;
const unsubscribe = subscribeToNotifications(user.uid, (notifications) => {
  updateNotificationBadge(notifications.length);
  renderNotificationList(notifications);
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  unsubscribe();
});