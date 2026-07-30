import { useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { Card, Field, Input, Button, PageHeading } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { changePassword, resendEmailVerification } from "../api/auth";
import { getErrorMessage, initials } from "../lib/utils";

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ oldPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.oldPassword || !form.newPassword) return;
    setLoading(true);
    try {
      await changePassword(form);
      toast.success("Password changed");
      setForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setResending(true);
    try {
      await resendEmailVerification();
      toast.success("Verification email sent");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">
        <PageHeading eyebrow="Account" title="Your profile" />

        <Card className="p-6 flex items-center gap-4">
          <span className="w-14 h-14 rounded-full bg-forest text-paper flex items-center justify-center font-display text-lg">
            {initials(user.username || user.email)}
          </span>
          <div>
            <p className="font-medium text-ink">{user.fullName || user.username}</p>
            <p className="text-sm text-ink-soft">{user.email}</p>
            {!user.isEmailVerified && (
              <button
                onClick={onResend}
                disabled={resending}
                className="text-xs text-amber-dark hover:underline mt-1"
              >
                {resending ? "Sending…" : "Email not verified — resend link"}
              </button>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-xl text-ink mb-4">Change password</h2>
          <form onSubmit={onSubmit} className="flex flex-col gap-4 max-w-sm">
            <Field label="Current password" htmlFor="oldPassword">
              <Input
                id="oldPassword"
                type="password"
                value={form.oldPassword}
                onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
              />
            </Field>
            <Field label="New password" htmlFor="newPassword">
              <Input
                id="newPassword"
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              />
            </Field>
            <Button type="submit" disabled={loading} className="self-start mt-1">
              {loading ? "Updating…" : "Update password"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
