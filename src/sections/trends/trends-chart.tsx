"use client";

import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  Box,
} from "@mui/material";

import { getHistoricalData, HistoricalData, Station } from "api/maps-api";
import { CheckOutlined, DownOutlined } from "@ant-design/icons";


type PollutantType = "aqi" | "pm25" | "pm10";

interface PollutantOption {
  value: PollutantType;
  label: string;
  unit: string;
}

interface TrendsChartProps {
  stations: Station[];
  pollutant: PollutantType;
  pollutantLabel: string;
  pollutantUnit: string;
}

const DURATIONS = [3, 6, 12, 24, 48, 72];

const POLLUTANT_COLOR_MAP: Record<PollutantType, string> = {
  aqi: "#3b82f6",
  pm25: "#ef4444",
  pm10: "#f59e0b",
};

// Example threshold values
const THRESHOLD_MAP: Record<PollutantType, number> = {
  aqi: 100,
  pm25: 25,
  pm10: 50,
};

const pollutantOptions: PollutantOption[] = [
  { value: "aqi", label: "AQI", unit: "" },
  { value: "pm25", label: "PM 2.5", unit: "μg/m³" },
  { value: "pm10", label: "PM 10", unit: "μg/m³" },
];

export default function TrendsChart({
  stations,
  pollutant,
  pollutantLabel,
  pollutantUnit,
}: TrendsChartProps) {
  const [duration, setDuration] = useState(12);
  const [trendsStation, setTrendsStation] = useState<Station | null>(
    stations[0] || null
  );
  const [selectedPollutant, setSelectedPollutant] =
    useState<PollutantType>(pollutant);

  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stationId = trendsStation?.id ?? "1";
        const historyData = await getHistoricalData(stationId, duration);
        setHistoricalData(Array.isArray(historyData) ? historyData : []);
      } catch (err) {
        console.error(err);
        setHistoricalData([]);
      }
    };
    fetchData();
  }, [trendsStation, duration, selectedPollutant]);

  const currentPollutantOption =
    pollutantOptions.find((p) => p.value === selectedPollutant) ||
    pollutantOptions[0];

  const thresholdValue = THRESHOLD_MAP[selectedPollutant] ?? 0;

  const labels = historicalData.slice(-duration).map((item) =>
    new Date(item.timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  const pollutantSeries = historicalData.slice(-duration).map((item) => {
    if (selectedPollutant === "aqi") return item.aqi;
    if (selectedPollutant === "pm25") return item.pm25;
    return item.pm10;
  });

  const series = [
    {
      name: `${currentPollutantOption.label}${
        currentPollutantOption.unit ? ` (${currentPollutantOption.unit})` : ""
      }`,
      data: pollutantSeries,
    },
    {
      name: `Threshold (${thresholdValue})`,
      data: Array(pollutantSeries.length).fill(thresholdValue),
    },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "line",
      height: 400,
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: [3, 2],
      dashArray: [0, 5],
    },
    colors: [POLLUTANT_COLOR_MAP[selectedPollutant], "red"],
    markers: { size: 0 },
    xaxis: {
      categories: labels,
      title: { text: "Time" },
    },
    yaxis: {
      title: {
        text: `${currentPollutantOption.label}${
          currentPollutantOption.unit ? ` (${currentPollutantOption.unit})` : ""
        }`,
      },
      min: 0,
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
  };

  return (
    <Card sx={{ width: "100%" }}>
      <CardHeader
        title={
          <Typography variant="h6">Air Quality Trends in Nairobi</Typography>
        }
      />
      <CardContent>
        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
          {/* Duration */}
          <FormControl sx={{ minWidth: 150 }}>
            <Select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              displayEmpty
            >
              {DURATIONS.map((d) => (
                <MenuItem key={d} value={d}>
                  Last {d} hours
                </MenuItem>
              ))}
            </Select>
          </FormControl>


          {/* Pollutant */}
          <FormControl sx={{ minWidth: 140 }}>
            <Select
              value={selectedPollutant}
              onChange={(e) =>
                setSelectedPollutant(e.target.value as PollutantType)
              }
              
            >
              {pollutantOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                  {selectedPollutant === opt.value && (
                    <CheckOutlined />
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

                  {/* Station */}
                  <FormControl sx={{ minWidth: 180 }}>
            <Select
              value={trendsStation?.id ?? ""}
              onChange={(e) => {
                const selected =
                  stations.find((s) => s.id === e.target.value) || null;
                setTrendsStation(selected);
              }}
              displayEmpty
            >
              {stations.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Chart */}
        <ReactApexChart
          options={options}
          series={series}
          type="line"
          height={400}
        />
      </CardContent>
      <CardActions></CardActions>
    </Card>
  );
}
