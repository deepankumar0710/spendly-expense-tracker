import { Route, Routes } from "react-router-dom";
import App from "./App";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";

function Shell() {
  const { user, logout } = useAuth();
  return (
    <>
      <div className="auth-topbar">
        <span>Signed in as {user.username}</span>
        <button onClick={logout}>Log out</button>
      </div>
      <App />
    </>
  );
}

export default function Root() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Shell />} />
      </Route>
    </Routes>
  );
}