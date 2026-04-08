import s from './FormField.module.css';
export default function FormField({ label, error, children, required }) {
  return (
    <div className={s.field}>
      {label && <label className={s.label}>{label}{required&&<span className={s.req}>*</span>}</label>}
      {children}
      {error && <span className={s.error}>{error}</span>}
    </div>
  );
}
export function Input({ className='', ...p }) {
  return <input className={`${s.input} ${className}`} {...p}/>;
}
export function Select({ className='', children, ...p }) {
  return <select className={`${s.input} ${className}`} {...p}>{children}</select>;
}
export function Textarea({ className='', ...p }) {
  return <textarea className={`${s.input} ${s.textarea} ${className}`} {...p}/>;
}
