"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./blood-bank.module.css";

const bloodGroups = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

export default function BloodBankPage() {
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSearch = () => {
    // MongoDB search will be connected here later.
    console.log("Blood Group:", bloodGroup);
    console.log("City:", city);
  };

  return (
    <main className={styles.page}>

      {/* SIDEBAR */}
      <aside className={styles.sidebar}>

        <Link href="/dashboard" className={styles.logo}>
          <span>♥</span>
          HealthHub
        </Link>

        <nav className={styles.navigation}>

          <Link href="/dashboard" className={styles.navItem}>
            <span>⌂</span>
            Dashboard
          </Link>

          <Link href="/dashboard/hospitals" className={styles.navItem}>
            <span>+</span>
            Hospitals
          </Link>

          <Link href="/dashboard/medicines" className={styles.navItem}>
            <span>▣</span>
            Medicines
          </Link>

          <Link
            href="/dashboard/blood-bank"
            className={`${styles.navItem} ${styles.active}`}
          >
            <span>●</span>
            Blood Bank
          </Link>

          <Link href="/dashboard/symptoms" className={styles.navItem}>
            <span>♡</span>
            Health Guidance
          </Link>

          <Link href="/dashboard/profile" className={styles.navItem}>
            <span>♙</span>
            Profile
          </Link>

        </nav>

        <Link href="/login" className={styles.logout}>
          <span>↪</span>
          Logout
        </Link>

        <div className={styles.sidebarTip}>
          <div className={styles.tipIcon}>♥</div>

          <div>
            <strong>Save a Life</strong>
            <p>One donation can make a difference.</p>
          </div>
        </div>

      </aside>


      {/* MAIN CONTENT */}
      <section className={styles.main}>

        {/* HEADER */}
        <header className={styles.header}>

          <div>
            <p className={styles.eyebrow}>
              HEALTHHUB BLOOD BANK
            </p>

            <h1>
              Find a <span>Blood Donor.</span>
            </h1>

            <p className={styles.subtitle}>
              Connect with available blood donors near you.
            </p>
          </div>

          <button
            className={styles.donorButton}
            onClick={() => setShowForm(true)}
          >
            + Become a Donor
          </button>

        </header>


        {/* SEARCH */}
        <section className={styles.searchCard}>

          <div className={styles.searchHeading}>

            <div className={styles.searchIcon}>
              ♥
            </div>

            <div>
              <h2>Find Blood Donors</h2>

              <p>
                Search for donors based on blood group and location.
              </p>
            </div>

          </div>


          <div className={styles.filters}>

            <div className={styles.field}>

              <label>Blood Group</label>

              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="">
                  Select blood group
                </option>

                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}

              </select>

            </div>


            <div className={styles.field}>

              <label>City / Location</label>

              <input
                type="text"
                placeholder="Enter your city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

            </div>


            <button
              className={styles.searchButton}
              onClick={handleSearch}
            >
              Search Donors
            </button>

          </div>

        </section>


        {/* DONOR LIST */}
        <section className={styles.donorSection}>

          <div className={styles.sectionHeader}>

            <div>
              <p className={styles.sectionLabel}>
                BLOOD DONORS
              </p>

              <h2>
                Available Donors
              </h2>
            </div>

          </div>


          {/* NO DONORS YET */}
          <div className={styles.emptyState}>

            <div className={styles.emptyIcon}>
              ♥
            </div>

            <h3>
              No donors registered yet
            </h3>

            <p>
              There are currently no registered blood donors.
              Be the first person to become a donor and help save
              a life.
            </p>

            <button
              className={styles.emptyButton}
              onClick={() => setShowForm(true)}
            >
              Become a Donor
            </button>

          </div>

        </section>


        {/* BANNER */}
        <section className={styles.donorBanner}>

          <div className={styles.bannerIcon}>
            ♥
          </div>

          <div>
            <p>HELP SOMEONE TODAY</p>

            <h2>
              Your blood could save a life.
            </h2>

            <span>
              Register as a donor and help people find you
              when they need your blood group.
            </span>
          </div>

          <button onClick={() => setShowForm(true)}>
            Register Now →
          </button>

        </section>

      </section>


      {/* DONOR REGISTRATION MODAL */}
      {showForm && (

        <div
          className={styles.modalOverlay}
          onClick={() => setShowForm(false)}
        >

          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className={styles.closeButton}
              onClick={() => setShowForm(false)}
            >
              ×
            </button>


            <p className={styles.modalLabel}>
              BLOOD DONOR REGISTRATION
            </p>

            <h2>
              Become a Donor
            </h2>

            <p className={styles.modalDescription}>
              Register your details to help people find you
              when they need your blood group.
            </p>


            <div className={styles.formGrid}>

              <div className={styles.formField}>

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Your full name"
                />

              </div>


              <div className={styles.formField}>

                <label>
                  Blood Group
                </label>

                <select defaultValue="">

                  <option value="" disabled>
                    Select blood group
                  </option>

                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}

                </select>

              </div>


              <div className={styles.formField}>

                <label>
                  City
                </label>

                <input
                  type="text"
                  placeholder="Your city"
                />

              </div>


              <div className={styles.formField}>

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  placeholder="Your phone number"
                />

              </div>

            </div>


            <div className={styles.availabilityBox}>

              <div>

                <strong>
                  Available to Donate
                </strong>

                <p>
                  Allow people to contact you when blood is needed.
                </p>

              </div>

              <input
                type="checkbox"
                defaultChecked
              />

            </div>


            <button
              className={styles.registerButton}
              onClick={() => setShowForm(false)}
            >
              Register as Donor
            </button>

          </div>

        </div>

      )}

    </main>
  );
}