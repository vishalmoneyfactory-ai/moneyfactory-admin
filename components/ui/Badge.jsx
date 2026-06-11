export default function Badge({ children, tone = 'gold' }) {
  const color = tone === 'success' ? 'bg-success/15 text-success' : tone === 'error' ? 'bg-error/15 text-error' : 'bg-gold/15 text-gold';
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${color}`}>{children}</span>;
}
