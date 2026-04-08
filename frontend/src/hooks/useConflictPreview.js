import { useCallback, useState } from 'react';
import { useApp } from '../context/AppContext';

/**
 * Real-time conflict warnings inside the slot scheduling form.
 * Returns warnings array that updates as form fields change.
 */
export function useConflictPreview(editSlotId = null) {
  const { slots, rooms, teachers, isBlocked, getBlockReason } = useApp();
  const [warnings, setWarnings] = useState([]);

  const check = useCallback((form) => {
    const ws = [];
    const { day, timeSlot, roomId, teacherId } = form;

    if (!day || !timeSlot) { setWarnings([]); return; }

    // Blocked slot check
    if (isBlocked(day, timeSlot)) {
      ws.push({ type: 'block', msg: `🔒 Slot blocked: ${getBlockReason(day, timeSlot)}` });
    }

    // Room checks
    if (roomId) {
      const roomConflict = slots.find(s =>
        s.day === day && s.timeSlot === timeSlot &&
        s.roomId === parseInt(roomId) && s.id !== editSlotId
      );
      if (roomConflict)
        ws.push({ type: 'room', msg: `🏠 Room booked: "${roomConflict.subject}" (${roomConflict.cls})` });

      const room = rooms.find(r => r.id === parseInt(roomId));
      if (room?.status === 'MAINTENANCE')
        ws.push({ type: 'maint', msg: `🔧 "${room.name}" is under maintenance` });
    }

    // Teacher checks
    if (teacherId) {
      const tchConflict = slots.find(s =>
        s.day === day && s.timeSlot === timeSlot &&
        s.teacherId === parseInt(teacherId) && s.id !== editSlotId
      );
      if (tchConflict)
        ws.push({ type: 'teacher', msg: `👤 Teacher has "${tchConflict.subject}" at this time` });

      const teacher = teachers.find(t => t.id === parseInt(teacherId));
      if (teacher?.availability?.[day] === false)
        ws.push({ type: 'avail', msg: `📅 ${teacher.name} is unavailable on ${day}` });
      if (teacher && teacher.assignedHours >= teacher.maxHours)
        ws.push({ type: 'workload', msg: `⚡ ${teacher.name} is at max workload (${teacher.assignedHours}/${teacher.maxHours}h)` });
    }

    setWarnings(ws);
  }, [slots, rooms, teachers, isBlocked, getBlockReason, editSlotId]);

  return { warnings, check };
}
