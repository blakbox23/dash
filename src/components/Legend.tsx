import React from "react"

const legendItems = [
  { label: "Good", range: "0–12", color: "#00e400" },         // Green
  { label: "Moderate", range: "12.2–35.4", color: "#ffff00" },    // Yellow
  { label: "Unhealthy for Sensitive Groups", range: "35.5–55.4", color: "#ff7e00" }, // Orange
  { label: "Unhealthy", range: "55.5–150.4", color: "#ff0000" },  // Red
  { label: "Very Unhealthy", range: "150.5–250.4", color: "#8f3f97" }, // Purple
  { label: "Hazardous", range: "250.5–500.4", color: "#7e0023" },     // Maroon
]

export default function Legend() {
  return (
    <div className=" w-full">
      <div className="flex flex-wrap justify-around gap-4">
        {legendItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center space-x-2 text-sm md:text-base"
          >
            <span
              className="w-5 h-5 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex flex-col">
              <span className="font-light">{item.label}</span>
              <span className="text-xs font-medium text-gray-600">{item.range}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
