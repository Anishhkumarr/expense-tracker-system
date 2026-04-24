import { useEffect, useState } from "react";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Budget from "./pages/Budget";
import AuthHome from "./pages/Auth/AuthHome";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import {
  clearStoredAuthSession,
  getStoredAuthSession,
  hasActiveSession,
  storeAuthSession,
} from "./utils/auth";

function normalizePath(pathname) {
  if (pathname === "/login") return "/login";
  if (pathname === "/register") return "/register";
  if (pathname === "/expenses") return "/expenses";
  if (pathname === "/reports") return "/reports";
  if (pathname === "/budget") return "/budget";
  return "/";
}

function App() {
  const [currentPath, setCurrentPath] = useState(() =>
    normalizePath(window.location.pathname)
  );
  const [authSession, setAuthSession] = useState(() => getStoredAuthSession());
  const [authNotice, setAuthNotice] = useState("");
  const [authPrefillEmail, setAuthPrefillEmail] = useState("");

  const isAuthenticated = hasActiveSession(authSession);

  useEffect(() => {
    function handlePopState() {
      setCurrentPath(normalizePath(window.location.pathname));
      setAuthSession(getStoredAuthSession());
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  function handleNavigate(pathname, options = {}) {
    const nextPath = normalizePath(pathname);

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
      setCurrentPath(nextPath);
    }

    if (!options.preserveAuthNotice) {
      setAuthNotice("");
    }

    if (!options.preserveAuthPrefillEmail) {
      setAuthPrefillEmail("");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLoginSuccess(response) {
    const session = storeAuthSession(response);
    setAuthSession(session);
    setAuthNotice("");
    setAuthPrefillEmail("");
    handleNavigate("/");
  }

  function handleRegisterSuccess({ message, email }) {
    setAuthNotice(message);
    setAuthPrefillEmail(email || "");
    handleNavigate("/login", {
      preserveAuthNotice: true,
      preserveAuthPrefillEmail: true,
    });
  }

  function handleLogout() {
    clearStoredAuthSession();
    setAuthSession(null);
    handleNavigate("/");
  }

  if (!isAuthenticated) {
    if (currentPath === "/login") {
      return (
        <Login
          onNavigate={handleNavigate}
          onSuccess={handleLoginSuccess}
          notice={authNotice}
          initialEmail={authPrefillEmail}
        />
      );
    }

    if (currentPath === "/register") {
      return (
        <Register
          onNavigate={handleNavigate}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
    }

    return <AuthHome onNavigate={handleNavigate} />;
  }

  if (currentPath === "/expenses") {
    return (
      <Expenses
        currentPath={currentPath}
        onNavigate={handleNavigate}
        authSession={authSession}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPath === "/reports") {
    return (
      <Reports
        currentPath={currentPath}
        onNavigate={handleNavigate}
        authSession={authSession}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPath === "/budget") {
    return (
      <Budget
        currentPath={currentPath}
        onNavigate={handleNavigate}
        authSession={authSession}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <Dashboard
      currentPath={currentPath}
      onNavigate={handleNavigate}
      authSession={authSession}
      onLogout={handleLogout}
    />
  );
}

export default App;
