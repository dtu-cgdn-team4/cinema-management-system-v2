import { Link } from 'react-router-dom';
import logoIcon from '../../assets/logo-icon.svg';

/** Logo Galaxy Lumière; header/footer chung đặt khung 145×40 như Figma qua `className`. */
export default function BrandLogo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
      <span className="grid size-9 place-items-center rounded-xl bg-linear-to-tr from-brand to-brand-dark shadow-lg shadow-brand/30">
        <img src={logoIcon} alt="" />
      </span>
      <span>
        <span className="block font-display text-base leading-4 font-bold tracking-widest">GALAXY</span>
        <span className="mt-0.5 block text-[8px] leading-3 font-semibold tracking-[0.25em] text-brand uppercase">
          CINEMA
        </span>
      </span>
    </Link>
  );
}
