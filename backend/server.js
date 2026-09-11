const express = require("express");
const cors = require("cors");

const getPersonalizedInsights = require("./personalization/personalization");

const app = express();

app.use(cors());
app.use(express.json());

console.log("MAUSAM BACKEND VERSION LOADED");

// HOME / TEST
app.get("/", (req, res) => {
  res.json({
    message: "MAUSAM Adaptive backend is running!"
  });
});

// PERSONALIZED WEATHER API
app.post("/api/personalized", (req, res) => {
  try {
    const persona = req.query.persona || "commuter";
    const weather = req.body;

    if (!weather || !weather.current) {
      return res.status(400).json({
        error: "Weather data was not provided."
      });
    }

    console.log("Generating insights for:", persona);

    const insights = getPersonalizedInsights(
      persona,
      weather
    );

    res.json({
      persona: persona,
      weather: weather.current,
      hourly: weather.hourly || {},
      daily: weather.daily || {},
      insights: insights
    });
  } catch (error) {
    console.error(
      "Personalized weather error:",
      error
    );

    res.status(500).json({
      error: "Unable to generate personalized weather information",
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    "MAUSAM backend running on port",
    PORT
  );
});
