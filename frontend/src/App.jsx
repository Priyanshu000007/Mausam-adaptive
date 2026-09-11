import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [persona, setPersona] = useState("commuter");
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState("");

  // Get user's location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Location services are not supported.");

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        setLocationError(
          "Location permission denied. Using New Delhi."
        );

        setLocation({
          lat: 28.6139,
          lon: 77.209,
        });
      }
    );
  }, []);

  // Get location name
  useEffect(() => {
    if (!location) return;

    const getLocationName = async () => {
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.lat}&longitude=${location.lon}&localityLanguage=en`
        );

        if (!response.ok) {
          throw new Error("Location lookup failed");
        }

        const result = await response.json();

        const city =
          result.city ||
          result.locality ||
          "Unknown location";

        const state = result.principalSubdivision || "";

        setLocationName(
          state && city !== state
            ? `${city}, ${state}`
            : city
        );
      } catch (error) {
        console.error(error);
        setLocationName("Location detected");
      }
    };

    getLocationName();
  }, [location]);

  // Get personalized weather
  useEffect(() => {
    if (!location) return;

    const fetchWeather = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `http://localhost:5000/api/personalized?persona=${persona}&lat=${location.lat}&lon=${location.lon}`
        );

        if (!response.ok) {
          throw new Error("Weather request failed");
        }

        const result = await response.json();

        setData(result);
      } catch (error) {
        console.error("Weather error:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [persona, location]);

  const getPersonaTitle = () => {
    if (persona === "commuter") return "Your commute";

    if (persona === "agriculture") return "Your garden & crops";

    if (persona === "traveller") return "Your travel";

    return "Your weather";
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div>
          <h1>🌦️ MAUSAM</h1>
          <p>Adaptive Weather Intelligence</p>
        </div>

        <div className="location">
          📍 {locationName || "Detecting location..."}
        </div>
      </header>

      {/* LOCATION ERROR */}
      {locationError && (
        <div className="notice">
          ⚠️ {locationError}
        </div>
      )}

      {/* PERSONA SELECTOR */}
      <section className="persona-section">
        <h2>What matters to you?</h2>

        <div className="persona-buttons">

          <button
            className={persona === "commuter" ? "active" : ""}
            onClick={() => setPersona("commuter")}
          >
            🚗
            <span>Commuter</span>
          </button>

          <button
            className={persona === "agriculture" ? "active" : ""}
            onClick={() => setPersona("agriculture")}
          >
            🌱
            <span>Agriculture</span>
          </button>

          <button
            className={persona === "traveller" ? "active" : ""}
            onClick={() => setPersona("traveller")}
          >
            ✈️
            <span>Traveller</span>
          </button>

        </div>
      </section>

      {/* WEATHER */}
      {loading ? (
        <div className="loading">
          🌦️ Loading your weather...
        </div>
      ) : data ? (
        <>
          {/* CURRENT WEATHER */}
          <section className="weather-card">

            <div className="weather-main">

              <div>
                <p className="small-text">
                  CURRENT WEATHER
                </p>

                <h2>
                  {data.weather?.temperature_2m ?? "—"}°C
                </h2>

                <p>
                  📍 {locationName || "Your location"}
                </p>
              </div>

              <div className="weather-icon">
                ☀️
              </div>

            </div>

            {/* WEATHER STATS */}
            <div className="weather-stats">

              <div>
                <span>💧</span>
                <p>Humidity</p>
                <strong>
                  {data.weather?.relative_humidity_2m ?? "—"}%
                </strong>
              </div>

              <div>
                <span>🌧️</span>
                <p>Rainfall</p>
                <strong>
                  {data.weather?.precipitation ?? "—"} mm
                </strong>
              </div>

              <div>
                <span>💨</span>
                <p>Wind</p>
                <strong>
                  {data.weather?.wind_speed_10m ?? "—"} km/h
                </strong>
              </div>

              {/* AGRICULTURE DATA */}
              {persona === "agriculture" && (
                <>
                  <div>
                    <span>☀️</span>
                    <p>UV Index</p>
                    <strong>
                      {data.weather?.uv_index ?? "—"}
                    </strong>
                  </div>

                  <div>
                    <span>🌱</span>
                    <p>Soil Moisture</p>
                    <strong>
                      {data.hourly?.soil_moisture_0_to_7cm?.[0] ?? "—"}
                    </strong>
                  </div>

                  <div>
                    <span>🌡️</span>
                    <p>Soil Temperature</p>
                    <strong>
                      {data.hourly?.soil_temperature_0cm?.[0] ?? "—"}°C
                    </strong>
                  </div>
                </>
              )}

            </div>

          </section>

          {/* PERSONALIZED SECTION */}
          <section className="insights">

            <div className="section-heading">
              <div>
                <p className="small-text">
                  PERSONALIZED FOR YOU
                </p>

                <h2>
                  {getPersonaTitle()}
                </h2>
              </div>
            </div>

            {data.insights && data.insights.length > 0 ? (
              data.insights.map((insight, index) => (
                <div
                  className={`insight-card ${insight.priority || ""}`}
                  key={index}
                >

                  <div className="insight-icon">

                    {insight.type === "rain" && "🌧️"}

                    {insight.type === "wind" && "💨"}

                    {insight.type === "heat" && "🌡️"}

                    {insight.type === "humidity" && "💧"}

                    {insight.type === "irrigation" && "💦"}

                    {insight.type === "uv" && "☀️"}

                    {insight.type === "good" && "✅"}

                    {insight.type === "normal" && "✅"}

                  </div>

                  <div>
                    <h3>{insight.title}</h3>
                    <p>{insight.message}</p>
                  </div>

                </div>
              ))
            ) : (
              <div className="insight-card normal">

                <div className="insight-icon">
                  ✅
                </div>

                <div>
                  <h3>Weather looks good</h3>

                  <p>
                    No major weather alerts for your selected profile.
                  </p>
                </div>

              </div>
            )}

          </section>

          {/* HOURLY FORECAST */}
          <section className="hourly-section">

            <div className="section-heading">

              <div>
                <p className="small-text">
                  HOURLY FORECAST
                </p>

                <h2>
                  Next few hours
                </h2>
              </div>

            </div>

            <div className="hourly-container">

              {data.hourly?.time
                ?.slice(0, 12)
                .map((time, index) => {

                  const hour = new Date(time).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  });

                  const rainProbability =
                    data.hourly?.precipitation_probability?.[index] ?? 0;

                  return (
                    <div
                      className="hour-card"
                      key={time}
                    >

                      <strong>
                        {hour}
                      </strong>

                      <div className="hour-icon">
                        {rainProbability > 50
                          ? "🌧️"
                          : "☀️"}
                      </div>

                      <span>
                        🌧️ {rainProbability}%
                      </span>

                    </div>
                  );
                })}

            </div>

          </section>

        </>
      ) : (
        <div className="error">
          ❌ Unable to load weather data.
          <br />
          <small>
            Make sure your backend server is running on port 5000.
          </small>
        </div>
      )}

    </div>
  );
}

export default App;