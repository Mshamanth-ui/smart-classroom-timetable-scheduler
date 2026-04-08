import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp  } from '../../context/AppContext';
import { LayoutDashboard, Calendar, DoorOpen, GraduationCap,
         AlertTriangle, BarChart2, Settings, LogOut, Menu, X, Bell, Users } from 'lucide-react';
import Avatar from './Avatar';
import s from './Layout.module.css';

const NAV = [
  { to:'/',           label:'Dashboard',  icon:LayoutDashboard, perm:'admin' },
  { to:'/timetable',  label:'Timetable',  icon:Calendar,        perm:null },
  { to:'/rooms',      label:'Rooms',      icon:DoorOpen,        perm:null },
  { to:'/teachers',   label:'Teachers',   icon:GraduationCap,   perm:null },
  { to:'/conflicts',  label:'Conflicts',  icon:AlertTriangle,   perm:null },
  { to:'/reports',    label:'Reports',    icon:BarChart2,        perm:'reports' },
  { to:'/users',      label:'Users',      icon:Users,            perm:'settings' },
  { to:'/settings',   label:'Settings',   icon:Settings,         perm:'settings' },
];

export default function Layout() {
  const { user, logout, can } = useAuth();
  const { conflicts } = useApp();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={s.root}>
      {/* Sidebar */}
      <aside className={`${s.sidebar} ${open ? s.open : ''}`}>
        <div className={s.logo}>
          <div className={s.logoIcon}>🏫</div>
          <div className={s.logoText}>
            <span className={s.logoMain}>Presidency University</span>
            <span className={s.logoSub}>Smart Scheduler</span>
          </div>
        </div>

        <nav className={s.nav}>
          {NAV.filter(n => !n.perm || can(n.perm)).map(n => (
            <NavLink key={n.to} to={n.to} end={n.to==='/'} onClick={() => setOpen(false)}
              className={({isActive}) => `${s.navItem} ${isActive ? s.active : ''}`}>
              <n.icon size={16}/>
              <span>{n.label}</span>
              {n.to==='/conflicts' && conflicts.length > 0 &&
                <span className={s.badge}>{conflicts.length}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={s.userBox}>
          <Avatar user={user} />
          <div className={s.userInfo}>
            <span className={s.userName}>{user?.fullName}</span>
            <span className={s.userRole}>{user?.role}</span>
          </div>
          <button className={s.logoutBtn} onClick={handleLogout} title="Logout">
            <LogOut size={16}/>
          </button>
        </div>
      </aside>

      {open && <div className={s.overlay} onClick={() => setOpen(false)}/>}

      {/* Main */}
      <div className={s.main}>
        <header className={s.header}>
          <button className={s.hamburger} onClick={() => setOpen(!open)}>
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
          <div className={s.headerTitle}>Presidency University</div>
          <div className={s.headerRight}>
            <span className={s.rolePill} data-role={user?.role}>{user?.role}</span>
          </div>
        </header>
        <main className={s.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
