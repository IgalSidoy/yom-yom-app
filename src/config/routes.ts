// Routes Configuration
// This file centralizes all route definitions to avoid duplication

export const ROUTES = {
  // Public routes
  LOGIN: "/login",
  ONBOARDING: "/onboarding",

  // Protected routes
  DASHBOARD: "/dashboard",
  ADMIN_DASHBOARD: "/admin/dashboard",
  STAFF_DASHBOARD: "/staff/dashboard",
  PARENT_DASHBOARD: "/parent/dashboard",
  SETTINGS: "/settings",
  ADMIN_SETTINGS: "/admin/settings",

  // Admin settings sub-routes
  ADMIN_PROFILE: "/admin/settings/profile",
  ADMIN_ORGANIZATION: "/admin/settings/organization",
  ADMIN_ACCOUNTS: "/admin/settings/accounts",
  ADMIN_ACCOUNT_EDIT: "/admin/settings/accounts/:id/edit",
  ADMIN_ACCOUNT_CREATE: "/admin/settings/accounts/new",
  ADMIN_GROUPS: "/admin/settings/groups",
  ADMIN_GROUP_CREATE: "/admin/settings/groups/new",
  ADMIN_GROUP_EDIT: "/admin/settings/groups/:id/edit",
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

// Helper function to get role-based dashboard route
export const getRoleBasedDashboardRoute = (userRole?: string): string => {
  switch (userRole) {
    case "Admin":
      return ROUTES.ADMIN_DASHBOARD;
    case "Staff":
      return ROUTES.STAFF_DASHBOARD;
    case "Parent":
      return ROUTES.PARENT_DASHBOARD;
    default:
      return ROUTES.DASHBOARD;
  }
};

// Type for route keys
export type RouteKey = keyof typeof ROUTES;
