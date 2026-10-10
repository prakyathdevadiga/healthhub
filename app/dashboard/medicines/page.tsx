"use client";

import { FormEvent, useState } from "react";
import styles from "./medicines.module.css";

interface Medicine {
  id?: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  productType: string;
  route: string;
  activeIngredient: string;
  purpose: string;
  indications: string;
  warnings: string;
}

export default function MedicinesPage() {
  const [search, setSearch] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =============================
  // SEARCH MEDICINE
  // =============================
  const searchMedicine = async (name: string) => {
    if (!name.trim()) {
      setError("Please enter a medicine name.");
      return;
    }

    setLoading(true);
    setError("");
    setMedicines([]);

    try {
      const response = await fetch(
        `/api/medicines?name=${encodeURIComponent(name.trim())}`
      );

      const data = await response.json();

      if (!response.ok || !data.results?.length) {
        setError(`No medicine information found for "${name}".`);
        return;
      }

      setMedicines(data.results);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to fetch medicine information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // FORM SUBMIT
  // =============================
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    searchMedicine(search);
  };

  // =============================
  // QUICK SEARCH
  // =============================
  const quickSearch = (name: string) => {
    setSearch(name);
    searchMedicine(name);
  };

  return (
    <main className={styles.page}>
      {/* Background decorations */}
      <div className={styles.gradientOne}></div>
      <div className={styles.gradientTwo}></div>

      <div className={styles.container}>

        {/* ================= HEADER ================= */}
        <section className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              HEALTH INFORMATION
            </span>

            <h1>
              Medicine <span>Information.</span>
            </h1>

            <p>
              Find trusted medicine information using FDA drug
              labeling data.
            </p>
          </div>

          <div className={styles.headerIcon}>
            💊
          </div>
        </section>

        {/* ================= SEARCH ================= */}
        <section className={styles.searchCard}>
          <form
            onSubmit={handleSubmit}
            className={styles.searchForm}
          >
            <div className={styles.searchBox}>
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search medicine e.g. Acetaminophen"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className={styles.searchButton}
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          <div className={styles.quickSearch}>
            <span>Popular:</span>

            <button
              type="button"
              onClick={() => quickSearch("acetaminophen")}
            >
              Acetaminophen
            </button>

            <button
              type="button"
              onClick={() => quickSearch("ibuprofen")}
            >
              Ibuprofen
            </button>

            <button
              type="button"
              onClick={() => quickSearch("aspirin")}
            >
              Aspirin
            </button>
          </div>
        </section>

        {/* ================= LOADING ================= */}
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>

            <p>
              Finding medicine information...
            </p>
          </div>
        )}

        {/* ================= ERROR ================= */}
        {!loading && error && (
          <div className={styles.error}>
            <span>!</span>

            <div>
              <strong>
                Medicine not found
              </strong>

              <p>{error}</p>
            </div>
          </div>
        )}

        {/* ================= RESULTS ================= */}
        {!loading && medicines.length > 0 && (
          <section className={styles.results}>

            {/* Results heading */}
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>
                  FDA RESULTS
                </span>

                <h2>
                  Medicine Details
                </h2>
              </div>

              <span className={styles.resultCount}>
                {medicines.length} results
              </span>
            </div>

            {/* Medicine cards */}
            {medicines.map((medicine, index) => (
              <article
                className={styles.medicineCard}
                key={medicine.id || index}
              >

                {/* ================= MEDICINE HEADER ================= */}
                <div className={styles.medicineTop}>
                  <div className={styles.medicineIcon}>
                    💊
                  </div>

                  <div className={styles.medicineTitle}>
                    <span>
                      MEDICINE
                    </span>

                    <h3>
                      {medicine.brandName}
                    </h3>

                    <p>
                      Generic:{" "}
                      <strong>
                        {medicine.genericName}
                      </strong>
                    </p>
                  </div>
                </div>

                {/* ================= PURPOSE ================= */}
                <div className={styles.purposeSection}>
                  <h4>
                    <span>✦</span>
                    Purpose
                  </h4>

                  <p>
                    {medicine.purpose}
                  </p>
                </div>

                {/* ================= USES ================= */}
                <div className={styles.contentSection}>
                  <h4>
                    <span>✓</span>
                    Uses & Indications
                  </h4>

                  <p>
                    {medicine.indications}
                  </p>
                </div>

                {/* ================= WARNING ================= */}
                <div className={styles.warning}>
                  <div className={styles.warningIcon}>
                    !
                  </div>

                  <div className={styles.warningContent}>
                    <h4>
                      Important Warnings
                    </h4>

                    <p>
                      {medicine.warnings}
                    </p>
                  </div>
                </div>

                {/* ================= MORE INFORMATION ================= */}
                <details className={styles.moreInfo}>
                  <summary>
                    <span>
                      More Information
                    </span>

                    <span className={styles.moreInfoIcon}>
                      +
                    </span>
                  </summary>

                  <div className={styles.infoGrid}>

                    <div className={styles.infoItem}>
                      <span>
                        Manufacturer
                      </span>

                      <strong>
                        {medicine.manufacturer}
                      </strong>
                    </div>

                    <div className={styles.infoItem}>
                      <span>
                        Product Type
                      </span>

                      <strong>
                        {medicine.productType}
                      </strong>
                    </div>

                    <div className={styles.infoItem}>
                      <span>
                        Route
                      </span>

                      <strong>
                        {medicine.route}
                      </strong>
                    </div>

                    <div className={styles.infoItem}>
                      <span>
                        Active Ingredient
                      </span>

                      <strong>
                        {medicine.activeIngredient}
                      </strong>
                    </div>

                  </div>
                </details>

              </article>
            ))}
          </section>
        )}

        {/* ================= INITIAL STATE ================= */}
        {!loading &&
          !error &&
          medicines.length === 0 && (
            <section className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                💊
              </div>

              <h2>
                Search for a medicine
              </h2>

              <p>
                Enter a medicine name above to view
                available FDA drug information.
              </p>
            </section>
          )}

        {/* ================= DISCLAIMER ================= */}
        <div className={styles.disclaimer}>
          <span>ⓘ</span>

          <p>
            <strong>
              HealthHub Information Notice:
            </strong>{" "}
            Medicine information is provided for educational
            purposes using openFDA data. It should not be used
            as a substitute for professional medical advice,
            diagnosis, or treatment. Always consult a qualified
            healthcare professional.
          </p>
        </div>

      </div>
    </main>
  );
}