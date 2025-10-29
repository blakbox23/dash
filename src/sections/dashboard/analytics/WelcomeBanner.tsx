// material-ui
import { Grid, Typography, Button, Stack, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project import
import MainCard from 'components/MainCard';

// types
import { ThemeMode } from 'types/config';
import { useNavigate } from 'react-router-dom';

const WelcomeBanner = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        borderRadius: '32px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #2E8B57 0%, #20B2AA 100%)', // green-teal gradient
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        mb: 3
      }}
    >
      <MainCard border={false} sx={{ background: 'transparent' }}>
        <Grid container alignItems="center">
          {/* Left section */}
          <Grid item md={6} sm={6} xs={12}>
            <Stack spacing={2} sx={{ padding: 4 }}>
              <Typography
                variant="h2"
                sx={{
                  color: '#fff',
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                Nairobi Air Quality Dashboard
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400
                }}
              >
                View complete statistics of air quality in Nairobi
              </Typography>

              <Box>
                <Button
                  variant="outlined"
                  sx={{
                    color: '#fff',
                    borderColor: '#fff',
                    px: 3,
                    py: 1,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor:
                        theme.palette.mode === ThemeMode.DARK
                          ? 'rgba(255,255,255,0.12)'
                          : 'rgba(255,255,255,0.15)',
                      color: '#fff',
                      borderColor: '#fff'
                    }
                  }}
                  onClick={() => navigate('/analytics')}
                >
                  View analytics
                </Button>
              </Box>
            </Stack>
          </Grid>

          {/* Right section (optional image or content area) */}
          <Grid
            item
            sm={6}
            xs={12}
            sx={{ display: { xs: 'none', sm: 'initial' } }}
          >
            <Stack
              sx={{ position: 'relative', pr: { sm: 3, md: 8 } }}
              justifyContent="center"
              alignItems="flex-end"
            >
            </Stack>
          </Grid>
        </Grid>
      </MainCard>
    </Box>
  );
};

export default WelcomeBanner;
