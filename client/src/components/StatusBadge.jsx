import { STATUS_LABELS } from "../lib/utils";

const STYLES = {
  todo: "bg-paper-dim text-ink-soft border-line-dark",
  in_progress: "bg-amber/15 text-amber-dark border-amber/40",
  done: "bg-forest/10 text-forest border-forest/30",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wide px-2 py-1 rounded-sm border ${STYLES[status] || STYLES.todo}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
