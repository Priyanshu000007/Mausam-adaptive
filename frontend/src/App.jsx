```jsx
import { useEffect, useState } from "react";
import "./App.css";

const BACKEND_URL =
  "https://mausam-adaptive.onrender.com";

function App() {
  const [persona, setPersona] = useState("commuter");
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState("");

  // ==========================================
  // GET USER LOCATION
  // ==========================================

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(
        "Location services are not supported. Using New Delhi."
      );

      setLocation({
        lat: 28.6139,
        lon: 77.209,
      });

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
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);


  // ==========================================
  // GET LOCATION NAME
  // ==========================================

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

        const state =
          result.principalSubdivision || "";

        setLocationName(
          state && city !== state
            ? `${city}, ${state}`
            : city
        );

      } catch (error) {

        console.error(
          "Location lookup error:",
          error
        );

        setLocationName("Location detected");
      }
    };

    getLocationName();

  }, [location]);


  // ==========================================
  // GET WEATHER + PERSONALIZED INSIGHTS
  // ==========================================

  useEffect(() => {
    if (!location) return;

    const fetchWeather = async () => {

      setLoading(true);

      try {

        // --------------------------------------
        // STEP 1: GET WEATHER DIRECTLY FROM
        // OPEN-METEO
        // --------------------------------------

        const weatherUrl =
          `https://api.open-meteo.com/v1/forecast?` +
          `latitude=${location.lat}` +
          `&longitude=${location.lon}` +
          `&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,uv_index` +
          `&hourly=temperature_2m,precipitation_probability,soil_moisture_0_to_7cm,soil_temperature_0cm` +
          `&daily=precipitation_probability_max,sunrise,sunset` +
          `&timezone=auto`;

        console.log(
          "🌦️ Fetching weather directly from Open-Meteo..."
        );

        const weatherResponse =
          await fetch(weatherUrl);

        if (!weatherResponse.ok) {
          throw new Error(
            `Open-Meteo request failed: ${weatherResponse.status}`
          );
        }

        const weatherData =
          await weatherResponse.json();


        // --------------------------------------
        // STEP 2: SEND WEATHER TO RENDER
        // FOR PERSONALIZATION
        // --------------------------------------

        console.log(
          "🧠 Sending weather to MAUSAM backend..."
        );

        const personalizedResponse =
          await fetch(
            `${BACKEND_URL}/api/personalized?persona=${persona}`,
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify(weatherData),
            }
          );


        if (!personalizedResponse.ok) {
          throw new Error(
            `Backend request failed: ${personalizedResponse.status}`
          );
        }


        // --------------------------------------
        // STEP 3: GET PERSONALIZED RESPONSE
        // --------------------------------------

        const result =
          await personalizedResponse.json();

        console.log(
          "✅ MAUSAM response:",
          result
        );

        setData(result);

      } catch (error) {

        console.error(
          "❌ Weather error:",
          error
        );

        setData(null);

      } finally {

        setLoading(false);

      }
    };

    fetchWeather();

  }, [persona, location]);


  // ==========================================
  // PERSONA TITLE
  // ==========================================

  const getPersonaTitle = () => {

    if (persona === "commuter") {
      return "Your commute";
    }

    if (persona === "agriculture") {
      return "Your garden & crops";
    }

    if (persona === "traveller") {
      return "Your travel";
    }

    return "Your weather";
  };


  // ==========================================
  // INSIGHT ICON
  // ==========================================

  const getInsightIcon = (type) => {

    if (type === "rain") {
      return "🌧️";
    }

    if (type === "wind") {
      return "💨";
    }

    if (type === "heat") {
      return "🌡️";
    }

    if (type === "humidity") {
      return "💧";
    }

    if (type === "irrigation") {
      return "💦";
    }

    if (type === "uv") {
      return "☀️";
    }

    if (type === "good") {
      return "✅";
    }

    return "🌦️";
  };


  // ==========================================
  // WEATHER ICON
  // ==========================================

  const getWeatherIcon = () => {

    if (!data?.weather) {
      return "🌦️";
    }

    const rain =
      Number(data.weather.precipitation) || 0;

    const probability =
      Number(
        data.hourly
          ?.precipitation_probability?.[0]
      ) || 0;

    if (rain > 0) {
      return "🌧️";
    }

    if (probability >= 60) {
      return "🌦️";
    }

    return "☀️";
  };


  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">

        <div>

          <h1>🌦️ MAUSAM</h1>

          <p>
            Adaptive Weather Intelligence
          </p>

        </div>

        <div className="location">

          📍{" "}
          {locationName ||
            "Detecting location..."}

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

        <h2>
          What matters to you?
        </h2>

        <div className="persona-buttons">

          <button
            className={
              persona === "commuter"
                ? "active"
                : ""
            }
            onClick={() =>
              setPersona("commuter")
            }
          >
            🚗
            <span>
              Commuter
            </span>
          </button>


          <button
            className={
              persona === "agriculture"
                ? "active"
                : ""
            }
            onClick={() =>
              setPersona("agriculture")
            }
          >
            🌱
            <span>
              Agriculture
            </span>
          </button>


          <button
            className={
              persona === "traveller"
                ? "active"
                : ""
            }
            onClick={() =>
              setPersona("traveller")
            }
          >
            ✈️
            <span>
              Traveller
            </span>
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
                  {data.weather
                    ?.temperature_2m ?? "—"}°C
                </h2>

                <p>
                  📍{" "}
                  {locationName ||
                    "Your location"}
                </p>

              </div>


              <div className="weather-icon">

                {getWeatherIcon()}

              </div>

            </div>


            {/* WEATHER STATS */}

            <div className="weather-stats">

              <div>

                <span>💧</span>

                <p>
                  Humidity
                </p>

                <strong>
                  {data.weather
                    ?.relative_humidity_2m ??
                    "—"}%
                </strong>

              </div>


              <div>

                <span>🌧️</span>

                <p>
                  Rainfall
                </p>

                <strong>
                  {data.weather
                    ?.precipitation ??
                    "—"} mm
                </strong>

              </div>


              <div>

                <span>💨</span>

                <p>
                  Wind
                </p>

                <strong>
                  {data.weather
                    ?.wind_speed_10m ??
                    "—"} km/h
                </strong>

              </div>


              {/* AGRICULTURE */}

              {persona === "agriculture" && (
                <>

                  <div>

                    <span>☀️</span>

                    <p>
                      UV Index
                    </p>

                    <strong>
                      {data.weather
                        ?.uv_index ??
                        "—"}
                    </strong>

                  </div>


                  <div>

                    <span>🌱</span>

                    <p>
                      Soil Moisture
                    </p>

                    <strong>

                      {data.hourly
                        ?.soil_moisture_0_to_7cm?.[0] != null
                        ? `${(
                            data.hourly
                              .soil_moisture_0_to_7cm[0] *
                            100
                          ).toFixed(1)}%`
                        : "—"}

                    </strong>

                  </div>


                  <div>

                    <span>🌡️</span>

                    <p>
                      Soil Temperature
                    </p>

                    <strong>

                      {data.hourly
                        ?.soil_temperature_0cm?.[0] != null
                        ? `${data.hourly
                            .soil_temperature_0cm[0]}°C`
                        : "—"}

                    </strong>

                  </div>

                </>
              )}

            </div>

          </section>


          {/* PERSONALIZED INSIGHTS */}

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


            {data.insights &&
            data.insights.length > 0 ? (

              data.insights.map(
                (insight, index) => (

                  <div
                    className={`insight-card ${
                      insight.priority || ""
                    }`}
                    key={index}
                  >

                    <div className="insight-icon">

                      {getInsightIcon(
                        insight.type
                      )}

                    </div>

                    <div>

                      <h3>
                        {insight.title}
                      </h3>

                      <p>
                        {insight.message}
                      </p>

                    </div>

                  </div>

                )
              )

            ) : (

              <div className="insight-card normal">

                <div className="insight-icon">
                  ✅
                </div>

                <div>

                  <h3>
                    Weather looks good
                  </h3>

                  <p>
                    No major weather alerts
                    for your selected profile.
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

                  const hour =
                    new Date(
                      time
                    ).toLocaleTimeString(
                      [],
                      {
                        hour: "numeric",
                        minute: "2-digit",
                      }
                    );


                  const rainProbability =
                    data.hourly
                      ?.precipitation_probability
                      ?.[index] ?? 0;


                  const temperature =
                    data.hourly
                      ?.temperature_2m
                      ?.[index];


                  const soilMoisture =
                    data.hourly
                      ?.soil_moisture_0_to_7cm
                      ?.[index];


                  return (

                    <div
                      className="hour-card"
                      key={time}
                    >

                      <strong>
                        {hour}
                      </strong>


                      <div className="hour-icon">

                        {rainProbability >= 60
                          ? "🌧️"
                          : rainProbability >= 30
                          ? "🌦️"
                          : "☀️"}

                      </div>


                      {temperature != null && (

                        <span>
                          🌡️{" "}
                          {temperature}°C
                        </span>

                      )}


                      <span>
                        🌧️{" "}
                        {rainProbability}%
                      </span>


                      {persona === "agriculture" &&
                        soilMoisture != null && (

                          <span>
                            🌱{" "}
                            {(
                              soilMoisture * 100
                            ).toFixed(1)}
                            %
                          </span>

                        )}

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
            Please check your internet
            connection and try again.
          </small>

        </div>

      )}

    </div>
  );
}

export default App;
```
