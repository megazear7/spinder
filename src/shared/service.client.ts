import { RouteName } from "./type.routes.js";

export const routes = [
  {
    name: RouteName.enum.home,
    path: "/",
  },
  {
    name: RouteName.enum.csv_help,
    path: "/csv-help",
  },
  {
    name: RouteName.enum.security,
    path: "/security",
  },
  {
    name: RouteName.enum.insights,
    path: "/insights",
  },
];
