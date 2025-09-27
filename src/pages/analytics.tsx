// material-ui
import { Container, Grid } from '@mui/material';
import { getStations, Station } from 'api/maps-api';
import { useEffect, useState } from 'react';
import UmbrellaTable from 'sections/table';
import TrendsChart from 'sections/trends/trends-chart';

// ==============================|| CONTACT US - MAIN ||============================== //

function Analytics() {
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const stationsData = await getStations();
        setStations(stationsData);
      } catch (err: any) {
        console.log(err.message || "Failed to load stations");
      }
    };

    // Initial fetch
    fetchStations();
  }, []);
  return (
    <Grid justifyContent="center" alignItems="center" sx={{ mb: 12 }}>
      <Grid item xs={12} sm={10} lg={9}>
            <TrendsChart stations={stations} pollutant={'aqi'} pollutantLabel={''} pollutantUnit={''} />
      </Grid>
    </Grid>
  );
}

export default Analytics;
