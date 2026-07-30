import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Paperclip, Trash2 } from "lucide-react";
import Modal from "../Modal";
import ConfirmDialog from "../ConfirmDialog";
import { Card, Field, Input, TextArea, Select, Button, EmptyState, Loader } from "../ui";
import { getTasks, createTask, deleteTask } from "../../api/tasks";
import { getErrorMessage, STATUS_ORDER, STATUS_LABELS } from "../../lib/utils";

const COLUMN_META = {
  todo: { marker: "01", accent: "bg-line-dark" },
  in_progress: { marker: "02", accent: "bg-amber" },
  done: { marker: "03", accent: "bg-forest" },
};

export default function TasksTab({ projectId, canManage, members }) {
  const [tasks, setTasks] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", assignedTo: "" });
  const [files, setFiles] = useState([]);

  const load = async () => {
    try {
      const res = await getTasks(projectId);
      setTasks(res.data?.data ?? []);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setTasks([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      if (form.assignedTo) fd.append("assignedTo", form.assignedTo);
      files.forEach((f) => fd.append("attachments", f));

      await createTask(projectId, fd);
      toast.success("Task created");
      setForm({ title: "", description: "", assignedTo: "" });
      setFiles([]);
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask(projectId, deleteTarget._id);
      toast.success("Task deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (tasks === null) return <Loader label="Loading tasks" />;

  const grouped = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        {canManage && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} /> New task
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks on the trail yet"
          description="Break the project into tasks so the team knows what's next."
        />
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {STATUS_ORDER.map((status, i) => (
            <div key={status} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-ink-soft">
                  {COLUMN_META[status].marker}
                </span>
                <span className="text-sm font-medium text-ink">
                  {STATUS_LABELS[status]}
                </span>
                <span className="text-xs text-ink-soft font-mono ml-auto">
                  {grouped[status].length}
                </span>
              </div>
              <div className={`h-0.5 rounded-full ${COLUMN_META[status].accent}`} />
              <div className="flex flex-col gap-3">
                {grouped[status].map((task) => (
                  <Card key={task._id} className="p-4 group hover:border-forest transition-colors">
                    <Link to={`/projects/${projectId}/tasks/${task._id}`}>
                      <p className="text-sm font-medium text-ink group-hover:text-forest transition-colors mb-1">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-ink-soft line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </Link>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
                      <span className="text-xs text-ink-soft font-mono">
                        {task.assignedTo?.username || task.assignedTo?.email || "Unassigned"}
                      </span>
                      <div className="flex items-center gap-2">
                        {task.attachments?.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-ink-soft">
                            <Paperclip size={12} /> {task.attachments.length}
                          </span>
                        )}
                        {canManage && (
                          <button
                            onClick={() => setDeleteTarget(task)}
                            aria-label="Delete task"
                            className="text-ink-soft hover:text-clay transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                {grouped[status].length === 0 && (
                  <div className="border border-dashed border-line rounded-sm py-6 text-center text-xs text-ink-soft/70">
                    Nothing here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New task">
        <form onSubmit={onCreate} className="flex flex-col gap-4">
          <Field label="Title" htmlFor="task-title">
            <Input
              id="task-title"
              autoFocus
              placeholder="Set up the base camp"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label="Description" htmlFor="task-description">
            <TextArea
              id="task-description"
              rows={3}
              placeholder="What needs to happen?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Field label="Assignee" htmlFor="task-assignee">
            <Select
              id="task-assignee"
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            >
              <option value="">Unassigned</option>
              {members?.map((m) => {
                const person = m.user || m;
                return (
                  <option key={person._id} value={person._id}>
                    {person.username || person.email}
                  </option>
                );
              })}
            </Select>
          </Field>
          <Field label="Attachments" htmlFor="task-files" hint="Optional — attach reference files">
            <input
              id="task-files"
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="text-sm text-ink-soft file:mr-3 file:py-2 file:px-3 file:rounded-sm file:border-0 file:bg-paper-dim file:text-ink-soft file:text-xs hover:file:bg-line"
            />
          </Field>
          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create task"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        title="Delete task"
        description="This removes the task and its subtasks. This can't be undone."
      />
    </div>
  );
}
