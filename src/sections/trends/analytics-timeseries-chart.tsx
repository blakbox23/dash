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
  Box,
  TextField,
} from "@mui/material";

import { getAnalyticsTimeSeries, getHistoricalData, getStations, HistoricalData, Station } from "api/maps-api";
import { CheckOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";

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

export default function AnalyticsTimeSeries({
  stations,
  pollutant
}: TrendsChartProps) {

  const [sensorId, setSensorId] = useState<string | undefined>(undefined);
  const [start, setStart] = useState(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 16));
  const [trendsStation, setTrendsStation] = useState<Station | null>(stations[0] || null);
  const [selectedPollutant, setSelectedPollutant] = useState<PollutantType>(pollutant);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  const [stationList, setStationList] = useState<Station[]>([]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await getStations();
        setStationList(data);
        // Set initial sensorId when stations are loaded
        if (data.length > 0 && !sensorId) {
          setTrendsStation(data[0]);
          setSensorId(data[0].sensorId);
        }
      } catch (err) {
        console.error("Failed to load stations:", err);
      }
    };
    fetchStations();
  }, []);

  // Format date for API - ensure proper format
  const formatDateForAPI = (dateTimeLocal: string) => {
    // Convert to ISO string and remove milliseconds
    return new Date(dateTimeLocal).toISOString().replace(/\.\d{3}Z$/, 'Z');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!sensorId || !start || !end) {
        console.log("Missing required parameters:", { sensorId, start, end });
        return;
      }
      
      try {
        const formattedStart = formatDateForAPI(start);
        const formattedEnd = formatDateForAPI(end);
        
        console.log("Fetching data with params:", {
          sensorId,
          start: formattedStart,
          end: formattedEnd,
          selectedPollutant
        });

        const historyData = await getAnalyticsTimeSeries(
          sensorId, 
          formattedStart, 
          formattedEnd, 
          selectedPollutant
        );
        
        console.log("Fetched data:", historyData);
        setHistoricalData(Array.isArray(historyData) ? historyData : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setHistoricalData([]);
      }
    };

    fetchData();
  }, [sensorId, start, end, selectedPollutant]);

  const currentPollutantOption =
    pollutantOptions.find((p) => p.value === selectedPollutant) ||
    pollutantOptions[0];

  const thresholdValue = THRESHOLD_MAP[selectedPollutant] ?? 0;

  // Use the same pollutantSeries function as comparison chart
  const pollutantSeries = (data: any[]) =>
    data.map((item) => ({
      x: new Date(item.timestamp),
      y:
        selectedPollutant === "aqi"
          ? item.aqi
          : selectedPollutant === "pm25"
          ? item.pm25
          : item.pm10,
    }));

  const stationName = trendsStation?.name || "Selected Station";

  const series = [
    {
      name: stationName,
      data: pollutantSeries(historicalData),
    },
    {
      name: `Threshold (${thresholdValue})`,
      data: historicalData.map((d) => ({
        x: new Date(d.timestamp),
        y: thresholdValue,
      })),
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
    colors: [POLLUTANT_COLOR_MAP[selectedPollutant], "#000000"],
    markers: { size: 0 },
    xaxis: {
      type: "datetime",
      title: { text: "Time" },
      labels: {
        formatter: function(value: string | number | Date) {
          return new Date(value).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      }
    },
    yaxis: {
      title: {
        text: `${currentPollutantOption.label}${
          currentPollutantOption.unit ? ` (${currentPollutantOption.unit})` : ""
        }`,
      },
      min: 0,
      labels: {
        formatter: function(val: number) {
          return val % 1 === 0 ? val.toString() : val.toFixed(1);
        }
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        // Get the timestamp for this data point
        const timestamp = new Date(w.globals.seriesX[seriesIndex][dataPointIndex]);
        const formattedDate = timestamp.toLocaleString("en-US", {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'long'
        });

        // Build the tooltip HTML
        let tooltipHTML = `<div style="padding: 10px; background: #fff; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">`;
        tooltipHTML += `<div style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px;">${formattedDate}</div>`;
        
        // Add data for each series
        const seriesNames = [stationName, `Threshold (${thresholdValue})`];
        
        series.forEach((s: number[], index: number) => {
          const value = series[index][dataPointIndex];
          if (value !== null && value !== undefined) {
            const color = w.config.colors[index];
            const isThreshold = index === 1;
            const displayValue = isThreshold ? thresholdValue : (value % 1 === 0 ? value.toString() : value.toFixed(1));
            
            tooltipHTML += `
              <div style="display: flex; align-items: center; margin: 4px 0;">
                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${color}; margin-right: 8px; ${isThreshold ? 'border: 2px dashed ' + color + '; background: transparent;' : ''}"></span>
                <span style="font-weight: 600;">${seriesNames[index]}:</span>
                <span style="margin-left: auto; font-weight: bold;">${displayValue}</span>
              </div>
            `;
          }
        });
        
        tooltipHTML += `</div>`;
        return tooltipHTML;
      }
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
  };

  return (
    <Card sx={{ width: "100%" }}>
      <CardContent>
        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
          {/* Start Date */}
          <TextField
            label="Start"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          {/* End Date */}
          <TextField
            label="End"
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

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
                  {selectedPollutant === opt.value && <CheckOutlined />}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Station */}
          <FormControl sx={{ minWidth: 180 }}>
            <Select
              value={trendsStation?.id ?? ""}
              onChange={(e) => {
                const selected = stationList.find((s) => s.id === e.target.value) || null;
                setTrendsStation(selected);
                setSensorId(selected?.sensorId);
              }}
              displayEmpty
            >
              {stationList.map((s) => (
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