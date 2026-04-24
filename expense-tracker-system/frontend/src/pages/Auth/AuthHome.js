import "./Auth.css";
import authArtwork from "../../assets/ExpenseImg.png";

function AuthHome({ onNavigate }) {
  return (
    <div className="auth-shell">
      <div className="auth-frame">
        <main className="auth-card auth-card--home">
          <section className="auth-hero" aria-hidden="true">
            <div className="auth-brand">
              <span className="auth-brand__mark">{"\u20B9"}</span>
              <span>ExpenseLy</span>
            </div>

            <img className="auth-hero__image" src={authArtwork} alt="" />
          </section>

          <section className="auth-panel auth-panel--home">
            <h1 className="auth-title">Expense Tracker</h1>
            <p className="auth-subtitle">Best way to save your money</p>

            <div className="auth-actions">
              <button
                className="auth-button auth-button--secondary"
                type="button"
                onClick={() => onNavigate("/register")}
              >
                Sign up
              </button>

              <button
                className="auth-button"
                type="button"
                onClick={() => onNavigate("/login")}
              >
                Sign in
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AuthHome;
