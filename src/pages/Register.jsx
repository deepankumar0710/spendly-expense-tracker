import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/services";
import { useAuth } from "../context/AuthContext";

function formatErrors(data) {
  if (!data || typeof data !== "object") return "Registration failed. Please try again.";
  return Object.entries(data)
    .map(([field, msgs]) => `${field}: ${[].concat(msgs).join(" ")}`)
    .join(" | ");
}

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", password2: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim() || !form.password) {
      setError("Fill in every field.");
      return;
    }
    if (form.password !== form.password2) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await register({ ...form, username: form.username.trim(), email: form.email.trim() });
      await login(form.username.trim(), form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response ? formatErrors(err.response.data) : "Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <h1>Create your account</h1>
      <label>
        Username
        <input name="username" value={form.username} onChange={handleChange} autoComplete="username" />
      </label>
      <label>
        Email
        <input name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" />
      </label>
      <label>
        Password
        <input name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
      </label>
      <label>
        Confirm password
        <input name="password2" type="password" value={form.password2} onChange={handleChange} autoComplete="new-password" />
      </label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? "Creating account..." : "Create account"}
      </button>
      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </form>
  );
}