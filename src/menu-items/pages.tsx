// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { DollarOutlined, LoginOutlined, PhoneOutlined, RocketOutlined } from '@ant-design/icons';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
// alternative: import MemoryIcon from '@mui/icons-material/Memory';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
// alternative: import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';


// type
import { NavItemType } from 'types/menu';

// icons
const icons = { DashboardOutlinedIcon, SensorsOutlinedIcon, AnalyticsOutlinedIcon, WarningAmberOutlinedIcon, FeedbackOutlinedIcon };

// ==============================|| MENU ITEMS - PAGES ||============================== //

const dashboard: NavItemType = {
  id: 'group-pages',
  title: <FormattedMessage id="Dashboard" />,
  type: 'group',
  children: [

    {
      id: 'overview',
      title: <FormattedMessage id="overview" />,
      type: 'item',
      url: '/overview',
      icon: icons.DashboardOutlinedIcon,
      breadcrumbs: false
    },
    {
      id: 'sensors',
      title: <FormattedMessage id="Sensors" />,
      type: 'item',
      url: '/sensors',
      icon: icons.SensorsOutlinedIcon,
      breadcrumbs: true
    },
    {
      id: 'analytics',
      title: <FormattedMessage id="Analytics" />,
      type: 'item',
      url: '/analytics',
      icon: icons.AnalyticsOutlinedIcon,
      breadcrumbs: true
    },
    {
      id: 'alerts',
      title: <FormattedMessage id="Alerts" />,
      type: 'item',
      url: '/alerts',
      icon: icons.WarningAmberOutlinedIcon,
      breadcrumbs: false
    },
    {
      id: 'feedback',
      title: <FormattedMessage id="Feedback" />,
      type: 'item',
      url: '/feedback',
      icon: icons.FeedbackOutlinedIcon,
      breadcrumbs: true
    }
  ]
};

export default dashboard;
