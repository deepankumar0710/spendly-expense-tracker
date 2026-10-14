import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError("Enter your username and password.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await login(form.username.trim(), form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Wrong username or password."
          : "Could not reach the server. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <h1>Sign in to Spendly</h1>
      <label>
        Username
        <input name="username" value={form.username} onChange={handleChange} autoComplete="username" />
      </label>
      <label>
        Password
        <input name="password" type="password" value={form.password} onChange={handleChange} autoComplete="current-password" />
      </label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? "Signing in..." : "Sign in"}
      </button>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </form>
  );
}