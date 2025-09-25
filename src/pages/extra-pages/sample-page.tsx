import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';

// project import


// import SalesChart from 'sections/dashboard/SalesChart';

// assets
import { DownloadOutlined, CaretDownOutlined, BarChartOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
// import ReportCard from 'components/cards/statistics/ReportCard';
import MapComponent from 'sections/map/maps-component';

import { getStations, Station } from 'api/maps-api';
import Legend from 'components/Legend';
import SensorsTable from 'sections/dashboard/analytics/SensorsTable';

type PollutantType = 'aqi' | 'pm25' | 'pm10';

// ==============================|| DASHBOARD - OVERVIEW ||============================== //

const DashboardAnalytics = () => {
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const stationsData = await getStations();
        setStations(stationsData);
      } catch (err: any) {
        console.log(err.message || 'Failed to load stations');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStations();
  }, []);
  function getPollutantValue(station: Station, pollutant: PollutantType): number {
    switch (pollutant) {
      case 'aqi':
        return station.aqi;
      case 'pm25':
        return station.pm25;
      case 'pm10':
        return station.pm10;
      default:
        return station.aqi;
    }
  }
  function getPollutantLevel(value: number, pollutant: PollutantType): string {
    if (pollutant === 'aqi') {
      if (value <= 50) return 'Good';
      if (value <= 100) return 'Moderate';
      if (value <= 150) return 'Unhealthy for Sensitive Groups';
      if (value <= 200) return 'Unhealthy';
      if (value <= 300) return 'Very Unhealthy';
      return 'Hazardous';
    }

    if (pollutant === 'pm25') {
      if (value <= 12) return 'Good';
      if (value <= 35.4) return 'Moderate';
      if (value <= 55.4) return 'Unhealthy for Sensitive Groups';
      if (value <= 150.4) return 'Unhealthy';
      if (value <= 250.4) return 'Very Unhealthy';
      return 'Hazardous';
    }

    if (pollutant === 'pm10') {
      if (value <= 54) return 'Good';
      if (value <= 154) return 'Moderate';
      if (value <= 254) return 'Unhealthy for Sensitive Groups';
      if (value <= 354) return 'Unhealthy';
      if (value <= 424) return 'Very Unhealthy';
      return 'Hazardous';
    }

    return 'Good';
  }
  function getPollutantColor(value: number, pollutant: PollutantType): string {
    const colorByAQI = (aqi: number): string => {
      if (aqi <= 50) return '#00e400'; // Good – Green
      if (aqi <= 100) return '#ffff00'; // Moderate – Yellow
      if (aqi <= 150) return '#ff7e00'; // Unhealthy for sensitive – Orange
      if (aqi <= 200) return '#ff0000'; // Unhealthy – Red
      if (aqi <= 300) return '#8f3f97'; // Very unhealthy – Purple
      return '#7e0023'; // Hazardous – Maroon
    };

    if (pollutant === 'aqi') {
      return colorByAQI(value);
    } else if (pollutant === 'pm25') {
      // assume value already given as AQI-equivalent scale
      return colorByAQI(value);
    } else if (pollutant === 'pm10') {
      // assume value is pm10 broken into equivalent AQI ranges
      return colorByAQI(value);
    }

    return '#00e400'; // default – Good
  }

  const [value, setValue] = useState('today');
  const [slot, setSlot] = useState('week');
  const [quantity, setQuantity] = useState('By volume');

  const handleQuantity = (e: SelectChangeEvent) => {
    setQuantity(e.target.value as string);
  };

  const handleChange = (event: React.MouseEvent<HTMLElement>, newAlignment: string) => {
    if (newAlignment) setSlot(newAlignment);
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={3}>
   

      {/* row 1 */}
      {/* <Grid item xs={12} lg={3} sm={6}>
        <ReportCard
          primary={stations.length}
          secondary="Active Sensors"
          color={theme.palette.secondary.main}
          iconPrimary={BarChartOutlined}
        />
      </Grid>
      <Grid item xs={12} lg={3} sm={6}>
        <ReportCard
          primary={50 - stations.length}
          secondary="Offline sensors"
          color={theme.palette.success.dark}
          iconPrimary={FileTextOutlined}
        />
      </Grid>
      <Grid item xs={12} lg={3} sm={6}>
        <ReportCard
          primary="145"
          secondary="Critical alerts in the last 24hrs"
          color={theme.palette.error.main}
          iconPrimary={CalendarOutlined}
        />
      </Grid>
      <Grid item xs={12} lg={3} sm={6}>
        <ReportCard primary="50µg/m³" secondary="Average AQI" color={theme.palette.primary.main} iconPrimary={DownloadOutlined} />
      </Grid> */}
      <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />

      {/* row 2 */}
      {/* Map Container */}
      <Grid item xs={12} md={12} lg={12}>
        <div className="rounded-lg bg-white-100 mx-auto my-6 w-full">
          <MapComponent
            stations={stations}
            selectedStation={selectedStation}
            selectedPollutant={'aqi'}
            onStationSelect={setSelectedStation}
            getPollutantValue={getPollutantValue}
            getPollutantColor={getPollutantColor}
            getPollutantLevel={getPollutantLevel}
          />
          <div className="w-full py-2">
            <Legend />
          </div>
        </div>
      </Grid>

      {/* row 3 */}
      <Grid item xs={12} md={12} lg={12}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">Sensor data</Typography>
          </Grid>
          <Grid item />
        </Grid>
          <SensorsTable stations={stations} />
      </Grid>

      {/* row 4 */}
      <Grid item xs={12} md={7} lg={8}></Grid>
    </Grid>
  );
};

export default DashboardAnalytics;
