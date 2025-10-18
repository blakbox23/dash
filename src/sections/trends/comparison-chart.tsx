
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

import { getAnalyticsTimeSeries,getHistoricalData, HistoricalData, Station } from "api/maps-api";
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

export default function ComparisonChart({
  stations,
  pollutant,
  pollutantLabel,
  pollutantUnit,
}: TrendsChartProps) {

    // two sensor IDs for comparison
  const [sensorId1, setSensorId1] = useState<string | undefined>(
    stations[0]?.sensorId
  );
  const [sensorId2, setSensorId2] = useState<string | undefined>(
    stations[1]?.sensorId
  );

  const [start, setStart] = useState(
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  ); // default last 24h
  const [end, setEnd] = useState(
    new Date().toISOString().slice(0, 16)
  );

  const [trendsStation, setTrendsStation] = useState<Station | null>(
    stations[0] || null
  );
  const [selectedPollutant, setSelectedPollutant] =
    useState<PollutantType>(pollutant);

  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);

  // Data for both sensors
  const [data1, setData1] = useState<HistoricalData[]>([]);
  const [data2, setData2] = useState<HistoricalData[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      if (!start || !end) return;
      try {
        const res1 = await getAnalyticsTimeSeries(
          sensorId1 ?? "",
          start,
          end,
        );
        const res2 = await getAnalyticsTimeSeries(
          sensorId2 ?? "",
          start,
          end,
        );
        setData1(
          Array.isArray(res1)
            ? res1.map((item) => ({
                ...item,
                date: item.timestamp,
                avg_aqi: item.aqi,
                avg_pm25: item.pm25,
                avg_pm10: item.pm10,
              }))
            : []
        );
        setData2(
          Array.isArray(res2)
            ? res2.map((item) => ({
                ...item,
                date: item.timestamp,
                avg_aqi: item.aqi,
                avg_pm25: item.pm25,
                avg_pm10: item.pm10,
              }))
            : []
        );
        // setHistoricalData(Array.isArray(historyData) ? historyData : []);
      } catch (err) {
        console.error(err);
        setData1([]);
        setData2([]);
      }
    };

    fetchData();
  }, [sensorId1, sensorId2, trendsStation, start, end, selectedPollutant]);

  const currentPollutantOption =
    pollutantOptions.find((p) => p.value === selectedPollutant) ||
    pollutantOptions[0];

  const thresholdValue = THRESHOLD_MAP[selectedPollutant] ?? 0;

  const labels = historicalData.map((item) =>
    new Date(item.timeStamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  const pollutantSeries = (data: HistoricalData[]) =>
  data.map((item) => ({
    x: new Date(item.timeStamp),
    y:
      selectedPollutant === "aqi"
        ? item.aqi
        : selectedPollutant === "pm25"
        ? item.pm25
        : item.pm10,
  }));


  const series = [
    {
      name: `${stations.find((s) => s.sensorId === sensorId1)?.name ?? "Sensor 1"}`,
      data: pollutantSeries(data1),
    },
    {
      name: `${stations.find((s) => s.sensorId === sensorId2)?.name ?? "Sensor 2"}`,
      data: pollutantSeries(data2),
    },
    {
      name: `Threshold (${thresholdValue})`,
    data: data1.map((d) => ({
      x: new Date(d.timeStamp),
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
      {/* {!sensorId && (
        <CardHeader
          title={
            <Typography variant="h6">Air Quality Trends in Nairobi</Typography>
          }
        />
      )} */}
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
              {stations.map((s) => (
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
              {stations.map((s) => (
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
