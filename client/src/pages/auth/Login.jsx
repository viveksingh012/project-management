import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../../components/AuthLayout";
import { Field, Input, Button } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../lib/utils";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!form.email || !form.password) {
      setErrors({
        email: !form.email ? "Email is required" : undefined,
        password: !form.password ? "Password is required" : undefined,
      });
      return;
    }
    setLoading(true);
    try {
      await login(form);
      toast.success("Welcome back");
      const dest = location.state?.from?.pathname || "/projects";
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Sign in"
      title="Welcome back"
      subtitle="Log in to pick up where your team left off."
      footer={
        <>
          New to Project Camp?{" "}
          <Link to="/register" className="text-forest font-medium hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={onChange}
          />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password}>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={onChange}
          />
        </Field>
        <div className="flex justify-end -mt-2">
          <Link to="/forgot-password" className="text-xs text-forest hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
