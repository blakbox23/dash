// material-ui
import { AlertOutlined, ClockCircleOutlined, EnvironmentOutlined, FileProtectOutlined } from '@ant-design/icons';
import { CircularProgress, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// project imports
import { getOneStation, Sensor, Station } from 'api/maps-api';
import ReportCard from 'components/cards/statistics/ReportCard';
import UserCountCard from 'components/cards/statistics/UserCountCard';
import TrendsChart from 'sections/trends/sensor-trends-chart';

function SensorsDetail() {
  const theme = useTheme();
  const { id: sensorId } = useParams<{ id: string }>();

  const [station, setStation] = useState<Station | null>(null);


  useEffect(() => {
    if (!sensorId) return;

    const fetchStation = async () => {
      try {
        const stationData = await getOneStation(sensorId);
        setStation(stationData);
      } catch (err: any) {
        console.error(err.message || 'Failed to load station');
      }
    };

    fetchStation();
  }, [sensorId]);


  if (!sensorId || !station) {
    return <CircularProgress color="info" />;
  }

  return (
    <>
      {/* ========== Sensor Overview Section ========== */}
      <Grid item xs={12} sx={{ mb: 2 }}>
        <Typography variant="h5">Sensor Overview</Typography>
      </Grid>

      <Grid container rowSpacing={4.5} columnSpacing={3} justifyContent="center" alignItems="center" sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} lg={4}>
          <ReportCard
            primary={station?.name}
            secondary="Location"
            color={theme.palette.secondary.main}
            iconPrimary={EnvironmentOutlined}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <ReportCard
            primary={station?.sensorId}
            secondary="Sensor ID"
            color={theme.palette.success.dark}
            iconPrimary={ClockCircleOutlined}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <ReportCard primary="Online" secondary="Status" color={theme.palette.error.main} iconPrimary={AlertOutlined} />
        </Grid>
      </Grid>

      {/* ========== Current Readings Section ========== */}
      <Grid item xs={12} sx={{ mb: 2 }}>
        <Typography variant="h5">Current Readings</Typography>
      </Grid>
      <Grid container rowSpacing={4.5} columnSpacing={3} justifyContent="center" alignItems="center" sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} lg={4}>
          <UserCountCard primary="PM 2.5" secondary={station.pm25?.toFixed(2) ?? "--"} iconPrimary={FileProtectOutlined} color={theme.palette.primary.light} />
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <UserCountCard primary="PM 10" secondary={station.pm10?.toFixed(2) ?? "--"} iconPrimary={FileProtectOutlined} color={theme.palette.primary.light} />
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <UserCountCard primary="Calculated AQI" secondary="78" iconPrimary={FileProtectOutlined} color={theme.palette.primary.main} />
        </Grid>
      </Grid>

      <Grid item xs={12} sx={{ mb: 2 }}>
        <Typography variant="h5">Historical Readings from this station </Typography>
      </Grid>
      <Grid container>
        <TrendsChart stations={[]} pollutant={'aqi'} pollutantLabel={''} pollutantUnit={''} />
      </Grid>
    </>
  );
}

export default SensorsDetail;
