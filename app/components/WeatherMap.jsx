
"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet marker icons in Next.js
const weatherMarkerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Update the map when the selected coordinates change
function MapUpdater({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (
      Number.isFinite(Number(latitude)) &&
      Number.isFinite(Number(longitude))
    ) {
      map.setView(
        [Number(latitude), Number(longitude)],
        map.getZoom()
      );
    }
  }, [map, latitude, longitude]);

  return null;
}

// Detect clicks anywhere on the map
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(event) {
      if (typeof onLocationSelect === "function") {
        onLocationSelect({
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
        });
      }
    },
  });

  return null;
}

export default function WeatherMap({
  latitude,
  longitude,
  cityName = "Selected Location",
  onLocationSelect,
}) {
  const numericLatitude = Number(latitude);
  const numericLongitude = Number(longitude);

  const validCoordinates =
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined &&
    Number.isFinite(numericLatitude) &&
    Number.isFinite(numericLongitude);

  const [selectedPosition, setSelectedPosition] = useState(null);

  // Sync the marker with the location selected in the parent component
  useEffect(() => {
    if (validCoordinates) {
      setSelectedPosition({
        latitude: numericLatitude,
        longitude: numericLongitude,
      });
    }
  }, [numericLatitude, numericLongitude, validCoordinates]);

  if (!validCoordinates) {
    return (
      <section className="my-6 rounded-2xl border p-5">
        <h2 className="text-2xl font-bold">🗺️ Weather Map</h2>
        <p className="mt-3">
          Location coordinates are unavailable.
        </p>
      </section>
    );
  }

  const position = selectedPosition
    ? [selectedPosition.latitude, selectedPosition.longitude]
    : [numericLatitude, numericLongitude];

  function handleMapClick(location) {
    // Move the marker immediately
    setSelectedPosition(location);

    // Send the selected coordinates to page.js
    if (typeof onLocationSelect === "function") {
      onLocationSelect(location);
    }
  }

  return (
    <section className="my-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-2 text-2xl font-bold">
        🗺️ Weather Map
      </h2>

      <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
        Selected location: {cityName}
      </p>

      <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
        Click anywhere on the map to check weather for that location.
      </p>

      <div className="h-[400px] w-full overflow-hidden rounded-xl">
        <MapContainer
          center={position}
          zoom={10}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapUpdater
            latitude={numericLatitude}
            longitude={numericLongitude}
          />

          <MapClickHandler
            onLocationSelect={handleMapClick}
          />

          <Marker
            position={position}
            icon={weatherMarkerIcon}
          >
            <Popup>
              <strong>{cityName}</strong>
              <br />
              Latitude: {position[0].toFixed(4)}
              <br />
              Longitude: {position[1].toFixed(4)}
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        Map data © OpenStreetMap contributors.
      </p>
    </section>
  );
}
