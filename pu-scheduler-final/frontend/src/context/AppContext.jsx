import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getSlots } from '../api/slots';
import { getRooms } from '../api/rooms';
import { getTeachers } from '../api/teachers';
import { getConflicts, getHolidays, getBlocked, getSettings } from '../api/settings';

const AppContext = createContext(null);

const DEFAULT_TIMES = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM'];
const DEFAULT_DAYS  = ['Mon','Tue','Wed','Thu','Fri'];

export function AppProvider({ children }) {
  const [slots,        setSlots]        = useState([]);
  const [rooms,        setRooms]        = useState([]);
  const [teachers,     setTeachers]     = useState([]);
  const [conflicts,    setConflicts]    = useState([]);
  const [holidays,     setHolidays]     = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [days,         setDays]         = useState(DEFAULT_DAYS);
  const [times,        setTimes]        = useState(DEFAULT_TIMES);
  const [loading,      setLoading]      = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [s, r, t, c, h, b, cfg] = await Promise.all([
        getSlots(), getRooms(), getTeachers(),
        getConflicts(), getHolidays(), getBlocked(), getSettings()
      ]);
      setSlots(s.data.data);
      setRooms(r.data.data);
      setTeachers(t.data.data);
      setConflicts(c.data.data);
      setHolidays(h.data.data);
      setBlockedSlots(b.data.data);
      const settings = cfg.data.data;
      if (settings.saturday_enabled === 'true')
        setDays(['Mon','Tue','Wed','Thu','Fri','Sat']);
      if (settings.custom_times)
        setTimes(JSON.parse(settings.custom_times));
    } catch(e) { console.error(e); }
    finally    { setLoading(false); }
  }, []);

  const refreshSlots     = useCallback(async () => { const r = await getSlots();    setSlots(r.data.data); const c = await getConflicts(); setConflicts(c.data.data); }, []);
  const refreshRooms     = useCallback(async () => { const r = await getRooms();    setRooms(r.data.data); }, []);
  const refreshTeachers  = useCallback(async () => { const r = await getTeachers(); setTeachers(r.data.data); }, []);
  const refreshConflicts = useCallback(async () => { const r = await getConflicts();setConflicts(r.data.data); }, []);
  const refreshHolidays  = useCallback(async () => { const r = await getHolidays(); setHolidays(r.data.data); }, []);
  const refreshBlocked   = useCallback(async () => { const r = await getBlocked();  setBlockedSlots(r.data.data); }, []);

  const isBlocked = useCallback((day, time) =>
    blockedSlots.some(b => b.day === day && b.timeSlot === time), [blockedSlots]);

  const getBlockReason = useCallback((day, time) =>
    blockedSlots.find(b => b.day === day && b.timeSlot === time)?.reason || '', [blockedSlots]);

  return (
    <AppContext.Provider value={{
      slots, rooms, teachers, conflicts, holidays, blockedSlots,
      days, setDays, times, setTimes, loading,
      fetchAll, refreshSlots, refreshRooms, refreshTeachers,
      refreshConflicts, refreshHolidays, refreshBlocked,
      isBlocked, getBlockReason,
      setSlots, setRooms, setTeachers
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
