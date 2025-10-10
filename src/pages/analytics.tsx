// material-ui
import { Box, Button, Card, Container, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import { dummyStations, getStations, Station } from 'api/maps-api';
import { useEffect, useState } from 'react';
import WelcomeBanner from 'sections/dashboard/analytics/WelcomeBanner';
import AlertsSummary from 'sections/trends/alerts-chart';
import AnalyticsTimeSeries from 'sections/trends/analytics-timeseries-chart';
import TrendsChart from 'sections/trends/analytics-timeseries-chart';
import AqiDistributionPieChart from 'sections/trends/api-pie-chart';
import ComparisonChart from 'sections/trends/comparison-chart';
import { ThemeMode } from 'types/config';


function Analytics() {
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

    // Initial fetch
    fetchStations();
  }, []);




  const [open, setOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string>('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = () => {
    console.log('User subscribed to:', selectedReport);
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
            bgcolor:
              theme.palette.mode === ThemeMode.DARK
                ? 'primary.darker'
                : 'primary.main'
          }
        }}
      >
        Subscribe to reports
      </Button>
        </div>

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth >
        <DialogTitle>Subscribe to Reports</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">Choose report type</FormLabel>
            <RadioGroup
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
            >
              <FormControlLabel
                value="timeSeries"
                control={<Radio />}
                label="Monthly Pollutant Time Series"
              />
              <FormControlLabel
                value="aqiDistribution"
                control={<Radio />}
                label="Monthly AQI Distribution"
              />
              <FormControlLabel
                value="alertSummary"
                control={<Radio />}
                label="Monthly Alert Summary"
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!selectedReport}
          >
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
