import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Download, Printer } from 'lucide-react';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import s from './ReportsPage.module.css';

const TABS = ['Room Utilization','Teacher Workload','Class Summary','Charts'];

export default function ReportsPage() {
  const { slots, rooms, teachers, conflicts } = useApp();
  const [tab, setTab] = useState(0);

  const roomData = rooms.map(r => ({
    name:r.name, pct:r.utilizationPct||0,
    fill:(r.utilizationPct||0)>70?'#ef4444':(r.utilizationPct||0)>40?'#f59e0b':'#06d6a0'
  }));

  const teacherData = teachers.map(t => ({
    name:t.name.split(' ').slice(-1)[0],
    pct:Math.min(100,Math.round((t.assignedHours/t.maxHours)*100)),
    fill:Math.min(100,Math.round((t.assignedHours/t.maxHours)*100))>=100?'#ef4444':'#3b82f6'
  }));

  const conflictPie = ['room','teacher','class','availability','workload'].map(t => ({
    name:t.charAt(0).toUpperCase()+t.slice(1), value:conflicts.filter(c=>c.type===t).length
  })).filter(d=>d.value>0);

  const classes = [...new Set(slots.map(s=>s.cls))].sort();

  const exportCSV = (data, filename) => {
    const csv = data.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download=filename; a.click();
    toast.success('Exported');
  };

  const printTimetable = () => {
    const w = window.open('','_blank');
    let html = `<html><head><title>Timetable</title><style>body{font-family:Arial;padding:20px;}table{width:100%;border-collapse:collapse;}th{background:#1a3a6e;color:#fff;padding:8px;font-size:11px;}td{border:1px solid #ddd;padding:6px;font-size:10px;}.ev{background:#e8f0ff;padding:3px;border-radius:2px;}@media print{body{-webkit-print-color-adjust:exact;}}</style></head><body><h2>Presidency University — Timetable</h2><table><thead><tr><th>Subject</th><th>Class</th><th>Teacher</th><th>Room</th><th>Day</th><th>Time</th></tr></thead><tbody>`;
    slots.forEach(s => html+=`<tr><td><b>${s.subject}</b></td><td>${s.cls}</td><td>${s.teacher}</td><td>${s.room}</td><td>${s.day}</td><td>${s.timeSlot}</td></tr>`);
    html+=`</tbody></table></body></html>`;
    w.document.write(html); w.document.close(); setTimeout(()=>w.print(),400);
  };

  return (
    <div className={s.page}>
      <div className={s.header}><h2 className={s.title}>Reports & Analytics</h2></div>
      <div className={s.tabs}>
        {TABS.map((t,i)=><button key={t} className={`${s.tab} ${tab===i?s.active:''}`} onClick={()=>setTab(i)}>{t}</button>)}
      </div>

      {tab===0 && (
        <div>
          <div className={s.actions}>
            <Button variant="ghost" size="sm" onClick={()=>exportCSV([['Room','Type','Capacity','Used','Pct','Status'],...rooms.map(r=>[r.name,r.type,r.capacity,r.usedSlots,r.utilizationPct+'%',r.status])],'rooms-report.csv')}><Download size={14}/> CSV</Button>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Room</th><th>Type</th><th>Capacity</th><th>Used</th><th>Utilization</th><th>Status</th></tr></thead>
              <tbody>
                {rooms.map(r=>{const p=r.utilizationPct||0; const c=p>70?'#ef4444':p>40?'#f59e0b':'#06d6a0';return(
                  <tr key={r.id}><td>{r.name}</td><td>{r.type.replace('_',' ')}</td><td>{r.capacity}</td><td>{r.usedSlots}/{r.totalSlots}</td>
                    <td><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{flex:1,height:6,background:'var(--surface2)',borderRadius:3,overflow:'hidden'}}><div style={{width:p+'%',height:'100%',background:c,borderRadius:3}}/></div><span style={{fontSize:'.78rem',color:c}}>{p}%</span></div></td>
                    <td><span style={{fontSize:'.78rem',padding:'2px 8px',borderRadius:12,background:r.status==='MAINTENANCE'?'rgba(245,158,11,.15)':'rgba(6,214,160,.15)',color:r.status==='MAINTENANCE'?'var(--accent3)':'var(--accent2)'}}>{r.status}</span></td>
                  </tr>);})}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab===1 && (
        <div>
          <div className={s.actions}>
            <Button variant="ghost" size="sm" onClick={()=>exportCSV([['Name','Subject','Assigned','Max','Status'],...teachers.map(t=>[t.name,t.subject,t.assignedHours,t.maxHours,t.assignedHours>=t.maxHours?'Overloaded':t.assignedHours>=t.maxHours*.75?'Near Limit':'OK'])],'teachers-report.csv')}><Download size={14}/> CSV</Button>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Teacher</th><th>Subject</th><th>Hours</th><th>Subjects</th><th>Classes</th><th>Status</th></tr></thead>
              <tbody>
                {teachers.map(t=>{const p=Math.min(100,Math.round((t.assignedHours/t.maxHours)*100));const sl=slots.filter(s=>s.teacher===t.name); return(
                  <tr key={t.id}><td>{t.name}</td><td>{t.subject}</td><td>{t.assignedHours}/{t.maxHours}</td>
                    <td style={{fontSize:'.8rem'}}>{[...new Set(sl.map(s=>s.subject))].join(', ')||'—'}</td>
                    <td style={{fontSize:'.8rem'}}>{[...new Set(sl.map(s=>s.cls))].join(', ')||'—'}</td>
                    <td><span style={{fontSize:'.78rem',padding:'2px 8px',borderRadius:12,background:p>=100?'rgba(239,68,68,.15)':p>=75?'rgba(245,158,11,.15)':'rgba(6,214,160,.15)',color:p>=100?'var(--danger)':p>=75?'var(--accent3)':'var(--accent2)'}}>{p>=100?'Overloaded':p>=75?'Near Limit':'OK'}</span></td>
                  </tr>);})}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab===2 && (
        <div>
          <div className={s.actions}>
            <Button variant="ghost" size="sm" onClick={()=>exportCSV([['Class','Periods','Subjects','Teachers'],...classes.map(c=>{const cs=slots.filter(s=>s.cls===c);return[c,cs.length,[...new Set(cs.map(s=>s.subject))].join(';'),[...new Set(cs.map(s=>s.teacher))].join(';')]})],'classes-report.csv')}><Download size={14}/> CSV</Button>
            <Button variant="ghost" size="sm" onClick={printTimetable}><Printer size={14}/> Print</Button>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Class</th><th>Periods/Week</th><th>Subjects</th><th>Teachers</th></tr></thead>
              <tbody>
                {classes.map(c=>{const cs=slots.filter(s=>s.cls===c);return(
                  <tr key={c}><td><b>{c}</b></td><td>{cs.length}</td>
                    <td style={{fontSize:'.82rem'}}>{[...new Set(cs.map(s=>s.subject))].join(', ')}</td>
                    <td style={{fontSize:'.82rem'}}>{[...new Set(cs.map(s=>s.teacher))].join(', ')}</td>
                  </tr>);})}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab===3 && (
        <div className={s.chartsGrid}>
          <div className={s.chartCard}>
            <div className={s.chartTitle}>Room Utilization (%)</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={roomData} margin={{top:8,right:8,bottom:8,left:-20}}>
                <XAxis dataKey="name" tick={{fontSize:11,fill:'#64748b'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:'#64748b'}} domain={[0,100]} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:'#111827',border:'1px solid #1f2d45',borderRadius:8,fontSize:12}} formatter={v=>[v+'%']}/>
                <Bar dataKey="pct" radius={[4,4,0,0]}>{roomData.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={s.chartCard}>
            <div className={s.chartTitle}>Teacher Workload (%)</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={teacherData} margin={{top:8,right:8,bottom:8,left:-20}}>
                <XAxis dataKey="name" tick={{fontSize:11,fill:'#64748b'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:'#64748b'}} domain={[0,100]} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:'#111827',border:'1px solid #1f2d45',borderRadius:8,fontSize:12}} formatter={v=>[v+'%']}/>
                <Bar dataKey="pct" radius={[4,4,0,0]}>{teacherData.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {conflictPie.length > 0 && (
            <div className={s.chartCard}>
              <div className={s.chartTitle}>Conflicts by Type</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={conflictPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name,value})=>`${name}:${value}`} labelLine={false} fontSize={11}>
                    {conflictPie.map((_,i)=><Cell key={i} fill={['#ef4444','#3b82f6','#f59e0b','#a78bfa','#06d6a0'][i%5]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{background:'#111827',border:'1px solid #1f2d45',borderRadius:8,fontSize:12}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
