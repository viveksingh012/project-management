import { Link } from "react-router-dom";

export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-paper">
      <div className="hidden lg:flex flex-col justify-between bg-forest text-paper p-12 relative overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.12]"
          viewBox="0 0 400 600"
          preserveAspectRatio="none"
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              d={`M-20 ${80 + i * 90} Q 100 ${20 + i * 90} 200 ${90 + i * 90} T 420 ${70 + i * 90}`}
              stroke="#FAF8F3"
              strokeWidth="1.5"
              fill="none"
            />
          ))}
        </svg>
        <Link to="/" className="relative flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
            <path
              d="M2 20L9 6L13 14L16 9L24 20"
              stroke="#FAF8F3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="9" r="1.6" fill="#E2A33D" />
          </svg>
          <span className="font-display text-xl">Project Camp</span>
        </Link>
        <div className="relative">
          <p className="font-display text-3xl leading-snug max-w-sm">
            Pitch the project. Mark the trail. Reach the summit together.
          </p>
          <p className="text-paper/70 text-sm mt-4 max-w-sm">
            Organize projects, assign the work, and track every task from
            todo to done — with your whole team in view.
          </p>
        </div>
        <p className="relative text-xs text-paper/50 font-mono">
          v1.0.0 — team basecamp
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <svg width="24" height="24" viewBox="0 0 26 26" fill="none">
              <path
                d="M2 20L9 6L13 14L16 9L24 20"
                stroke="#234B3D"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="9" r="1.6" fill="#E2A33D" />
            </svg>
            <span className="font-display text-lg text-ink">Project Camp</span>
          </div>

          {eyebrow && (
            <p className="text-xs uppercase tracking-[0.15em] text-moss font-mono mb-2">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-3xl text-ink mb-2">{title}</h1>
          {subtitle && <p className="text-sm text-ink-soft mb-8">{subtitle}</p>}

          {children}

          {footer && <div className="mt-6 text-sm text-ink-soft">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
