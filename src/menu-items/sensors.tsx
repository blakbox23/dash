// This is example of menu item without group for horizontal layout. There will be no children.

// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { ChromeOutlined } from '@ant-design/icons';

// type
import { NavItemType } from 'types/menu';

// icons
const icons = {
  ChromeOutlined
};

// ==============================|| MENU ITEMS - SAMPLE PAGE ||============================== //

const sensors: NavItemType = {
  id: 'sensors',
  title: <FormattedMessage id="Sensors" />,
  type: 'group',
  url: '/sensors',
  icon: icons.ChromeOutlined,
  breadcrumbs: true
};

export default sensors;
