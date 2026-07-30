import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../../components/AuthLayout";
import { Field, Input, Button } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../lib/utils";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.username) errs.username = "Username is required";
    if (!form.email) errs.email = "Email is required";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8)
      errs.password = "Use at least 8 characters";
    return errs;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await register(form);
      toast.success("Account created — check your email to verify it");
      navigate("/login");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Set up camp — you can invite your team right after."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-forest font-medium hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Full name" htmlFor="fullName">
          <Input
            id="fullName"
            name="fullName"
            placeholder="Jordan Rivera"
            value={form.fullName}
            onChange={onChange}
          />
        </Field>
        <Field label="Username" htmlFor="username" error={errors.username}>
          <Input
            id="username"
            name="username"
            placeholder="jordanrivera"
            value={form.username}
            onChange={onChange}
          />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={onChange}
          />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          error={errors.password}
          hint="At least 8 characters"
        >
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={onChange}
          />
        </Field>
        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
