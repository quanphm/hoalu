/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as DashboardRouteImport } from './routes/_dashboard/route'
import { Route as AuthRouteImport } from './routes/_auth/route'
import { Route as DashboardIndexImport } from './routes/_dashboard/index'
import { Route as DashboardSlugImport } from './routes/_dashboard/$slug'
import { Route as AuthSignupImport } from './routes/_auth/signup'
import { Route as AuthLoginImport } from './routes/_auth/login'
import { Route as DashboardSlugIndexImport } from './routes/_dashboard/$slug/index'
import { Route as InviteIdAcceptImport } from './routes/invite.$id.accept'
import { Route as DashboardAccountTokensImport } from './routes/_dashboard/account/tokens'
import { Route as DashboardAccountPreferencesImport } from './routes/_dashboard/account/preferences'
import { Route as DashboardSlugTasksImport } from './routes/_dashboard/$slug/tasks'
import { Route as DashboardSlugSettingsImport } from './routes/_dashboard/$slug/settings'
import { Route as DashboardSlugExpensesImport } from './routes/_dashboard/$slug/expenses'
import { Route as DashboardSlugSettingsWorkspaceImport } from './routes/_dashboard/$slug/settings/workspace'
import { Route as DashboardSlugSettingsMembersImport } from './routes/_dashboard/$slug/settings/members'
import { Route as DashboardSlugSettingsLibraryImport } from './routes/_dashboard/$slug/settings/library'

// Create/Update Routes

const DashboardRouteRoute = DashboardRouteImport.update({
  id: '/_dashboard',
  getParentRoute: () => rootRoute,
} as any)

const AuthRouteRoute = AuthRouteImport.update({
  id: '/_auth',
  getParentRoute: () => rootRoute,
} as any)

const DashboardIndexRoute = DashboardIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => DashboardRouteRoute,
} as any)

const DashboardSlugRoute = DashboardSlugImport.update({
  id: '/$slug',
  path: '/$slug',
  getParentRoute: () => DashboardRouteRoute,
} as any)

const AuthSignupRoute = AuthSignupImport.update({
  id: '/signup',
  path: '/signup',
  getParentRoute: () => AuthRouteRoute,
} as any)

const AuthLoginRoute = AuthLoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => AuthRouteRoute,
} as any)

const DashboardSlugIndexRoute = DashboardSlugIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => DashboardSlugRoute,
} as any)

const InviteIdAcceptRoute = InviteIdAcceptImport.update({
  id: '/invite/$id/accept',
  path: '/invite/$id/accept',
  getParentRoute: () => rootRoute,
} as any)

const DashboardAccountTokensRoute = DashboardAccountTokensImport.update({
  id: '/account/tokens',
  path: '/account/tokens',
  getParentRoute: () => DashboardRouteRoute,
} as any)

const DashboardAccountPreferencesRoute =
  DashboardAccountPreferencesImport.update({
    id: '/account/preferences',
    path: '/account/preferences',
    getParentRoute: () => DashboardRouteRoute,
  } as any)

const DashboardSlugTasksRoute = DashboardSlugTasksImport.update({
  id: '/tasks',
  path: '/tasks',
  getParentRoute: () => DashboardSlugRoute,
} as any)

const DashboardSlugSettingsRoute = DashboardSlugSettingsImport.update({
  id: '/settings',
  path: '/settings',
  getParentRoute: () => DashboardSlugRoute,
} as any)

const DashboardSlugExpensesRoute = DashboardSlugExpensesImport.update({
  id: '/expenses',
  path: '/expenses',
  getParentRoute: () => DashboardSlugRoute,
} as any)

const DashboardSlugSettingsWorkspaceRoute =
  DashboardSlugSettingsWorkspaceImport.update({
    id: '/workspace',
    path: '/workspace',
    getParentRoute: () => DashboardSlugSettingsRoute,
  } as any)

