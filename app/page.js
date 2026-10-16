
"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import AirQuality from "./components/AirQuality";
import TemperatureChart from "./components/TemperatureChart";
import WeatherAdvice from "./components/WeatherAdvice";

const WeatherMap = dynamic(
  () => import("./components/WeatherMap"),
  {
    ssr: false,
    loading: () => (
      <p className="my-6 rounded-xl p-4">
        Loading weather map...
      </p>
    ),
  }
);

const DEFAULT_CITY = {
  name: "Dhaka",
  admin1: "Dhaka",
  country: "Bangladesh",
  latitude: 23.8103,
  longitude: 90.4125,
};

const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

function weatherEmoji(code) {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";

  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return "🌧️";
  }

  if ([71, 73, 75].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";

  return "🌡️";
}

export default function Home() {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);

  const [theme, setTheme] = useState("light");
  const [favorites, setFavorites] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Current location loading state
  const [locationLoading, setLocationLoading] = useState(false);

  // Load saved theme and favorite cities
  useEffect(() => {
    setMounted(true);

    try {
      const savedTheme = localStorage.getItem("weather-theme");
      const savedFavorites = localStorage.getItem("weather-favorites");

      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
      }

      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites);

        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch {
      console.warn("Could not load saved weather preferences.");
    }
  }, []);

  // Save theme and favorite cities
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("weather-theme", theme);
        localStorage.setItem(
          "weather-favorites",
          JSON.stringify(favorites)
        );
      } catch {
        console.warn("Could not save weather preferences.");
      }
    }
  }, [theme, favorites, mounted]);

  // Fetch weather for selected coordinates
  const fetchWeather = useCallback(async () => {
    if (!city) return;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        latitude: String(city.latitude),
        longitude: String(city.longitude),
        current:
          "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,surface_pressure",
        hourly:
          "temperature_2m,relative_humidity_2m,precipitation_probability,weather_code",
        daily:
          "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max",
        timezone: "auto",
        forecast_days: "7",
      });

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?${params}`
      );

      if (!response.ok) {
        throw new Error("Weather data could not be loaded.");
      }

      const data = await response.json();
      setWeather(data);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError(err.message || "Something went wrong.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Search cities using Open-Meteo Geocoding API
  async function handleSearch(event) {
    event.preventDefault();

    const query = search.trim();

    if (!query) return;

    setSearching(true);
    setError("");
    setSuggestions([]);

    try {
      const params = new URLSearchParams({
        name: query,
        count: "8",
        language: "en",
        format: "json",
      });

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?${params}`
      );

      if (!response.ok) {
        throw new Error("City search failed.");
      }

      const data = await response.json();
      setSuggestions(data.results || []);

      if (!data.results?.length) {
        setError("No matching city found. Try another name.");
      }
    } catch (err) {
      console.error("City search error:", err);
      setError(err.message || "Unable to search for this city.");
    } finally {
      setSearching(false);
    }
  }

  // Select a city from search results
  function selectCity(result) {
    setCity({
      name: result.name,
      admin1: result.admin1 || "",
      country: result.country || "",
      latitude: result.latitude,
      longitude: result.longitude,
    });

    setSearch("");
    setSuggestions([]);
    setError("");
  }

  // Reverse geocoding: coordinates to a readable location name
  const handleMapLocationSelect = useCallback(
    async ({ latitude, longitude }) => {
      const fallbackCity = {
        name: `Selected Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
        admin1: "",
        country: "",
        latitude,
        longitude,
      };

      // Update coordinates immediately so weather fetching can begin
      setCity(fallbackCity);
      setSearch("");
      setSuggestions([]);
      setError("");

      try {
        const params = new URLSearchParams({
          format: "jsonv2",
          lat: String(latitude),
          lon: String(longitude),
          zoom: "10",
          addressdetails: "1",
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?${params}`
        );

        if (!response.ok) {
          throw new Error("Could not find the location name.");
        }

        const data = await response.json();
        const address = data.address || {};

        const locationName =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          address.county ||
          address.state ||
          data.name;

        if (locationName) {
          setCity((previous) => {
            // Ignore a stale response if another location was selected
            if (
              previous.latitude !== latitude ||
              previous.longitude !== longitude
            ) {
              return previous;
            }

            return {
              ...previous,
              name: locationName,
              admin1: address.state || "",
              country: address.country || "",
            };
          });
        }
      } catch (err) {
        console.warn("Reverse geocoding failed:", err);
        // The coordinate-based fallback name remains available
      }
    },
    []
  );

  // Use the browser to get the current location
  function handleUseMyLocation() {
    console.log("Use My Location button clicked");

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      setError("Your browser does not support geolocation.");
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log("Location received:", position.coords);

        try {
          await handleMapLocationSelect({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        } catch (err) {
          console.error("Location update failed:", err);
          setError("Could not update weather for your location.");
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err.code, err.message);

        const messages = {
          1: "Location permission denied. Allow location access in Chrome.",
          2: "Location unavailable. Check your device location settings.",
          3: "Location request timed out. Please try again.",
        };

        setError(
          messages[err.code] || `Location error: ${err.message}`
        );

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 60000,
      }
    );
  }

  // Add or remove a favorite city
  function toggleFavorite() {
    const alreadySaved = favorites.some(
      (item) =>
        item.latitude === city.latitude &&
        item.longitude === city.longitude
    );

    if (alreadySaved) {
      setFavorites((previous) =>
        previous.filter(
          (item) =>
            !(
              item.latitude === city.latitude &&
              item.longitude === city.longitude
            )
        )
      );
    } else {
      setFavorites((previous) => [...previous, city]);
    }
  }

  const isFavorite = favorites.some(
    (item) =>
      item.latitude === city.latitude &&
      item.longitude === city.longitude
  );

  const current = weather?.current;
  const hourly = weather?.hourly;
  const daily = weather?.daily;

  const currentHourIndex = hourly?.time?.findIndex(
    (time) => time === current?.time
  );

  const startIndex =
    currentHourIndex != null && currentHourIndex >= 0
      ? currentHourIndex
      : Math.max(
          0,
          hourly?.time?.findIndex(
            (time) => time > (current?.time || "")
          ) ?? 0
        );

  const hourlyItems = hourly
    ? hourly.time.slice(startIndex, startIndex + 24).map((time, index) => {
        const i = startIndex + index;

        return {
          time,
          temperature: hourly.temperature_2m[i],
          humidity: hourly.relative_humidity_2m[i],
          precipitation: hourly.precipitation_probability[i],
          code: hourly.weather_code[i],
        };
      })
    : [];

  const dailyItems = daily
    ? daily.time.map((date, index) => ({
        date,
        code: daily.weather_code[index],
        max: daily.temperature_2m_max[index],
        min: daily.temperature_2m_min[index],
        sunrise: daily.sunrise[index],
        sunset: daily.sunset[index],
        uv: daily.uv_index_max[index],
        rain: daily.precipitation_probability_max[index],
      }))
    : [];

  const formatHour = (time) =>
    new Date(time).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

  const formatDay = (date) =>
    new Date(`${date}T12:00:00`).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const formatLocalTime = (dateTime) => {
    if (!dateTime) return "—";

    return dateTime.split("T")[1] || dateTime;
  };

  if (!mounted) return null;

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gray-950 text-white"
          : "bg-sky-50 text-gray-900"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">
              🌦️ Weather App
            </h1>

            <p
              className={`mt-1 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Weather, forecasts and air quality in one place
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setTheme((previous) =>
                previous === "light" ? "dark" : "light"
              )
            }
            className="rounded-full border border-gray-300 px-4 py-2 font-medium dark:border-gray-700"
          >
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </header>

        {/* City search */}
        <section className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search a city, e.g. Dhaka"
              className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 dark:border-gray-700"
            />

            <button
              type="submit"
              disabled={searching}
              className="rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </form>

          {/* Use My Location */}
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locationLoading}
            className="mt-3 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {locationLoading
              ? "📍 Finding your location..."
              : "📍 Use My Location"}
          </button>

          {suggestions.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow dark:border-gray-700">
              {suggestions.map((result) => (
                <button
                  type="button"
                  key={`${result.id}-${result.latitude}-${result.longitude}`}
                  onClick={() => selectCity(result)}
                  className="block w-full border-b border-gray-100 px-4 py-3 text-left last:border-b-0 hover:bg-sky-50"
                >
                  <span className="font-semibold">{result.name}</span>

                  <span className="ml-2 text-sm text-gray-500">
                    {[result.admin1, result.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl bg-red-100 p-4 text-red-800"
          >
            {error}
          </div>
        )}

        {/* Selected city and current weather */}
        <section className="mb-6 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-sky-100">Current weather</p>
              <h2 className="mt-1 text-3xl font-bold">{city.name}</h2>
              <p className="mt-1 text-sky-100">
                {[city.admin1, city.country].filter(Boolean).join(", ")}
              </p>
            </div>

            <button
              type="button"
              onClick={toggleFavorite}
              className="rounded-full bg-white/20 px-4 py-2 font-semibold hover:bg-white/30"
            >
              {isFavorite ? "★ Saved" : "☆ Add Favorite"}
            </button>
          </div>

          {loading ? (
            <p className="mt-8 animate-pulse">Loading weather...</p>
          ) : current ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <div className="text-6xl">
                  {weatherEmoji(current.weather_code)}
                </div>

                <p className="mt-3 text-5xl font-extrabold">
                  {Math.round(current.temperature_2m)}°C
                </p>

                <p className="mt-2 text-lg">
                  {WEATHER_CODES[current.weather_code] || "Weather"}
                </p>

                <p className="mt-1 text-sky-100">
                  Feels like {Math.round(current.apparent_temperature)}°C
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ["💧 Humidity", `${current.relative_humidity_2m}%`],
                  ["💨 Wind", `${current.wind_speed_10m} km/h`],
                  ["🌧️ Precipitation", `${current.precipitation} mm`],
                  ["🔽 Pressure", `${current.surface_pressure} hPa`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-white/15 p-4 backdrop-blur-sm"
                  >
                    <p className="text-sm text-sky-100">{label}</p>
                    <p className="mt-2 text-xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !loading && (
              <p className="mt-6">
                Weather data is unavailable. Try selecting the city again.
              </p>
            )
          )}
        </section>

        {/* Favorite cities */}
        {favorites.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-bold">⭐ Favorite Cities</h2>

            <div className="flex flex-wrap gap-2">
              {favorites.map((favorite) => (
                <button
                  type="button"
                  key={`${favorite.latitude}-${favorite.longitude}`}
                  onClick={() => {
                    setCity(favorite);
                    setError("");
                  }}
                  className={`rounded-full border px-4 py-2 ${
                    city.latitude === favorite.latitude &&
                    city.longitude === favorite.longitude
                      ? "border-sky-500 bg-sky-100 text-sky-900"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  {favorite.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Air Quality */}
        <AirQuality
          latitude={city.latitude}
          longitude={city.longitude}
          cityName={city.name}
        />

        {/* Weather advice */}
        <WeatherAdvice weather={weather} />

        {/* Interactive Weather Map */}
        <WeatherMap
          latitude={city.latitude}
          longitude={city.longitude}
          cityName={city.name}
          onLocationSelect={handleMapLocationSelect}
        />

        {/* Hourly temperature chart */}
        {hourlyItems.length > 0 && (
          <section className="my-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold">
              📈 Hourly Temperature
            </h2>
            <TemperatureChart data={hourlyItems} />
          </section>
        )}

        {/* Hourly forecast */}
        <section className="my-6">
          <h2 className="mb-4 text-2xl font-bold">🕒 Hourly Forecast</h2>

          {hourlyItems.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-3">
              {hourlyItems.map((item) => (
                <div
                  key={item.time}
                  className="min-w-28 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatHour(item.time)}
                  </p>
                  <p className="my-2 text-2xl">
                    {weatherEmoji(item.code)}
                  </p>
                  <p className="font-bold">
                    {Math.round(item.temperature)}°C
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    💧 {item.humidity}%
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    🌧️ {item.precipitation ?? 0}%
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              Hourly forecast is unavailable.
            </p>
          )}
        </section>

        {/* 7-day forecast */}
        <section className="my-8">
          <h2 className="mb-4 text-2xl font-bold">📅 7-Day Forecast</h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {dailyItems.map((item) => (
              <div
                key={item.date}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <p className="font-semibold">{formatDay(item.date)}</p>
                <p className="my-3 text-3xl">
                  {weatherEmoji(item.code)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {WEATHER_CODES[item.code] || "Weather"}
                </p>
                <p className="mt-2 text-lg font-bold">
                  {Math.round(item.max)}° / {Math.round(item.min)}°
                </p>
                <p className="mt-2 text-sm">
                  🌧️ Rain chance: {item.rain ?? 0}%
                </p>
                <p className="mt-1 text-sm">
                  ☀️ UV Index: {item.uv ?? "—"}
                </p>

                <div className="mt-3 border-t border-gray-200 pt-3 text-sm dark:border-gray-700">
                  <p>🌅 Sunrise: {formatLocalTime(item.sunrise)}</p>
                  <p className="mt-1">
                    🌇 Sunset: {formatLocalTime(item.sunset)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          <p>Weather data provided by Open-Meteo.</p>
          <p className="mt-1">
            Forecasts and air-quality estimates are informational and may
            differ from local observations.
          </p>
        </footer>
      </div>
    </main>
  );
}
