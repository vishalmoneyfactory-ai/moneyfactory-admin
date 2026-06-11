export default function Button({ children, variant = 'solid', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
  const styles = variant === 'outline'
    ? 'border border-gold text-gold hover:bg-gold hover:text-black'
    : variant === 'danger'
      ? 'bg-error text-white hover:brightness-110'
      : 'bg-gold text-black hover:bg-goldHover';
  return <button className={`${base} ${styles} ${className}`} {...props}>{children}</button>;
}
