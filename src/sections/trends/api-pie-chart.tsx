import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useTheme } from "@mui/material/styles";
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { DistributionItem, getAqiDistribution, Station } from "api/maps-api";
import { DownloadOutlined } from "@ant-design/icons";

// Minimal Station type for this example

// Dummy API (replace with real API call)


// color map for categories (fallback will use theme.primary)
const AQI_COLORS: Record<string, string> = {
  Good: "#10b981",
  Moderate: "#facc15",
  "Unhealthy for Sensitive Groups": "#f97316",
  Unhealthy: "#ef4444",
  "Very Unhealthy": "#8b5cf6",
  Hazardous: "#6b7280",
};

const defaultOptions: ApexCharts.ApexOptions = {
  chart: { type: "donut", toolbar: { show: false } },
  labels: [],
  colors: [],
  legend: { position: "bottom" },
  tooltip: {
    y: {
      formatter: (val: number) => `${val}%`,
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: "60%",
      },
    },
  },
};

export default function AqiDistributionPieChart({
  stations,
}: {
  stations: Station[];
}) {
  const theme = useTheme();

  console.log(`stations at pie chart ${stations[0]}`)

  const [start, setStart] = useState(
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 16));
  const [station, setStation] = useState<Station | null>(stations[0] ?? null);

  const [options, setOptions] = useState<ApexCharts.ApexOptions>(defaultOptions);
  const [series, setSeries] = useState<number[]>([]);

  const [distribution, setDistribution] = useState<DistributionItem[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      if (!station || !start || !end) return;
      console.log(`station at api pie chart ${station}`)
      try {
        const res = await getAqiDistribution(station.sensorId, start, end);
        const labels = res.distribution.map((d) => d.category);
        const values = res.distribution.map((d) => d.value);

        setDistribution(res.distribution)

        const colors = labels.map(
          (lab) => AQI_COLORS[lab] ?? (theme.palette.primary.main as string)
        );

        // update options & series
        setOptions((prev) => ({
          ...prev,
          labels,
          colors,
        }));
        setSeries(values);
      } catch (err) {
        console.error("AQI distribution fetch failed", err);
        setOptions((prev) => ({ ...prev, labels: [], colors: [] }));
        setSeries([]);
      }
    };

    fetchData();
  }, [station, start, end, theme.palette.primary.main]);

  return (
    <Card sx={{ width: "100%" }}>
  <CardHeader
    title={<Typography variant="h6">AQI Distribution</Typography>}
    action={
      <DownloadOutlined
      style={{ cursor: "pointer", fontSize: 20 }}
      onClick={() => {
        if (!distribution || distribution.length === 0) return;
    
        const total = distribution.reduce((sum, item) => sum + item.value, 0);
    
        const headers = ["Category", "Percentage"];
        const rows = distribution.map((item) => {
          const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
          return `${item.category},${percent}%`;
        });
    
        const csvContent = [headers.join(","), ...rows].join("\n");
    
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `aqi_distribution_${station?.name ?? station?.id ?? "station"}_${start}_to_${end}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}
    />
    
    }
  />
  <CardContent>
    <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
      <TextField
        label="Start"
        type="datetime-local"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="End"
        type="datetime-local"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <FormControl sx={{ minWidth: 180 }}>
        <Select
          value={station?.id ?? ""}
          onChange={(e) => {
            const selected = stations.find((s) => s.id === e.target.value) ?? null;
            setStation(selected);
          }}
        >
          {stations.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>

    <ReactApexChart options={options} series={series} type="donut" height={320} />
  </CardContent>
</Card>

  );
}
