import { useState, useCallback } from 'react';
import { useApp }  from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { createSlot, updateSlot, deleteSlot as apiDeleteSlot, moveSlot as apiMove, copySlot as apiCopy } from '../api/slots';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import FormField, { Input, Select } from '../components/common/FormField';
import { Plus, Copy, Edit2, Trash2, Printer, Download, X } from 'lucide-react';
import s from './TimetablePage.module.css';

const COLORS = ['#3b82f6','#06d6a0','#f59e0b','#a78bfa','#f87171','#38bdf8','#fb923c','#e879f9'];
const DAYS_ALL = ['Mon','Tue','Wed','Thu','Fri','Sat'];

export default function TimetablePage() {
  const { slots, rooms, teachers, days, times, isBlocked, getBlockReason, refreshSlots, holidays } = useApp();
  const { can } = useAuth();

  const [filterCls,      setFilterCls]      = useState('');
  const [filterTeacher,  setFilterTeacher]  = useState('');
  const [copyId,         setCopyId]         = useState(null);
  const [dragId,         setDragId]         = useState(null);
  const [modalOpen,      setModalOpen]      = useState(false);
  const [editSlot,       setEditSlot]       = useState(null);
  const [prefill,        setPrefill]        = useState({});
  const [loading,        setLoading]        = useState(false);
  const [warnings,       setWarnings]       = useState([]);

  const [form, setForm] = useState({ subject:'', cls:'', teacherId:'', roomId:'', day:'Mon', timeSlot:'', color:'#3b82f6', recurring:false });

  const classes = [...new Set(slots.map(s=>s.cls))].sort();

  const getSlot = (day, time) => slots.find(s =>
    s.day===day && s.timeSlot===time &&
    (!filterCls     || s.cls===filterCls) &&
    (!filterTeacher || s.teacher===filterTeacher)
  );

  // Real-time conflict preview
  const checkWarnings = useCallback((f) => {
    const ws = [];
    if (!f.day || !f.timeSlot) { setWarnings([]); return; }
    if (isBlocked(f.day, f.timeSlot)) ws.push({ type:'block', msg:`🔒 Slot blocked: ${getBlockReason(f.day,f.timeSlot)}` });
    if (f.roomId) {
      const conflict = slots.find(s => s.day===f.day && s.timeSlot===f.timeSlot && s.roomId===parseInt(f.roomId) && s.id!==(editSlot?.id));
      if (conflict) ws.push({ type:'room', msg:`🏠 Room already booked (${conflict.subject} — ${conflict.cls})` });
      const room = rooms.find(r=>r.id===parseInt(f.roomId));
      if (room?.status==='MAINTENANCE') ws.push({ type:'maint', msg:`🔧 Room is under maintenance` });
    }
    if (f.teacherId) {
      const conflict = slots.find(s => s.day===f.day && s.timeSlot===f.timeSlot && s.teacherId===parseInt(f.teacherId) && s.id!==(editSlot?.id));
      if (conflict) ws.push({ type:'teacher', msg:`👤 Teacher has "${conflict.subject}" at this time` });
      const t = teachers.find(t=>t.id===parseInt(f.teacherId));
      if (t?.availability?.[f.day]===false) ws.push({ type:'avail', msg:`📅 Teacher unavailable on ${f.day}` });
      if (t && t.assignedHours >= t.maxHours) ws.push({ type:'workload', msg:`⚡ Teacher at max workload (${t.assignedHours}/${t.maxHours}h)` });
    }
    setWarnings(ws);
  }, [slots, rooms, teachers, isBlocked, getBlockReason, editSlot]);

  const updateForm = (key, val) => {
    const next = { ...form, [key]:val };
    setForm(next);
    checkWarnings(next);
  };

  const openAdd = (day, timeSlot) => {
    setEditSlot(null);
    setForm({ subject:'', cls:'', teacherId:'', roomId:'', day, timeSlot, color:'#3b82f6', recurring:false });
    setWarnings([]);
    setModalOpen(true);
  };

  const openEdit = (sl) => {
    setEditSlot(sl);
    const f = { subject:sl.subject, cls:sl.cls, teacherId:String(sl.teacherId), roomId:String(sl.roomId),
                day:sl.day, timeSlot:sl.timeSlot, color:sl.color, recurring:sl.recurring };
    setForm(f);
    checkWarnings(f);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.subject||!form.cls||!form.teacherId||!form.roomId) { toast.error('Fill all fields'); return; }
    if (isBlocked(form.day, form.timeSlot)) { toast.error('Slot is blocked'); return; }
    setLoading(true);
    try {
      const payload = { ...form, teacherId:parseInt(form.teacherId), roomId:parseInt(form.roomId) };
      if (editSlot) { await updateSlot(editSlot.id, payload); toast.success('Class updated'); }
      else          { await createSlot(payload);              toast.success('Class scheduled'); }
      setModalOpen(false);
      await refreshSlots();
    } catch(e) { toast.error(e.response?.data?.message || 'Error'); }
    finally    { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this class?')) return;
    try { await apiDeleteSlot(id); toast.success('Deleted'); await refreshSlots(); }
    catch(e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handleDrop = async (day, time) => {
    if (dragId) {
      try { await apiMove(dragId, day, time); toast.success('Rescheduled'); await refreshSlots(); }
      catch(e) { toast.error(e.response?.data?.message || 'Error'); }
      setDragId(null);
    } else if (copyId) {
      try { await apiCopy(copyId, day, time); toast.success('Copied'); await refreshSlots(); }
      catch(e) { toast.error(e.response?.data?.message || 'Error'); }
      setCopyId(null);
    }
  };

  const exportPDF = () => {
    const w = window.open('','_blank');
    let html = `<html><head><title>Timetable</title><style>
      body{font-family:Arial,sans-serif;padding:20px;}table{width:100%;border-collapse:collapse;}
      th{background:#1a3a6e;color:#fff;padding:8px;font-size:11px;}
      td{border:1px solid #ddd;padding:6px;vertical-align:top;font-size:10px;}
      .ev{background:#e8f0ff;border-radius:3px;padding:3px 5px;font-size:10px;}
      @media print{body{-webkit-print-color-adjust:exact;}}
    </style></head><body>
    <h2>Presidency University — Weekly Timetable</h2>
    <table><thead><tr><th>Time</th>${days.map(d=>`<th>${d}</th>`).join('')}</tr></thead><tbody>`;
    times.forEach(t => {
      html += `<tr><td><b>${t}</b></td>`;
      days.forEach(d => {
        const sl = slots.find(s=>s.day===d&&s.timeSlot===t);
        html += sl ? `<td><div class="ev"><b>${sl.subject}</b><br>${sl.cls}<br>${sl.teacher}<br>${sl.room}</div></td>` : '<td></td>';
      });
      html += '</tr>';
    });
    html += `</tbody></table><p style="font-size:10px;color:#888;margin-top:12px">Generated ${new Date().toLocaleString()}</p></body></html>`;
    w.document.write(html); w.document.close(); setTimeout(()=>w.print(),400);
    toast.success('Print dialog opened');
  };

  const exportCSV = () => {
    const rows = [['Subject','Class','Teacher','Room','Day','Time','Color','Recurring'],...slots.map(s=>[s.subject,s.cls,s.teacher,s.room,s.day,s.timeSlot,s.color,s.recurring?'Yes':'No'])];
    const csv = rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download='timetable.csv'; a.click(); toast.success('CSV downloaded');
  };

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  // Check for today's holiday
  const today = new Date().toISOString().split('T')[0];
  const todayHoliday = holidays?.find(h => h.date === today);

  // Helper to get holiday for a specific day name
  const getHolidayForDay = (dayName) => {
    if (!holidays) return null;
    const dayDates = {};
    const now = new Date();
    const startDay = now.getDay();
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + (i - startDay));
      const dayOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
      dayDates[dayOfWeek] = d.toISOString().split('T')[0];
    }
    
    const dateStr = dayDates[dayName];
    return holidays.find(h => h.date === dateStr);
  };

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <h2 className={s.title}>Weekly Timetable</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '4px' }}>Today: {todayDate}</p>
          {todayHoliday && (
            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', color: '#92400e', padding: '8px 12px', borderRadius: '6px', marginTop: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
              🎉 Today is {todayHoliday.label}
            </div>
          )}
        </div>
        <div className={s.actions}>
          <select value={filterCls} onChange={e=>setFilterCls(e.target.value)} className={s.filter}>
            <option value="">All Classes</option>
            {classes.map(c=><option key={c}>{c}</option>)}
          </select>
          <select value={filterTeacher} onChange={e=>setFilterTeacher(e.target.value)} className={s.filter}>
            <option value="">All Teachers</option>
            {teachers.map(t=><option key={t.id}>{t.name}</option>)}
          </select>
          <Button variant="ghost" size="sm" onClick={exportPDF}><Printer size={14}/> PDF</Button>
          <Button variant="ghost" size="sm" onClick={exportCSV}><Download size={14}/> CSV</Button>
          {can('add') && <Button size="sm" onClick={() => openAdd('Mon', times[0])}><Plus size={14}/> Add Class</Button>}
        </div>
      </div>

      {copyId && (
        <div className={s.copyBanner}>
          <span>📋 Copy mode — click any empty cell to paste</span>
          <Button variant="ghost" size="sm" onClick={()=>setCopyId(null)}><X size={14}/> Cancel</Button>
        </div>
      )}

      <div className={s.gridWrap}>
        <div className={s.grid} style={{gridTemplateColumns:`90px repeat(${days.length},1fr)`}}>
          {/* Headers */}
          <div className={s.hdr}/>
          {days.map(d => {
            const dayHoliday = getHolidayForDay(d);
            return (
              <div key={d} className={s.hdr} style={{ background: dayHoliday ? '#fef3c7' : '', borderBottom: dayHoliday ? '2px solid #fcd34d' : '' }}>
                <div>{d}</div>
                {dayHoliday && <div style={{ fontSize: '0.7rem', color: '#92400e', fontWeight: '600', marginTop: '4px' }}>🎉 {dayHoliday.label}</div>}
              </div>
            );
          })}

          {/* Rows */}
          {times.map(time => (
            <>
              <div key={time} className={s.timeCell}>
                {time.split(' ')[0]}<br/>
                <span style={{fontSize:'.62rem',color:'var(--muted)'}}>{time.split(' ')[1]}</span>
              </div>
              {days.map(day => {
                const blocked = isBlocked(day, time);
                const sl      = getSlot(day, time);
                return (
                  <div key={day+time}
                    className={`${s.cell} ${blocked?s.cellBlocked:''} ${sl?s.cellOccupied:s.cellEmpty} ${copyId&&!sl&&!blocked?s.cellCopy:''}`}
                    draggable={!!sl && can('edit')}
                    onDragStart={() => sl && setDragId(sl.id)}
                    onDragOver={e => { if(!sl&&!blocked) e.preventDefault(); }}
                    onDrop={() => { if(!sl&&!blocked) handleDrop(day,time); }}
                    onClick={() => { if(blocked||sl) return; if(copyId||dragId) return; if(can('add')) openAdd(day,time); }}>
                    {blocked && <div className={s.blockedCell}><span>🔒</span><span>{getBlockReason(day,time)}</span></div>}
                    {sl && (
                      <div className={s.event} style={{background:sl.color+'22',borderLeft:`3px solid ${sl.color}`}}>
                        <div className={s.evSubject} style={{color:sl.color}}>{sl.subject}{sl.recurring?' 🔁':''}</div>
                        <div className={s.evInfo}>🚪 {sl.room}</div>
                        <div className={s.evInfo}>👤 {sl.teacher}</div>
                        <div className={s.evInfo}>📚 {sl.cls}</div>
                        {can('edit') && (
                          <div className={s.evActions}>
                            <button onClick={e=>{e.stopPropagation();openEdit(sl)}} title="Edit"><Edit2 size={11}/></button>
                            <button onClick={e=>{e.stopPropagation();setCopyId(sl.id);toast.success(`Copy: click target cell`);}} title="Copy"><Copy size={11}/></button>
                            <button onClick={e=>{e.stopPropagation();handleDelete(sl.id)}} title="Delete" style={{color:'var(--danger)'}}><Trash2 size={11}/></button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editSlot?'✏️ Edit Class':'📅 Schedule Class'} size="lg">
        {warnings.length > 0 && (
          <div className={s.warningBox}>
            {warnings.map((w,i) => <div key={i} className={`${s.warning} ${s['w_'+w.type]}`}>{w.msg}</div>)}
          </div>
        )}
        <div className={s.formGrid}>
          <FormField label="Subject" required>
            <Input value={form.subject} onChange={e=>updateForm('subject',e.target.value)} placeholder="e.g. Mathematics"/>
          </FormField>
          <FormField label="Class / Section" required>
            <Input value={form.cls} onChange={e=>updateForm('cls',e.target.value)} placeholder="e.g. 10-A"/>
          </FormField>
          <FormField label="Teacher" required>
            <Select value={form.teacherId} onChange={e=>updateForm('teacherId',e.target.value)}>
              <option value="">-- Select Teacher --</option>
              {teachers.map(t=><option key={t.id} value={t.id}>{t.name} ({t.subject})</option>)}
            </Select>
          </FormField>
          <FormField label="Room" required>
            <Select value={form.roomId} onChange={e=>updateForm('roomId',e.target.value)}>
              <option value="">-- Select Room --</option>
              {rooms.filter(r=>r.status==='ACTIVE').map(r=><option key={r.id} value={r.id}>{r.name} (Cap: {r.capacity})</option>)}
            </Select>
          </FormField>
          <FormField label="Day">
            <Select value={form.day} onChange={e=>updateForm('day',e.target.value)}>
              {DAYS_ALL.map(d=><option key={d}>{d}</option>)}
            </Select>
          </FormField>
          <FormField label="Time Slot">
            <Select value={form.timeSlot} onChange={e=>updateForm('timeSlot',e.target.value)}>
              {times.map(t=><option key={t}>{t}</option>)}
            </Select>
          </FormField>
          <FormField label="Color">
            <div style={{display:'flex',gap:8,flexWrap:'wrap',paddingTop:4}}>
              {COLORS.map(c=>(
                <button key={c} onClick={()=>updateForm('color',c)} style={{
                  width:28,height:28,borderRadius:'50%',background:c,border:form.color===c?'3px solid #fff':'3px solid transparent',cursor:'pointer'}}/>
              ))}
            </div>
          </FormField>
          <FormField label="Options">
            <label style={{display:'flex',alignItems:'center',gap:8,paddingTop:10,fontSize:'.88rem',cursor:'pointer'}}>
              <input type="checkbox" checked={form.recurring} onChange={e=>updateForm('recurring',e.target.checked)} style={{width:'auto'}}/>
              🔁 Recurring weekly
            </label>
          </FormField>
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:1.5+'rem'}}>
          <Button variant="ghost" onClick={()=>setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading?'Saving…':editSlot?'Save Changes':'Schedule'}</Button>
        </div>
      </Modal>
    </div>
  );
}
