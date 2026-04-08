import s from './Button.module.css';
export default function Button({ children, variant='primary', size='md', onClick, disabled, type='button', className='' }) {
  return (
    <button type={type} className={`${s.btn} ${s[variant]} ${s[size]} ${className}`}
      onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
