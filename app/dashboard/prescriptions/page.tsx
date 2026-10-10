
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FilePlus2,
  HeartPulse,
  LoaderCircle,
  Pill,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { auth } from "@/lib/firebase";
import styles from "./prescriptions.module.css";

type DoseTime = {
  hour: string;
  minute: string;
  period: "AM" | "PM";
};

type Prescription = {
  _id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate: string;
  notes?: string;
};

const initialDoseTime: DoseTime = {
  hour: "09",
  minute: "00",
  period: "AM",
};

export default function PrescriptionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [times, setTimes] = useState<DoseTime[]>([
    { ...initialDoseTime },
  ]);
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());
  const [notes, setNotes] = useState("");

  function showMessage(text: string, type: "success" | "error") {
    setMessage(text);
    setMessageType(type);
  }

  function addDoseTime() {
    setTimes((previous) => [
      ...previous,
      { hour: "01", minute: "00", period: "PM" },
    ]);
  }

  function removeDoseTime(index: number) {
    setTimes((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  function updateDoseTime(
    index: number,
    field: keyof DoseTime,
    value: string
  ) {
    setTimes((previous) =>
      previous.map((time, currentIndex) =>
        currentIndex === index
          ? { ...time, [field]: value }
          : time
      )
    );
  }

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;

    let cancelled = false;

    async function loadPrescriptions() {
      setLoading(true);
      setMessage("");

      try {
        const response = await fetch(
          `/api/prescriptions?firebaseUid=${encodeURIComponent(user!.uid)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load prescriptions.");
        }

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from the prescriptions API.");
        }

        if (!cancelled) {
          setPrescriptions(data);
        }
      } catch (error) {
        if (!cancelled) {
          showMessage(
            error instanceof Error
              ? error.message
              : "Failed to load prescriptions.",
            "error"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPrescriptions();

    return () => {
      cancelled = true;
    };
  }, [authReady, user]);

  async function addPrescription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!user) {
      showMessage("Please log in before adding a prescription.", "error");
      return;
    }

    if (!medicineName.trim() || !dosage.trim()) {
      showMessage("Enter the medicine name and dosage.", "error");
      return;
    }

    if (times.length === 0) {
      showMessage("Add at least one dose time.", "error");
      return;
    }

    const selectedTimes = times.map(
      (time) => `${time.hour}:${time.minute} ${time.period}`
    );

    const uniqueTimes = new Set(selectedTimes);

    if (uniqueTimes.size !== selectedTimes.length) {
      showMessage("Please remove duplicate dose times.", "error");
      return;
    }

    if (endDate < startDate) {
      showMessage("The end date cannot be before the start date.", "error");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firebaseUid: user.uid,
          medicineName: medicineName.trim(),
          dosage: dosage.trim(),
          frequency,
          times: selectedTimes,
          startDate,
          endDate,
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save prescription.");
      }

      if (!data.prescription) {
        throw new Error("The server did not return the saved prescription.");
      }

      setPrescriptions((previous) => [
        data.prescription,
        ...previous,
      ]);

      setMedicineName("");
      setDosage("");
      setFrequency("Daily");
      setTimes([{ ...initialDoseTime }]);
      setStartDate(getToday());
      setEndDate(getToday());
      setNotes("");

      showMessage("Prescription saved successfully.", "success");
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  if (!authReady) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>
          <LoaderCircle size={22} className="animate-spin" />
          <p>Loading your account...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <ShieldCheck size={38} />
            </div>
            <h1 className={styles.emptyTitle}>Login required</h1>
            <p className={styles.emptyText}>
              Please log in to access your personal prescriptions.
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              HEALTHHUB · PERSONAL HEALTH
            </p>

            <h1 className={styles.title}>Prescription Management</h1>

            <p className={styles.subtitle}>
              Keep your medication details and schedule organized in one
              simple place.
            </p>
          </div>

          <div className={styles.headerIcon}>
            <Pill size={36} strokeWidth={1.7} />
          </div>
        </header>

        <section className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Pill size={23} />
            </div>
            <div>
              <p className={styles.statLabel}>Saved prescriptions</p>
              <p className={styles.statValue}>{prescriptions.length}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Clock3 size={23} />
            </div>
            <div>
              <p className={styles.statLabel}>Scheduled dose times</p>
              <p className={styles.statValue}>
                {prescriptions.reduce(
                  (total, prescription) =>
                    total + (prescription.times?.length ?? 0),
                  0
                )}
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Activity size={23} />
            </div>
            <div>
              <p className={styles.statLabel}>Account status</p>
              <p className={styles.statValue}>Active</p>
            </div>
          </div>
        </section>

        {message && (
          <div
            className={`${styles.message} ${
              messageType === "error" ? styles.errorMessage : ""
            }`}
            role="status"
          >
            {messageType === "success" && (
              <CheckCircle2
                size={18}
                style={{
                  display: "inline",
                  verticalAlign: "middle",
                  marginRight: 8,
                }}
              />
            )}
            {message}
          </div>
        )}

        <section className={styles.contentGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 10,
                  color: "#0d9488",
                }}
              >
                <FilePlus2 size={22} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 1.5,
                  }}
                >
                  NEW ENTRY
                </span>
              </div>

              <h2 className={styles.panelTitle}>Add a prescription</h2>

              <p className={styles.panelDescription}>
                Enter your medicine details as provided by your healthcare
                professional.
              </p>
            </div>

            <form className={styles.form} onSubmit={addPrescription}>
              <label className={styles.field}>
                Medicine name
                <input
                  className={styles.input}
                  value={medicineName}
                  onChange={(event) => setMedicineName(event.target.value)}
                  placeholder="Enter medicine name"
                  maxLength={100}
                  required
                />
              </label>

              <label className={styles.field}>
                Dosage
                <input
                  className={styles.input}
                  value={dosage}
                  onChange={(event) => setDosage(event.target.value)}
                  placeholder="e.g. 1 tablet, 5 ml"
                  maxLength={100}
                  required
                />
              </label>

              <label className={styles.field}>
                Frequency
                <select
                  className={styles.select}
                  value={frequency}
                  onChange={(event) => setFrequency(event.target.value)}
                >
                  <option value="Daily">Daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="As prescribed">As prescribed</option>
                </select>
              </label>

              <div className={styles.field}>
                <span>Dose times</span>

                {times.map((time, index) => (
                  <div
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 0.9fr auto",
                      gap: 8,
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <select
                      className={styles.select}
                      value={time.hour}
                      onChange={(event) =>
                        updateDoseTime(index, "hour", event.target.value)
                      }
                      aria-label={`Dose ${index + 1} hour`}
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const hour = String(i + 1).padStart(2, "0");
                        return (
                          <option key={hour} value={hour}>
                            {hour}
                          </option>
                        );
                      })}
                    </select>

                    <select
                      className={styles.select}
                      value={time.minute}
                      onChange={(event) =>
                        updateDoseTime(index, "minute", event.target.value)
                      }
                      aria-label={`Dose ${index + 1} minute`}
                    >
                      {Array.from({ length: 60 }, (_, i) => {
                        const minute = String(i).padStart(2, "0");
                        return (
                          <option key={minute} value={minute}>
                            {minute}
                          </option>
                        );
                      })}
                    </select>

                    <select
                      className={styles.select}
                      value={time.period}
                      onChange={(event) =>
                        updateDoseTime(index, "period", event.target.value)
                      }
                      aria-label={`Dose ${index + 1} AM or PM`}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>

                    {times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDoseTime(index)}
                        aria-label={`Remove dose time ${index + 1}`}
                        title="Remove time"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "none",
                          background: "transparent",
                          color: "#dc2626",
                          cursor: "pointer",
                          padding: 6,
                        }}
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addDoseTime}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 12,
                    border: "none",
                    background: "transparent",
                    color: "#0d9488",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  <Plus size={17} />
                  Add another time
                </button>

                <span className={styles.helperText}>
                  Select one or more times according to your prescription.
                </span>
              </div>

              <div className={styles.dateGrid}>
                <label className={styles.field}>
                  Start date
                  <input
                    className={styles.input}
                    type="date"
                    value={startDate}
                    onChange={(event) => {
                      const value = event.target.value;
                      setStartDate(value);

                      if (endDate < value) {
                        setEndDate(value);
                      }
                    }}
                    required
                  />
                </label>

                <label className={styles.field}>
                  End date
                  <input
                    className={styles.input}
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    required
                  />
                </label>
              </div>

              <label className={styles.field}>
                Notes <span style={{ fontWeight: 400 }}>(optional)</span>
                <textarea
                  className={styles.textarea}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add instructions from your prescription"
                  maxLength={500}
                  rows={3}
                />
              </label>

              <button
                className={styles.primaryButton}
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Saving prescription...
                  </>
                ) : (
                  <>
                    <Plus size={19} />
                    Save prescription
                  </>
                )}
              </button>
            </form>

            <p className={styles.footerNote}>
              <ShieldCheck
                size={14}
                style={{
                  display: "inline",
                  verticalAlign: "middle",
                  marginRight: 5,
                }}
              />
              Prescription details are saved in your HealthHub database.
            </p>
          </div>

          <div className={styles.panel}>
            <div className={styles.listHeader}>
              <div className={styles.panelHeader} style={{ marginBottom: 0 }}>
                <h2 className={styles.panelTitle}>Your prescriptions</h2>
                <p className={styles.panelDescription}>
                  Review your saved medication details.
                </p>
              </div>

              <span className={styles.countBadge}>
                {prescriptions.length}
              </span>
            </div>

            {loading ? (
              <div className={styles.loading}>
                <LoaderCircle size={24} className="animate-spin" />
                <p>Loading prescriptions...</p>
              </div>
            ) : prescriptions.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <Sparkles size={36} />
                </div>
                <h3 className={styles.emptyTitle}>Your list starts here</h3>
                <p className={styles.emptyText}>
                  Add your first prescription using the form. Your saved
                  entries will appear here.
                </p>
              </div>
            ) : (
              <div className={styles.prescriptionList}>
                {prescriptions.map((prescription) => (
                  <article
                    className={styles.medicineCard}
                    key={prescription._id}
                  >
                    <div className={styles.medicineHeader}>
                      <div className={styles.medicineIcon}>
                        <Pill size={23} />
                      </div>

                      <div className={styles.medicineInfo}>
                        <h3 className={styles.medicineName}>
                          {prescription.medicineName}
                        </h3>
                        <p className={styles.medicineDosage}>
                          {prescription.dosage}
                        </p>
                        <span className={styles.frequencyBadge}>
                          {prescription.frequency}
                        </span>
                      </div>
                    </div>

                    <div className={styles.medicineDetails}>
                      <div className={styles.detailRow}>
                        <span>
                          <Clock3
                            size={14}
                            style={{
                              display: "inline",
                              verticalAlign: "middle",
                              marginRight: 5,
                            }}
                          />
                          Dose times
                        </span>
                        <span className={styles.detailValue}>
                          {prescription.times.join(", ")}
                        </span>
                      </div>

                      <div className={styles.detailRow}>
                        <span>
                          <CalendarDays
                            size={14}
                            style={{
                              display: "inline",
                              verticalAlign: "middle",
                              marginRight: 5,
                            }}
                          />
                          Start date
                        </span>
                        <span className={styles.detailValue}>
                          {prescription.startDate}
                        </span>
                      </div>

                      <div className={styles.detailRow}>
                        <span>End date</span>
                        <span className={styles.detailValue}>
                          {prescription.endDate}
                        </span>
                      </div>
                    </div>

                    {prescription.notes && (
                      <p className={styles.notes}>
                        <strong>Notes:</strong> {prescription.notes}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}

            <p className={styles.footerNote}>
              <HeartPulse
                size={14}
                style={{
                  display: "inline",
                  verticalAlign: "middle",
                  marginRight: 5,
                }}
              />
              Follow the dosage and schedule given by your healthcare
              professional. This page records prescriptions; it does not
              send reminders or verify medication instructions.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
