// Routes Configuration
// This file centralizes all route definitions to avoid duplication

export const ROUTES = {
  // Public routes
  LOGIN: "/login",
  ONBOARDING: "/onboarding",

  // Protected routes
  DASHBOARD: "/dashboard",
  SETTINGS: "/settings",
  ADMIN_SETTINGS: "/admin/settings",

  // Admin settings sub-routes
  ADMIN_PROFILE: "/admin/settings/profile",
  ADMIN_ORGANIZATION: "/admin/settings/organization",
  ADMIN_ACCOUNTS: "/admin/settings/accounts",
  ADMIN_GROUPS: "/admin/settings/groups",
  ADMIN_USERS: "/admin/settings/users",
  ADMIN_CHILDREN: "/admin/settings/children",

  FEED: "/feed",
  ATTENDANCE: "/attendance",

  // Post creation routes
  SLEEP_POST: "/sleep-post",
  FOOD_POST: "/food-post",

  // Catch-all route
  NOT_FOUND: "*",
} as const;

// Route groups for easier management
export const ROUTE_GROUPS = {
  PUBLIC: [ROUTES.LOGIN, ROUTES.ONBOARDING],
  PROTECTED: [
    ROUTES.DASHBOARD,
    ROUTES.SETTINGS,
    ROUTES.FEED,
    ROUTES.ATTENDANCE,
  ],
  POST_ROUTES: [ROUTES.SLEEP_POST, ROUTES.FOOD_POST],
} as const;

// Helper function to build dynamic routes
export const buildRoute = (
  baseRoute: string,
  params?: Record<string, string>
): string => {
  if (!params) return baseRoute;

  let route = baseRoute;
  Object.entries(params).forEach(([key, value]) => {
    route = route.replace(`:${key}`, value);
  });

  return route;
};

// Type for route keys
export type RouteKey = keyof typeof ROUTES;
