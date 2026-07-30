import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Paperclip, Plus, Trash2, Check } from "lucide-react";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import StatusBadge from "../components/StatusBadge";
import { Card, Field, Input, TextArea, Select, Button, Loader } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import {
  getTaskById,
  updateTask,
  deleteTask,
  createSubtask,
  updateSubtask,
  deleteSubtask,
} from "../api/tasks";
import { getProjectMembers } from "../api/projects";
import { getErrorMessage, STATUS_ORDER, STATUS_LABELS } from "../lib/utils";
import { useProjectPermissions } from "../lib/permissions";

export default function TaskDetail() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [members, setMembers] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [subtaskOpen, setSubtaskOpen] = useState(false);
  const [subtaskDeleteTarget, setSubtaskDeleteTarget] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", status: "todo", assignedTo: "" });
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [taskRes, membersRes] = await Promise.all([
        getTaskById(projectId, taskId),
        getProjectMembers(projectId),
      ]);
      const t = taskRes.data?.data;
      setTask(t);
      setForm({
        title: t?.title || "",
        description: t?.description || "",
        status: t?.status || "todo",
        assignedTo: t?.assignedTo?._id || "",
      });
      setMembers(membersRes.data?.data ?? []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, taskId]);

  const myRole =
    members.find((m) => (m.user?._id || m._id) === user?._id)?.role || "member";
  const { canManageTasks } = useProjectPermissions(myRole);

  const onUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateTask(projectId, taskId, form);
      toast.success("Task updated");
      setEditOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onDeleteTask = async () => {
    try {
      await deleteTask(projectId, taskId);
      toast.success("Task deleted");
      navigate(`/projects/${projectId}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onAddSubtask = async (e) => {
    e.preventDefault();
    if (!subtaskTitle.trim()) return;
    try {
      await createSubtask(projectId, taskId, { title: subtaskTitle });
      setSubtaskTitle("");
      setSubtaskOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onToggleSubtask = async (subtask) => {
    try {
      await updateSubtask(projectId, subtask._id, { isCompleted: !subtask.isCompleted });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onDeleteSubtask = async () => {
    if (!subtaskDeleteTarget) return;
    try {
      await deleteSubtask(projectId, subtaskDeleteTarget._id);
      setSubtaskDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (!task) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <Loader label="Loading task" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-6">
        <Link
          to={`/projects/${projectId}`}
          className="inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-forest font-mono w-fit"
        >
          <ArrowLeft size={14} /> Back to project
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={task.status} />
              <span className="text-xs text-ink-soft font-mono">
                {task.assignedTo?.username || task.assignedTo?.email || "Unassigned"}
              </span>
            </div>
            <h1 className="font-display text-3xl text-ink">{task.title}</h1>
          </div>
          {canManageTasks && (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash2 size={14} /> Delete
              </Button>
            </div>
          )}
        </div>

        <Card className="p-5">
          <p className="text-sm text-ink-soft whitespace-pre-wrap">
            {task.description || "No description."}
          </p>
        </Card>

        {task.attachments?.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-ink mb-3">Attachments</h2>
            <div className="flex flex-col gap-2">
              {task.attachments.map((file, i) => (
                <a
                  key={i}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-forest hover:underline"
                >
                  <Paperclip size={14} />
                  {file.url?.split("/").pop() || `Attachment ${i + 1}`}
                </a>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-ink">Subtasks</h2>
            {canManageTasks && (
              <Button variant="ghost" size="sm" onClick={() => setSubtaskOpen(true)}>
                <Plus size={14} /> Add subtask
              </Button>
            )}
          </div>

          {task.subtasks?.length > 0 ? (
            <Card className="divide-y divide-line">
              {task.subtasks.map((st) => (
                <div key={st._id} className="flex items-center justify-between gap-3 p-3.5">
                  <button
                    onClick={() => onToggleSubtask(st)}
                    className="flex items-center gap-3 text-left flex-1"
                  >
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        st.isCompleted
                          ? "bg-forest border-forest text-paper"
                          : "border-line-dark"
                      }`}
                    >
                      {st.isCompleted && <Check size={12} />}
                    </span>
                    <span
                      className={`text-sm ${
                        st.isCompleted ? "text-ink-soft line-through" : "text-ink"
                      }`}
                    >
                      {st.title}
                    </span>
                  </button>
                  {canManageTasks && (
                    <button
                      onClick={() => setSubtaskDeleteTarget(st)}
                      aria-label="Delete subtask"
                      className="text-ink-soft hover:text-clay transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </Card>
          ) : (
            <p className="text-sm text-ink-soft">No subtasks yet.</p>
          )}
        </div>
      </main>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit task">
        <form onSubmit={onUpdate} className="flex flex-col gap-4">
          <Field label="Title" htmlFor="edit-title">
            <Input
              id="edit-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label="Description" htmlFor="edit-description">
            <TextArea
              id="edit-description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Field label="Status" htmlFor="edit-status">
            <Select
              id="edit-status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Assignee" htmlFor="edit-assignee">
            <Select
              id="edit-assignee"
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            >
              <option value="">Unassigned</option>
              {members.map((m) => {
                const person = m.user || m;
                return (
                  <option key={person._id} value={person._id}>
                    {person.username || person.email}
                  </option>
                );
              })}
            </Select>
          </Field>
          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={subtaskOpen} onClose={() => setSubtaskOpen(false)} title="Add subtask" size="sm">
        <form onSubmit={onAddSubtask} className="flex flex-col gap-4">
          <Field label="Title" htmlFor="subtask-title">
            <Input
              id="subtask-title"
              autoFocus
              value={subtaskTitle}
              onChange={(e) => setSubtaskTitle(e.target.value)}
            />
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setSubtaskOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onDeleteTask}
        title="Delete task"
        description="This removes the task and its subtasks."
      />
      <ConfirmDialog
        open={!!subtaskDeleteTarget}
        onClose={() => setSubtaskDeleteTarget(null)}
        onConfirm={onDeleteSubtask}
        title="Delete subtask"
      />
    </div>
  );
}
