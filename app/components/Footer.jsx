"use client";

import { useEffect, useState } from "react";

export default function Footer() {
  const [year, setYear] = useState("");

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mt-auto bg-gray-900 px-6 py-5 text-center text-white">
      <p>
        © {year || "2026"} Weather App. All Rights Reserved.
      </p>

      <p className="mt-2 text-sm text-gray-400">
        Weather data powered by Open-Meteo
      </p>
    </footer>
  );
}
