"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);
      setName(currentUser.displayName || "");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = async () => {
    if (!user || !name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await updateProfile(user, {
        displayName: name.trim(),
      });

      setEditing(false);
      setMessage("Profile updated successfully.");

      setUser(auth.currentUser);
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage("Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.loadingPage}>
        <div className={styles.loader}></div>
        <p>Loading profile...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.displayName || "HealthHub User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <main className={styles.page}>

      {/* ================= MAIN ================= */}

      <section className={styles.main}>

        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              HEALTHHUB ACCOUNT
            </p>

            <h1>
              Your <span>Profile.</span>
            </h1>

            <p className={styles.subtitle}>
              Manage your personal account information.
            </p>
          </div>
        </header>

        {/* ================= PROFILE CARD ================= */}

        <section className={styles.profileCard}>

          <div className={styles.profileTop}>

            <div className={styles.largeAvatar}>
              {initial}
            </div>

            <div className={styles.profileHeading}>

              <h2>
                {displayName}
              </h2>

              <p>
                {user.email}
              </p>

              <span className={styles.accountBadge}>
                HealthHub Account
              </span>

            </div>

          </div>

          {/* ================= ACCOUNT INFORMATION ================= */}

          <div className={styles.section}>

            <div className={styles.sectionTitle}>
              <p>
                ACCOUNT INFORMATION
              </p>

              <span>
                Firebase Account
              </span>
            </div>

            <div className={styles.infoGrid}>

              <div className={styles.infoBox}>

                <label>
                  Full Name
                </label>

                {editing ? (

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    autoFocus
                  />

                ) : (

                  <strong>
                    {displayName}
                  </strong>

                )}

              </div>

              <div className={styles.infoBox}>

                <label>
                  Email Address
                </label>

                <strong>
                  {user.email || "Not available"}
                </strong>

              </div>

            </div>

            {message && (
              <p className={styles.message}>
                {message}
              </p>
            )}

            <div className={styles.actions}>

              {editing ? (

                <>
                  <button
                    className={styles.cancelButton}
                    onClick={() => {
                      setEditing(false);
                      setName(user.displayName || "");
                      setMessage("");
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </>

              ) : (

                <button
                  className={styles.editButton}
                  onClick={() => {
                    setEditing(true);
                    setMessage("");
                  }}
                >
                  Edit Profile
                </button>

              )}

            </div>

          </div>

          {/* ================= ACCOUNT NOTE ================= */}

          <div className={styles.accountNote}>

            <div className={styles.noteIcon}>
              ✓
            </div>

            <div>
              <strong>
                Your account is connected
              </strong>

              <p>
                Your profile information is securely
                managed through your HealthHub account.
              </p>
            </div>

          </div>

        </section>

      </section>

    </main>
  );
}