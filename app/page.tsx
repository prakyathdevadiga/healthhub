"use client";

import { useEffect, useState } from "react";

export default function Home() {

  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
  const sectionIds = ["home", "features", "how-it-works", "about"];

  const handleScroll = () => {
    let current = "home";

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);

      if (section) {
        const top = section.getBoundingClientRect().top;

        if (top <= 180) {
          current = id;
        }
      }
    });

    setActiveSection(current);
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll();

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);
  return (
    <main>
      {/* ================= NAVBAR ================= */}
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">✚</div>

          <span>
            Health<span>Hub</span>
          </span>
        </div>

        <div className="nav-links">
          <a
  href="#home"
  className={activeSection === "home" ? "active" : ""}
  onClick={() => setActiveSection("home")}
>
  Home
</a>

<a
  href="#features"
  className={activeSection === "features" ? "active" : ""}
  onClick={() => setActiveSection("features")}
>
  Features
</a>

<a
  href="#how-it-works"
  className={activeSection === "how-it-works" ? "active" : ""}
  onClick={() => setActiveSection("how-it-works")}
>
  How It Works
</a>

<a
  href="#about"
  className={activeSection === "about" ? "active" : ""}
  onClick={() => setActiveSection("about")}
>
  About Us
</a>
        </div>

        <div className="nav-actions">
          <button className="login-btn">
            Login
          </button>

          <button className="primary-btn">
            Get Started <span>→</span>
          </button>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="hero" id="home">
        <div className="hero-content">

          <div className="hero-badge">
            <span>✦</span>
            Healthcare made simpler
          </div>

          <h1>
            Smarter Healthcare.
            <br />
            <span>All in One Place.</span>
          </h1>

          <p className="hero-description">
            Health Hub brings medicine information, prescription management,
            healthcare facilities, medication reminders and emergency
            assistance together in one simple platform.
          </p>

          {/* NO HERO BUTTONS HERE */}

          {/* ================= TRUST CARD ================= */}
          <div className="trust-card">

            <div className="trust-item">
              <div className="trust-icon">
                🔒
              </div>

              <div>
                <strong>Secure & Private</strong>
                <p>Your data is protected</p>
              </div>
            </div>

            <div className="trust-divider"></div>

            <div className="trust-item">
              <div className="trust-icon">
                ♥
              </div>

              <div>
                <strong>Healthcare Focused</strong>
                <p>Built for your well-being</p>
              </div>
            </div>

            <div className="trust-divider"></div>

            <div className="trust-item">
              <div className="trust-icon">
                ✓
              </div>

              <div>
                <strong>Easy to Use</strong>
                <p>Simple and intuitive</p>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT HEALTH CARD ================= */}
        <div className="hero-visual">

          {/* FLOATING + REMOVED */}

          <div className="health-preview">

            <div className="preview-header">

              <div>
                <p className="preview-label">
                  HEALTH HUB
                </p>

                <h2>
                  Your Health, Simplified
                </h2>

                <p className="preview-subtitle">
                  Everything you need, in one place.
                </p>
              </div>

              <div className="heart-button">
                ♥
              </div>

            </div>

            <div className="service-list">

              {/* Medicine */}
              <div className="service-item">

                <div className="service-icon medicine">
                  +
                </div>

                <div className="service-content">
                  <h3>Medicine Information</h3>
                  <p>Find trusted medicine details</p>
                </div>

                <span className="arrow">
                  →
                </span>

              </div>

              {/* Prescription */}
              <div className="service-item">

                <div className="service-icon prescription">
                  ▤
                </div>

                <div className="service-content">
                  <h3>Prescription Management</h3>
                  <p>Keep your prescriptions organized</p>
                </div>

                <span className="arrow">
                  →
                </span>

              </div>

              {/* Medication */}
              <div className="service-item">

                <div className="service-icon reminder">
                  ◷
                </div>

                <div className="service-content">
                  <h3>Medication Reminders</h3>
                  <p>Never miss your medication</p>
                </div>

                <span className="arrow">
                  →
                </span>

              </div>

              {/* Healthcare */}
              <div className="service-item">

                <div className="service-icon healthcare">
                  ●
                </div>

                <div className="service-content">
                  <h3>Nearby Healthcare</h3>
                  <p>Find hospitals and pharmacies</p>
                </div>

                <span className="arrow">
                  →
                </span>

              </div>

              {/* Blood Donor */}
              <div className="service-item">

                <div className="service-icon blood">
                  ●
                </div>

                <div className="service-content">
                  <h3>Blood Donor Finder</h3>
                  <p>Connect with nearby donors</p>
                </div>

                <span className="arrow">
                  →
                </span>

              </div>

              {/* Emergency */}
              <div className="service-item emergency">

                <div className="service-icon emergency-icon">
                  !
                </div>

                <div className="service-content">
                  <h3>Emergency Assistance</h3>
                  <p>Quick access to emergency facilities</p>
                </div>

                <span className="arrow">
                  →
                </span>

              </div>

            </div>
          </div>

          {/* FLOATING DOTS REMOVED */}

        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="features-section" id="features">

        <div className="section-heading">

          <div className="section-badge">
            HEALTH HUB FEATURES
          </div>

          <h2>
            Everything you need for
            <span> better healthcare.</span>
          </h2>

          <p>
            Simple tools designed to help you manage healthcare information,
            medications and essential services from one platform.
          </p>

        </div>

        <div className="feature-grid">

          <div className="feature-card">
            <div className="feature-icon medicine-bg">
              +
            </div>

            <h3>Medicine Information</h3>

            <p>
              Search medicines and access useful information such as uses,
              warnings and other label details.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple-bg">
              ▤
            </div>

            <h3>Prescription Management</h3>

            <p>
              Organize your medication details and keep important prescription
              information in one place.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon orange-bg">
              ◷
            </div>

            <h3>Medication Reminders</h3>

            <p>
              Create medication schedules and receive reminders at the times
              you have selected.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon green-bg">
              ●
            </div>

            <h3>Nearby Healthcare</h3>

            <p>
              Find nearby hospitals, clinics and pharmacies using location
              based services.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon red-bg">
              ●
            </div>

            <h3>Blood Donor Finder</h3>

            <p>
              Search available donors using blood group and location.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon emergency-bg">
              !
            </div>

            <h3>Emergency Assistance</h3>

            <p>
              Quickly access nearby healthcare facilities and important
              emergency information.
            </p>
          </div>

        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="how-section" id="how-it-works">

        <div className="section-heading">

          <div className="section-badge">
            HOW IT WORKS
          </div>

          <h2>
            Healthcare made
            <span> simple.</span>
          </h2>

          <p>
            Health Hub brings multiple healthcare utilities together through
            one easy-to-use platform.
          </p>

        </div>

        <div className="steps">

          <div className="step">
            <div className="step-number">
              01
            </div>

            <h3>Create your account</h3>

            <p>
              Sign up securely and create your Health Hub profile.
            </p>
          </div>

          <div className="step-line"></div>

          <div className="step">
            <div className="step-number">
              02
            </div>

            <h3>Manage your health</h3>

            <p>
              Store medication schedules and organize important information.
            </p>
          </div>

          <div className="step-line"></div>

          <div className="step">
            <div className="step-number">
              03
            </div>

            <h3>Access healthcare</h3>

            <p>
              Find medicines, healthcare facilities and blood donors.
            </p>
          </div>

        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section className="about-section" id="about">

        <div className="about-card">

          <div>

            <div className="section-badge">
              ABOUT HEALTH HUB
            </div>

            <h2>
              One platform.
              <br />
              <span>Multiple healthcare needs.</span>
            </h2>

            <p>
              Health Hub is designed to simplify access to essential
              healthcare information and everyday medication management
              through a single digital platform.
            </p>

          </div>

          <div className="about-stat">
            <strong>01</strong>

            <span>
              Unified Healthcare Platform
            </span>
          </div>

        </div>
      </section>

      {/* ================= DISCLAIMER ================= */}
      <section className="disclaimer">

        <strong>
          Medical Information Disclaimer
        </strong>

        <p>
          Health Hub provides general healthcare information and management
          tools for educational and organizational purposes. It does not
          diagnose medical conditions or replace professional medical advice.
        </p>

      </section>

      {/* ================= FOOTER ================= */}
      <footer>

        <div className="footer-logo">

          <div className="logo-icon">
            ✚
          </div>

          <span>
            Health<span>Hub</span>
          </span>

        </div>

        <p>
          Smarter healthcare. All in one place.
        </p>

        <span className="copyright">
          © 2026 Health Hub. All rights reserved.
        </span>

      </footer>

    </main>
  );
}