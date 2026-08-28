"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      // Save user's name in Firebase
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      setMessage("Account created successfully!");

      // Go to dashboard
      router.push("/dashboard");

    } catch (error: any) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        setError(
          "An account already exists with this email."
        );
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        setError(
          "Password is too weak. Use at least 6 characters."
        );
      } else {
        setError(
          "Unable to create account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      await signInWithPopup(auth, provider);

      router.push("/dashboard");

    } catch (error: any) {
      console.error(error);

      if (error.code === "auth/popup-closed-by-user") {
        setError("Google sign-in was cancelled.");
      } else if (error.code === "auth/popup-blocked") {
        setError(
          "Google sign-in popup was blocked by your browser."
        );
      } else {
        setError(
          "Unable to sign up with Google. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell auth-shell-compact">

        <div className="auth-panel auth-form-panel forgot-panel">

          {/* Logo */}
          <Link
            className="auth-logo auth-logo-centered"
            href="/"
          >
            <span className="logo-icon">+</span>

            <span>
              Health<span>Hub</span>
            </span>
          </Link>

          {/* Heading */}
          <div className="auth-form-heading centered">

            <p className="auth-kicker">
              CREATE ACCOUNT
            </p>

            <h1>
              Join HealthHub
            </h1>

            <span>
              Create your account to manage your health
              in one place.
            </span>

          </div>

          {/* Signup Form */}
          <form
            className="auth-form"
            onSubmit={handleSignup}
          >

            {/* Name */}
            <label htmlFor="name">
              Full name

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                autoComplete="name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />
            </label>

            {/* Email */}
            <label htmlFor="email">
              Email address

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </label>

            {/* Password */}
            <label htmlFor="password">
              Password

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                autoComplete="new-password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </label>

            {/* Confirm Password */}
            <label htmlFor="confirm-password">
              Confirm password

              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                placeholder="Confirm your password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />
            </label>

            {/* Error */}
            {error && (
              <p className="auth-error">
                {error}
              </p>
            )}

            {/* Success */}
            {message && (
              <p className="auth-success">
                {message}
              </p>
            )}

            {/* Create Account */}
            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <span>OR</span>
            </div>

            {/* Google */}
            <button
              type="button"
              className="google-login"
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              <span className="google-icon">
                G
              </span>

              Continue with Google
            </button>

          </form>

          {/* Login */}
          <p className="auth-switch">
            Already have an account?{" "}

            <Link href="/login">
              Login
            </Link>
          </p>

        </div>

      </section>
    </main>
  );
}