import { useApp } from '../context/AppContext';
import Button from '../components/common/Button';
import { RefreshCw } from 'lucide-react';
import s from './ConflictsPage.module.css';

const ICON = {room:'🏠',teacher:'👤',class:'📚',availability:'📅',workload:'⚡'};
const TYPES = [{k:'room',l:'Room'},{k:'teacher',l:'Teacher'},{k:'class',l:'Class'},{k:'availability',l:'Availability'},{k:'workload',l:'Workload'}];

export default function ConflictsPage() {
  const { conflicts, refreshConflicts } = useApp();

  const grouped = TYPES.map(t => ({ ...t, items: conflicts.filter(c => c.type===t.k) })).filter(g => g.items.length > 0);

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <h2 className={s.title}>Conflict Detection</h2>
          <p className={s.sub}>{conflicts.length} issue{conflicts.length!==1?'s':''} detected</p>
        </div>
        <Button variant="ghost" size="sm" onClick={refreshConflicts}><RefreshCw size={14}/> Refresh</Button>
      </div>

      {conflicts.length === 0 ? (
        <div className={s.clear}><div className={s.clearIcon}>🎉</div><div>All clear! No scheduling conflicts.</div></div>
      ) : (
        <div className={s.groups}>
          {grouped.map(g => (
            <div key={g.k} className={s.group}>
              <div className={s.groupTitle}>{ICON[g.k]} {g.l} Conflicts <span className={s.count}>{g.items.length}</span></div>
              {g.items.map((c,i) => (
                <div key={i} className={`${s.alert} ${s['t_'+c.type]}`}>
                  <div className={s.alertTitle}>{c.title}</div>
                  <div className={s.alertDesc}>{c.description}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
