import React from "react";
import "./WelcomePage.css";
import HotelListPage from "./HotelListPage.jsx";

export default function WelcomePage() {
  const scrollToHotels = () => {
    document.getElementById("home-hotels")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main className="staylux">
      <nav className="staylux-nav">
        <a className="staylux-logo" href="/">
          ✦ STAYLUX
        </a>

        <button onClick={scrollToHotels}>
          View Hotels
        </button>
      </nav>

      <section className="staylux-hero">
        <div className="staylux-overlay">
          <span className="staylux-tag">
            LUXURY • COMFORT • EXPERIENCE
          </span>

          <h1>
            Your Journey
            <br />
            Begins With a
            <br />
            <span>Perfect Stay.</span>
          </h1>

          <p>
            Discover exceptional hotels, beautiful destinations,
            and unforgettable stays—all in one place.
          </p>

          <button
            className="staylux-primary"
            onClick={scrollToHotels}
          >
            Explore Hotels <span>→</span>
          </button>
        </div>

        <div className="hero-note">
          <span>✦</span> Your comfort, our priority
        </div>
      </section>

      <section id="home-hotels" className="home-hotels">
        <HotelListPage />
      </section>

      <footer className="staylux-footer">
        <strong>✦ STAYLUX</strong>
        <p>Find your perfect stay.</p>

      </footer>
    </main>
  );
}
