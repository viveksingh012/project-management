import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import TasksTab from "../components/project/TasksTab";
import MembersTab from "../components/project/MembersTab";
import NotesTab from "../components/project/NotesTab";
import { Field, Input, TextArea, Button, Loader } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import {
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
} from "../api/projects";
import { getErrorMessage } from "../lib/utils";
import { useProjectPermissions } from "../lib/permissions";

const TABS = [
  { key: "tasks", label: "Tasks" },
  { key: "members", label: "Members" },
  { key: "notes", label: "Notes" },
];

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tab, setTab] = useState("tasks");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [projectRes, membersRes] = await Promise.all([
        getProjectById(projectId),
        getProjectMembers(projectId),
      ]);
      const p = projectRes.data?.data;
      setProject(p);
      setForm({ name: p?.name || "", description: p?.description || "" });
      setMembers(membersRes.data?.data ?? []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const myRole =
    members.find((m) => (m.user?._id || m._id) === user?._id)?.role ||
    (project?.createdBy === user?._id ? "admin" : "member");

  const { canManageTasks, canManageNotes, canManageMembers, isAdmin } =
    useProjectPermissions(myRole);

  const onUpdate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await updateProject(projectId, form);
      toast.success("Project updated");
      setEditOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    try {
      await deleteProject(projectId);
      toast.success("Project deleted");
      navigate("/projects");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <Loader label="Loading project" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-8">
        <div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-forest mb-4 font-mono"
          >
            <ArrowLeft size={14} /> All projects
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-3xl text-ink mb-1">{project.name}</h1>
              <p className="text-sm text-ink-soft max-w-2xl">
                {project.description || "No description yet."}
              </p>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                  <Pencil size={14} /> Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="border-b border-line flex gap-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                tab === t.key ? "text-forest" : "text-ink-soft hover:text-ink"
              }`}
            >
              {t.label}
              {tab === t.key && (
                <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-forest" />
              )}
            </button>
          ))}
        </div>

        {tab === "tasks" && (
          <TasksTab projectId={projectId} canManage={canManageTasks} members={members} />
        )}
        {tab === "members" && (
          <MembersTab projectId={projectId} canManage={canManageMembers} />
        )}
        {tab === "notes" && (
          <NotesTab projectId={projectId} canManage={canManageNotes} />
        )}
      </main>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit project">
        <form onSubmit={onUpdate} className="flex flex-col gap-4">
          <Field label="Project name" htmlFor="edit-name">
            <Input
              id="edit-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onDelete}
        title="Delete project"
        description="This permanently removes the project, its tasks, members, and notes."
      />
    </div>
  );
}
