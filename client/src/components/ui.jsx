export function Button({
  as: Comp = "button",
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base",
  };
  const variants = {
    primary: "bg-forest text-paper hover:bg-forest-dark",
    secondary: "bg-transparent text-forest border border-forest hover:bg-forest hover:text-paper",
    ghost: "bg-transparent text-ink-soft hover:text-ink hover:bg-paper-dim",
    danger: "bg-clay text-paper hover:opacity-90",
    amber: "bg-amber text-forest-dark hover:bg-amber-dark",
  };
  return (
    <Comp
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink-soft">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-ink-soft/70">{hint}</p>}
      {error && <p className="text-xs text-clay">{error}</p>}
    </div>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-sm border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest ${className}`}
      {...props}
    />
  );
}

export function TextArea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-sm border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`w-full rounded-sm border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`bg-white border border-line rounded-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function PageHeading({ eyebrow, title, action }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.15em] text-moss font-mono mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl text-ink">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="border border-dashed border-line-dark rounded-sm py-16 px-6 text-center flex flex-col items-center gap-3">
      <p className="font-display text-xl text-ink">{title}</p>
      {description && <p className="text-sm text-ink-soft max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

export function Loader({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-ink-soft text-sm font-mono">
      <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
      <span className="w-2 h-2 rounded-full bg-amber animate-pulse [animation-delay:150ms]" />
      <span className="w-2 h-2 rounded-full bg-amber animate-pulse [animation-delay:300ms]" />
      <span className="ml-2">{label}</span>
    </div>
  );
}
