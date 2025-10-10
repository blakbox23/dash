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
import { dummyStations, getStations, Station } from 'api/maps-api';
import { useEffect, useState } from 'react';
import AlertsSummary from 'sections/trends/alerts-chart';
import AnalyticsTimeSeries from 'sections/trends/analytics-timeseries-chart';
import AqiDistributionPieChart from 'sections/trends/api-pie-chart';
import ComparisonChart from 'sections/trends/comparison-chart';
import { ThemeMode } from 'types/config';

function Analytics() {
  const [stations, setStations] = useState<Station[]>(dummyStations);
  const theme = useTheme();

  // useEffect(() => {
  //   const fetchStations = async () => {
  //     try {
  //       const stationsData = await getStations();
  //       setStations(stationsData);
  //     } catch (err: any) {
  //       console.log(err.message || 'Failed to load stations');
  //     }
  //   };

  //   // Initial fetch
  //   fetchStations();
  // }, []);

  const [selectedStations, setSelectedStations] = useState<string[]>([]);

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleToggleStation = (id: string) => {
    setSelectedStations((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleSubmit = () => {
    console.log('user', 'reportsStations');
    // TODO: hook into your backend subscription logic
    handleClose();
  };

  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 12 }}>
        {/* <Grid item xs={12}>
      <WelcomeBanner />
    </Grid> */}
        <div style={{ marginLeft: 'auto' }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleOpen}
            sx={{
              color: 'green',
              borderColor: 'green',
              '&:hover': {
                color: 'white',
                borderColor: 'green',
                bgcolor: theme.palette.mode === ThemeMode.DARK ? 'primary.darker' : 'primary.main'
              }
            }}
          >
            Subscribe to reports
          </Button>
        </div>

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>Subscribe to Monthly Reports</DialogTitle>

          <DialogContent dividers>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Select the stations you want to receive monthly air quality reports for:
            </Typography>

            <Autocomplete
              multiple
              options={stations}
              getOptionLabel={(option) => option.name}
              value={stations.filter((s) => selectedStations.includes(s.id))}
              onChange={(_, newValue) => setSelectedStations(newValue.map((s) => s.id))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    key={option.id}
                    sx={{
                      borderRadius: 1,
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText'
                    }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Report Stations" placeholder="Search stations..." margin="normal" fullWidth />
              )}
              fullWidth
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" disabled={selectedStations.length === 0}>
              Subscribe
            </Button>
          </DialogActions>
        </Dialog>
        {/* Row 1 */}
        <Grid item xs={12} sm={12} lg={12} sx={{ mb: 6 }}>
          <Grid item>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Time series chart
            </Typography>
          </Grid>
          <AnalyticsTimeSeries stations={dummyStations} pollutant={'aqi'} pollutantLabel={''} pollutantUnit={''} />
        </Grid>

        {/* Row 2 */}
        <Grid container spacing={2} sx={{ mb: 6 }} alignItems="stretch">
          {/* Left */}
          <Grid item xs={12} lg={7}>
            <Card sx={{ height: '100%', background: 'transparent', border: 'none' }}>
              <Typography variant="h4" sx={{ mb: 1 }}>
                AQI distribution
              </Typography>
              <AqiDistributionPieChart stations={dummyStations} />
            </Card>
          </Grid>

          {/* Right */}
          <Grid item xs={12} lg={5}>
            <Card sx={{ height: '100%', background: 'transparent', border: 'none' }}>
              <Typography variant="h4" sx={{ mb: 1 }}>
                Alerts summary
              </Typography>
              <AlertsSummary stations={dummyStations} />
            </Card>
          </Grid>
        </Grid>

        {/* Row 3 */}
        <Grid item xs={12} sm={12} lg={12}>
          <Grid item>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Comparison chart
            </Typography>
          </Grid>
          <ComparisonChart stations={dummyStations} pollutant={'aqi'} pollutantLabel={''} pollutantUnit={''} />
        </Grid>
      </Grid>
    </>
  );
}

export default Analytics;
