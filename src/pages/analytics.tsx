// material-ui
import { Container, Grid } from '@mui/material';
import UmbrellaTable from 'sections/table';

// ==============================|| CONTACT US - MAIN ||============================== //

function Analytics() {
  return (
    <Grid justifyContent="center" alignItems="center" sx={{ mb: 12 }}>
      <Grid item xs={12} sm={10} lg={9}>
            <UmbrellaTable />
      </Grid>
    </Grid>
  );
}

export default Analytics;
