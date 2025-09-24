// material-ui
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

// types
import { ThemeDirection, ThemeMode } from 'types/config';

// ==============================|| AUTH BLUR BACK SVG ||============================== //

const AuthBackground = () => {
  const theme = useTheme();
  return (
    <Box
    sx={{
      position: 'absolute',
      // left: 200,
      width: '100%',
      filter: "blur(27px)",
      zIndex: -1,
      top: 0,
      transform: theme.direction === ThemeDirection.RTL ? "rotate(180deg)" : "inherit",
      height: '100vh',
      backgroundImage: 'url(/assets/identity/nccg_logo.png)',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: '50%'
    }}
  />
  );
};

export default AuthBackground;
