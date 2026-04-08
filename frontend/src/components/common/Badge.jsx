import s from './Badge.module.css';
export default function Badge({ children, variant='blue' }) {
  return <span className={`${s.badge} ${s[variant]}`}>{children}</span>;
}
