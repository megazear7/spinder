import z from "zod";

export const RoutePath = z.string();
export type RoutePath = z.infer<typeof RoutePath>;

export const RouteName = z.enum(["home", "csv_help", "security", "insights"]);
export type RouteName = z.infer<typeof RouteName>;

export const RouteConfig = z.object({
  name: RouteName,
  path: RoutePath,
});
export type RouteConfig = z.infer<typeof RouteConfig>;
