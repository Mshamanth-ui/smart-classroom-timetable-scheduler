import { useApp }  from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart2, AlertTriangle, Calendar, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Avatar from '../components/common/Avatar';
import s from './DashboardPage.module.css';

export default function DashboardPage() {
  const { slots, rooms, teachers, conflicts } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const recent = [...slots].reverse().slice(0, 6);

  const roomChart = rooms.map(r => ({
    name: r.name,
    pct:  r.utilizationPct || 0,
    fill: (r.utilizationPct||0) > 70 ? '#ef4444' : (r.utilizationPct||0) > 40 ? '#f59e0b' : '#06d6a0'
  }));

  const stats = [
    { label:'Classes Scheduled', value:slots.length,    icon:Calendar,      color:'#3b82f6', page:'timetable' },
    { label:'Active Rooms',       value:rooms.filter(r=>r.status==='ACTIVE').length, icon:BarChart2, color:'#06d6a0', page:'rooms' },
    { label:'Teachers',           value:teachers.length, icon:Users,         color:'#f59e0b', page:'teachers' },
    { label:'Conflicts',          value:conflicts.length,icon:AlertTriangle, color:'#ef4444', page:'conflicts' },
  ];

  return (
    <div className={s.page}>
      <div className={s.welcome}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Avatar user={user} />
            <h2 className={s.heading}>Welcome back, {user?.fullName}</h2>
          </div>
          <p className={s.sub}>Here's your scheduling overview for today</p>
        </div>
      </div>

      {/* Stats */}
      <div className={s.statsGrid}>
        {stats.map(st => (
          <div key={st.label} className={s.statCard} style={{borderTopColor:st.color}}
            onClick={() => navigate('/'+st.page)}>
            <div className={s.statNum} style={{color:st.color}}>{st.value}</div>
            <div className={s.statLabel}>{st.label}</div>
          </div>
        ))}
      </div>

      <div className={s.grid}>
        {/* Recent Bookings */}
        <div className={s.box}>
          <h3 className={s.boxTitle}>Recent Bookings</h3>
          {recent.length === 0 ? (
            <div className={s.empty}>No classes scheduled yet</div>
          ) : (
            <table className={s.table}>
              <thead><tr><th>Subject</th><th>Room</th><th>Day</th><th>Time</th></tr></thead>
              <tbody>
                {recent.map(sl => (
                  <tr key={sl.id}>
                    <td>
                      <span style={{color:sl.color,fontWeight:600}}>{sl.subject}</span>
                      <br/><span style={{fontSize:'.75rem',color:'var(--muted)'}}>{sl.cls} · {sl.teacher}</span>
                    </td>
                    <td>{sl.room}</td>
                    <td>{sl.day}</td>
                    <td>{sl.timeSlot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Room Utilization Chart */}
        <div className={s.box}>
          <h3 className={s.boxTitle}>Room Utilization</h3>
          {roomChart.length === 0 ? (
            <div className={s.empty}>No rooms added yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={roomChart} margin={{top:8,right:8,bottom:8,left:-20}}>
                <XAxis dataKey="name" tick={{fontSize:11,fill:'#64748b'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:'#64748b'}} axisLine={false} tickLine={false} domain={[0,100]}/>
                <Bar dataKey="pct" radius={[4,4,0,0]}>
                  {roomChart.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Conflict Alerts */}
        <div className={s.box}>
          <h3 className={s.boxTitle}>Active Conflicts</h3>
          {conflicts.length === 0 ? (
            <div className={s.empty}>🎉 No conflicts detected</div>
          ) : (
            <div className={s.conflictList}>
              {conflicts.slice(0,4).map((c,i) => (
                <div key={i} className={`${s.alert} ${s['alert_'+c.type]}`}>
                  <div className={s.alertIcon}>{
                    {room:'🏠',teacher:'👤',class:'📚',availability:'📅',workload:'⚡'}[c.type]||'⚠️'
                  }</div>
                  <div>
                    <div className={s.alertTitle}>{c.title}</div>
                    <div className={s.alertDesc}>{c.description}</div>
                  </div>
                </div>
              ))}
              {conflicts.length > 4 &&
                <button className={s.moreBtn} onClick={() => navigate('/conflicts')}>
                  View all {conflicts.length} conflicts →
                </button>}
            </div>
          )}
        </div>

        {/* Teacher Workload */}
        <div className={s.box}>
          <h3 className={s.boxTitle}>Teacher Workload</h3>
          {teachers.length === 0 ? <div className={s.empty}>No teachers added</div> : (
            <div className={s.workloadList}>
              {teachers.map(t => {
                const pct = Math.min(100, Math.round((t.assignedHours/t.maxHours)*100));
                const color = pct>=100?'#ef4444':pct>=75?'#f59e0b':'#06d6a0';
                return (
                  <div key={t.id} className={s.workloadRow}>
                    <div className={s.workloadName}>{t.name}</div>
                    <div className={s.workloadBar}>
                      <div style={{width:`${pct}%`,background:color}}/>
                    </div>
                    <div style={{fontSize:'.78rem',color,minWidth:60,textAlign:'right'}}>
                      {t.assignedHours}/{t.maxHours}h
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
