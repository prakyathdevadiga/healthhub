"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);

      setMessage(
        "Password reset instructions have been sent to your email."
      );
      setEmail("");
    } catch (error: any) {
      console.error(error);

      if (error.code === "auth/user-not-found") {
        setError("No account was found with this email address.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Unable to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell auth-shell-compact">
        <div className="auth-panel auth-form-panel forgot-panel">

          <Link
            className="auth-logo auth-logo-centered"
            href="/"
          >
            <span className="logo-icon">+</span>
            <span>
              Health<span>Hub</span>
            </span>
          </Link>

          <div className="auth-form-heading centered">
            <p className="auth-kicker">PASSWORD RESET</p>

            <h1>Forgot your password?</h1>

            <span>
              Enter the email linked to your account and we will
              send reset instructions.
            </span>
          </div>

          <form
            className="auth-form"
            onSubmit={handleResetPassword}
          >
            <label htmlFor="reset-email">
              Email address

              <input
                id="reset-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            {error && (
              <p className="auth-error">
                {error}
              </p>
            )}

            {message && (
              <p className="auth-success">
                {message}
              </p>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Sending..."
                : "Send reset link"}
            </button>
          </form>

          <p className="auth-switch">
            Remembered it?{" "}
            <Link href="/login">
              Back to login
            </Link>
          </p>

        </div>
      </section>
    </main>
  );
}