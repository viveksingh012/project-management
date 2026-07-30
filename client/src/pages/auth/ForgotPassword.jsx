import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";
import AuthLayout from "../../components/AuthLayout";
import { Field, Input, Button } from "../../components/ui";
import { forgotPassword } from "../../api/auth";
import { getErrorMessage } from "../../lib/utils";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Reset your password"
      subtitle="We'll send a reset link to your email."
      footer={
        <Link to="/login" className="text-forest font-medium hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="flex items-start gap-3 bg-forest/10 border border-forest/20 rounded-sm p-4">
          <CheckCircle2 className="text-forest shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-ink">
            If an account exists for <strong>{email}</strong>, a reset link is on
            its way.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
