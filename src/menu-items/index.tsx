// project import
import overview from './overview';
import feedback from './feedback';
import analytics from './analytics';
import alerts from './alerts';

// types
import { NavItemType } from 'types/menu';
import dashboard from './pages';
import sensors from './sensors';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [dashboard]
};

export default menuItems;
