
"use client";

export default function WeatherAdvice({ weather }) {
  if (!weather) return null;

  const temperature = weather.current?.temperature_2m;
  const windSpeed = weather.current?.wind_speed_10m;
  const precipitation =
    weather.hourly?.precipitation_probability;

  const advice = [];

  if (temperature >= 35) {
    advice.push({
      icon: "🌡️",
      title: "High Temperature",
      message:
        "Drink plenty of water and avoid prolonged exposure to direct sunlight.",
    });
  }

  if (windSpeed >= 40) {
    advice.push({
      icon: "💨",
      title: "Strong Wind",
      message:
        "Be careful outdoors because strong winds may affect travel and outdoor activities.",
    });
  }

  if (
    Array.isArray(precipitation) &&
    precipitation.some((value) => value >= 60)
  ) {
    advice.push({
      icon: "🌧️",
      title: "Rain Possible",
      message:
        "Rain may occur during the forecast period. Consider carrying an umbrella.",
    });
  }

  if (advice.length === 0) {
    advice.push({
      icon: "🌤️",
      title: "Weather Looks Good",
      message:
        "No extreme conditions detected by these simple rules. Check the hourly forecast before going out.",
    });
  }

  return (
    <section className="my-6 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
      <h2 className="mb-4 text-xl font-bold">
        🧭 Weather Advice
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {advice.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-sky-100 bg-white p-4 dark:border-slate-600 dark:bg-slate-700"
          >
            <h3 className="mb-2 font-semibold">
              {item.icon} {item.title}
            </h3>

            <p className="text-sm leading-6">
              {item.message}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
