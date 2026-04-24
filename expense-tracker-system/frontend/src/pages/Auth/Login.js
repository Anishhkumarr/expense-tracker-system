import { useEffect, useState } from "react";
import "./Auth.css";
import authArtwork from "../../assets/ExpenseImg.png";
import { getApiErrorMessage, loginUser } from "../../services/api";

const INITIAL_FORM = {
  email: "",
  password: "",
};

function buildLoginPayload(email, password) {
  return {
    email,
    password,
  };
}

function Login({ onNavigate, onSuccess, notice = "", initialEmail = "" }) {
  const [formData, setFormData] = useState(() => ({
    ...INITIAL_FORM,
    email: initialEmail,
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData((currentValue) =>
      currentValue.email === initialEmail
        ? currentValue
        : { ...currentValue, email: initialEmail || "" }
    );
  }, [initialEmail]);

  async function handleSubmit(event) {
    event.preventDefault();
    const email = formData.email.trim();
    const password = formData.password.trim();

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await loginUser(buildLoginPayload(email, password));
      onSuccess(response);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not sign in."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-frame">
        <main className="auth-card">
          <section className="auth-hero" aria-hidden="true">
            <div className="auth-brand">
              <span className="auth-brand__mark">{"\u20B9"}</span>
              <span>ExpenseLy</span>
            </div>
            <img
              className="auth-hero__image"
              src={authArtwork}
              alt=""
            />
          </section>

          <section className="auth-panel">
            <form className="auth-form" onSubmit={handleSubmit}>
              <h1 className="auth-form__title">Sign in</h1>

              {notice ? (
                <p className="auth-status auth-status--success">{notice}</p>
              ) : null}

              {error ? (
                <p className="auth-status auth-status--error">{error}</p>
              ) : null}

              <label className="auth-field">
                <span>Email</span>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((currentValue) => ({
                      ...currentValue,
                      email: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label className="auth-field">
                <span>Password</span>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(event) =>
                    setFormData((currentValue) => ({
                      ...currentValue,
                      password: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <button
                className="auth-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="auth-footer">
              Don't have an account?{" "}
              <button type="button" onClick={() => onNavigate("/register")}>
                SIGN UP
              </button>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Login;
