import { useEffect, useMemo, useRef, useState } from "react";
import "./Navbar.css";

function getDisplayName(authSession) {
  if (authSession?.name?.trim()) {
    return authSession.name.trim();
  }

  if (authSession?.email?.trim()) {
    return authSession.email.trim().split("@")[0];
  }

  return "Expense Tracker User";
}

function getProfileInitials(authSession) {
  const displayName = getDisplayName(authSession);
  const parts = displayName.split(/\s+/).filter(Boolean).slice(0, 2);

  if (!parts.length) {
    return "ET";
  }

  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

function Navbar({ currentPath = "/", onNavigate, authSession, onLogout }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const displayName = useMemo(() => getDisplayName(authSession), [authSession]);
  const profileInitials = useMemo(
    () => getProfileInitials(authSession),
    [authSession]
  );

  useEffect(() => {
    function handlePointerDown(event) {
      if (!profileRef.current?.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleNavigation(pathname) {
    if (onNavigate) {
      onNavigate(pathname);
    }

    setIsProfileOpen(false);
  }

  function handleLogout() {
    setIsProfileOpen(false);

    if (onLogout) {
      onLogout();
    }
  }

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">{"\u20B9"}</div>
        <div>
          <p className="brand-kicker">Personal finance dashboard</p>
          <h1>Expense Tracker</h1>
        </div>
      </div>

      <nav className="topnav" aria-label="Primary">
        <button
          className={`topnav__item ${
            currentPath === "/" ? "topnav__item--active" : ""
          }`}
          type="button"
          onClick={() => handleNavigation("/")}
        >
          Dashboard
        </button>
        <button
          className={`topnav__item ${
            currentPath === "/expenses" ? "topnav__item--active" : ""
          }`}
          type="button"
          onClick={() => handleNavigation("/expenses")}
        >
          Expenses
        </button>
        <button
          className={`topnav__item ${
            currentPath === "/reports" ? "topnav__item--active" : ""
          }`}
          type="button"
          onClick={() => handleNavigation("/reports")}
        >
          Reports
        </button>
        <button
          className={`topnav__item ${
            currentPath === "/budget" ? "topnav__item--active" : ""
          }`}
          type="button"
          onClick={() => handleNavigation("/budget")}
        >
          Budget
        </button>
      </nav>

      <div className="profile-menu" ref={profileRef}>
        <button
          className={`profile-trigger ${
            isProfileOpen ? "profile-trigger--active" : ""
          }`}
          type="button"
          aria-haspopup="menu"
          aria-expanded={isProfileOpen}
          aria-label="Open profile menu"
          onClick={() => setIsProfileOpen((currentValue) => !currentValue)}
        >
          <span className="profile-trigger__avatar" aria-hidden="true">
            {profileInitials}
          </span>
          <span className="profile-trigger__copy">
            <strong>{displayName}</strong>
            <small>{authSession?.email || `User ID: ${authSession?.userId || "-"}`}</small>
          </span>
        </button>

        {isProfileOpen ? (
          <div className="profile-dropdown" role="menu" aria-label="Profile options">
            <div className="profile-card">
              <div className="profile-card__avatar" aria-hidden="true">
                {profileInitials}
              </div>

              <div className="profile-card__copy">
                <h2>{displayName}</h2>
                <p>{authSession?.email || "No email available"}</p>
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-details__row">
                <span>Account</span>
                <strong>Expense Tracker</strong>
              </div>
              {/* <div className="profile-details__row">
                <span>User ID</span>
                <strong>{authSession?.userId || "-"}</strong>
              </div> */}
              <div className="profile-details__row">
                <span>Mobile</span>
                <strong>{authSession?.mobile || "Not added yet"}</strong>
              </div>
            </div>

            <button
              className="profile-logout"
              type="button"
              role="menuitem"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default Navbar;
