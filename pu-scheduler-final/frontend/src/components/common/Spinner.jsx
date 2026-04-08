import s from './Spinner.module.css';
export default function Spinner({ size=24 }) {
  return <div className={s.spinner} style={{width:size,height:size}}/>;
}
