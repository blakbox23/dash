// material-ui
import { Card, Container, Grid, Typography } from '@mui/material';
import { dummyStations, getStations, Station } from 'api/maps-api';
import { useEffect, useState } from 'react';
import AlertsSummary from 'sections/trends/alerts-chart';
import AnalyticsTimeSeries from 'sections/trends/analytics-timeseries-chart';
import TrendsChart from 'sections/trends/analytics-timeseries-chart';
import AqiDistributionPieChart from 'sections/trends/api-pie-chart';
import ComparisonChart from 'sections/trends/comparison-chart';

// ==============================|| CONTACT US - MAIN ||============================== //

function Analytics() {
  const [stations, setStations] = useState<Station[]>([]);

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
  return (
    <Grid container spacing={2.5} sx={{ mb: 12 }}>
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
  );
}

export default Analytics;
