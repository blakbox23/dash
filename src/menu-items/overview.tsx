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

const overview: NavItemType = {
  id: 'overview',
  title: <FormattedMessage id="overview" />,
  type: 'group',
  url: '/overview',
  icon: icons.ChromeOutlined,
  breadcrumbs: true,
};

export default overview;
