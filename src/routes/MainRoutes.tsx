import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import PagesLayout from 'layout/Pages';
import SimpleLayout from 'layout/Simple';

// types
import { SimpleLayoutType } from 'types/config';
import { Outlet } from 'react-router';
import SensorsDetail from 'pages/sensorsDetail';
// import FeedbackTable from 'sections/data-tables/feedbackTable';
import Feedback from 'pages/feedback';
import Users from 'pages/users';

const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon')));
const Analytics = Loadable(lazy(() => import('pages/analytics')));
const Sensors = Loadable(lazy(() => import('pages/sensors')));

const AppContactUS = Loadable(lazy(() => import('pages/contact-us')));
// render - sample page
const Overview = Loadable(lazy(() => import('pages/overview')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'overview',
          element: <Overview />
        }
      ]
    },
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'sensors',
          element: <Outlet />,
          children: [
            {
              index: true,
              element: <Sensors />,
            },
            {
              path: ":id",
              element: <SensorsDetail />,
            },
          ],
        }
      ]
    },
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'analytics',
          element: <Analytics />
        }
      ]
    },

    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'alerts',
          element: <MaintenanceUnderConstruction />
        }
      ]
    },

    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'feedback',
          element: <Feedback />
        }
      ]
    },
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'users',
          element: <Users />
        }
      ]
    },









    // {
    //   path: '/maintenance',
    //   element: <PagesLayout />,
    //   children: [
    //     {
    //       path: '404',
    //       element: <MaintenanceError />
    //     },
    //     {
    //       path: '500',
    //       element: <MaintenanceError500 />
    //     },
    //     {
    //       path: 'under-construction',
    //       element: <MaintenanceUnderConstruction />
    //     },
    //     {
    //       path: 'coming-soon',
    //       element: <MaintenanceComingSoon />
    //     }
    //   ]
    // }
  ]
};

export default MainRoutes;
