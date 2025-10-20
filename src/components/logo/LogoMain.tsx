// material-ui
import { useTheme } from '@mui/material/styles';
import { ThemeMode } from 'types/config';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

const LogoMain = ({ reverse, ...others }: { reverse?: boolean }) => {
  const theme = useTheme();
  return (
    /**
     * if you want to use image instead of svg uncomment following, and comment out <svg> element.
     *
     * <img src={theme.palette.mode === ThemeMode.DARK ? logoDark : logo} alt="airdash" width="100" />
     *
     */
    <div style={{margin: 'auto', marginLeft: '3.66rem'}}>
        <img
        src="/assets/identity/nccg_logo.png"
        alt="Nairobi County Logo"
        style={{ width: 77, display: "block",  }}
      />

      {/* <h2 style={{display: 'block'}}>Air Quality Dashboard</h2> */}
    </div>
  );
};

export default LogoMain;
