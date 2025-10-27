import React, { useRef, useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { getAqiDistribution, getAnalyticsTimeSeries, getAlertsSummary, Station } from 'api/maps-api';

interface FullReportProps {
  start: string;
  end: string;
  station: Station;
  onFinish?: () => void; // callback to hide report after download
}

interface Overview {
  averageAQI: number;
  dominantPollutant: string;
  alerts: number;
}

interface TimeSeriesItem {
  date: string;
  aqi: number;
  pm25: number;
  pm10: number;
}

interface DistributionItem {
  category: string;
  value: number;
}

interface AlertBreakdownItem {
  level: string;
  count: number;
}

const FullReport: React.FC<FullReportProps> = ({ start, end, station, onFinish }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesItem[]>([]);
  const [aqiDistribution, setAqiDistribution] = useState<DistributionItem[]>([]);
  const [alertBreakdown, setAlertBreakdown] = useState<AlertBreakdownItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch time series
        const series = await getAnalyticsTimeSeries(station.sensorId, start, end);
        const formattedSeries = series.map((s: any) => ({
          date: new Date(s.timeStamp).toLocaleDateString(),
          aqi: s.aqi,
          pm25: s.pm25,
          pm10: s.pm10
        }));
        setTimeSeriesData(formattedSeries);

        // Fetch AQI distribution
        const dist = await getAqiDistribution(station.sensorId, start, end);
        setAqiDistribution(dist.distribution);

        // Fetch alerts
        const alerts = await getAlertsSummary(station.sensorId, start, end);
        setAlertBreakdown(alerts.breakdown || []);
        const totalAlerts = alerts.total || 0;

        // Compute overview
        const avgAqi =
          series.length > 0 ? parseFloat((series.reduce((acc: number, r: any) => acc + r.aqi, 0) / series.length).toFixed(2)) : 0;

        setOverview({
          averageAQI: avgAqi,
          dominantPollutant: 'PM2.5',
          alerts: totalAlerts
        });
      } catch (err) {
        console.error('Failed to fetch report data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [station, start, end]);

  const generatePDF = async () => {
    const input = reportRef.current;
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`air-quality-report-${station.name}-${station.sensorId}.pdf`);

    if (onFinish) onFinish(); // hide report after download
  };

  if (loading || !overview) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Generating report...
        </Typography>
      </div>
    );
  }

  return (
    <div>
      <Button variant="contained" color="primary" onClick={generatePDF} sx={{ mb: 3, mr: 2 }}>
        Download PDF Report
      </Button>

      <Button variant="outlined" color="primary" onClick={onFinish} sx={{ mb: 3 }}>
        cancel
      </Button>

      <div
        ref={reportRef}
        style={{
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/assets/identity/nccg_logo.png" alt="NCCG logo" style={{ height: '100px', objectFit: 'contain', margin: 'auto' }} />
        </div>

        <Typography variant="h5" gutterBottom align="center">
          Air Quality Report
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="center">
          Station: {station.name} | Period: {start} → {end}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Overview Section */}
        <Typography variant="h6" gutterBottom>
          Overview
        </Typography>
        <Grid container spacing={2} sx={{ my: 1 }}>
          <Grid item xs={4}>
            <Card>
              <CardContent>
                <Typography>Avg AQI: {overview.averageAQI}</Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* <Grid item xs={4}>
            <Card>
              <CardContent>
                <Typography>Dominant Pollutant: {overview.dominantPollutant}</Typography>
              </CardContent>
            </Card>
          </Grid> */}
          <Grid item xs={4}>
            <Card>
              <CardContent>
                <Typography>Total Alerts: {overview.alerts}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alerts Breakdown */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Alerts Breakdown
        </Typography>
        <Table component={Paper} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Alert Level</TableCell>
              <TableCell align="right">Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alertBreakdown.map((a, i) => (
              <TableRow key={i}>
                <TableCell>{a.level}</TableCell>
                <TableCell align="right">{a.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Time Series Data */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Pollutant and AQI Readings
        </Typography>
        <Table component={Paper} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>AQI</TableCell>
              <TableCell>PM2.5</TableCell>
              <TableCell>PM10</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSeriesData.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.aqi}</TableCell>
                <TableCell>{row.pm25}</TableCell>
                <TableCell>{row.pm10}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* AQI Distribution */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          AQI Distribution
        </Typography>
        <Table component={Paper} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell align="right">Percentage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {aqiDistribution.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item.category}</TableCell>
                <TableCell align="right">{item.value}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Divider sx={{ my: 3 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          Generated on {new Date().toLocaleDateString()}
        </Typography>
      </div>
    </div>
  );
};

export default FullReport;
