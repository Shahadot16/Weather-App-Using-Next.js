
"use client";

import { useEffect, useState } from "react";

export default function AirQuality({
  latitude,
  longitude,
  cityName = "Selected City",
}) {
  const [airData, setAirData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (
      latitude == null ||
      longitude == null ||
      !Number.isFinite(Number(latitude)) ||
      !Number.isFinite(Number(longitude))
    ) {
      setAirData(null);
      setError("Valid city coordinates are not available.");
      return;
    }

    const controller = new AbortController();

    async function fetchAirQuality() {
      setLoading(true);
      setError("");
      setAirData(null);

      try {
        const params = new URLSearchParams({
          latitude: String(latitude),
          longitude: String(longitude),
          current:
            "us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,carbon_monoxide,uv_index",
          timezone: "auto",
        });

        const response = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load air quality data.");
        }

        const data = await response.json();

        if (!data.current) {
          throw new Error("Air quality data is unavailable.");
        }

        setAirData(data.current);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Something went wrong while loading air quality."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchAirQuality();

    return () => controller.abort();
  }, [latitude, longitude]);

  function getAQIInfo(aqi) {
    if (aqi == null || !Number.isFinite(Number(aqi))) {
      return {
        label: "Unavailable",
        advice: "Current AQI information is not available.",
        color: "text-gray-600",
        bg: "bg-gray-100",
      };
    }

    if (aqi <= 50) {
      return {
        label: "Good",
        advice:
          "Air quality is generally satisfactory. Most people can enjoy outdoor activities.",
        color: "text-green-700",
        bg: "bg-green-100",
      };
    }

    if (aqi <= 100) {
      return {
        label: "Moderate",
        advice:
          "Air quality is generally acceptable. Unusually sensitive people may wish to limit prolonged, intense outdoor activity.",
        color: "text-yellow-800",
        bg: "bg-yellow-100",
      };
    }

    if (aqi <= 150) {
      return {
        label: "Unhealthy for Sensitive Groups",
        advice:
          "Sensitive people, including some people with asthma or heart/lung conditions, should consider reducing prolonged outdoor exertion.",
        color: "text-orange-800",
        bg: "bg-orange-100",
      };
    }

    if (aqi <= 200) {
      return {
        label: "Unhealthy",
        advice:
          "Consider reducing prolonged outdoor activity. Sensitive people should take extra care.",
        color: "text-red-700",
        bg: "bg-red-100",
      };
    }

    if (aqi <= 300) {
      return {
        label: "Very Unhealthy",
        advice:
          "Avoid prolonged outdoor exertion and follow local air-quality guidance.",
        color: "text-purple-800",
        bg: "bg-purple-100",
      };
    }

    return {
      label: "Hazardous",
      advice:
        "Avoid outdoor exertion as much as possible and follow local public-health guidance.",
      color: "text-red-900",
      bg: "bg-red-200",
    };
  }

  const aqiInfo = getAQIInfo(airData?.us_aqi);

  const pollutants = [
    {
      name: "PM2.5",
      value: airData?.pm2_5,
      unit: "µg/m³",
      description: "Fine particles",
    },
    {
      name: "PM10",
      value: airData?.pm10,
      unit: "µg/m³",
      description: "Coarse particles",
    },
    {
      name: "Ozone (O₃)",
      value: airData?.ozone,
      unit: "µg/m³",
      description: "Ground-level ozone",
    },
    {
      name: "Nitrogen Dioxide (NO₂)",
      value: airData?.nitrogen_dioxide,
      unit: "µg/m³",
      description: "Traffic-related pollutant",
    },
    {
      name: "Carbon Monoxide (CO)",
      value: airData?.carbon_monoxide,
      unit: "µg/m³",
      description: "Combustion-related gas",
    },
    {
      name: "UV Index",
      value: airData?.uv_index,
      unit: "",
      description: "Sun exposure indicator",
    },
  ];

  return (
    <section className="my-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🌫️ Air Quality & Health
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Current air conditions for {cityName}
        </p>
      </div>

      {loading && (
        <p className="py-6 text-center text-gray-600 dark:text-gray-300">
          Loading air quality data...
        </p>
      )}

      {error && !loading && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </div>
      )}

      {airData && !loading && (
        <>
          <div className={`rounded-xl p-5 ${aqiInfo.bg}`}>
            <p className="text-sm font-medium text-gray-700">
              United States Air Quality Index (US AQI)
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className={`text-5xl font-extrabold ${aqiInfo.color}`}>
                {airData.us_aqi ?? "—"}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-sm font-bold ${aqiInfo.color}`}
              >
                {aqiInfo.label}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-800">
              {aqiInfo.advice}
            </p>
          </div>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-900 dark:text-white">
            Pollutants & UV
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pollutants.map((item) => (
              <div
                key={item.name}
                className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.name}
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {item.value == null
                    ? "—"
                    : `${Number(item.value).toFixed(1)} ${item.unit}`}
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs leading-5 text-gray-500 dark:text-gray-400">
            Data source: Open-Meteo Air Quality API. Values are model-based
            estimates/forecasts and may differ from local monitoring stations.
            This general information is not a medical diagnosis.
          </p>
        </>
      )}
    </section>
  );
}
