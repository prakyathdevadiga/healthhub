import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="auth-page">
      <section className="auth-shell auth-shell-compact">
        <div className="auth-panel auth-form-panel forgot-panel">
          <Link className="auth-logo auth-logo-centered" href="/">
            <span className="logo-icon">+</span>
            <span>
              Health<span>Hub</span>
            </span>
          </Link>

          <div className="auth-form-heading centered">
            <p className="auth-kicker">PASSWORD RESET</p>
            <h1>Forgot your password?</h1>
            <span>
              Enter the email linked to your account and we will send reset
              instructions.
            </span>
          </div>

          <form className="auth-form">
            <label htmlFor="reset-email">
              Email address
              <input
                id="reset-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <button className="auth-submit" type="submit">
              Send reset link
            </button>
          </form>

          <p className="auth-switch">
            Remembered it? <Link href="/login">Back to login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
