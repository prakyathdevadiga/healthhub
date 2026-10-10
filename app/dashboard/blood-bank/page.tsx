
"use client";

import { useCallback, useEffect, useState } from "react";
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
  distanceKm?: number | null;
  isExactLocation?: boolean;
};

export default function BloodBankPage() {
  // SEARCH
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");

  // DONORS
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loadingDonors, setLoadingDonors] = useState(true);
  const [searchError, setSearchError] = useState("");

  // DONOR REGISTRATION MODAL
  const [showForm, setShowForm] = useState(false);
  const [registering, setRegistering] = useState(false);

  // FIREBASE USER
  const [user, setUser] = useState<User | null>(null);

  // REGISTRATION FORM DATA
  const [donorBloodGroup, setDonorBloodGroup] = useState("");
  const [donorCity, setDonorCity] = useState("");
  const [phone, setPhone] = useState("");
  const [available, setAvailable] = useState(true);

  // CURRENT FIREBASE USER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // FETCH DONORS FROM THE API
  const fetchDonors = useCallback(
    async (searchBloodGroup = "", searchCity = "") => {
      try {
        setLoadingDonors(true);
        setSearchError("");

        const params = new URLSearchParams();

        if (searchBloodGroup) {
          params.set("bloodGroup", searchBloodGroup);
        }

        if (searchCity.trim()) {
          params.set("city", searchCity.trim());
        }

        const query = params.toString();
        const url = query ? `/api/donors?${query}` : "/api/donors";

        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch donors.");
        }

        if (!Array.isArray(data)) {
          throw new Error("The server returned an unexpected response.");
        }

        setDonors(data);
      } catch (error) {
        console.error("Donor fetch error:", error);
        setDonors([]);
        setSearchError(
          error instanceof Error
            ? error.message
            : "Unable to load donors. Please try again."
        );
      } finally {
        setLoadingDonors(false);
      }
    },
    []
  );

  // LOAD ALL AVAILABLE DONORS WHEN THE PAGE OPENS
  useEffect(() => {
    void fetchDonors();
  }, [fetchDonors]);

  // SEARCH DONORS
  const handleSearch = async () => {
    await fetchDonors(bloodGroup, city);
  };

  // RESET SEARCH
  const handleResetSearch = async () => {
    setBloodGroup("");
    setCity("");
    await fetchDonors();
  };

  // API ALREADY APPLIES THE BLOOD GROUP AND LOCATION FILTERS
  const filteredDonors = donors.filter((donor) => donor.available);

  // OPEN REGISTRATION MODAL
  const openDonorForm = () => {
    if (!user) {
      alert("Please log in before registering as a donor.");
      return;
    }

    setShowForm(true);
  };

  // REGISTER DONOR
  const handleRegisterDonor = async () => {
    if (!user) {
      alert("Please log in before registering as a donor.");
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

    try {
      setRegistering(true);

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

      alert("Donor registered successfully!");

      setShowForm(false);
      setDonorBloodGroup("");
      setDonorCity("");
      setPhone("");
      setAvailable(true);

      // REFRESH RESULTS USING THE CURRENT SEARCH
      await fetchDonors(bloodGroup, city);
    } catch (error) {
      console.error("Registration error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while registering."
      );
    } finally {
      setRegistering(false);
    }
  };

  return (
    <main className={styles.page}>
      {/* MAIN CONTENT - SIDEBAR COMES FROM DASHBOARD LAYOUT */}
      <section className={styles.main}>
        {/* HEADER */}
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>HEALTHHUB BLOOD BANK</p>

            <h1>
              Find a <span>Blood Donor.</span>
            </h1>

            <p className={styles.subtitle}>
              Connect with available blood donors near you.
            </p>
          </div>
        </header>

        {/* SEARCH */}
        <section className={styles.searchCard}>
          <div className={styles.searchHeading}>
            <div className={styles.searchIcon}>♥</div>

            <div>
              <h2>Find Blood Donors</h2>
              <p>
                Search by blood group and location to find nearby donors.
              </p>
            </div>
          </div>

          <form
            className={styles.filters}
            onSubmit={(event) => {
              event.preventDefault();
              void handleSearch();
            }}
          >
            {/* BLOOD GROUP */}
            <div className={styles.field}>
              <label htmlFor="searchBloodGroup">Blood Group</label>

              <select
                id="searchBloodGroup"
                value={bloodGroup}
                onChange={(event) => setBloodGroup(event.target.value)}
              >
                <option value="">All blood groups</option>

                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            {/* LOCATION */}
            <div className={styles.field}>
              <label htmlFor="searchCity">City / Location</label>

              <input
                id="searchCity"
                type="text"
                placeholder="e.g. Surathkal"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              />
            </div>

            {/* SEARCH BUTTON */}
            <button
              type="submit"
              className={styles.searchButton}
              disabled={loadingDonors}
            >
              {loadingDonors ? "Searching..." : "Search Donors"}
            </button>
          </form>

          {(bloodGroup || city) && (
            <button
              type="button"
              onClick={() => void handleResetSearch()}
              disabled={loadingDonors}
              style={{
                marginTop: "12px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Clear search
            </button>
          )}

          {city.trim() && (
            <p className={styles.subtitle} style={{ marginTop: "12px" }}>
              Results may include exact location matches and donors within
              25 km, sorted with exact matches first.
            </p>
          )}
        </section>

        {/* DONOR LIST */}
        <section className={styles.donorSection}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionLabel}>BLOOD DONORS</p>
              <h2>Available Donors</h2>
            </div>
          </div>

          {/* LOADING */}
          {loadingDonors ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>♥</div>
              <h3>Loading donors...</h3>
              <p>Please wait while we fetch available blood donors.</p>
            </div>
          ) : searchError ? (
            /* ERROR */
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>!</div>
              <h3>Unable to load donors</h3>
              <p>{searchError}</p>

              <button
                type="button"
                className={styles.emptyButton}
                onClick={() => void fetchDonors(bloodGroup, city)}
              >
                Try Again
              </button>
            </div>
          ) : filteredDonors.length === 0 ? (
            /* NO DONORS */
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>♥</div>
              <h3>No donors found</h3>
              <p>
                There are currently no available donors matching your search.
                Try another location or blood group.
              </p>

              <button
                type="button"
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
                <div key={donor._id} className={styles.donorCard}>
                  {/* DONOR HEADER */}
                  <div className={styles.donorTop}>
                    <div className={styles.donorAvatar}>
                      {(donor.name || "D").charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3>{donor.name}</h3>

                      <span className={styles.availableBadge}>
                        ● Available
                      </span>
                    </div>
                  </div>

                  {/* DONOR DETAILS */}
                  <div className={styles.donorDetails}>
                    <div>
                      <strong>Blood Group:</strong>

                      <span className={styles.bloodGroupBadge}>
                        {donor.bloodGroup}
                      </span>
                    </div>

                    <div>
                      <strong>City:</strong>
                      <span>{donor.city}</span>
                    </div>

                    {/* LOCATION MATCH / DISTANCE */}
                    {donor.isExactLocation && (
                      <div>
                        <strong>Location:</strong>
                        <span>Exact location match</span>
                      </div>
                    )}

                    {typeof donor.distanceKm === "number" && (
                      <div>
                        <strong>Distance:</strong>
                        <span>
                          {donor.distanceKm < 1
                            ? `${Math.round(donor.distanceKm * 1000)} m away`
                            : `${donor.distanceKm.toFixed(1)} km away`}
                        </span>
                      </div>
                    )}

                    <div>
                      <strong>Phone:</strong>
                      <a href={`tel:${donor.phone}`}>{donor.phone}</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* DONOR REGISTRATION BANNER */}
        <section className={styles.donorBanner}>
          <div className={styles.bannerIcon}>♥</div>

          <div>
            <p>HELP SOMEONE TODAY</p>

            <h2>Your blood could save a life.</h2>

            <span>
              Register as a donor and help people find you when they need your
              blood group.
            </span>
          </div>

          <button type="button" onClick={openDonorForm}>
            Register Now →
          </button>
        </section>
      </section>

      {/* DONOR REGISTRATION MODAL */}
      {showForm && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            if (!registering) setShowForm(false);
          }}
        >
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            {/* CLOSE */}
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setShowForm(false)}
              disabled={registering}
              aria-label="Close registration form"
            >
              ×
            </button>

            <p className={styles.modalLabel}>BLOOD DONOR REGISTRATION</p>

            <h2>Become a Donor</h2>

            <p className={styles.modalDescription}>
              Register your details to help people find you when they need your
              blood group.
            </p>

            <div className={styles.formGrid}>
              {/* NAME */}
              <div className={styles.formField}>
                <label htmlFor="donorName">Full Name</label>

                <input
                  id="donorName"
                  type="text"
                  value={user?.displayName || ""}
                  placeholder="Your name"
                  readOnly
                />
              </div>

              {/* BLOOD GROUP */}
              <div className={styles.formField}>
                <label htmlFor="donorBloodGroup">Blood Group</label>

                <select
                  id="donorBloodGroup"
                  value={donorBloodGroup}
                  onChange={(event) =>
                    setDonorBloodGroup(event.target.value)
                  }
                  disabled={registering}
                >
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

              {/* CITY */}
              <div className={styles.formField}>
                <label htmlFor="donorCity">City</label>

                <input
                  id="donorCity"
                  type="text"
                  placeholder="e.g. Surathkal"
                  value={donorCity}
                  onChange={(event) => setDonorCity(event.target.value)}
                  disabled={registering}
                />
              </div>

              {/* PHONE */}
              <div className={styles.formField}>
                <label htmlFor="donorPhone">Phone Number</label>

                <input
                  id="donorPhone"
                  type="tel"
                  placeholder="Your phone number"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={registering}
                />
              </div>
            </div>

            {/* AVAILABILITY */}
            <div className={styles.availabilityBox}>
              <div>
                <strong>Available to Donate</strong>
                <p>Allow people to contact you when blood is needed.</p>
              </div>

              <input
                type="checkbox"
                checked={available}
                onChange={(event) => setAvailable(event.target.checked)}
                disabled={registering}
                aria-label="Available to donate"
              />
            </div>

            {/* REGISTER */}
            <button
              type="button"
              className={styles.registerButton}
              onClick={() => void handleRegisterDonor()}
              disabled={registering}
            >
              {registering ? "Registering..." : "Register as Donor"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
