import { useEffect } from 'react';
import s from './Modal.module.css';
export default function Modal({ open, onClose, title, children, size='md' }) {
  useEffect(() => {
    const handler = e => { if(e.key==='Escape') onClose(); };
    if (open) { document.addEventListener('keydown', handler); document.body.style.overflow='hidden'; }
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow=''; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className={s.overlay} onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div className={`${s.modal} ${s[size]}`}>
        <div className={s.header}>
          <h3 className={s.title}>{title}</h3>
          <button className={s.close} onClick={onClose}>✕</button>
        </div>
        <div className={s.body}>{children}</div>
      </div>
    </div>
  );
}
