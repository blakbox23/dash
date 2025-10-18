import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Grid,
  Divider,
  Avatar
} from "@mui/material";
import { useParams } from "react-router-dom";
import { DownloadOutlined, WarningOutlined } from "@ant-design/icons";
import { getAlerts } from "api/maps-api";

// dummy fetch function (replace with API call)
const getAlertsSummary = async (stationId: string, start: string, end: string) => {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 150));

  const levels = [
    "Unhealthy for Sensitive Groups",
    "Unhealthy",
    "Very Unhealthy",
    "Hazardous"
  ];

  // total alerts for this query
  const total = Math.floor(Math.random() * 15) + 5; // between 5 and 20

  // distribute alerts randomly across levels
  let remaining = total;
  const breakdown = levels.map((level, idx) => {
    if (idx === levels.length - 1) {
      // assign the remaining to last category
      return { level, count: remaining };
    }
    const count = Math.floor(Math.random() * (remaining + 1));
    remaining -= count;
    return { level, count };
  });

  return { total, breakdown };
};


interface Station {
  id: string;
  name: string;
}

interface AlertsSummaryProps {
  stations: Station[];
}

export default function AlertsSummary({ stations }: AlertsSummaryProps) {
  const { id: sensorId } = useParams<{ id: string }>();

  const [start, setStart] = useState("2025-10-01");
  const [end, setEnd] = useState("2025-10-07");
  const [station, setStation] = useState<Station | null>(stations[0] || null);

  const [summary, setSummary] = useState<{ total: number; breakdown: { level: string; count: number }[] }>({
    total: 0,
    breakdown: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stationId = sensorId ?? station?.id ?? "1";
        const result = await getAlertsSummary(stationId, start, end);
        const realAlerts = await getAlerts();
        setSummary(result);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [sensorId, station, start, end]);

  return (
    <Card sx={{ width: "100%", height: "100%" }}>
      <CardHeader
        title={<Typography variant="h6">Alerts Summary</Typography>}
        action={
          <DownloadOutlined
            style={{ cursor: "pointer", fontSize: 20 }}
            onClick={() => {
              // create a simple CSV string from summary
              const headers = ["Level", "Count"];
              const rows = summary.breakdown.map(
                (item) => `${item.level},${item.count}`
              );
              const csvContent =
                [headers.join(","), ...rows, `Total,${summary.total}`].join("\n");
    
              // create a blob and trigger download
              const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute(
                "download",
                `alerts_summary_${station?.name ?? sensorId}_${start}_to_${end}.csv`
              );
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          />
        }
      
      />
      <CardContent>
        {/* Filters */}
        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
      

          {/* Start Date */}
          <TextField
            type="date"
            label="Start"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          {/* End Date */}
          <TextField
            type="date"
            label="End"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
              {/* Station Selector */}
              {!sensorId && (
            <FormControl sx={{ minWidth: 180 }}>
              <Select
                value={station?.id ?? ""}
                onChange={(e) => {
                  const selected =
                    stations.find((s) => s.id === e.target.value) || null;
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
          )}
        </Box>

        {/* Summary */}
        <Typography variant="h4" gutterBottom>
          {summary.total} Alerts
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Breakdown */}
        <Grid container spacing={1}>
          {summary.breakdown.map((item, idx) => (
            <Grid item xs={12} key={idx}>
              <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar alt="User 1" color="error">
                {/* <DownloadOutlined /> */}
                <WarningOutlined />
              </Avatar>
            </Grid>
            <Grid item xs zeroMinWidth>
              <Typography align="left" variant="subtitle1">
               {item.level}
              </Typography>
              {/* <Typography align="left" variant="caption" color="secondary">
                2 August
              </Typography> */}
            </Grid>
            <Grid item>
              {/* <LinkOutlined style={iconSX} /> */}
              {item.count}
            </Grid>
          </Grid>

            </Grid>
          ))}

        

        
      
        </Grid>
      </CardContent>
    </Card>
  );
}