const DashboardSlugSettingsMembersRoute =
  DashboardSlugSettingsMembersImport.update({
    id: '/members',
    path: '/members',
    getParentRoute: () => DashboardSlugSettingsRoute,
  } as any)

const DashboardSlugSettingsLibraryRoute =
  DashboardSlugSettingsLibraryImport.update({
    id: '/library',
    path: '/library',
    getParentRoute: () => DashboardSlugSettingsRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_auth': {
      id: '/_auth'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthRouteImport
      parentRoute: typeof rootRoute
    }
    '/_dashboard': {
      id: '/_dashboard'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof DashboardRouteImport
      parentRoute: typeof rootRoute
    }
    '/_auth/login': {
      id: '/_auth/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof AuthLoginImport
      parentRoute: typeof AuthRouteImport
    }
    '/_auth/signup': {
      id: '/_auth/signup'
      path: '/signup'
      fullPath: '/signup'
      preLoaderRoute: typeof AuthSignupImport
      parentRoute: typeof AuthRouteImport
    }
    '/_dashboard/$slug': {
      id: '/_dashboard/$slug'
      path: '/$slug'
      fullPath: '/$slug'
      preLoaderRoute: typeof DashboardSlugImport
      parentRoute: typeof DashboardRouteImport
    }
    '/_dashboard/': {
      id: '/_dashboard/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof DashboardIndexImport
      parentRoute: typeof DashboardRouteImport
    }
    '/_dashboard/$slug/expenses': {
      id: '/_dashboard/$slug/expenses'
      path: '/expenses'
      fullPath: '/$slug/expenses'
      preLoaderRoute: typeof DashboardSlugExpensesImport
      parentRoute: typeof DashboardSlugImport
    }
    '/_dashboard/$slug/settings': {
      id: '/_dashboard/$slug/settings'
      path: '/settings'
      fullPath: '/$slug/settings'
      preLoaderRoute: typeof DashboardSlugSettingsImport
      parentRoute: typeof DashboardSlugImport
    }
    '/_dashboard/$slug/tasks': {
      id: '/_dashboard/$slug/tasks'
      path: '/tasks'
      fullPath: '/$slug/tasks'
      preLoaderRoute: typeof DashboardSlugTasksImport
      parentRoute: typeof DashboardSlugImport
    }
    '/_dashboard/account/preferences': {
      id: '/_dashboard/account/preferences'
      path: '/account/preferences'
      fullPath: '/account/preferences'
      preLoaderRoute: typeof DashboardAccountPreferencesImport
      parentRoute: typeof DashboardRouteImport
    }
    '/_dashboard/account/tokens': {
      id: '/_dashboard/account/tokens'
      path: '/account/tokens'
      fullPath: '/account/tokens'
      preLoaderRoute: typeof DashboardAccountTokensImport
      parentRoute: typeof DashboardRouteImport
    }
    '/invite/$id/accept': {
      id: '/invite/$id/accept'
      path: '/invite/$id/accept'
      fullPath: '/invite/$id/accept'
      preLoaderRoute: typeof InviteIdAcceptImport
      parentRoute: typeof rootRoute
    }
    '/_dashboard/$slug/': {
      id: '/_dashboard/$slug/'
      path: '/'
      fullPath: '/$slug/'
      preLoaderRoute: typeof DashboardSlugIndexImport
      parentRoute: typeof DashboardSlugImport
    }
    '/_dashboard/$slug/settings/library': {
      id: '/_dashboard/$slug/settings/library'
      path: '/library'
      fullPath: '/$slug/settings/library'
      preLoaderRoute: typeof DashboardSlugSettingsLibraryImport
      parentRoute: typeof DashboardSlugSettingsImport
    }
    '/_dashboard/$slug/settings/members': {
      id: '/_dashboard/$slug/settings/members'
      path: '/members'
      fullPath: '/$slug/settings/members'
      preLoaderRoute: typeof DashboardSlugSettingsMembersImport
      parentRoute: typeof DashboardSlugSettingsImport
    }
    '/_dashboard/$slug/settings/workspace': {
      id: '/_dashboard/$slug/settings/workspace'
      path: '/workspace'
      fullPath: '/$slug/settings/workspace'
      preLoaderRoute: typeof DashboardSlugSettingsWorkspaceImport
      parentRoute: typeof DashboardSlugSettingsImport
    }
  }
}

