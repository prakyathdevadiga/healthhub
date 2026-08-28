"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <main className={styles.dashboard}>

      {/* Background glow effects */}
      <div className={styles.glowOne}></div>
      <div className={styles.glowTwo}></div>
      <div className={styles.glowThree}></div>

      {/* ================= SIDEBAR ================= */}

      <aside className={styles.sidebar}>

        <div className={styles.logo}>
          <span>♥</span>
          HealthHub
        </div>

        <nav className={styles.navigation}>

          <Link
            href="/dashboard"
            className={`${styles.navItem} ${styles.active}`}
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            href="/dashboard/hospitals"
            className={styles.navItem}
          >
            <span>+</span>
            Hospitals
          </Link>

          <Link
            href="/dashboard/medicines"
            className={styles.navItem}
          >
            <span>▣</span>
            Medicines
          </Link>

          <Link
            href="/dashboard/blood-bank"
            className={styles.navItem}
          >
            <span>●</span>
            Blood Bank
          </Link>

          <Link
            href="/dashboard/symptoms"
            className={styles.navItem}
          >
            <span>♡</span>
            Health Guidance
          </Link>

          <Link
            href="/dashboard/profile"
            className={styles.navItem}
          >
            <span>♙</span>
            Profile
          </Link>

        </nav>

        {/* LOGOUT */}

        <button
          onClick={handleLogout}
          className={styles.logout}
        >
          <span>↪</span>
          Logout
        </button>

        <div className={styles.sidebarTip}>
          <div className={styles.tipShield}>♥</div>

          <div>
            <strong>Stay Healthy</strong>
            <p>
              Small steps today for a better tomorrow.
            </p>
          </div>
        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <section className={styles.main}>

        {/* HEADER */}

        <header className={styles.header}>

          <div className={styles.headingArea}>

            <p className={styles.eyebrow}>
              HEALTH HUB
            </p>

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
          >

            <div className={styles.avatar}>
              👤
            </div>

            <div className={styles.profileText}>
              <strong>My Profile</strong>
              <span>View account</span>
            </div>

            <span className={styles.profileArrow}>
              →
            </span>

          </Link>

        </header>


        {/* ================= EMERGENCY ================= */}

        <section className={styles.emergency}>

          <div className={styles.emergencyIcon}>
            !
          </div>

          <div className={styles.emergencyContent}>

            <p>EMERGENCY ASSISTANCE</p>

            <h2>
              Need urgent medical help?
            </h2>

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


        {/* ================= SERVICES ================= */}

        <section className={styles.section}>

          <div className={styles.sectionHeader}>

            <div>

              <p className={styles.sectionLabel}>
                QUICK ACCESS
              </p>

              <h2>
                Healthcare Services
              </h2>

            </div>

            <span className={styles.serviceCount}>
              6 services
            </span>

          </div>


          <div className={styles.serviceGrid}>

            {/* Medicine */}

            <Link
              href="/dashboard/medicines"
              className={styles.serviceCard}
            >

              <div
                className={`${styles.serviceIcon} ${styles.blue}`}
              >
                +
              </div>

              <div className={styles.serviceInfo}>

                <h3>
                  Medicine Information
                </h3>

                <p>
                  Find trusted information about medicines.
                </p>

              </div>

              <span className={styles.arrow}>
                →
              </span>

            </Link>


            {/* Prescription */}

            <Link
              href="/dashboard/prescriptions"
              className={styles.serviceCard}
            >

              <div
                className={`${styles.serviceIcon} ${styles.purple}`}
              >
                ▤
              </div>

              <div className={styles.serviceInfo}>

                <h3>
                  Prescription Management
                </h3>

                <p>
                  Keep your prescriptions organized.
                </p>

              </div>

              <span className={styles.arrow}>
                →
              </span>

            </Link>


            {/* Reminders */}

            <Link
              href="/dashboard/reminders"
              className={styles.serviceCard}
            >

              <div
                className={`${styles.serviceIcon} ${styles.orange}`}
              >
                ◷
              </div>

              <div className={styles.serviceInfo}>

                <h3>
                  Medication Reminders
                </h3>

                <p>
                  Never miss your medication.
                </p>

              </div>

              <span className={styles.arrow}>
                →
              </span>

            </Link>


            {/* Hospitals */}

            <Link
              href="/dashboard/hospitals"
              className={styles.serviceCard}
            >

              <div
                className={`${styles.serviceIcon} ${styles.green}`}
              >
                ●
              </div>

              <div className={styles.serviceInfo}>

                <h3>
                  Nearby Healthcare
                </h3>

                <p>
                  Find hospitals and pharmacies near you.
                </p>

              </div>

              <span className={styles.arrow}>
                →
              </span>

            </Link>


            {/* Blood Bank */}

            <Link
              href="/dashboard/blood-bank"
              className={styles.serviceCard}
            >

              <div
                className={`${styles.serviceIcon} ${styles.red}`}
              >
                ●
              </div>

              <div className={styles.serviceInfo}>

                <h3>
                  Blood Donor Finder
                </h3>

                <p>
                  Connect with nearby blood donors.
                </p>

              </div>

              <span className={styles.arrow}>
                →
              </span>

            </Link>


            {/* Emergency */}

            <Link
              href="/dashboard/hospitals"
              className={styles.serviceCard}
            >

              <div
                className={`${styles.serviceIcon} ${styles.emergencySmall}`}
              >
                !
              </div>

              <div className={styles.serviceInfo}>

                <h3>
                  Emergency Assistance
                </h3>

                <p>
                  Quick access to emergency facilities.
                </p>

              </div>

              <span className={styles.arrow}>
                →
              </span>

            </Link>

          </div>

        </section>


        {/* ================= BOTTOM ================= */}

        <section className={styles.bottomGrid}>

          {/* Health Tip */}

          <div className={styles.healthTip}>

            <div>

              <p className={styles.whiteLabel}>
                TODAY'S HEALTH TIP
              </p>

              <h2>
                Small habits can make a big difference.
              </h2>

              <p>
                Stay hydrated, eat balanced meals, stay active,
                and keep track of your important health information.
              </p>

            </div>

            <div className={styles.heart}>
              ♥
            </div>

          </div>


          {/* Profile */}

          <div className={styles.profileCard}>

            <div className={styles.profileCardTop}>

              <div className={styles.largeAvatar}>
                👤
              </div>

              <div>

                <p className={styles.sectionLabel}>
                  YOUR HEALTH PROFILE
                </p>

                <h3>
                  Health Profile
                </h3>

              </div>

            </div>

            <p>
              Complete your profile to keep your healthcare
              information organized.
            </p>

            <Link href="/dashboard/profile">
              View Profile →
            </Link>

          </div>

        </section>

      </section>

    </main>
  );
}