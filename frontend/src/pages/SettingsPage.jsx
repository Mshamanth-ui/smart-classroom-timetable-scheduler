import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { addHoliday, deleteHoliday, addBlocked, deleteBlocked, updateSetting } from '../api/settings';
import Button from '../components/common/Button';
import FormField, { Input, Select } from '../components/common/FormField';
import { Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import s from './SettingsPage.module.css';

const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat'];
const HOURS = ['6','7','8','9','10','11','12','1','2','3','4','5'];

export default function SettingsPage() {
  const { days, setDays, times, setTimes, holidays, blockedSlots,
          refreshHolidays, refreshBlocked } = useApp();

  const [hDate,  setHDate]  = useState('');
  const [hLabel, setHLabel] = useState('');
  const [bDay,   setBDay]   = useState('Mon');
  const [bTime,  setBTime]  = useState(times[0]||'8:00 AM');
  const [bReason,setBReason]= useState('');
  const [newHour,  setNewHour]   = useState('5');
  const [newPeriod,setNewPeriod] = useState('PM');

  const toggleSaturday = async checked => {
    const newDays = checked ? [...days,'Sat'] : days.filter(d=>d!=='Sat');
    setDays(newDays);
    await updateSetting('saturday_enabled', String(checked));
    toast.success(`Saturday ${checked?'enabled':'disabled'}`);
  };

  const addTimeSlot = async () => {
    const t = `${newHour}:00 ${newPeriod}`;
    if (times.includes(t)) { toast.error('Already exists'); return; }
    const next = [...times,t].sort((a,b)=>{
      const toMin = s => { const [ti,p]=s.split(' '); let [h]=ti.split(':').map(Number); if(p==='PM'&&h!==12)h+=12; if(p==='AM'&&h===12)h=0; return h*60; };
      return toMin(a)-toMin(b);
    });
    setTimes(next);
    await updateSetting('custom_times', JSON.stringify(next));
    toast.success(`${t} added`);
  };

  const removeTimeSlot = async (t) => {
    const next = times.filter(x=>x!==t);
    setTimes(next);
    await updateSetting('custom_times', JSON.stringify(next));
    toast.success(`${t} removed`);
  };

  const handleAddHoliday = async () => {
    if (!hDate||!hLabel) { toast.error('Fill date and name'); return; }
    try { await addHoliday({date:hDate,label:hLabel}); setHDate(''); setHLabel(''); await refreshHolidays(); toast.success('Holiday added'); }
    catch(e) { toast.error(e.response?.data?.message||'Error'); }
  };

  const handleDeleteHoliday = async id => {
    await deleteHoliday(id); await refreshHolidays(); toast.success('Holiday removed');
  };

  const handleAddBlocked = async () => {
    if (!bReason) { toast.error('Enter a reason'); return; }
    try { await addBlocked({day:bDay,timeSlot:bTime,reason:bReason}); setBReason(''); await refreshBlocked(); toast.success('Slot blocked'); }
    catch(e) { toast.error(e.response?.data?.message||'Error'); }
  };

  const handleDeleteBlocked = async id => {
    await deleteBlocked(id); await refreshBlocked(); toast.success('Block removed');
  };

  return (
    <div className={s.page}>
      <h2 className={s.title}>⚙️ Settings & Configuration</h2>
      <div className={s.grid}>

        {/* Day Config */}
        <div className={s.card}>
          <div className={s.cardTitle}>📅 Day Configuration</div>
          <div className={s.row}>
            <div><div className={s.rowLabel}>Enable Saturday</div><div className={s.rowSub}>Show Saturday in timetable</div></div>
            <label className={s.toggle}>
              <input type="checkbox" checked={days.includes('Sat')} onChange={e=>toggleSaturday(e.target.checked)}/>
              <span className={s.slider}/>
            </label>
          </div>
        </div>

        {/* Custom Time Slots */}
        <div className={s.card}>
          <div className={s.cardTitle}>🕐 Custom Time Slots</div>
          <div style={{display:'flex',gap:8,marginBottom:'1rem',alignItems:'flex-end'}}>
            <FormField label="Hour" style={{margin:0,flex:1}}>
              <Select value={newHour} onChange={e=>setNewHour(e.target.value)}>
                {HOURS.map(h=><option key={h}>{h}</option>)}
              </Select>
            </FormField>
            <FormField label="Period" style={{margin:0,flex:1}}>
              <Select value={newPeriod} onChange={e=>setNewPeriod(e.target.value)}>
                <option>AM</option><option>PM</option>
              </Select>
            </FormField>
            <Button size="sm" onClick={addTimeSlot}><Plus size={14}/></Button>
          </div>
          <div className={s.list}>
            {times.map(t=>(
              <div key={t} className={s.listItem}>
                <span>{t}</span>
                <button className={s.delBtn} onClick={()=>removeTimeSlot(t)}><Trash2 size={13}/></button>
              </div>
            ))}
          </div>
        </div>

        {/* Holidays */}
        <div className={s.card}>
          <div className={s.cardTitle}>🎉 Holidays & Closures</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
            <FormField label="Date"><Input type="date" value={hDate} onChange={e=>setHDate(e.target.value)}/></FormField>
            <FormField label="Name"><Input value={hLabel} onChange={e=>setHLabel(e.target.value)} placeholder="e.g. Republic Day"/></FormField>
          </div>
          <Button size="sm" onClick={handleAddHoliday} style={{marginBottom:'1rem'}}><Plus size={14}/> Add Holiday</Button>
          <div className={s.list}>
            {holidays.length===0 && <div className={s.empty}>No holidays added</div>}
            {holidays.map(h=>(
              <div key={h.id} className={s.listItem}>
                <div><div style={{fontSize:'.88rem',fontWeight:500}}>{h.label}</div><div style={{fontSize:'.76rem',color:'var(--muted)'}}>{h.date}</div></div>
                <button className={s.delBtn} onClick={()=>handleDeleteHoliday(h.id)}><Trash2 size={13}/></button>
              </div>
            ))}
          </div>
        </div>

        {/* Blocked Slots */}
        <div className={s.card}>
          <div className={s.cardTitle}>🔒 Block Slots (Exams/Events)</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
            <FormField label="Day"><Select value={bDay} onChange={e=>setBDay(e.target.value)}>{DAYS.map(d=><option key={d}>{d}</option>)}</Select></FormField>
            <FormField label="Time"><Select value={bTime} onChange={e=>setBTime(e.target.value)}>{times.map(t=><option key={t}>{t}</option>)}</Select></FormField>
          </div>
          <FormField label="Reason" style={{marginBottom:8}}><Input value={bReason} onChange={e=>setBReason(e.target.value)} placeholder="e.g. Mid-term Exam"/></FormField>
          <Button variant="danger" size="sm" onClick={handleAddBlocked} style={{marginBottom:'1rem'}}>🔒 Block Slot</Button>
          <div className={s.list}>
            {blockedSlots.length===0 && <div className={s.empty}>No blocked slots</div>}
            {blockedSlots.map(b=>(
              <div key={b.id} className={s.listItem}>
                <div><div style={{fontSize:'.88rem',fontWeight:500}}>{b.day} · {b.timeSlot}</div><div style={{fontSize:'.76rem',color:'var(--muted)'}}>{b.reason}</div></div>
                <button className={s.delBtn} onClick={()=>handleDeleteBlocked(b.id)}><Trash2 size={13}/></button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
