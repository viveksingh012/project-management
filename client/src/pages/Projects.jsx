import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Users, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import { Card, Field, Input, TextArea, Button, PageHeading, EmptyState, Loader } from "../components/ui";
import { getProjects, createProject } from "../api/projects";
import { getErrorMessage } from "../lib/utils";

export default function Projects() {
  const [projects, setProjects] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data?.data ?? []);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setProjects([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await createProject(form);
      toast.success("Project created");
      setForm({ name: "", description: "" });
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-8">
        <PageHeading
          eyebrow="Basecamp"
          title="Your projects"
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} /> New project
            </Button>
          }
        />

        {projects === null && <Loader label="Loading projects" />}

        {projects?.length === 0 && (
          <EmptyState
            title="No projects yet"
            description="Pitch your first project to start assigning tasks and inviting your team."
            action={
              <Button onClick={() => setModalOpen(true)} className="mt-2">
                <Plus size={16} /> New project
              </Button>
            }
          />
        )}

        {projects?.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <Link key={p._id} to={`/projects/${p._id}`}>
                <Card className="p-5 h-full flex flex-col justify-between hover:border-forest transition-colors group">
                  <div>
                    <h3 className="font-display text-lg text-ink mb-1 group-hover:text-forest transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-sm text-ink-soft line-clamp-2">
                      {p.description || "No description yet."}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
                    <span className="flex items-center gap-1.5 text-xs text-ink-soft font-mono">
                      <Users size={13} />
                      {p.memberCount ?? p.members?.length ?? 0} members
                    </span>
                    <ArrowRight
                      size={15}
                      className="text-moss group-hover:translate-x-0.5 transition-transform"
                    />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New project">
        <form onSubmit={onCreate} className="flex flex-col gap-4">
          <Field label="Project name" htmlFor="name">
            <Input
              id="name"
              autoFocus
              placeholder="Trailhead redesign"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Description" htmlFor="description">
            <TextArea
              id="description"
              rows={3}
              placeholder="What's this project about?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create project"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
