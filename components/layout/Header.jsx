export default function Header({ title, action }) {
  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between border-b px-8 py-4 backdrop-blur-md"
      style={{
        borderColor: 'rgba(255,255,255,0.06)',
        background: 'rgba(8,8,8,0.85)',
      }}
    >
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
        <p className="mt-0.5 text-xs font-medium text-muted">Money Factory · Admin</p>
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
