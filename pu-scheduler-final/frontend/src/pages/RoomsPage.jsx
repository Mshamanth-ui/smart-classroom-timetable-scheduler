import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { createRoom, updateRoom, deleteRoom as apiDelete } from '../api/rooms';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import FormField, { Input, Select, Textarea } from '../components/common/FormField';
import Badge from '../components/common/Badge';
import { Plus, Edit2, Trash2, Download } from 'lucide-react';
import s from './RoomsPage.module.css';

const EQUIPMENT = ['Projector','AC','Whiteboard','Smart Board','Lab Equipment','PA System','Computer'];

export default function RoomsPage() {
  const { rooms, refreshRooms } = useApp();
  const { can } = useAuth();
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', capacity:'', type:'CLASSROOM', status:'ACTIVE', notes:'', equipment:[] });

  const filtered = rooms.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase()) ||
    r.equipment?.some(e => e.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => { setEditing(null); setForm({name:'',capacity:'',type:'CLASSROOM',status:'ACTIVE',notes:'',equipment:[]}); setModal(true); };
  const openEdit = r => { setEditing(r); setForm({name:r.name,capacity:String(r.capacity),type:r.type,status:r.status,notes:r.notes||'',equipment:r.equipment||[]}); setModal(true); };

  const toggleEq = eq => setForm(f => ({...f, equipment: f.equipment.includes(eq) ? f.equipment.filter(e=>e!==eq) : [...f.equipment,eq]}));

  const handleSubmit = async () => {
    if (!form.name || !form.capacity) { toast.error('Name and capacity required'); return; }
    setLoading(true);
    try {
      const payload = { ...form, capacity: parseInt(form.capacity) };
      if (editing) { await updateRoom(editing.id, payload); toast.success('Room updated'); }
      else         { await createRoom(payload);             toast.success('Room added'); }
      setModal(false); await refreshRooms();
    } catch(e) { toast.error(e.response?.data?.message||'Error'); }
    finally    { setLoading(false); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this room?')) return;
    try { await apiDelete(id); toast.success('Deleted'); await refreshRooms(); }
    catch(e) { toast.error(e.response?.data?.message||'Error'); }
  };

  const exportCSV = () => {
    const rows = [['Name','Type','Capacity','Equipment','Status','Notes'], ...rooms.map(r=>[r.name,r.type,r.capacity,r.equipment?.join(';'),r.status,r.notes||''])];
    const csv = rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='rooms.csv'; a.click();
    toast.success('Exported');
  };

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h2 className={s.title}>Classroom Management</h2>
        <div style={{display:'flex',gap:8}}>
          <Button variant="ghost" size="sm" onClick={exportCSV}><Download size={14}/> Export</Button>
          {can('add') && <Button size="sm" onClick={openAdd}><Plus size={14}/> Add Room</Button>}
        </div>
      </div>
      <input className={s.search} value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search by name, type, equipment…"/>

      <div className={s.grid}>
        {filtered.map(r => {
          const pct   = r.utilizationPct || 0;
          const color = pct>70?'#ef4444':pct>40?'#f59e0b':'#06d6a0';
          return (
            <div key={r.id} className={`${s.card} ${r.status==='MAINTENANCE'?s.maint:''}`}>
              <div className={s.cardHead}>
                <div>
                  <div className={s.name}>{r.name}</div>
                  <div className={s.meta}>{r.type.replace('_',' ')} · Cap: {r.capacity}</div>
                </div>
                {can('edit') && (
                  <div style={{display:'flex',gap:4}}>
                    <button className={s.iconBtn} onClick={()=>openEdit(r)}><Edit2 size={14}/></button>
                    <button className={s.iconBtn} style={{color:'var(--danger)'}} onClick={()=>handleDelete(r.id)}><Trash2 size={14}/></button>
                  </div>
                )}
              </div>
              {r.status==='MAINTENANCE' && <div className={s.maintBanner}>🔧 Under Maintenance{r.notes?': '+r.notes:''}</div>}
              <div className={s.equipment}>
                {r.equipment?.map(e=><span key={e} className={s.eqTag}>{e}</span>)}
              </div>
              <div className={s.barWrap}><div className={s.bar} style={{width:pct+'%',background:color}}/></div>
              <div className={s.util}>{pct}% utilization · {r.usedSlots}/{r.totalSlots} slots</div>
              <div style={{marginTop:'.75rem',display:'flex',gap:6}}>
                <Badge variant={r.status==='MAINTENANCE'?'amber':r.usedSlots>0?'green':'blue'}>
                  {r.status==='MAINTENANCE'?'Maintenance':r.usedSlots>0?'In Use':'Available'}
                </Badge>
                <Badge variant="amber">{r.type.replace('_',' ')}</Badge>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className={s.empty}>No rooms found</div>}
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={editing?'✏️ Edit Room':'🏠 Add Room'}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
          <FormField label="Room Name" required><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Room 101"/></FormField>
          <FormField label="Capacity" required><Input type="number" value={form.capacity} onChange={e=>setForm(f=>({...f,capacity:e.target.value}))} placeholder="40"/></FormField>
          <FormField label="Type"><Select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
            <option value="CLASSROOM">Classroom</option><option value="LAB">Lab</option>
            <option value="LECTURE_HALL">Lecture Hall</option><option value="SEMINAR_ROOM">Seminar Room</option>
          </Select></FormField>
          <FormField label="Status"><Select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
            <option value="ACTIVE">Active</option><option value="MAINTENANCE">Maintenance</option>
          </Select></FormField>
        </div>
        <FormField label="Equipment" style={{marginTop:'1rem'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:4}}>
            {EQUIPMENT.map(eq=>(
              <label key={eq} style={{display:'flex',alignItems:'center',gap:8,fontSize:'.85rem',cursor:'pointer'}}>
                <input type="checkbox" checked={form.equipment.includes(eq)} onChange={()=>toggleEq(eq)} style={{width:'auto'}}/>
                {eq}
              </label>
            ))}
          </div>
        </FormField>
        <FormField label="Notes" style={{marginTop:'1rem'}}><Textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Optional notes…"/></FormField>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:'1.5rem'}}>
          <Button variant="ghost" onClick={()=>setModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleSubmit} disabled={loading}>{loading?'Saving…':editing?'Save Changes':'Add Room'}</Button>
        </div>
      </Modal>
    </div>
  );
}
