```javascript
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
// PERSONALIZED WEATHER API
// ------------------------------------
// The frontend gets live weather directly
// from Open-Meteo and sends it here.
//
// This means Render does NOT repeatedly
// call Open-Meteo and avoids Render's
// Open-Meteo rate limit problem.
// ------------------------------------

app.post("/api/personalized", (req, res) => {
  try {

    const persona = req.query.persona || "commuter";

    const weather = req.body;

    // Make sure weather data exists
    if (!weather || !weather.current) {
      return res.status(400).json({
        error: "Weather data was not provided."
      });
    }

    console.log(
      `🧠 Generating insights for: ${persona}`
    );

    // Generate personalized insights
    const insights = getPersonalizedInsights(
      persona,
      weather
    );

    // Send response
    res.json({

      persona: persona,

      weather: weather.current,

      hourly: weather.hourly || {},

      daily: weather.daily || {},

      insights: insights

    });

  } catch (error) {

    console.error(
      "❌ Personalized weather error:",
      error
    );

    res.status(500).json({

      error:
        "Unable to generate personalized weather information",

      details: error.message

    });

  }
});


// ------------------------------------
// START SERVER
// ------------------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `🚀 MAUSAM backend running on port ${PORT}`
  );

});
```