// Create and export the route tree

interface AuthRouteRouteChildren {
  AuthLoginRoute: typeof AuthLoginRoute
  AuthSignupRoute: typeof AuthSignupRoute
}

const AuthRouteRouteChildren: AuthRouteRouteChildren = {
  AuthLoginRoute: AuthLoginRoute,
  AuthSignupRoute: AuthSignupRoute,
}

const AuthRouteRouteWithChildren = AuthRouteRoute._addFileChildren(
  AuthRouteRouteChildren,
)

interface DashboardSlugSettingsRouteChildren {
  DashboardSlugSettingsLibraryRoute: typeof DashboardSlugSettingsLibraryRoute
  DashboardSlugSettingsMembersRoute: typeof DashboardSlugSettingsMembersRoute
  DashboardSlugSettingsWorkspaceRoute: typeof DashboardSlugSettingsWorkspaceRoute
}

const DashboardSlugSettingsRouteChildren: DashboardSlugSettingsRouteChildren = {
  DashboardSlugSettingsLibraryRoute: DashboardSlugSettingsLibraryRoute,
  DashboardSlugSettingsMembersRoute: DashboardSlugSettingsMembersRoute,
  DashboardSlugSettingsWorkspaceRoute: DashboardSlugSettingsWorkspaceRoute,
}

const DashboardSlugSettingsRouteWithChildren =
  DashboardSlugSettingsRoute._addFileChildren(
    DashboardSlugSettingsRouteChildren,
  )

interface DashboardSlugRouteChildren {
  DashboardSlugExpensesRoute: typeof DashboardSlugExpensesRoute
  DashboardSlugSettingsRoute: typeof DashboardSlugSettingsRouteWithChildren
  DashboardSlugTasksRoute: typeof DashboardSlugTasksRoute
  DashboardSlugIndexRoute: typeof DashboardSlugIndexRoute
}

const DashboardSlugRouteChildren: DashboardSlugRouteChildren = {
  DashboardSlugExpensesRoute: DashboardSlugExpensesRoute,
  DashboardSlugSettingsRoute: DashboardSlugSettingsRouteWithChildren,
  DashboardSlugTasksRoute: DashboardSlugTasksRoute,
  DashboardSlugIndexRoute: DashboardSlugIndexRoute,
}

const DashboardSlugRouteWithChildren = DashboardSlugRoute._addFileChildren(
  DashboardSlugRouteChildren,
)

interface DashboardRouteRouteChildren {
  DashboardSlugRoute: typeof DashboardSlugRouteWithChildren
  DashboardIndexRoute: typeof DashboardIndexRoute
  DashboardAccountPreferencesRoute: typeof DashboardAccountPreferencesRoute
  DashboardAccountTokensRoute: typeof DashboardAccountTokensRoute
}

const DashboardRouteRouteChildren: DashboardRouteRouteChildren = {
  DashboardSlugRoute: DashboardSlugRouteWithChildren,
  DashboardIndexRoute: DashboardIndexRoute,
  DashboardAccountPreferencesRoute: DashboardAccountPreferencesRoute,
  DashboardAccountTokensRoute: DashboardAccountTokensRoute,
}

const DashboardRouteRouteWithChildren = DashboardRouteRoute._addFileChildren(
  DashboardRouteRouteChildren,
)

