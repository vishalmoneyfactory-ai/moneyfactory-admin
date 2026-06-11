export default function Header({ title, action }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-primary/95 px-8 py-5 backdrop-blur">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-sm text-muted">Money Factory operations dashboard</p>
      </div>
      {action}
    </header>
  );
}
