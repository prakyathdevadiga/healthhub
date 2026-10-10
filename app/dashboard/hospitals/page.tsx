
"use client";

import { FormEvent, useState } from "react";
import styles from "./hospitals.module.css";

type SearchMode = "gps" | "pincode" | "city";

interface LocationResult {
  name: string;
  latitude: number;
  longitude: number;
}

interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
  address: string;
  phone: string;
  website: string;
  emergency: boolean | null;
}

export default function HospitalsPage() {
  const [mode, setMode] = useState<SearchMode>("gps");
  const [place, setPlace] = useState("");
  const [locations, setLocations] = useState<LocationResult[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationResult | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const resetResults = () => {
    setLocations([]);
    setSelectedLocation(null);
    setHospitals([]);
    setError("");
    setSearched(false);
  };

  const changeMode = (nextMode: SearchMode) => {
    setMode(nextMode);
    setPlace("");
    resetResults();
  };

  const searchNearbyHospitals = async (
    location: LocationResult
  ) => {
    setLoading(true);
    setError("");
    setLocations([]);
    setSelectedLocation(location);
    setHospitals([]);
    setSearched(false);

    try {
      const response = await fetch("/api/hospitals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to find nearby hospitals."
        );
      }

      setHospitals(data.hospitals || []);
      setSearched(true);

      if (!data.hospitals?.length) {
        setError(
          "No mapped hospitals were found within 10 km. Try another location."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to find hospitals. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    resetResults();

    if (!navigator.geolocation) {
      setError("Your browser does not support location services.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Avoid silently searching from a very inaccurate location.
        if (accuracy > 5000) {
          setLoading(false);
          setError(
            `Your location accuracy is about ${(accuracy / 1000).toFixed(
              1
            )} km. Please try again or use the PIN Code or City / Area option.`
          );
          return;
        }

        await searchNearbyHospitals({
          name: `Current location (accuracy approximately ${Math.round(
            accuracy
          )} m)`,
          latitude,
          longitude,
        });
      },
      (geoError) => {
        setLoading(false);

        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError(
            "Location access was denied. Allow location permission or choose PIN Code or City / Area."
          );
        } else if (geoError.code === geoError.TIMEOUT) {
          setError(
            "Location detection timed out. Please try again."
          );
        } else {
          setError(
            "Could not detect your location. Try again or enter your place manually."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const findPlace = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const query = place.trim();

    if (mode === "pincode" && !/^\d{6}$/.test(query)) {
      setError("Enter a valid 6-digit Indian PIN code.");
      return;
    }

    if (mode === "city" && query.length < 2) {
      setError("Enter a city or area name.");
      return;
    }

    setLoading(true);
    setError("");
    setLocations([]);
    setSelectedLocation(null);
    setHospitals([]);
    setSearched(false);

    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success || !data.locations?.length) {
        throw new Error(
          data.error || "Location not found. Try another search."
        );
      }

      setLocations(data.locations);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to find that location."
      );
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMaps = (hospital: Hospital) => {
    const url = new URL("https://www.google.com/maps/search/");
    url.searchParams.set("api", "1");
    url.searchParams.set(
      "query",
      `${hospital.latitude},${hospital.longitude}`
    );

    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  const callHospital = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <main className={styles.page}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <div className={styles.container}>
        <section className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              HEALTHCARE LOCATOR
            </span>
            <h1>
              Nearby <span>Hospitals.</span>
            </h1>
            <p>
              Choose your location method to find nearby hospitals.
            </p>
          </div>

          <div className={styles.headerIcon}>🏥</div>
        </section>

        <section className={styles.searchPanel}>
          <h2>How would you like to search?</h2>
          <p className={styles.panelSubtitle}>
            Select one option below to set your search location.
          </p>

          <div className={styles.modeGrid}>
            <button
              type="button"
              className={`${styles.modeCard} ${
                mode === "gps" ? styles.modeActive : ""
              }`}
              onClick={() => changeMode("gps")}
              aria-pressed={mode === "gps"}
              disabled={loading}
            >
              <span className={styles.modeIcon}>📍</span>
              <strong>My Location</strong>
              <small>Use device location</small>
            </button>

            <button
              type="button"
              className={`${styles.modeCard} ${
                mode === "pincode" ? styles.modeActive : ""
              }`}
              onClick={() => changeMode("pincode")}
              aria-pressed={mode === "pincode"}
              disabled={loading}
            >
              <span className={styles.modeIcon}>#</span>
              <strong>PIN Code</strong>
              <small>Enter 6-digit PIN</small>
            </button>

            <button
              type="button"
              className={`${styles.modeCard} ${
                mode === "city" ? styles.modeActive : ""
              }`}
              onClick={() => changeMode("city")}
              aria-pressed={mode === "city"}
              disabled={loading}
            >
              <span className={styles.modeIcon}>🏙️</span>
              <strong>City / Area</strong>
              <small>Enter a place name</small>
            </button>
          </div>

          {mode === "gps" && (
            <div className={styles.modeContent}>
              <div className={styles.modeDescription}>
                <strong>Use your current location</strong>
                <p>
                  Your browser will ask for location permission.
                  If location accuracy is poor, enter your place manually.
                </p>
              </div>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={useMyLocation}
                disabled={loading}
              >
                {loading ? "Finding hospitals..." : "Use My Location"}
              </button>
            </div>
          )}

          {(mode === "pincode" || mode === "city") && (
            <form className={styles.placeForm} onSubmit={findPlace}>
              <label htmlFor="hospital-place">
                {mode === "pincode" ? "Enter PIN code" : "Enter city or area"}
              </label>

              <input
                id="hospital-place"
                type="text"
                inputMode={mode === "pincode" ? "numeric" : "text"}
                autoComplete="off"
                maxLength={mode === "pincode" ? 6 : 100}
                pattern={mode === "pincode" ? "[0-9]{6}" : undefined}
                value={place}
                onChange={(e) => {
                  const value = e.target.value;
                  setPlace(
                    mode === "pincode"
                      ? value.replace(/\D/g, "").slice(0, 6)
                      : value
                  );
                  setError("");
                }}
                placeholder={
                  mode === "pincode"
                    ? "e.g. 575001"
                    : "e.g. Surathkal, Mangalore"
                }
                required
              />

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={loading}
              >
                {loading ? "Searching..." : "Find Location"}
              </button>

              <span className={styles.inputHint}>
                {mode === "pincode"
                  ? "Enter all 6 digits of an Indian PIN code."
                  : "For better results, include the city and state."}
              </span>
            </form>
          )}
        </section>

        {locations.length > 0 && (
          <section className={styles.locationMatches}>
            <h2>Choose the correct location</h2>
            <p>Confirm the place before searching for hospitals.</p>

            {locations.map((location, index) => (
              <button
                type="button"
                className={styles.locationMatch}
                key={`${location.latitude}-${location.longitude}-${index}`}
                disabled={loading}
                onClick={() => searchNearbyHospitals(location)}
              >
                <span className={styles.matchPin}>📍</span>
                <span className={styles.matchText}>
                  <strong>{location.name}</strong>
                  <small>Find hospitals within 10 km</small>
                </span>
                <span className={styles.matchArrow}>→</span>
              </button>
            ))}
          </section>
        )}

        {selectedLocation && (
          <div className={styles.selectedLocation}>
            <span>✓</span>
            <div>
              <strong>Search location</strong>
              <p>{selectedLocation.name}</p>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setSelectedLocation(null);
                setHospitals([]);
                setLocations([]);
                setSearched(false);
                setError("");
              }}
            >
              Change
            </button>
          </div>
        )}

        {loading && (
          <section className={styles.loadingCard}>
            <div className={styles.spinner} />
            <div>
              <strong>Finding nearby hospitals...</strong>
              <p>Searching mapped healthcare facilities within 10 km.</p>
            </div>
          </section>
        )}

        {!loading && error && (
          <section className={styles.errorCard}>
            <div className={styles.errorIcon}>!</div>
            <div>
              <strong>Unable to complete search</strong>
              <p>{error}</p>
            </div>
          </section>
        )}

        {!loading && hospitals.length > 0 && (
          <section className={styles.results}>
            <div className={styles.resultsHeader}>
              <div>
                <span className={styles.resultLabel}>NEARBY RESULTS</span>
                <h2>Hospitals near your location</h2>
              </div>
              <span className={styles.count}>
                {hospitals.length} found
              </span>
            </div>

            <div className={styles.hospitalList}>
              {hospitals.map((hospital) => (
                <article className={styles.hospitalCard} key={hospital.id}>
                  <div className={styles.cardTop}>
                    <div className={styles.hospitalIcon}>🏥</div>
                    <div className={styles.hospitalInfo}>
                      <div className={styles.nameRow}>
                        <h3>{hospital.name}</h3>
                        {hospital.emergency === true && (
                          <span className={styles.emergencyBadge}>
                            Emergency
                          </span>
                        )}
                      </div>
                      <div className={styles.distance}>
                        📍 {hospital.distance} km away
                      </div>
                    </div>
                  </div>

                  <div className={styles.address}>
                    <span>⌖</span>
                    <p>{hospital.address}</p>
                  </div>

                  <div className={styles.actions}>
                    {hospital.phone && (
                      <button
                        type="button"
                        className={styles.callButton}
                        onClick={() => callHospital(hospital.phone)}
                      >
                        ☎ Call
                      </button>
                    )}

                    <button
                      type="button"
                      className={styles.mapButton}
                      onClick={() => openGoogleMaps(hospital)}
                    >
                      Open in Google Maps →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {!loading && searched && hospitals.length === 0 && !error && (
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏥</div>
            <h2>No hospitals found</h2>
            <p>Try another nearby area or PIN code.</p>
          </section>
        )}

        {!loading &&
          !searched &&
          !error &&
          locations.length === 0 &&
          !selectedLocation && (
            <section className={styles.emptyState}>
              <div className={styles.emptyIcon}>📍</div>
              <h2>Start with your location</h2>
              <p>
                Choose My Location, PIN Code or City / Area above to find
                nearby hospitals.
              </p>
            </section>
          )}

        <div className={styles.notice}>
          <span>ⓘ</span>
          <p>
            <strong>HealthHub Location Notice:</strong>{" "}
            Hospital information comes from OpenStreetMap and may be
            incomplete. PIN-code searches use a representative mapped
            location, so distances are approximate. Verify important
            details directly with the hospital. © OpenStreetMap contributors.
          </p>
        </div>
      </div>
    </main>
  );
}
