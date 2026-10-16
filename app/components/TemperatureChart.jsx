"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function TemperatureChart({ data, darkMode = false }) {
  if (!data || data.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">
        Temperature chart data is unavailable.
      </p>
    );
  }

  const axisColor = darkMode ? "#cbd5e1" : "#64748b";
  const gridColor = darkMode ? "#334155" : "#e2e8f0";

  return (
    <section
      className={`mt-10 rounded-2xl border p-4 shadow-md sm:p-6 ${
        darkMode
          ? "border-slate-700 bg-slate-900"
          : "border-gray-100 bg-white"
      }`}
    >
      <h3 className="text-xl font-bold sm:text-2xl">
        Hourly Temperature Trend
      </h3>

      <p className="mt-1 text-sm opacity-70">
        Temperature changes over the next 24 hours
      </p>

      <div className="mt-5 h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 12, left: -15, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />

            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: axisColor }}
              tickLine={false}
              axisLine={false}
              minTickGap={20}
            />

            <YAxis
              unit="°C"
              tick={{ fontSize: 12, fill: axisColor }}
              tickLine={false}
              axisLine={false}
              width={55}
              domain={["auto", "auto"]}
            />

            <Tooltip
              formatter={(value) => [`${value}°C`, "Temperature"]}
              labelFormatter={(label) => `Time: ${label}`}
              contentStyle={{
                borderRadius: "12px",
                backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                border: `1px solid ${gridColor}`,
                color: darkMode ? "#ffffff" : "#0f172a",
              }}
            />

            <Line
              type="monotone"
              dataKey="temperature"
              name="Temperature"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-xs opacity-60">
        Source: Open-Meteo hourly forecast
      </p>
    </section>
  );
}