"use client";

import { useEffect, useState } from "react";
import styles from "./blood-bank.module.css";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

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

type Donor = {
  _id: string;
  firebaseUid?: string;
  name: string;
  email?: string;
  bloodGroup: string;
  city: string;
  phone: string;
  available: boolean;
  createdAt?: string;
};

export default function BloodBankPage() {
  /* =========================
     SEARCH
  ========================= */

  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");

  /* =========================
     DONORS
  ========================= */

  const [donors, setDonors] = useState<Donor[]>([]);
  const [loadingDonors, setLoadingDonors] = useState(true);

  /* =========================
     DONOR FORM
  ========================= */

  const [showForm, setShowForm] = useState(false);

  /* =========================
     FIREBASE USER
  ========================= */

  const [user, setUser] = useState<User | null>(null);

  /* =========================
     DONOR FORM DATA
  ========================= */

  const [donorBloodGroup, setDonorBloodGroup] = useState("");
  const [donorCity, setDonorCity] = useState("");
  const [phone, setPhone] = useState("");
  const [available, setAvailable] = useState(true);

  /* =========================
     GET CURRENT FIREBASE USER
  ========================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        console.log("Logged in user:", currentUser.displayName);
        console.log("Email:", currentUser.email);
        console.log("UID:", currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  /* =========================
     FETCH DONORS FROM MONGODB
  ========================= */

  const fetchDonors = async () => {
    try {
      setLoadingDonors(true);

      const response = await fetch("/api/donors", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch donors");
      }

      const data = await response.json();

      console.log("Donors received from MongoDB:", data);

      setDonors(data);
    } catch (error) {
      console.error("Donor fetch error:", error);
      setDonors([]);
    } finally {
      setLoadingDonors(false);
    }
  };

  /* =========================
     LOAD DONORS WHEN PAGE OPENS
  ========================= */

  useEffect(() => {
    fetchDonors();
  }, []);

  /* =========================
     SEARCH DONORS
  ========================= */

  const handleSearch = () => {
    console.log("Searching donors...");
    console.log("Blood Group:", bloodGroup);
    console.log("City:", city);
  };

  /* =========================
     FILTER DONORS
  ========================= */

  const filteredDonors = donors.filter((donor) => {
    const bloodMatch =
      !bloodGroup ||
      donor.bloodGroup.toLowerCase() === bloodGroup.toLowerCase();

    const cityMatch =
      !city ||
      donor.city.toLowerCase().includes(city.toLowerCase());

    return bloodMatch && cityMatch && donor.available;
  });

  /* =========================
     OPEN DONOR FORM
  ========================= */

  const openDonorForm = () => {
    setShowForm(true);

    if (user) {
      console.log("Donor:", user.displayName);
      console.log("Email:", user.email);
    }
  };

  /* =========================
     REGISTER DONOR
  ========================= */

  const handleRegisterDonor = async () => {
    if (!user) {
      alert("Please login before registering as a donor.");
      return;
    }

    if (!donorBloodGroup) {
      alert("Please select your blood group.");
      return;
    }

    if (!donorCity.trim()) {
      alert("Please enter your city.");
      return;
    }

    if (!phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    const donorData = {
      firebaseUid: user.uid,
      name: user.displayName || "HealthHub User",
      email: user.email || "",
      bloodGroup: donorBloodGroup,
      city: donorCity.trim(),
      phone: phone.trim(),
      available,
    };

    console.log("Sending donor data to MongoDB:", donorData);

    try {
      const response = await fetch("/api/donors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(donorData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to register donor.");
        return;
      }

      console.log("MongoDB response:", data);

      alert("Donor registered successfully!");

      setShowForm(false);

      /* CLEAR FORM */

      setDonorBloodGroup("");
      setDonorCity("");
      setPhone("");
      setAvailable(true);

      /* REFRESH DONORS */

      await fetchDonors();
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong while registering.");
    }
  };

  return (
    <main className={styles.page}>
      {/* =========================
          MAIN CONTENT
          Sidebar comes from
          app/dashboard/layout.tsx
      ========================= */}

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
        </header>

        {/* =========================
            SEARCH
        ========================= */}

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

            {/* BLOOD GROUP */}

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

            {/* CITY */}

            <div className={styles.field}>
              <label>City / Location</label>

              <input
                type="text"
                placeholder="Enter your city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            {/* SEARCH BUTTON */}

            <button
              className={styles.searchButton}
              onClick={handleSearch}
            >
              Search Donors
            </button>
          </div>
        </section>

        {/* =========================
            DONOR LIST
        ========================= */}

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

          {/* LOADING */}

          {loadingDonors ? (
            <div className={styles.emptyState}>

              <div className={styles.emptyIcon}>
                ♥
              </div>

              <h3>
                Loading donors...
              </h3>

              <p>
                Please wait while we fetch available blood donors.
              </p>

            </div>

          ) : filteredDonors.length === 0 ? (

            /* NO DONORS */

            <div className={styles.emptyState}>

              <div className={styles.emptyIcon}>
                ♥
              </div>

              <h3>
                No donors found
              </h3>

              <p>
                There are currently no available donors
                matching your search.
              </p>

              <button
                className={styles.emptyButton}
                onClick={openDonorForm}
              >
                Become a Donor
              </button>

            </div>

          ) : (

            /* DONOR CARDS */

            <div className={styles.donorGrid}>

              {filteredDonors.map((donor) => (

                <div
                  key={donor._id}
                  className={styles.donorCard}
                >

                  {/* DONOR HEADER */}

                  <div className={styles.donorTop}>

                    <div className={styles.donorAvatar}>
                      {donor.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <h3>
                        {donor.name}
                      </h3>

                      <span
                        className={
                          styles.availableBadge
                        }
                      >
                        ● Available
                      </span>
                    </div>

                  </div>

                  {/* DONOR DETAILS */}

                  <div className={styles.donorDetails}>

                    <div>
                      <strong>
                        Blood Group:
                      </strong>

                      <span
                        className={
                          styles.bloodGroupBadge
                        }
                      >
                        {donor.bloodGroup}
                      </span>
                    </div>

                    <div>
                      <strong>
                        City:
                      </strong>

                      <span>
                        {donor.city}
                      </span>
                    </div>

                    <div>
                      <strong>
                        Phone:
                      </strong>

                      <span>
                        {donor.phone}
                      </span>
                    </div>

                  </div>

                </div>

              ))}

            </div>
          )}
        </section>

        {/* =========================
            BANNER
        ========================= */}

        <section className={styles.donorBanner}>

          <div className={styles.bannerIcon}>
            ♥
          </div>

          <div>
            <p>
              HELP SOMEONE TODAY
            </p>

            <h2>
              Your blood could save a life.
            </h2>

            <span>
              Register as a donor and help people
              find you when they need your blood group.
            </span>
          </div>

          <button onClick={openDonorForm}>
            Register Now →
          </button>

        </section>

      </section>

      {/* =========================
          DONOR REGISTRATION MODAL
      ========================= */}

      {showForm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowForm(false)}
        >

          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >

            {/* CLOSE */}

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

            {/* FORM */}

            <div className={styles.formGrid}>

              {/* NAME */}

              <div className={styles.formField}>
                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  value={user?.displayName || ""}
                  placeholder="Your name"
                  readOnly
                />
              </div>

              {/* BLOOD GROUP */}

              <div className={styles.formField}>
                <label>
                  Blood Group
                </label>

                <select
                  value={donorBloodGroup}
                  onChange={(e) =>
                    setDonorBloodGroup(e.target.value)
                  }
                >
                  <option value="" disabled>
                    Select blood group
                  </option>

                  {bloodGroups.map((group) => (
                    <option
                      key={group}
                      value={group}
                    >
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              {/* CITY */}

              <div className={styles.formField}>
                <label>
                  City
                </label>

                <input
                  type="text"
                  placeholder="Your city"
                  value={donorCity}
                  onChange={(e) =>
                    setDonorCity(e.target.value)
                  }
                />
              </div>

              {/* PHONE */}

              <div className={styles.formField}>
                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  placeholder="Your phone number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                />
              </div>

            </div>

            {/* AVAILABILITY */}

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
                checked={available}
                onChange={(e) =>
                  setAvailable(e.target.checked)
                }
              />

            </div>

            {/* REGISTER */}

            <button
              className={styles.registerButton}
              onClick={handleRegisterDonor}
            >
              Register as Donor
            </button>

          </div>
        </div>
      )}

    </main>
  );
}