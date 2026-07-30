import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserPlus, Trash2 } from "lucide-react";
import Modal from "../Modal";
import ConfirmDialog from "../ConfirmDialog";
import RoleBadge from "../RoleBadge";
import { Card, Field, Input, Select, Button, EmptyState, Loader } from "../ui";
import {
  getProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeMember,
} from "../../api/projects";
import { getErrorMessage, initials } from "../../lib/utils";

export default function MembersTab({ projectId, canManage }) {
  const [members, setMembers] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [form, setForm] = useState({ email: "", role: "member" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await getProjectMembers(projectId);
      setMembers(res.data?.data ?? []);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setMembers([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const onInvite = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) return;
    setSaving(true);
    try {
      await addProjectMember(projectId, form);
      toast.success("Member added");
      setForm({ email: "", role: "member" });
      setInviteOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onRoleChange = async (userId, role) => {
    try {
      await updateMemberRole(projectId, userId, { role });
      toast.success("Role updated");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onRemove = async () => {
    if (!removeTarget) return;
    try {
      await removeMember(projectId, removeTarget.user?._id || removeTarget._id);
      toast.success("Member removed");
      setRemoveTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (members === null) return <Loader label="Loading members" />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        {canManage && (
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus size={16} /> Add member
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <EmptyState title="No members yet" description="Invite teammates by email to get them into this project." />
      ) : (
        <Card className="divide-y divide-line">
          {members.map((m) => {
            const person = m.user || m;
            return (
              <div key={m._id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-paper-dim text-ink-soft flex items-center justify-center text-xs font-mono">
                    {initials(person.username || person.email || "?")}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {person.fullName || person.username || person.email}
                    </p>
                    <p className="text-xs text-ink-soft">{person.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {canManage ? (
                    <Select
                      value={m.role}
                      onChange={(e) => onRoleChange(person._id, e.target.value)}
                      className="!w-auto !py-1.5 text-xs"
                    >
                      <option value="admin">Admin</option>
                      <option value="project_admin">Project Admin</option>
                      <option value="member">Member</option>
                    </Select>
                  ) : (
                    <RoleBadge role={m.role} />
                  )}
                  {canManage && (
                    <button
                      onClick={() => setRemoveTarget(m)}
                      aria-label="Remove member"
                      className="text-ink-soft hover:text-clay transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Add member">
        <form onSubmit={onInvite} className="flex flex-col gap-4">
          <Field label="Email" htmlFor="member-email">
            <Input
              id="member-email"
              type="email"
              autoFocus
              placeholder="teammate@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Role" htmlFor="member-role">
            <Select
              id="member-role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="member">Member</option>
              <option value="project_admin">Project Admin</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="ghost" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Adding…" : "Add member"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={onRemove}
        title="Remove member"
        description="They'll lose access to this project immediately."
      />
    </div>
  );
}
