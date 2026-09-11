const express = require("express");
const cors = require("cors");

const getPersonalizedInsights = require("./personalization/personalization");

const app = express();

app.use(cors());
app.use(express.json());

console.log("🔥 NEW MAUSAM BACKEND VERSION LOADED");


// ------------------------------------
// HOME / TEST ROUTE
// ------------------------------------

app.get("/", (req, res) => {
  res.json({
    message: "MAUSAM Adaptive backend is running!"
  });
});


// ------------------------------------
// BASIC WEATHER API
// ------------------------------------

app.get("/api/weather", async (req, res) => {
  try {
    const latitude = req.query.lat || 28.6139;
    const longitude = req.query.lon || 77.2090;

    const url =
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,uv_index` +
      `&hourly=precipitation_probability,soil_moisture_0_to_7cm,soil_temperature_0cm` +
      `&daily=precipitation_probability_max,sunrise,sunset` +
      `&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API request failed: ${response.status}`);
    }

    const data = await response.json();

    res.json(data);

  } catch (error) {
    console.error("Weather API error:", error);

    res.status(500).json({
      error: "Unable to fetch weather data",
      details: error.message
    });
  }
});


// ------------------------------------
// PERSONALIZED WEATHER API
// ------------------------------------

app.get("/api/personalized", async (req, res) => {
  try {
    const persona = req.query.persona || "commuter";

    const latitude = req.query.lat || 28.6139;
    const longitude = req.query.lon || 77.2090;

    const url =
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,uv_index` +
      `&hourly=precipitation_probability,soil_moisture_0_to_7cm,soil_temperature_0cm` +
      `&daily=precipitation_probability_max,sunrise,sunset` +
      `&timezone=auto`;

    console.log("🌦️ Requesting weather from Open-Meteo...");

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open-Meteo request failed: ${response.status}`);
    }

    const weather = await response.json();

    console.log(`🧠 Generating insights for: ${persona}`);

    const insights = getPersonalizedInsights(
      persona,
      weather
    );

    res.json({
      persona: persona,
      weather: weather.current,
      hourly: weather.hourly,
      daily: weather.daily,
      insights: insights
    });

  } catch (error) {
  console.error("❌ Personalized weather error:", error);

  res.status(500).json({
    error: "Unable to generate personalized weather information",
    details: String(error),
    stack: error.stack
  });
}
});


// ------------------------------------
// START SERVER
// ------------------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
