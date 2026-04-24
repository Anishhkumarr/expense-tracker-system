import { useState } from "react";
import "./Auth.css";
import authArtwork from "../../assets/ExpenseImg.png";
import { getApiErrorMessage, registerUser } from "../../services/api";

const INITIAL_FORM = {
  name: "",
  password: "",
  email: "",
  phone: "",
};

function Register({ onNavigate, onRegisterSuccess }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      name: formData.name.trim(),
      password: formData.password.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    };

    if (!payload.name || !payload.password || !payload.email || !payload.phone) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await registerUser(payload);
      onRegisterSuccess({
        message: "Registration successful. Please sign in.",
        email: payload.email,
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not create account."));
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
              <h1 className="auth-form__title">Sign up</h1>

              {error ? (
                <p className="auth-status auth-status--error">{error}</p>
              ) : null}

              <label className="auth-field">
                <span>Name</span>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((currentValue) => ({
                      ...currentValue,
                      name: event.target.value,
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
                  placeholder="Create a password"
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
                <span>Phone</span>
                <input
                  className="auth-input"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(event) =>
                    setFormData((currentValue) => ({
                      ...currentValue,
                      phone: event.target.value,
                    }))
                  }
                  pattern="[789][0-9]{9}"
                  title="Phone number must start with 7, 8, or 9 and be 10 digits."
                  required
                />
              </label>

              <button
                className="auth-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Sign up"}
              </button>
            </form>

            <p className="auth-footer">
              Already have an account.{" "}
              <button type="button" onClick={() => onNavigate("/login")}>
                SIGN IN
              </button>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Register;
