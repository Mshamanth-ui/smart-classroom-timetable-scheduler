import s from './Card.module.css';
export default function Card({ children, className='', accent }) {
  return <div className={`${s.card} ${className}`} style={accent ? {borderTopColor:accent,borderTopWidth:3} : {}}>{children}</div>;
}
