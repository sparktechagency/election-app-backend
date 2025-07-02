import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { PollingStationRoutes } from '../app/modules/polling_station/polling_station.route';
import { TeamRoutes } from '../app/modules/team/team.route';
import { DisclaimerRoutes } from '../app/modules/disclaimer/disclaimer.route';
import { FaqRoutes } from '../app/modules/faq/faq.route';
import { MessageRoutes } from '../app/modules/message/message.route';
import { NotificationRoutes } from '../app/modules/notifcation/notifcation.route';
import { DocumentRoutes } from '../app/modules/document/document.route';
import { PollingRoutes } from '../app/modules/polling/polling.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/polling-station',
    route: PollingStationRoutes,
  },
  {
    path:"/team",
    route:TeamRoutes
  },
  {
    path:"/disclaimer",
    route:DisclaimerRoutes
  },
  {
    path:"/faq",
    route:FaqRoutes
  },
  {
    path:"/message",
    route:MessageRoutes
  },
  {
    path:"/notification",
    route:NotificationRoutes
  },
  {
    path:"/document",
    route:DocumentRoutes
  },
  {
    path:"/polling",
    route:PollingRoutes
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
