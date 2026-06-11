export default function Input({ label, className = '', ...props }) {
  return (
    <label className="block space-y-2 text-sm">
      {label && <span className="font-medium text-white">{label}</span>}
      <input className={`w-full rounded-md px-3 py-2 ${className}`} {...props} />
    </label>
  );
}
