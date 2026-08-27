"use client";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
export default function LoginPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    await signInWithEmailAndPassword(auth, email, password);

    router.push("/dashboard");
  } catch (error: any) {
    console.error(error);

    if (error.code === "auth/invalid-credential") {
      setError("Invalid email or password.");
    } else if (error.code === "auth/user-not-found") {
      setError("No account found with this email.");
    } else if (error.code === "auth/wrong-password") {
      setError("Incorrect password.");
    } else {
      setError("Unable to login. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

const handleGoogleLogin = async () => {
  setError("");
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
      setError("Google sign-in popup was blocked by your browser.");
    }else if (error.code === "auth/unauthorized-domain") {
      setError("This website domain is not authorized in Firebase.");
    } else {
      setError("Unable to sign in with Google. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="auth-page">
      <section className="auth-shell">

        <div className="auth-panel auth-brand-panel">
          <Link className="auth-logo" href="/">
            <span className="logo-icon">+</span>
            <span>
              Health<span>Hub</span>
            </span>
          </Link>

          <div className="auth-copy">
            <p className="auth-kicker">WELCOME BACK</p>

            <h1>
              Sign in to manage your health in one place.
            </h1>

            <p>
              Access medicine details, prescriptions, reminders,
              nearby care options and emergency support from your
              secure Health Hub account.
            </p>
          </div>

          <div className="auth-highlights">
            <div>
              <strong>Private</strong>
              <span>Protected health records</span>
            </div>

            <div>
              <strong>Organized</strong>
              <span>Prescriptions and reminders</span>
            </div>

            <div>
              <strong>Helpful</strong>
              <span>Healthcare tools anytime</span>
            </div>
          </div>
        </div>

        <div className="auth-panel auth-form-panel">

          <div className="auth-form-heading">
            <p className="auth-kicker">LOGIN</p>

            <h2>Welcome back</h2>

            <span>
              Enter your details to continue to Health Hub.
            </span>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>

            <label htmlFor="email">
              Email address

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
            </label>

            <label htmlFor="password">
              Password

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <div className="auth-row">
              <label className="checkbox-label" htmlFor="remember">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                />
                Remember me
              </label>

              <Link href="/forgot-password">
                Forgot password?
              </Link>
            </div>

            {error && (
               <p className="auth-error">
              {error}
            </p>
          )}

            <button
  className="auth-submit"
  type="submit"
  disabled={loading}
>
  {loading ? "Logging in..." : "Login"}
</button>

<div className="auth-divider">
  <span>OR</span>
</div>

<button
  type="button"
  className="google-login"
  onClick={handleGoogleLogin}
  disabled={loading}
>
  <FcGoogle size={22} />
  Continue with Google
</button>

</form>

<p className="auth-switch">
  New to Health Hub?{" "}
  <Link href="/signup">
    Create an account
  </Link>
</p>

        </div>

      </section>
    </main>
  );
}