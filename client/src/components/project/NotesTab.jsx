import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "../Modal";
import ConfirmDialog from "../ConfirmDialog";
import { Card, Field, TextArea, Input, Button, EmptyState, Loader } from "../ui";
import { getNotes, createNote, updateNote, deleteNote } from "../../api/notes";
import { getErrorMessage, formatDate } from "../../lib/utils";

export default function NotesTab({ projectId, canManage }) {
  const [notes, setNotes] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await getNotes(projectId);
      setNotes(res.data?.data ?? []);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setNotes([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", content: "" });
    setModalOpen(true);
  };

  const openEdit = (note) => {
    setEditing(note);
    setForm({ title: note.title || "", content: note.content || "" });
    setModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateNote(projectId, editing._id, form);
        toast.success("Note updated");
      } else {
        await createNote(projectId, form);
        toast.success("Note added");
      }
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
      await deleteNote(projectId, deleteTarget._id);
      toast.success("Note deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (notes === null) return <Loader label="Loading notes" />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        {canManage && (
          <Button onClick={openCreate}>
            <Plus size={16} /> New note
          </Button>
        )}
      </div>

      {notes.length === 0 ? (
        <EmptyState title="No notes yet" description="Keep shared context, decisions, and reminders here." />
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <Card key={note._id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {note.title && (
                    <p className="text-sm font-medium text-ink mb-1">{note.title}</p>
                  )}
                  <p className="text-sm text-ink-soft whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-ink-soft/60 font-mono mt-2">
                    {formatDate(note.createdAt)}
                  </p>
                </div>
                {canManage && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(note)}
                      aria-label="Edit note"
                      className="text-ink-soft hover:text-forest transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(note)}
                      aria-label="Delete note"
                      className="text-ink-soft hover:text-clay transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit note" : "New note"}
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label="Title" htmlFor="note-title" hint="Optional">
            <Input
              id="note-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label="Content" htmlFor="note-content">
            <TextArea
              id="note-content"
              rows={5}
              autoFocus
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </Field>
          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add note"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        title="Delete note"
        description="This note will be permanently removed."
      />
    </div>
  );
}
