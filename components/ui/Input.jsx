export default function Input({ label, className = '', ...props }) {
  return (
    <label className={`block space-y-1.5 text-sm ${className}`}>
      {label && <span className="block font-medium text-muted">{label}</span>}
      <input
        className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-white placeholder-[#555] transition focus:border-gold focus:outline-none focus:ring-0"
        {...props}
      />
    </label>
  );
}
