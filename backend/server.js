const express = require("express");

console.log("🔥 NEW MAUSAM BACKEND VERSION LOADED");

const cors = require("cors");

const getPersonalizedInsights = require("./personalization/personalization");

const app = express();

app.use(cors());

app.use(express.json());


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

      throw new Error("Weather API request failed");

    }

    const data = await response.json();

    res.json(data);

  } catch (error) {

    console.error("Weather API error:", error);

    res.status(500).json({

      error: "Unable to fetch weather data"

    });

  }

});


// ------------------------------------
// PERSONALIZED WEATHER API
// ------------------------------------

app.get("/api/personalized", async (req, res) => {

  try {

    // Get persona from frontend
    const persona = req.query.persona || "commuter";

    // Get location from frontend
    // Default = Delhi
    const latitude = req.query.lat || 28.6139;

    const longitude = req.query.lon || 77.2090;


    // --------------------------------
    // OPEN-METEO REQUEST
    // --------------------------------

    const url =
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${latitude}` +
      `&longitude=${longitude}` +

      // Current weather
      `&current=` +
      `temperature_2m,` +
      `relative_humidity_2m,` +
      `precipitation,` +
      `wind_speed_10m,` +
      `uv_index` +

      // Hourly weather
      `&hourly=` +
      `precipitation_probability,` +
      `soil_moisture_0_to_7cm,` +
      `soil_temperature_0cm` +

      // Daily weather
      `&daily=` +
      `precipitation_probability_max,` +
      `sunrise,` +
      `sunset` +

      // Automatically use local timezone
      `&timezone=auto`;


    // --------------------------------
    // FETCH WEATHER DATA
    // --------------------------------

    const response = await fetch(url);

    if (!response.ok) {

      throw new Error("Weather API request failed");

    }

    const weather = await response.json();


    // --------------------------------
    // GENERATE PERSONALIZED INSIGHTS
    // --------------------------------

    const insights = getPersonalizedInsights(
      persona,
      weather
    );


    // --------------------------------
    // SEND DATA TO FRONTEND
    // --------------------------------

    res.json({

      // Selected persona
      persona: persona,

      // Current weather
      weather: weather.current,

      // Hourly forecast
      hourly: weather.hourly,

      // Daily forecast
      daily: weather.daily,

      // Personalized recommendations
      insights: insights

    });

  } catch (error) {

  console.error("Personalized weather error:", error);

  res.status(500).json({
    error: "Unable to generate personalized weather information",
    details: error.message
  });

}

// ------------------------------------
// START SERVER
// ------------------------------------

const PORT = 5000;

app.listen(PORT, () => {

  console.log(`Backend running on http://localhost:${PORT}`);

});