export interface FileRoutesByFullPath {
  '': typeof DashboardRouteRouteWithChildren
  '/login': typeof AuthLoginRoute
  '/signup': typeof AuthSignupRoute
  '/$slug': typeof DashboardSlugRouteWithChildren
  '/': typeof DashboardIndexRoute
  '/$slug/expenses': typeof DashboardSlugExpensesRoute
  '/$slug/settings': typeof DashboardSlugSettingsRouteWithChildren
  '/$slug/tasks': typeof DashboardSlugTasksRoute
  '/account/preferences': typeof DashboardAccountPreferencesRoute
  '/account/tokens': typeof DashboardAccountTokensRoute
  '/invite/$id/accept': typeof InviteIdAcceptRoute
  '/$slug/': typeof DashboardSlugIndexRoute
  '/$slug/settings/library': typeof DashboardSlugSettingsLibraryRoute
  '/$slug/settings/members': typeof DashboardSlugSettingsMembersRoute
  '/$slug/settings/workspace': typeof DashboardSlugSettingsWorkspaceRoute
}

export interface FileRoutesByTo {
  '': typeof AuthRouteRouteWithChildren
  '/login': typeof AuthLoginRoute
  '/signup': typeof AuthSignupRoute
  '/': typeof DashboardIndexRoute
  '/$slug/expenses': typeof DashboardSlugExpensesRoute
  '/$slug/settings': typeof DashboardSlugSettingsRouteWithChildren
  '/$slug/tasks': typeof DashboardSlugTasksRoute
  '/account/preferences': typeof DashboardAccountPreferencesRoute
  '/account/tokens': typeof DashboardAccountTokensRoute
  '/invite/$id/accept': typeof InviteIdAcceptRoute
  '/$slug': typeof DashboardSlugIndexRoute
  '/$slug/settings/library': typeof DashboardSlugSettingsLibraryRoute
  '/$slug/settings/members': typeof DashboardSlugSettingsMembersRoute
  '/$slug/settings/workspace': typeof DashboardSlugSettingsWorkspaceRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/_auth': typeof AuthRouteRouteWithChildren
  '/_dashboard': typeof DashboardRouteRouteWithChildren
  '/_auth/login': typeof AuthLoginRoute
  '/_auth/signup': typeof AuthSignupRoute
  '/_dashboard/$slug': typeof DashboardSlugRouteWithChildren
  '/_dashboard/': typeof DashboardIndexRoute
  '/_dashboard/$slug/expenses': typeof DashboardSlugExpensesRoute
  '/_dashboard/$slug/settings': typeof DashboardSlugSettingsRouteWithChildren
  '/_dashboard/$slug/tasks': typeof DashboardSlugTasksRoute
  '/_dashboard/account/preferences': typeof DashboardAccountPreferencesRoute
  '/_dashboard/account/tokens': typeof DashboardAccountTokensRoute
  '/invite/$id/accept': typeof InviteIdAcceptRoute
  '/_dashboard/$slug/': typeof DashboardSlugIndexRoute
  '/_dashboard/$slug/settings/library': typeof DashboardSlugSettingsLibraryRoute
  '/_dashboard/$slug/settings/members': typeof DashboardSlugSettingsMembersRoute
  '/_dashboard/$slug/settings/workspace': typeof DashboardSlugSettingsWorkspaceRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | ''
    | '/login'
    | '/signup'
    | '/$slug'
    | '/'
    | '/$slug/expenses'
    | '/$slug/settings'
    | '/$slug/tasks'
    | '/account/preferences'
    | '/account/tokens'
    | '/invite/$id/accept'
    | '/$slug/'
    | '/$slug/settings/library'
    | '/$slug/settings/members'
    | '/$slug/settings/workspace'
  fileRoutesByTo: FileRoutesByTo
  to:
    | ''
    | '/login'
    | '/signup'
    | '/'
    | '/$slug/expenses'
    | '/$slug/settings'
    | '/$slug/tasks'
    | '/account/preferences'
    | '/account/tokens'
    | '/invite/$id/accept'
    | '/$slug'
    | '/$slug/settings/library'
    | '/$slug/settings/members'
    | '/$slug/settings/workspace'
  id:
    | '__root__'
    | '/_auth'
    | '/_dashboard'
    | '/_auth/login'
    | '/_auth/signup'
    | '/_dashboard/$slug'
    | '/_dashboard/'
    | '/_dashboard/$slug/expenses'
    | '/_dashboard/$slug/settings'
    | '/_dashboard/$slug/tasks'
    | '/_dashboard/account/preferences'
    | '/_dashboard/account/tokens'
    | '/invite/$id/accept'
    | '/_dashboard/$slug/'
    | '/_dashboard/$slug/settings/library'
    | '/_dashboard/$slug/settings/members'
    | '/_dashboard/$slug/settings/workspace'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  AuthRouteRoute: typeof AuthRouteRouteWithChildren
  DashboardRouteRoute: typeof DashboardRouteRouteWithChildren
  InviteIdAcceptRoute: typeof InviteIdAcceptRoute
}

