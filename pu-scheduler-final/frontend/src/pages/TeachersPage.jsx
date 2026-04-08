import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { createTeacher, updateTeacher, deleteTeacher as apiDelete } from '../api/teachers';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import FormField, { Input } from '../components/common/FormField';
import Badge from '../components/common/Badge';
import { Plus, Edit2, Trash2, Download } from 'lucide-react';
import s from './TeachersPage.module.css';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat'];

export default function TeachersPage() {
  const { teachers, refreshTeachers } = useApp();
  const { can } = useAuth();
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', subject:'', email:'', phone:'', maxHours:20,
    availability:{ Mon:true,Tue:true,Wed:true,Thu:true,Fri:true,Sat:false } });

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({name:'',subject:'',email:'',phone:'',maxHours:20, availability:{Mon:true,Tue:true,Wed:true,Thu:true,Fri:true,Sat:false}});
    setModal(true);
  };
  const openEdit = t => {
    setEditing(t);
    setForm({name:t.name,subject:t.subject,email:t.email,phone:t.phone||'',maxHours:t.maxHours, availability:{...t.availability}});
    setModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.subject) { toast.error('Name and subject required'); return; }
    setLoading(true);
    try {
      if (editing) { await updateTeacher(editing.id, form); toast.success('Teacher updated'); }
      else         { await createTeacher(form);              toast.success('Teacher added'); }
      setModal(false); await refreshTeachers();
    } catch(e) { toast.error(e.response?.data?.message||'Error'); }
    finally    { setLoading(false); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this teacher?')) return;
    try { await apiDelete(id); toast.success('Deleted'); await refreshTeachers(); }
    catch(e) { toast.error(e.response?.data?.message||'Error'); }
  };

  const exportCSV = () => {
    const rows = [['Name','Subject','Email','Phone','Max Hours','Assigned Hours'],
      ...teachers.map(t=>[t.name,t.subject,t.email,t.phone||'',t.maxHours,t.assignedHours])];
    const csv = rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='teachers.csv'; a.click();
    toast.success('Exported');
  };

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h2 className={s.title}>Teacher Directory</h2>
        <div style={{display:'flex',gap:8}}>
          <Button variant="ghost" size="sm" onClick={exportCSV}><Download size={14}/> Export</Button>
          {can('add') && <Button size="sm" onClick={openAdd}><Plus size={14}/> Add Teacher</Button>}
        </div>
      </div>
      <input className={s.search} value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search teachers…"/>

      <div className={s.grid}>
        {filtered.map(t => {
          const pct   = Math.min(100, Math.round((t.assignedHours/t.maxHours)*100));
          const color = pct>=100?'#ef4444':pct>=75?'#f59e0b':'#06d6a0';
          const avDays = Object.entries(t.availability||{}).filter(([,v])=>v).map(([k])=>k).join(', ')||'None';
          return (
            <div key={t.id} className={s.card}>
              <div className={s.cardHead}>
                <div>
                  <div className={s.name}>{t.name}</div>
                  <div className={s.subject}>{t.subject}</div>
                </div>
                {can('edit') && (
                  <div style={{display:'flex',gap:4}}>
                    <button className={s.iconBtn} onClick={()=>openEdit(t)}><Edit2 size={14}/></button>
                    <button className={s.iconBtn} style={{color:'var(--danger)'}} onClick={()=>handleDelete(t.id)}><Trash2 size={14}/></button>
                  </div>
                )}
              </div>
              <div className={s.info}>📧 {t.email}</div>
              {t.phone && <div className={s.info}>📞 {t.phone}</div>}
              <div className={s.info} style={{marginTop:6}}>📅 Available: <span style={{color:'var(--text)'}}>{avDays}</span></div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'.76rem',margin:'.75rem 0 4px'}}>
                <span style={{color:'var(--muted)'}}>Workload</span>
                <span style={{color,fontWeight:600}}>{t.assignedHours}/{t.maxHours} hrs</span>
              </div>
              <div className={s.barWrap}><div className={s.bar} style={{width:pct+'%',background:color}}/></div>
              {pct>=100 && <div style={{fontSize:'.73rem',color:'var(--danger)',marginTop:3}}>⚠️ Overloaded</div>}
              <div style={{marginTop:'.75rem'}}>
                <Badge variant={pct>=100?'red':pct>=75?'amber':'green'}>{pct>=100?'Overloaded':pct>=75?'Near Limit':'Available'}</Badge>
              </div>
            </div>
          );
        })}
        {filtered.length===0 && <div className={s.empty}>No teachers found</div>}
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={editing?'✏️ Edit Teacher':'👨‍🏫 Add Teacher'}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
          <FormField label="Full Name" required><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Mr. John Smith"/></FormField>
          <FormField label="Subject" required><Input value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} placeholder="Mathematics"/></FormField>
          <FormField label="Email"><Input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="name@presidency.edu"/></FormField>
          <FormField label="Phone"><Input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="98xxxxxxxx"/></FormField>
          <FormField label="Max Hours/Week"><Input type="number" value={form.maxHours} onChange={e=>setForm(f=>({...f,maxHours:parseInt(e.target.value)||20}))} min={1} max={40}/></FormField>
        </div>
        <FormField label="Available Days" style={{marginTop:'1rem'}}>
          <div style={{display:'flex',gap:12,marginTop:8,flexWrap:'wrap'}}>
            {DAYS.map(d=>(
              <label key={d} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,cursor:'pointer'}}>
                <span style={{fontSize:'.75rem',color:'var(--muted)'}}>{d}</span>
                <input type="checkbox" checked={!!form.availability?.[d]}
                  onChange={e=>setForm(f=>({...f,availability:{...f.availability,[d]:e.target.checked}}))}
                  style={{width:18,height:18}}/>
              </label>
            ))}
          </div>
        </FormField>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:'1.5rem'}}>
          <Button variant="ghost" onClick={()=>setModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading?'Saving…':editing?'Save Changes':'Add Teacher'}</Button>
        </div>
      </Modal>
    </div>
  );
}
