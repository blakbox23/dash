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

// dummy fetch function (replace with API call)
const getAlertsSummary = async (stationId: string, start: string, end: string) => {
  // Simulated backend response
  return {
    total: 8,
    breakdown: [
        { level: "Unhealthy for Sensitive Groups", count: 4 },
        { level: "Unhealthy", count: 2 },
        { level: "Very Unhealthy", count: 1 },
        { level: "Hazardous", count: 1 }
      ]
      
  };
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
      />
      <CardContent>
        {/* Filters */}
        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
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
