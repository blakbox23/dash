"use client";

import { useEffect, useRef } from "react";
import L, { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Station } from "api/maps-api";

type PollutantType = "aqi" | "pm25" | "pm10";

interface MapComponentProps {
  stations: Station[];
  selectedStation: Station | null;
  selectedPollutant: PollutantType;
  onStationSelect: (station: Station | null) => void;
  getPollutantValue: (station: Station, pollutant: PollutantType) => number;
  getPollutantColor: (value: number, pollutant: PollutantType) => string;
  getPollutantLevel: (value: number, pollutant: PollutantType) => string;
}

export default function MapComponent({
  stations,
  selectedStation,
  selectedPollutant,
  onStationSelect,
  getPollutantValue,
  getPollutantColor,
  getPollutantLevel,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const timeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const updateTime = () => {
      if (timeRef.current) {
        timeRef.current.textContent = new Date().toLocaleString("en-KE", {
          timeZone: "Africa/Nairobi",
        });
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Helper to create custom icon
  const createCustomIcon = (
    station: Station,
    isSelected: boolean
  ): L.DivIcon => {
    const value = getPollutantValue(station, selectedPollutant);
    const color = getPollutantColor(value, selectedPollutant);
    return divIcon({
      html: `
        <div style="
          width: 2rem;
          height: 2rem;
          background-color: ${color};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #101828;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.2s;
          ${isSelected ? "transform: scale(1.6); box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.2);" : ""}
        ">
          ${value}
        </div>
      `,
      className: "custom-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  useEffect(() => {
    if (mapRef.current && !leafletMapRef.current) {
      // Initialize map
      leafletMapRef.current = L.map(mapRef.current).setView(
        [-1.2921, 36.8719],
        12
      );

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(leafletMapRef.current);

      markerGroupRef.current = L.layerGroup().addTo(leafletMapRef.current);
    }

    // Clear and add new markers
    if (leafletMapRef.current && markerGroupRef.current) {
      markerGroupRef.current.clearLayers();

      stations.forEach((station) => {
        const marker = L.marker([station.lat, station.lng], {
          icon: createCustomIcon(
            station,
            selectedStation?.id === station.id
          ),
        });

        const value = getPollutantValue(station, selectedPollutant);
        const unit = selectedPollutant === "aqi" ? "" : "μg/m³";
        const timeStamp = station.time
          ? new Date(station.time).toLocaleString()
          : "No timestamp available";

        marker.bindPopup(`
          <div class="p-2">
            <div class="font-semibold text-[#101828]">${station.name}</div>
            <div class="text-xs text-[#667085] mb-1">${timeStamp}</div>
            <div class="text-sm text-[#667085]">
              ${selectedPollutant.toUpperCase()}: ${value}${unit} - ${getPollutantLevel(value, selectedPollutant)}
            </div>
            <div class="mt-2 text-xs text-[#667085]">
              <div>AQI: ${station.aqi}</div>
              <div>PM2.5: ${station.pm25} μg/m³</div>
              <div>PM10: ${station.pm10} μg/m³</div>
            </div>
          </div>
        `);

        marker.on("click", () => onStationSelect(station));
        marker.addTo(markerGroupRef.current!);
      });

      if (selectedStation) {
        leafletMapRef.current.setView(
          [selectedStation.lat, selectedStation.lng],
          13,
          { animate: true }
        );
      }
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [
    stations,
    selectedStation,
    selectedPollutant,
    getPollutantValue,
    getPollutantColor,
    getPollutantLevel,
    onStationSelect,
  ]);

  // Live timestamp 
  return (
    <div className="w-full">
      <div className="flex items-center text-sm text-gray-700 mb-2">
        <span ref={timeRef} className="ml-2 font-medium" />
      </div>
      <div ref={mapRef} style={{ height: "86vh", width: "100%" }} />
    </div>
  );
}
