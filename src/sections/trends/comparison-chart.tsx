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

interface ComparisonChartProps {
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

export default function ComparisonChart({
  stations,
  pollutant,
  pollutantLabel,
  pollutantUnit,
}: ComparisonChartProps) {
  const [stationList, setStationList] = useState<Station[]>([]);

  // two sensor IDs for comparison
  const [sensorId1, setSensorId1] = useState<string>();
  const [sensorId2, setSensorId2] = useState<string>();

  const [start, setStart] = useState(
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  ); // default last 24h
  const [end, setEnd] = useState(
    new Date().toISOString().slice(0, 16)
  );

  const [selectedPollutant, setSelectedPollutant] =
    useState<PollutantType>(pollutant);

  // Data for both sensors
  const [data1, setData1] = useState<HistoricalData[]>([]);
  const [data2, setData2] = useState<HistoricalData[]>([]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const stations = await getStations();
        setStationList(stations);
        if (stations.length >= 2) {
          setSensorId1(stations[0].sensorId);
          setSensorId2(stations[1].sensorId);
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
      if (!sensorId1 || !sensorId2) {
        console.log("Missing sensor IDs:", { sensorId1, sensorId2 });
        return;
      }

      try {
        const formattedStart = formatDateForAPI(start);
        const formattedEnd = formatDateForAPI(end);
        
        console.log("Fetching comparison data with params:", {
          sensorId1,
          sensorId2,
          start: formattedStart,
          end: formattedEnd,
          selectedPollutant
        });

        const [res1, res2] = await Promise.all([
          getAnalyticsTimeSeries(sensorId1, formattedStart, formattedEnd, selectedPollutant),
          getAnalyticsTimeSeries(sensorId2, formattedStart, formattedEnd, selectedPollutant),
        ]);

        console.log("Sensor 1 data:", res1);
        console.log("Sensor 2 data:", res2);

        // Use the data directly without transformation since your API already returns the correct format
        setData1(Array.isArray(res1) ? res1 : []);
        setData2(Array.isArray(res2) ? res2 : []);
      } catch (err) {
        console.error("Error fetching comparison data:", err);
        setData1([]);
        setData2([]);
      } 
    };

    fetchData();
  }, [sensorId1, sensorId2, start, end, selectedPollutant]);

  const currentPollutantOption =
    pollutantOptions.find((p) => p.value === selectedPollutant) ||
    pollutantOptions[0];

  const thresholdValue = THRESHOLD_MAP[selectedPollutant] ?? 0;

  const pollutantSeries = (data: HistoricalData[]) =>
    data.map((item) => ({
      x: new Date(item.timestamp),
      y:
        selectedPollutant === "aqi"
          ? item.aqi
          : selectedPollutant === "pm25"
          ? item.pm25
          : item.pm10,
    }));

  const name1 = stationList.find((s) => s.sensorId === sensorId1)?.name ?? sensorId1 ?? "Sensor 1";
  const name2 = stationList.find((s) => s.sensorId === sensorId2)?.name ?? sensorId2 ?? "Sensor 2";

  // Create threshold data that spans the entire time range
  const allTimestamps = Array.from(
    new Set([
      ...data1.map(item => new Date(item.timestamp).getTime()),
      ...data2.map(item => new Date(item.timestamp).getTime())
    ])
  ).sort();

  const thresholdData = allTimestamps.map(timestamp => ({
    x: timestamp,
    y: thresholdValue
  }));

  const series = [
    {
      name: name1,
      data: pollutantSeries(data1),
    },
    {
      name: name2,
      data: pollutantSeries(data2),
    },
    {
      name: `Threshold (${thresholdValue})`,
      data: thresholdData,
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
      width: [3, 3, 2],
      dashArray: [0, 0, 5],
    },
    colors: [POLLUTANT_COLOR_MAP[selectedPollutant], "red", "#000000"],
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
        const seriesNames = [name1, name2, `Threshold (${thresholdValue})`];
        
        series.forEach((s: number[], index: number) => {
          const value = series[index][dataPointIndex];
          if (value !== null && value !== undefined) {
            const color = w.config.colors[index];
            const isThreshold = index === 2;
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

          {/* Sensor 1 */}
          <FormControl sx={{ minWidth: 180 }}>
            <Select
              value={sensorId1 ?? ""}
              onChange={(e) => setSensorId1(e.target.value)}
              displayEmpty
            >
              {stationList.map((s) => (
                <MenuItem key={s.sensorId} value={s.sensorId}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Sensor 2 */}
          <FormControl sx={{ minWidth: 180 }}>
            <Select
              value={sensorId2 ?? ""}
              onChange={(e) => setSensorId2(e.target.value)}
              displayEmpty
            >
              {stationList.map((s) => (
                <MenuItem key={s.sensorId} value={s.sensorId}>
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