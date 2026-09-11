function getPersonalizedInsights(persona, weather) {
  const insights = [];

  const current = weather.current || {};
  const hourly = weather.hourly || {};

  const temperature = current.temperature_2m;
  const precipitation = current.precipitation;
  const wind = current.wind_speed_10m;
  const uv = current.uv_index;

  const rainProbability =
    hourly.precipitation_probability?.[0] ?? 0;

  const soilMoisture =
    hourly.soil_moisture_0_to_7cm?.[0] ?? null;

  if (persona === "agriculture") {

    if (precipitation > 0) {
      insights.push({
        type: "rain",
        priority: "high",
        title: "Rain detected",
        message:
          "Rain is occurring. Consider reviewing your irrigation schedule."
      });

    } else if (rainProbability >= 60) {
      insights.push({
        type: "rain",
        priority: "high",
        title: "Rain expected",
        message:
          `There is a ${rainProbability}% chance of rain soon. Consider delaying irrigation.`
      });
    }

    if (
      soilMoisture !== null &&
      soilMoisture < 0.20
    ) {
      insights.push({
        type: "irrigation",
        priority: "high",
        title: "Low soil moisture",
        message:
          "Soil moisture appears low. Consider checking your crops and irrigation needs."
      });

    } else if (
      soilMoisture !== null &&
      soilMoisture > 0.40
    ) {
      insights.push({
        type: "irrigation",
        priority: "medium",
        title: "Soil is well hydrated",
        message:
          "Soil moisture is relatively high. Avoid unnecessary watering."
      });
    }

    if (temperature >= 35) {
      insights.push({
        type: "heat",
        priority: "high",
        title: "High temperature",
        message:
          "High temperatures may stress plants. Monitor soil moisture and provide appropriate irrigation."
      });
    }

    if (wind >= 30) {
      insights.push({
        type: "wind",
        priority: "medium",
        title: "Strong winds",
        message:
          "Strong winds may affect plants and young crops. Check supports and exposed areas."
      });
    }

    if (uv >= 8) {
      insights.push({
        type: "uv",
        priority: "medium",
        title: "High UV levels",
        message:
          "Strong sunlight is expected. Monitor plants for heat and sun stress."
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: "good",
        priority: "low",
        title: "Favorable conditions",
        message:
          "Current weather conditions look relatively favorable for your garden and crops."
      });
    }

  } else if (persona === "commuter") {

    if (
      precipitation > 0 ||
      rainProbability >= 60
    ) {
      insights.push({
        type: "rain",
        priority: "high",
        title: "Rain expected",
        message:
          "Rain may affect your commute. Consider carrying rain protection."
      });
    }

    if (wind >= 30) {
      insights.push({
        type: "wind",
        priority: "medium",
        title: "Strong winds",
        message:
          "Strong winds may make your commute more difficult. Travel carefully."
      });
    }

    if (temperature >= 35) {
      insights.push({
        type: "heat",
        priority: "medium",
        title: "Hot conditions",
        message:
          "High temperatures are expected. Stay hydrated during your commute."
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: "good",
        priority: "low",
        title: "Good travel conditions",
        message:
          "Current weather conditions look favorable for your commute."
      });
    }

  } else if (persona === "traveller") {

    if (
      precipitation > 0 ||
      rainProbability >= 60
    ) {
      insights.push({
        type: "rain",
        priority: "high",
        title: "Rain expected",
        message:
          "Rain may affect your plans. Consider carrying an umbrella or rain protection."
      });
    }

    if (temperature >= 35) {
      insights.push({
        type: "heat",
        priority: "medium",
        title: "Hot weather",
        message:
          "High temperatures are expected. Carry water and plan outdoor activities accordingly."
      });
    }

    if (wind >= 30) {
      insights.push({
        type: "wind",
        priority: "medium",
        title: "Windy conditions",
        message:
          "Strong winds may affect outdoor activities and travel plans."
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: "good",
        priority: "low",
        title: "Good conditions for travel",
        message:
          "The current weather looks relatively favorable for your plans."
      });
    }
  }

  return insights;
}

module.exports = getPersonalizedInsights;
