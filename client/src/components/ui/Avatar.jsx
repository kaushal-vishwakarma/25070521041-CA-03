import { initials } from '../../utils/format.js';

const GRADIENTS = [
  'from-violet-500 to-fuchsia-500',
  'from-cyan-500 to-sky-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
];
const SIZES = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' };

// Initials on a gradient. The color is derived from the name, so the same name always looks the same.
export default function Avatar({ name = '', size = 'md', rounded = 'rounded-xl', className = '' }) {
  const hash = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return (
    <span
      aria-hidden="true"
      className={[
        'inline-grid shrink-0 place-items-center bg-gradient-to-br font-semibold text-white',
        GRADIENTS[hash % GRADIENTS.length],
        SIZES[size],
        rounded,
        className,
      ].join(' ')}
    >
      {initials(name) || '?'}
    </span>
  );
}
