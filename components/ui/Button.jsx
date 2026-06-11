export default function Button({ children, variant = 'solid', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.97]';

  const styles =
    variant === 'outline'
      ? 'border border-gold/60 text-gold hover:bg-gold hover:text-black hover:border-gold'
      : variant === 'danger'
        ? 'bg-error/90 text-white hover:bg-error shadow-sm'
        : 'bg-gold text-black hover:bg-goldHover shadow-sm shadow-gold/20';

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
