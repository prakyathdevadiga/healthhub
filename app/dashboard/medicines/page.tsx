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
  dosage: string;
  sideEffects: string;
  pregnancy: string;
  doNotUse: string;
  storage: string;
}

export default function MedicinesPage() {
  const [search, setSearch] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    searchMedicine(search);
  };

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
        {/* Header */}
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

          <div className={styles.headerIcon}>💊</div>
        </section>

        {/* Search */}
        <section className={styles.searchCard}>
          <form onSubmit={handleSubmit} className={styles.searchForm}>
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

            <button onClick={() => quickSearch("acetaminophen")}>
              Acetaminophen
            </button>

            <button onClick={() => quickSearch("ibuprofen")}>
              Ibuprofen
            </button>

            <button onClick={() => quickSearch("aspirin")}>
              Aspirin
            </button>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Finding medicine information...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className={styles.error}>
            <span>!</span>
            <div>
              <strong>Medicine not found</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && medicines.length > 0 && (
          <section className={styles.results}>
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>FDA RESULTS</span>
                <h2>Medicine Details</h2>
              </div>

              <span className={styles.resultCount}>
                {medicines.length} results
              </span>
            </div>

            {medicines.map((medicine, index) => (
              <article
                className={styles.medicineCard}
                key={medicine.id || index}
              >
                {/* Medicine top */}
                <div className={styles.medicineTop}>
                  <div className={styles.medicineIcon}>
                    💊
                  </div>

                  <div className={styles.medicineTitle}>
                    <span>MEDICINE</span>

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

                {/* Basic information */}
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span>Manufacturer</span>
                    <strong>{medicine.manufacturer}</strong>
                  </div>

                  <div className={styles.infoItem}>
                    <span>Product Type</span>
                    <strong>{medicine.productType}</strong>
                  </div>

                  <div className={styles.infoItem}>
                    <span>Route</span>
                    <strong>{medicine.route}</strong>
                  </div>

                  <div className={styles.infoItem}>
                    <span>Active Ingredient</span>
                    <strong>
                      {medicine.activeIngredient}
                    </strong>
                  </div>
                </div>

                {/* Purpose */}
                <div className={styles.contentSection}>
                  <h4>
                    <span>✦</span>
                    Purpose
                  </h4>

                  <p>{medicine.purpose}</p>
                </div>

                {/* Indications */}
                <div className={styles.contentSection}>
                  <h4>
                    <span>✓</span>
                    Uses & Indications
                  </h4>

                  <p>{medicine.indications}</p>
                </div>

                {/* Warning */}
                <div className={styles.warning}>
                  <div className={styles.warningIcon}>!</div>

                  <div>
                    <h4>Important Warnings</h4>
                    <p>{medicine.warnings}</p>
                  </div>
                </div>

                {/* Extra details */}
                <details className={styles.moreDetails}>
                  <summary>
                    View more medicine information
                    <span>+</span>
                  </summary>

                  <div className={styles.detailsContent}>
                    <div>
                      <h4>Dosage & Administration</h4>
                      <p>{medicine.dosage}</p>
                    </div>

                    <div>
                      <h4>Side Effects</h4>
                      <p>{medicine.sideEffects}</p>
                    </div>

                    <div>
                      <h4>Pregnancy & Breastfeeding</h4>
                      <p>{medicine.pregnancy}</p>
                    </div>

                    <div>
                      <h4>Do Not Use</h4>
                      <p>{medicine.doNotUse}</p>
                    </div>

                    <div>
                      <h4>Storage</h4>
                      <p>{medicine.storage}</p>
                    </div>
                  </div>
                </details>
              </article>
            ))}
          </section>
        )}

        {/* Initial state */}
        {!loading && !error && medicines.length === 0 && (
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>💊</div>

            <h2>Search for a medicine</h2>

            <p>
              Enter a medicine name above to view available
              FDA drug information.
            </p>
          </section>
        )}

        {/* Disclaimer */}
        <div className={styles.disclaimer}>
          <span>ⓘ</span>

          <p>
            <strong>HealthHub Information Notice:</strong>{" "}
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