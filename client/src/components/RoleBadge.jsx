import { ROLE_LABELS } from "../lib/utils";

const STYLES = {
  admin: "bg-forest text-paper",
  project_admin: "bg-moss text-paper",
  member: "bg-paper-dim text-ink-soft border border-line-dark",
};

export default function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex text-[11px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-sm ${STYLES[role] || STYLES.member}`}
    >
      {ROLE_LABELS[role] || role}
    </span>
  );
}
