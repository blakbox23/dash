// project import
import overview from './overview';
import feedback from './feedback';
import analytics from './analytics';
import alerts from './alerts';

// types
import { NavItemType } from 'types/menu';
import pages from './pages';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [overview, analytics, alerts, feedback]
};

export default menuItems;
