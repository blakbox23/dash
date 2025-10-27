// material-ui
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
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

  const [reportStart, setReportStart] = useState('');
  const [reportEnd, setReportEnd] = useState('');
  const [reportStation, setReportStation] = useState<Station | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // --- Populate selected stations when user or stations load ---
  useEffect(() => {
    if (!user || stations.length === 0) return;

    const local = JSON.parse(localStorage.getItem('reportStations') || '[]');
    const fromUser =
      Array.isArray(user.reportStations) && user.reportStations.length > 0
        ? user.reportStations.map((s: any) => (typeof s === 'string' ? s : s.id))
        : [];

    const chosen = fromUser.length > 0 ? fromUser : local;

    // Validate IDs
    const validIds = stations.map((s) => s.id);
    const filtered = chosen.filter((id: string) => validIds.includes(id));

    setSelectedStations(filtered);
  }, [user, stations]);

  useEffect(() => {
    if (stations.length > 0 && !reportStation) {
      setReportStation(stations[0]);
    }
  }, [stations]);

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

        {/* ================= Subscribe Dialog (multiple) ================= */}
        <Dialog open={openSubscribeDialog} onClose={() => setOpenSubscribeDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Subscribe to Monthly Reports</DialogTitle>
          <DialogContent dividers>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={stations}
              getOptionLabel={(option) => option.name}
              value={stations.filter((s) => selectedStations.includes(s.id))}
              onChange={(_, newValue) => setSelectedStations(newValue.map((s) => s.id))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option.name} {...getTagProps({ index })} key={option.id} sx={{ borderRadius: 1 }} />
                ))
              }
              renderInput={(params) => <TextField {...params} label="Select stations" placeholder="Choose stations..." />}
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

        {/* ================= Generate Full Report Dialog (single) ================= */}
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
            <FormControl fullWidth margin="normal">
              <Autocomplete
                options={stations}
                getOptionLabel={(option) => option.name}
                value={stations.find((s) => s.id === reportStation?.id) || null}
                onChange={(_, newValue) => setReportStation(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Report Station" placeholder="Select a station..." margin="normal" />
                )}
              />
            </FormControl>
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
        {showPreview && reportStation && (
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
          <Typography variant="h4" sx={{ mb: 1 }}>
            Time series chart
          </Typography>
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
          <Typography variant="h4" sx={{ mb: 1 }}>
            Comparison chart
          </Typography>
          <ComparisonChart stations={stations} pollutant={'aqi'} pollutantLabel={''} pollutantUnit={''} />
        </Grid>
      </Grid>
    </>
  );
}

export default Analytics;
