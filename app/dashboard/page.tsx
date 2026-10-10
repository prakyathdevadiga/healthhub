
"use client";

import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Pill,
  UserRound,
} from "lucide-react";
import styles from "./dashboard.module.css";

type DoseLog = {
  date: string;
  time: string;
  taken: boolean;
  takenAt?: string | null;
};

type Prescription = {
  _id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate: string;
  doseLogs?: DoseLog[];
};

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function timeToMinutes(time: string) {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) return 0;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (hour === 12) hour = 0;
  if (period === "PM") hour += 12;

  return hour * 60 + minute;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loadingDoses, setLoadingDoses] = useState(true);
  const [updatingDose, setUpdatingDose] = useState<string | null>(null);
  const [doseError, setDoseError] = useState("");
  const [doseNotice, setDoseNotice] = useState("");

  const today = getLocalDate();

  const loadPrescriptions = useCallback(async (firebaseUid: string) => {
    setLoadingDoses(true);
    setDoseError("");

    try {
      const response = await fetch(
        `/api/prescriptions?firebaseUid=${encodeURIComponent(firebaseUid)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load medicine reminders.");
      }

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from the prescriptions API.");
      }

      setPrescriptions(data);
    } catch (error) {
      setDoseError(
        error instanceof Error
          ? error.message
          : "Could not load medicine reminders."
      );
    } finally {
      setLoadingDoses(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        void loadPrescriptions(currentUser.uid);
      } else {
        setPrescriptions([]);
        setLoadingDoses(false);
      }
    });

    return () => unsubscribe();
  }, [loadPrescriptions]);

  const todaysDoses = prescriptions
    .filter(
      (prescription) =>
        prescription.startDate <= today &&
        prescription.endDate >= today
    )
    .flatMap((prescription) =>
      (prescription.times ?? []).map((time) => {
        const log = (prescription.doseLogs ?? []).find(
          (entry) => entry.date === today && entry.time === time
        );

        return {
          id: `${prescription._id}|${today}|${time}`,
          prescriptionId: prescription._id,
          medicineName: prescription.medicineName,
          dosage: prescription.dosage,
          time,
          taken: Boolean(log?.taken),
          takenAt: log?.takenAt,
        };
      })
    )
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  const takenCount = todaysDoses.filter((dose) => dose.taken).length;
  const totalCount = todaysDoses.length;
  const progress = totalCount
    ? Math.round((takenCount / totalCount) * 100)
    : 0;

  async function toggleDose(
    prescriptionId: string,
    time: string,
    currentlyTaken: boolean
  ) {
    if (!user) return;

    const id = `${prescriptionId}|${today}|${time}`;

    setUpdatingDose(id);
    setDoseError("");
    setDoseNotice("");

    try {
      const response = await fetch("/api/prescriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          prescriptionId,
          date: today,
          time,
          taken: !currentlyTaken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update this dose.");
      }

      await loadPrescriptions(user.uid);

      setDoseNotice(
        !currentlyTaken
          ? "Dose marked as taken."
          : "Dose marked as not taken."
      );
    } catch (error) {
      setDoseError(
        error instanceof Error
          ? error.message
          : "Could not update this dose."
      );
    } finally {
      setUpdatingDose(null);
    }
  }

  const displayName = user?.displayName?.trim() || "HealthHub User";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className={styles.dashboard}>
      <div className={styles.glowOne}></div>
      <div className={styles.glowTwo}></div>
      <div className={styles.glowThree}></div>

      <section className={styles.main}>
        {/* HEADER */}
        <header className={styles.header}>
          <div className={styles.headingArea}>
            <p className={styles.eyebrow}>HEALTH HUB</p>

            <h1>
              Your Health, <span>Simplified.</span>
            </h1>

            <p className={styles.subtitle}>
              Everything you need to manage your healthcare in one place.
            </p>
          </div>

          <Link
            href="/dashboard/profile"
            className={styles.profileButton}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              padding: "10px 15px 10px 11px",
              minWidth: 240,
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.9)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(235,248,245,0.92))",
              boxShadow: "0 8px 24px rgba(25,95,85,0.08)",
              color: "#20343a",
              textDecoration: "none",
              transition: "transform 180ms ease, box-shadow 180ms ease",
            }}
          >
            <div
              className={styles.avatar}
              style={{
                width: 44,
                height: 44,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: 15,
                background: "linear-gradient(145deg, #dff4ef, #c5e9e1)",
                border: "1px solid #c8e8e1",
                color: "#168578",
                fontSize: 17,
                fontWeight: 800,
                boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8)",
              }}
            >
              {initials.charAt(0)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <strong
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 750,
                  letterSpacing: "-0.2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayName}
              </strong>

              <span
                style={{
                  display: "block",
                  marginTop: 4,
                  fontSize: 11,
                  color: "#7b9191",
                }}
              >
                View your profile
              </span>
            </div>

            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 30,
                height: 30,
                flexShrink: 0,
                borderRadius: 10,
                background: "rgba(22,133,120,0.07)",
                color: "#168578",
                fontSize: 17,
              }}
            >
              ↗
            </span>
          </Link>
        </header>

        {/* EMERGENCY ASSISTANCE */}
        <section className={styles.emergency}>
          <div className={styles.emergencyIcon}>!</div>

          <div className={styles.emergencyContent}>
            <p>EMERGENCY ASSISTANCE</p>
            <h2>Need urgent medical help?</h2>

            <span>
              Quickly find nearby hospitals and emergency healthcare
              facilities.
            </span>
          </div>

          <Link
            href="/dashboard/hospitals"
            className={styles.emergencyButton}
          >
            Find Help →
          </Link>
        </section>

        {/* TODAY'S MEDICINE */}
        <section
          aria-labelledby="medicine-reminders-heading"
          style={{
            marginTop: 28,
            padding: "clamp(18px, 3vw, 28px)",
            border: "1px solid rgba(13,148,136,0.18)",
            borderRadius: 20,
            background: "rgba(255,255,255,0.9)",
            boxShadow: "0 8px 28px rgba(15,23,42,0.045)",
            color: "#172033",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 7px",
                  color: "#0d9488",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                }}
              >
                DAILY MEDICATION
              </p>

              <h2
                id="medicine-reminders-heading"
                style={{
                  margin: 0,
                  fontSize: "clamp(21px, 3vw, 27px)",
                  fontWeight: 750,
                  letterSpacing: "-0.6px",
                }}
              >
                Today&apos;s medicine
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#64748b",
                  fontSize: 14,
                }}
              >
                {takenCount} of {totalCount} scheduled doses completed
              </p>
            </div>

            <Link
              href="/dashboard/prescriptions"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #dbe5e7",
                color: "#0f766e",
                textDecoration: "none",
                fontWeight: 650,
                fontSize: 13,
              }}
            >
              <Pill size={16} />
              Manage prescriptions
            </Link>
          </div>

          <div
            style={{
              height: 6,
              background: "#e8eeee",
              borderRadius: 99,
              overflow: "hidden",
              marginTop: 20,
            }}
            role="progressbar"
            aria-label={`Daily completion: ${progress}%`}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "#0d9488",
                borderRadius: 99,
                transition: "width 200ms ease",
              }}
            />
          </div>

          {doseError && (
            <p role="alert" style={{ color: "#b91c1c", marginTop: 14 }}>
              {doseError}
            </p>
          )}

          {doseNotice && (
            <p role="status" style={{ color: "#0f766e", marginTop: 14 }}>
              <CheckCircle2
                size={16}
                style={{ display: "inline", verticalAlign: "middle" }}
              />{" "}
              {doseNotice}
            </p>
          )}

          {loadingDoses ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
                padding: 30,
                color: "#64748b",
              }}
            >
              <LoaderCircle size={20} className="animate-spin" />
              Loading today&apos;s doses...
            </div>
          ) : !user ? (
            <p style={{ color: "#64748b", marginTop: 20 }}>
              Log in to view your personal medicine reminders.
            </p>
          ) : todaysDoses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 12px 12px" }}>
              <div
                style={{
                  margin: "0 auto 12px",
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: "#e6f5f2",
                  color: "#0f766e",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <CalendarDays size={22} />
              </div>

              <h3 style={{ margin: 0, fontSize: 17 }}>
                No doses scheduled for today
              </h3>

              <p
                style={{
                  color: "#64748b",
                  fontSize: 14,
                  margin: "8px 0 16px",
                }}
              >
                Add a prescription with today&apos;s date to see it here.
              </p>

              <Link
                href="/dashboard/prescriptions"
                style={{ color: "#0f766e", fontWeight: 700 }}
              >
                Add a prescription →
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
              {todaysDoses.map((dose) => {
                const isUpdating = updatingDose === dose.id;

                return (
                  <div
                    key={dose.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 13,
                      padding: 14,
                      borderRadius: 13,
                      border: `1px solid ${
                        dose.taken ? "#b7e5db" : "#e5e9ed"
                      }`,
                      background: dose.taken ? "#f5fbf9" : "#ffffff",
                      opacity: isUpdating ? 0.65 : 1,
                      transition: "background 160ms ease",
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: dose.taken ? "#dff3ed" : "#f1f5f7",
                        color: dose.taken ? "#0f766e" : "#52616b",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {dose.taken ? (
                        <CheckCircle2 size={21} />
                      ) : (
                        <Pill size={21} />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 15,
                          fontWeight: 700,
                          overflowWrap: "anywhere",
                          textDecoration: dose.taken ? "line-through" : "none",
                          color: dose.taken ? "#64748b" : "#172033",
                        }}
                      >
                        {dose.medicineName}
                      </h3>

                      <p
                        style={{
                          margin: "5px 0",
                          color: "#64748b",
                          fontSize: 13,
                        }}
                      >
                        {dose.dosage}
                      </p>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          color: "#52616b",
                          fontSize: 12,
                        }}
                      >
                        <Clock3 size={13} />
                        {dose.time}
                      </span>

                      {dose.taken && (
                        <span
                          style={{
                            display: "block",
                            marginTop: 5,
                            color: "#0f766e",
                            fontSize: 12,
                            fontWeight: 650,
                          }}
                        >
                          Taken
                          {dose.takenAt &&
                            ` · ${new Date(dose.takenAt).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}`}
                        </span>
                      )}
                    </div>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        cursor: isUpdating ? "wait" : "pointer",
                        fontSize: 12,
                        fontWeight: 650,
                        color: dose.taken ? "#0f766e" : "#52616b",
                        flexShrink: 0,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={dose.taken}
                        disabled={isUpdating}
                        onChange={() =>
                          void toggleDose(
                            dose.prescriptionId,
                            dose.time,
                            dose.taken
                          )
                        }
                        aria-label={`Mark ${dose.medicineName} at ${dose.time} as taken`}
                        style={{
                          width: 17,
                          height: 17,
                          accentColor: "#0d9488",
                          cursor: "pointer",
                        }}
                      />

                      {isUpdating
                        ? "Saving..."
                        : dose.taken
                          ? "Taken"
                          : "Mark taken"}
                    </label>
                  </div>
                );
              })}
            </div>
          )}

          <p
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 7,
              color: "#78858d",
              fontSize: 12,
              lineHeight: 1.6,
              margin: "18px 0 0",
            }}
          >
            <Activity size={15} style={{ flexShrink: 0, marginTop: 2 }} />
            Mark a dose only after taking it. These are in-app tracking
            reminders, not notifications.
          </p>
        </section>

        {/* BOTTOM CARDS */}
        <section
          className={styles.bottomGrid}
          style={{ marginTop: 24, alignItems: "stretch" }}
        >
          {/* Health tip */}
          <div className={styles.healthTip}>
            <div>
              <p className={styles.whiteLabel}>A HEALTHY REMINDER</p>

              <h2>Small habits make a difference.</h2>

              <p>
                Stay hydrated, eat balanced meals, stay active, and keep your
                health information up to date.
              </p>
            </div>

            <div className={styles.heart}>♥</div>
          </div>

          {/* Profile card */}
          <div
            className={styles.profileCard}
            style={{
              position: "relative",
              overflow: "hidden",
              padding: 25,
              background: "#ffffff",
              border: "1px solid #e5ecec",
              borderRadius: 18,
              boxShadow: "0 8px 26px rgba(20,45,55,0.045)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: "#7bbfb1",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 16,
                  background: "#eaf5f2",
                  border: "1px solid #dceee8",
                  color: "#216f64",
                  fontSize: 18,
                  fontWeight: 750,
                  letterSpacing: 0.5,
                }}
                aria-label={`Initials: ${initials}`}
              >
                {initials || <UserRound size={24} />}
              </div>

              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    margin: "0 0 5px",
                    color: "#66827d",
                    fontSize: 10,
                    fontWeight: 750,
                    letterSpacing: 1.25,
                  }}
                >
                  YOUR ACCOUNT
                </p>

                <h3
                  style={{
                    margin: 0,
                    color: "#20343a",
                    fontSize: 18,
                    fontWeight: 700,
                    overflowWrap: "anywhere",
                  }}
                >
                  {displayName}
                </h3>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#77868b",
                    fontSize: 12,
                  }}
                >
                  Personal health profile
                </p>
              </div>
            </div>

            <div
              style={{
                height: 1,
                background: "#edf1f1",
                margin: "22px 0 16px",
              }}
            />

            <p
              style={{
                margin: "0 0 18px",
                color: "#687980",
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              Keep your personal details and health information current so
              everything you need stays in one place.
            </p>

            <Link
              href="/dashboard/profile"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "12px 14px",
                border: "1px solid #dce9e6",
                borderRadius: 10,
                color: "#216f64",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              View your profile
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
