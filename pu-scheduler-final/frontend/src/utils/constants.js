/** Shared constants used across the app */

export const DAYS_BASE = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
export const DAYS_WITH_SAT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DEFAULT_TIMES = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
];

export const SLOT_COLORS = [
  { label: 'Blue',   value: '#3b82f6' },
  { label: 'Green',  value: '#06d6a0' },
  { label: 'Amber',  value: '#f59e0b' },
  { label: 'Purple', value: '#a78bfa' },
  { label: 'Red',    value: '#f87171' },
  { label: 'Sky',    value: '#38bdf8' },
  { label: 'Orange', value: '#fb923c' },
  { label: 'Pink',   value: '#e879f9' },
];

export const ROOM_TYPES = [
  { label: 'Classroom',    value: 'CLASSROOM' },
  { label: 'Lab',          value: 'LAB' },
  { label: 'Lecture Hall', value: 'LECTURE_HALL' },
  { label: 'Seminar Room', value: 'SEMINAR_ROOM' },
];

export const EQUIPMENT_OPTIONS = [
  'Projector', 'AC', 'Whiteboard', 'Smart Board',
  'Lab Equipment', 'PA System', 'Computer'
];

export const ROLES = {
  ADMIN:   { label: 'Admin',   color: 'var(--accent)' },
  TEACHER: { label: 'Teacher', color: 'var(--accent2)' },
  VIEWER:  { label: 'Viewer',  color: 'var(--muted)' },
};

export const CONFLICT_TYPES = {
  room:         { icon: '🏠', label: 'Room',         color: 'var(--danger)' },
  teacher:      { icon: '👤', label: 'Teacher',      color: 'var(--accent)' },
  class:        { icon: '📚', label: 'Class',        color: 'var(--accent3)' },
  availability: { icon: '📅', label: 'Availability', color: 'var(--accent3)' },
  workload:     { icon: '⚡', label: 'Workload',     color: '#a855f7' },
};
