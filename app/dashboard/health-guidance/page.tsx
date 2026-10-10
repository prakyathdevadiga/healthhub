"use client";

import { FormEvent, useState } from "react";
import styles from "./health-guidance.module.css";

interface Guidance {
  title: string;
  summary: string;
  quickSteps: string[];
  whenToGetHelp: string[];
}

export default function HealthGuidancePage() {
  const [message, setMessage] = useState("");
  const [guidance, setGuidance] = useState<Guidance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getGuidance = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Please enter a health concern.");
      return;
    }

    setLoading(true);
    setError("");
    setGuidance(null);

    try {
      const response = await fetch("/api/health-guidance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to generate health guidance."
        );
      }

      setGuidance(data.result);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const quickSearch = (text: string) => {
    setMessage(text);
  };

  return (
    <main className={styles.page}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <div className={styles.container}>

        {/* HEADER */}

        <section className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              HEALTH ASSISTANCE
            </span>

            <h1>
              Health <span>Guidance.</span>
            </h1>

            <p>
              Get quick, simple and practical guidance for
              common health concerns.
            </p>
          </div>

          <div className={styles.headerIcon}>
            ♥
          </div>
        </section>

        {/* SEARCH */}

        <section className={styles.searchCard}>
          <form
            onSubmit={getGuidance}
            className={styles.searchForm}
          >
            <div className={styles.inputBox}>
              <span>✦</span>

              <input
                type="text"
                placeholder="Describe your health concern..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setError("");
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.searchButton}
            >
              {loading ? "Thinking..." : "Get Guidance"}
            </button>
          </form>

          <div className={styles.examples}>
            <span>Try:</span>

            <button
              type="button"
              onClick={() => quickSearch("mild headache")}
            >
              Mild headache
            </button>

            <button
              type="button"
              onClick={() => quickSearch("fever")}
            >
              Fever
            </button>

            <button
              type="button"
              onClick={() => quickSearch("common cold")}
            >
              Common cold
            </button>
          </div>
        </section>

        {/* LOADING */}

        {loading && (
          <section className={styles.loadingCard}>
            <div className={styles.spinner} />

            <div>
              <strong>Preparing your guidance...</strong>

              <p>
                Getting simple and practical health information.
              </p>
            </div>
          </section>
        )}

        {/* ERROR */}

        {!loading && error && (
          <section className={styles.errorCard}>
            <div className={styles.errorIcon}>!</div>

            <div>
              <strong>Unable to provide guidance</strong>

              <p>{error}</p>
            </div>
          </section>
        )}

        {/* RESULT */}

        {!loading && guidance && (
          <section className={styles.result}>

            {/* TITLE */}

            <div className={styles.resultHeader}>
              <div className={styles.resultIcon}>
                ✓
              </div>

              <div>
                <span className={styles.resultLabel}>
                  HEALTH GUIDANCE
                </span>

                <h2>{guidance.title}</h2>
              </div>
            </div>

            {/* SUMMARY */}

            <div className={styles.summaryCard}>
              <h3>What it may be</h3>

              <p>{guidance.summary}</p>
            </div>

            {/* QUICK STEPS */}

            <div className={styles.stepsCard}>
              <div className={styles.cardHeading}>
                <div className={styles.stepIcon}>
                  ✓
                </div>

                <div>
                  <span>TAKE ACTION</span>
                  <h3>Quick Steps</h3>
                </div>
              </div>

              <div className={styles.steps}>
                {guidance.quickSteps.map(
                  (step, index) => (
                    <div
                      className={styles.step}
                      key={index}
                    >
                      <div className={styles.stepNumber}>
                        {index + 1}
                      </div>

                      <p>{step}</p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* MEDICAL HELP */}

            <div className={styles.helpCard}>
              <div className={styles.helpIcon}>
                !
              </div>

              <div>
                <span>IMPORTANT</span>

                <h3>
                  When to Get Medical Help
                </h3>

                <ul>
                  {guidance.whenToGetHelp.map(
                    (item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {/* NOTICE */}

            <div className={styles.notice}>
              <span>ⓘ</span>

              <p>
                <strong>HealthHub Notice:</strong>{" "}
                This information is for general educational
                purposes and is not a diagnosis or a substitute
                for professional medical advice.
              </p>
            </div>

          </section>
        )}

        {/* EMPTY STATE */}

        {!loading && !error && !guidance && (
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              ♥
            </div>

            <h2>
              How are you feeling?
            </h2>

            <p>
              Enter a symptom, condition, or health concern
              to receive quick general guidance.
            </p>
          </section>
        )}

      </div>
    </main>
  );
}