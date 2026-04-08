import s from './Avatar.module.css';

export default function Avatar({ user }) {
  // Generate initials from full name
  const initials = user?.fullName
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user?.username?.slice(0, 2).toUpperCase() || '?';

  // Generate color based on username (deterministic)
  const colors = ['#3b82f6', '#06d6a0', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const colorIndex = user?.username?.charCodeAt(0) % colors.length || 0;
  const bgColor = colors[colorIndex];

  return (
    <div
      className={s.avatar}
      style={{
        backgroundColor: bgColor,
        color: '#fff',
      }}
    >
      {initials}
    </div>
  );
}