const rootRouteChildren: RootRouteChildren = {
  AuthRouteRoute: AuthRouteRouteWithChildren,
  DashboardRouteRoute: DashboardRouteRouteWithChildren,
  InviteIdAcceptRoute: InviteIdAcceptRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_auth",
        "/_dashboard",
        "/invite/$id/accept"
      ]
    },
    "/_auth": {
      "filePath": "_auth/route.tsx",
      "children": [
        "/_auth/login",
        "/_auth/signup"
      ]
    },
    "/_dashboard": {
      "filePath": "_dashboard/route.tsx",
      "children": [
        "/_dashboard/$slug",
        "/_dashboard/",
        "/_dashboard/account/preferences",
        "/_dashboard/account/tokens"
      ]
    },
    "/_auth/login": {
      "filePath": "_auth/login.tsx",
      "parent": "/_auth"
    },
    "/_auth/signup": {
      "filePath": "_auth/signup.tsx",
      "parent": "/_auth"
    },
    "/_dashboard/$slug": {
      "filePath": "_dashboard/$slug.tsx",
      "parent": "/_dashboard",
      "children": [
        "/_dashboard/$slug/expenses",
        "/_dashboard/$slug/settings",
        "/_dashboard/$slug/tasks",
        "/_dashboard/$slug/"
      ]
    },
    "/_dashboard/": {
      "filePath": "_dashboard/index.tsx",
      "parent": "/_dashboard"
    },
    "/_dashboard/$slug/expenses": {
      "filePath": "_dashboard/$slug/expenses.tsx",
      "parent": "/_dashboard/$slug"
    },
    "/_dashboard/$slug/settings": {
      "filePath": "_dashboard/$slug/settings.tsx",
      "parent": "/_dashboard/$slug",
      "children": [
        "/_dashboard/$slug/settings/library",
        "/_dashboard/$slug/settings/members",
        "/_dashboard/$slug/settings/workspace"
      ]
    },
    "/_dashboard/$slug/tasks": {
      "filePath": "_dashboard/$slug/tasks.tsx",
      "parent": "/_dashboard/$slug"
    },
    "/_dashboard/account/preferences": {
      "filePath": "_dashboard/account/preferences.tsx",
      "parent": "/_dashboard"
    },
    "/_dashboard/account/tokens": {
      "filePath": "_dashboard/account/tokens.tsx",
      "parent": "/_dashboard"
    },
    "/invite/$id/accept": {
      "filePath": "invite.$id.accept.tsx"
    },
    "/_dashboard/$slug/": {
      "filePath": "_dashboard/$slug/index.tsx",
      "parent": "/_dashboard/$slug"
    },
    "/_dashboard/$slug/settings/library": {
      "filePath": "_dashboard/$slug/settings/library.tsx",
      "parent": "/_dashboard/$slug/settings"
    },
    "/_dashboard/$slug/settings/members": {
      "filePath": "_dashboard/$slug/settings/members.tsx",
      "parent": "/_dashboard/$slug/settings"
    },
    "/_dashboard/$slug/settings/workspace": {
      "filePath": "_dashboard/$slug/settings/workspace.tsx",
      "parent": "/_dashboard/$slug/settings"
    }
  }
}
ROUTE_MANIFEST_END */
