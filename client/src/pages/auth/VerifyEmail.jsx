import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import AuthLayout from "../../components/AuthLayout";
import { Loader, Button } from "../../components/ui";
import { verifyEmail } from "../../api/auth";
import { getErrorMessage } from "../../lib/utils";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    verifyEmail(token)
      .then(() => {
        if (active) setStatus("success");
      })
      .catch((err) => {
        if (active) {
          setStatus("error");
          setMessage(getErrorMessage(err));
        }
      });
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <AuthLayout eyebrow="Account" title="Email verification">
      {status === "loading" && <Loader label="Verifying your email" />}
      {status === "success" && (
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-2 text-forest">
            <CheckCircle2 size={22} />
            <span className="font-medium">Your email is verified</span>
          </div>
          <p className="text-sm text-ink-soft">
            You're all set. Sign in to head to your projects.
          </p>
          <Button as={Link} to="/login">
            Go to sign in
          </Button>
        </div>
      )}
      {status === "error" && (
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-2 text-clay">
            <XCircle size={22} />
            <span className="font-medium">Verification failed</span>
          </div>
          <p className="text-sm text-ink-soft">{message}</p>
          <Button as={Link} to="/login" variant="secondary">
            Back to sign in
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
