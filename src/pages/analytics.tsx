// material-ui
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { getStations, Station, updateUserReportStations } from 'api/maps-api';
import { openSnackbar } from 'api/snackbar';
import FullReport from 'components/FullReport';
import useAuth from 'hooks/useAuth';
import { useEffect, useState } from 'react';
import AlertsSummary from 'sections/trends/alerts-chart';
import AnalyticsTimeSeries from 'sections/trends/analytics-timeseries-chart';
import AqiDistributionPieChart from 'sections/trends/api-pie-chart';
import ComparisonChart from 'sections/trends/comparison-chart';
import { ThemeMode } from 'types/config';
import { SnackbarProps } from 'types/snackbar';

function Analytics() {
  const { user } = useAuth();

  const [stations, setStations] = useState<Station[]>([]);
  const theme = useTheme();

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const stationsData = await getStations();
        setStations(stationsData);
      } catch (err: any) {
        console.log(err.message || 'Failed to load stations');
      }
    };

    fetchStations();
  }, []);

  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  const [openSubscribeDialog, setOpenSubscribeDialog] = useState(false);
  const [openReportDialog, setOpenReportDialog] = useState(false);

  // ✅ new state for the report dialog
  const [openReport, setOpenReport] = useState(false);
  const [reportStart, setReportStart] = useState('');
  const [reportEnd, setReportEnd] = useState('');
  const [reportStation, setReportStation] = useState<Station>(stations[0]);
  const [showPreview, setShowPreview] = useState(false);

  const handleToggleStation = (id: string) => {
    setSelectedStations((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleSubmitSubscribe = async () => {
    try {
      await updateUserReportStations(user?.id, selectedStations);
      openSnackbar({ open: true, message: 'Stations updated!', variant: 'success' } as SnackbarProps);
    } catch (err) {
      console.error(err);
      openSnackbar({ open: true, message: 'Failed to update stations!', variant: 'error' } as SnackbarProps);
    }
    setOpenSubscribeDialog(false);
  };

  const handleGenerateReport = () => {
    if (!reportStation || !reportStart || !reportEnd) return;
    setShowPreview(true);
    setOpenReportDialog(false);
  };

  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 12 }}>
        <div style={{ marginLeft: 'auto' }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setOpenReportDialog(true)}
            sx={{
              color: 'white',
              borderColor: 'blue',
              backgroundColor: 'blue',
              '&:hover': {
                color: 'white',
                borderColor: 'transparent',
                bgcolor: theme.palette.mode === ThemeMode.DARK ? 'primary.darker' : 'primary.main'
              }
            }}
          >
            Get full report
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setOpenSubscribeDialog(true)}
            sx={{
              color: 'blue',
              borderColor: 'blue',
              marginLeft: '1.5rem',
              '&:hover': {
                color: 'white',
                borderColor: 'transparent',
                bgcolor: theme.palette.mode === ThemeMode.DARK ? 'primary.darker' : 'primary.main'
              }
            }}
          >
            Subscribe to reports
          </Button>
        </div>

        {/* ================= Subscribe Dialog ================= */}
        <Dialog open={openSubscribeDialog} onClose={() => setOpenSubscribeDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Subscribe to Monthly Reports</DialogTitle>

          <DialogContent dividers>
            <Autocomplete
              multiple
              options={stations}
              getOptionLabel={(option) => option.name}
              // ✅ use id consistently for both value and mapping
              value={stations.filter((s) => selectedStations.includes(s.id))}
              onChange={(_, newValue) => setSelectedStations(newValue.map((s) => s.id))}
              renderInput={(params) => <TextField {...params} label="Report Stations" placeholder="Search stations..." />}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenSubscribeDialog(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSubmitSubscribe} variant="contained" disabled={selectedStations.length === 0}>
              Subscribe
            </Button>
          </DialogActions>
        </Dialog>

        {/* ================= Generate Full Report Dialog ================= */}
        <Dialog open={openReportDialog} onClose={() => setOpenReportDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Generate Full Report</DialogTitle>
          <DialogContent dividers>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={reportStart}
              onChange={(e) => setReportStart(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={reportEnd}
              onChange={(e) => setReportEnd(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <Autocomplete
              options={stations}
              getOptionLabel={(option) => option.name}
              onChange={(_, value) => setReportStation(value ?? reportStation)}
              renderInput={(params) => <TextField {...params} label="Select Station" placeholder="Search station..." />}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenReportDialog(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} variant="contained" disabled={!reportStart || !reportEnd || !reportStation}>
              Generate
            </Button>
          </DialogActions>
        </Dialog>

        {/* ================= Show Full Report Preview ================= */}
        {showPreview && (
          <Grid item xs={12} sx={{ mt: 4 }}>
            <FullReport
              start={reportStart}
              end={reportEnd}
              station={reportStation}
              onFinish={() => setShowPreview(false)} // hides preview after download
            />
          </Grid>
        )}

        <Grid item xs={12} sm={12} lg={12} sx={{ mb: 6 }}>
          <Grid item>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Time series chart
            </Typography>
          </Grid>
          <AnalyticsTimeSeries stations={stations} pollutant={'aqi'} pollutantLabel={''} pollutantUnit={''} />
        </Grid>

        <Grid container spacing={2} sx={{ mb: 6 }} alignItems="stretch">
          <Grid item xs={12} lg={7}>
            <Card sx={{ height: '100%', background: 'transparent', border: 'none' }}>
              <Typography variant="h4" sx={{ mb: 1 }}>
                AQI distribution
              </Typography>
              <AqiDistributionPieChart stations={stations} />
            </Card>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Card sx={{ height: '100%', background: 'transparent', border: 'none' }}>
              <Typography variant="h4" sx={{ mb: 1 }}>
                Alerts summary
              </Typography>
              <AlertsSummary stations={stations} />
            </Card>
          </Grid>
        </Grid>

        <Grid item xs={12} sm={12} lg={12}>
          <Grid item>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Comparison chart
            </Typography>
          </Grid>
          <ComparisonChart stations={stations} pollutant={'aqi'} pollutantLabel={''} pollutantUnit={''} />
        </Grid>
      </Grid>
    </>
  );
}

export default Analytics;
