// material-ui
import { Container, Grid } from '@mui/material';
import { getStations, Station } from 'api/maps-api';
import { useEffect, useState } from 'react';
import FeedbackTable from 'sections/data-tables/feedbackTable';


function Sensors() {
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
            <FeedbackTable />
      </Grid>
    </Grid>
  );
}

export default Sensors;
