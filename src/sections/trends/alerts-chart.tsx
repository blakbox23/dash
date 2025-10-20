import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { DownloadOutlined, WarningOutlined } from '@ant-design/icons';
import { getAlertsSummary, Station } from 'api/maps-api';

interface AlertsSummaryProps {
  stations: Station[];
}

export default function AlertsSummary({ stations }: AlertsSummaryProps) {

  const [start, setStart] = useState(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 16));
  const [station, setStation] = useState<Station | null>(stations[0] || null);

  const [summary, setSummary] = useState<{ total: number; breakdown: { level: string; count: number }[] }>({
    total: 0,
    breakdown: []
  });

  // Set default station once stations are loaded
   useEffect(() => {
     if (!station && stations.length > 0) {
       setStation(stations[0]);
     }
   }, [stations, start, end]);


  // Fetch alerts summary
  useEffect(() => {
    const fetchData = async () => {
      if (!station || !start || !end) return;

      try {
        const alertsData = await getAlertsSummary(station.sensorId, start, end);
        setSummary(alertsData);
      } catch (err) {
        console.error('Error fetching alerts summary:', err);
      }
    };
    fetchData();
  }, [station, start, end]);

  return (
    <Card sx={{ width: '100%', height: '100%' }}>
      <CardHeader
        title={<Typography variant="h6">Alerts Summary</Typography>}
        action={
          <DownloadOutlined
            style={{ cursor: 'pointer', fontSize: 20 }}
            onClick={() => {
              const headers = ['Level', 'Count'];
              const rows = summary.breakdown.map((item) => `${item.level},${item.count}`);
              const csvContent = [headers.join(','), ...rows, `Total,${summary.total}`].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute(
                'download',
                `alerts_summary_${station?.name ?? station?.sensorId}_${start}_to_${end}.csv`
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
          <TextField
            label="Start"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            type="datetime-local"
            label="End"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <FormControl sx={{ minWidth: 180 }}>
            <Select
              value={station?.sensorId || ''}
              onChange={(e) => {
                const selected = stations.find((s) => s.sensorId === e.target.value) || null;
                setStation(selected);
              }}
            >
              {stations.map((s) => (
                <MenuItem key={s.sensorId} value={s.sensorId}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Summary */}
        <Typography variant="h4" gutterBottom>
          {summary.total} Alerts
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Breakdown */}
        {summary.breakdown.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No alerts found for the selected period.
          </Typography>
        ) : (
          <Grid container spacing={1}>
            {summary.breakdown.map((item, idx) => (
              <Grid item xs={12} key={idx}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Avatar >
                      <WarningOutlined />
                    </Avatar>
                  </Grid>
                  <Grid item xs zeroMinWidth>
                    <Typography align="left" variant="subtitle1">
                      {item.level}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography>{item.count}</Typography>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
