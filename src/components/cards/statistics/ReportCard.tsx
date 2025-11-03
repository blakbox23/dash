// material-ui
import { Box, Grid, Stack, Typography } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import { GenericCardProps } from 'types/root';

// ==============================|| REPORT CARD ||============================== //

interface ReportCardProps extends GenericCardProps {}

const ReportCard = ({ primary, secondary, iconPrimary, color }: ReportCardProps) => {
  const IconPrimary = iconPrimary!;
  const primaryIcon = iconPrimary ? <IconPrimary fontSize="large" /> : null;

  return (
    <Box
      sx={{
        borderRadius: '32px',
        overflow: 'hidden',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        
      }}
    >
      <MainCard>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Stack spacing={2}>
              <Typography variant="h4">{primary}</Typography>
              <Typography variant="body1" color="secondary">
                {secondary}
              </Typography>
            </Stack>
          </Grid>
          <Grid item>
            <Typography variant="h2" style={{ color }}>
              {primaryIcon}
            </Typography>
          </Grid>
        </Grid>
      </MainCard>
    </Box>
  );
};

export default ReportCard;
