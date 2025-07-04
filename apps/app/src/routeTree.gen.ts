/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as DashboardRouteRouteImport } from './routes/_dashboard/route'
import { Route as AuthRouteRouteImport } from './routes/_auth/route'
import { Route as DashboardIndexRouteImport } from './routes/_dashboard/index'
import { Route as AuthVerifyEmailRouteImport } from './routes/_auth/verify-email'
import { Route as AuthSignupRouteImport } from './routes/_auth/signup'
import { Route as AuthResetPasswordRouteImport } from './routes/_auth/reset-password'
import { Route as AuthLoginRouteImport } from './routes/_auth/login'
import { Route as DashboardSlugRouteRouteImport } from './routes/_dashboard/$slug/route'
import { Route as DashboardSlugIndexRouteImport } from './routes/_dashboard/$slug/index'
import { Route as DashboardAccountTokensRouteImport } from './routes/_dashboard/account/tokens'
import { Route as DashboardAccountPreferencesRouteImport } from './routes/_dashboard/account/preferences'
import { Route as DashboardSlugTasksRouteImport } from './routes/_dashboard/$slug/tasks'
import { Route as DashboardSlugExpensesRouteImport } from './routes/_dashboard/$slug/expenses'
import { Route as DashboardSlugSettingsRouteRouteImport } from './routes/_dashboard/$slug/settings/route'
import { Route as DashboardSlugSettingsIndexRouteImport } from './routes/_dashboard/$slug/settings/index'
import { Route as DashboardSlugSettingsWorkspaceRouteImport } from './routes/_dashboard/$slug/settings/workspace'
import { Route as DashboardSlugSettingsPhotosRouteImport } from './routes/_dashboard/$slug/settings/photos'
import { Route as DashboardSlugSettingsMembersRouteImport } from './routes/_dashboard/$slug/settings/members'
import { Route as DashboardSlugSettingsLibraryRouteImport } from './routes/_dashboard/$slug/settings/library'
import { Route as AuthInviteIdAcceptRouteImport } from './routes/_auth/invite.$id.accept'

const DashboardRouteRoute = DashboardRouteRouteImport.update({
  id: '/_dashboard',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthRouteRoute = AuthRouteRouteImport.update({
  id: '/_auth',
  getParentRoute: () => rootRouteImport,
} as any)
const DashboardIndexRoute = DashboardIndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => DashboardRouteRoute,
} as any)
const AuthVerifyEmailRoute = AuthVerifyEmailRouteImport.update({
  id: '/verify-email',
  path: '/verify-email',
  getParentRoute: () => AuthRouteRoute,
} as any)
const AuthSignupRoute = AuthSignupRouteImport.update({
  id: '/signup',
  path: '/signup',
  getParentRoute: () => AuthRouteRoute,
} as any)
const AuthResetPasswordRoute = AuthResetPasswordRouteImport.update({
  id: '/reset-password',
  path: '/reset-password',
  getParentRoute: () => AuthRouteRoute,
} as any)
const AuthLoginRoute = AuthLoginRouteImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => AuthRouteRoute,
} as any)
const DashboardSlugRouteRoute = DashboardSlugRouteRouteImport.update({
  id: '/$slug',
  path: '/$slug',
  getParentRoute: () => DashboardRouteRoute,
} as any)
const DashboardSlugIndexRoute = DashboardSlugIndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => DashboardSlugRouteRoute,
} as any)
const DashboardAccountTokensRoute = DashboardAccountTokensRouteImport.update({
  id: '/account/tokens',
  path: '/account/tokens',
  getParentRoute: () => DashboardRouteRoute,
} as any)
const DashboardAccountPreferencesRoute =
  DashboardAccountPreferencesRouteImport.update({
    id: '/account/preferences',
    path: '/account/preferences',
    getParentRoute: () => DashboardRouteRoute,
  } as any)
const DashboardSlugTasksRoute = DashboardSlugTasksRouteImport.update({
  id: '/tasks',
  path: '/tasks',
  getParentRoute: () => DashboardSlugRouteRoute,
} as any)
const DashboardSlugExpensesRoute = DashboardSlugExpensesRouteImport.update({
  id: '/expenses',
  path: '/expenses',
  getParentRoute: () => DashboardSlugRouteRoute,
} as any)
const DashboardSlugSettingsRouteRoute =
  DashboardSlugSettingsRouteRouteImport.update({
    id: '/settings',
    path: '/settings',
    getParentRoute: () => DashboardSlugRouteRoute,
  } as any)
const DashboardSlugSettingsIndexRoute =
  DashboardSlugSettingsIndexRouteImport.update({
    id: '/',
    path: '/',
    getParentRoute: () => DashboardSlugSettingsRouteRoute,
  } as any)
const DashboardSlugSettingsWorkspaceRoute =
  DashboardSlugSettingsWorkspaceRouteImport.update({
    id: '/workspace',
    path: '/workspace',
    getParentRoute: () => DashboardSlugSettingsRouteRoute,
  } as any)
const DashboardSlugSettingsPhotosRoute =
  DashboardSlugSettingsPhotosRouteImport.update({
    id: '/photos',
    path: '/photos',
    getParentRoute: () => DashboardSlugSettingsRouteRoute,
  } as any)
const DashboardSlugSettingsMembersRoute =
  DashboardSlugSettingsMembersRouteImport.update({
    id: '/members',
    path: '/members',
    getParentRoute: () => DashboardSlugSettingsRouteRoute,
  } as any)
const DashboardSlugSettingsLibraryRoute =
  DashboardSlugSettingsLibraryRouteImport.update({
    id: '/library',
    path: '/library',
    getParentRoute: () => DashboardSlugSettingsRouteRoute,
  } as any)
const AuthInviteIdAcceptRoute = AuthInviteIdAcceptRouteImport.update({
  id: '/invite/$id/accept',
  path: '/invite/$id/accept',
  getParentRoute: () => AuthRouteRoute,
} as any)

export interface FileRoutesByFullPath {
  '/$slug': typeof DashboardSlugRouteRouteWithChildren
  '/login': typeof AuthLoginRoute
  '/reset-password': typeof AuthResetPasswordRoute
  '/signup': typeof AuthSignupRoute
  '/verify-email': typeof AuthVerifyEmailRoute
  '/': typeof DashboardIndexRoute
  '/$slug/settings': typeof DashboardSlugSettingsRouteRouteWithChildren
  '/$slug/expenses': typeof DashboardSlugExpensesRoute
  '/$slug/tasks': typeof DashboardSlugTasksRoute
  '/account/preferences': typeof DashboardAccountPreferencesRoute
  '/account/tokens': typeof DashboardAccountTokensRoute
  '/$slug/': typeof DashboardSlugIndexRoute
  '/invite/$id/accept': typeof AuthInviteIdAcceptRoute
  '/$slug/settings/library': typeof DashboardSlugSettingsLibraryRoute
  '/$slug/settings/members': typeof DashboardSlugSettingsMembersRoute
  '/$slug/settings/photos': typeof DashboardSlugSettingsPhotosRoute
  '/$slug/settings/workspace': typeof DashboardSlugSettingsWorkspaceRoute
  '/$slug/settings/': typeof DashboardSlugSettingsIndexRoute
}
export interface FileRoutesByTo {
  '/login': typeof AuthLoginRoute
  '/reset-password': typeof AuthResetPasswordRoute
  '/signup': typeof AuthSignupRoute
  '/verify-email': typeof AuthVerifyEmailRoute
  '/': typeof DashboardIndexRoute
  '/$slug/expenses': typeof DashboardSlugExpensesRoute
  '/$slug/tasks': typeof DashboardSlugTasksRoute
  '/account/preferences': typeof DashboardAccountPreferencesRoute
  '/account/tokens': typeof DashboardAccountTokensRoute
  '/$slug': typeof DashboardSlugIndexRoute
  '/invite/$id/accept': typeof AuthInviteIdAcceptRoute
  '/$slug/settings/library': typeof DashboardSlugSettingsLibraryRoute
  '/$slug/settings/members': typeof DashboardSlugSettingsMembersRoute
  '/$slug/settings/photos': typeof DashboardSlugSettingsPhotosRoute
  '/$slug/settings/workspace': typeof DashboardSlugSettingsWorkspaceRoute
  '/$slug/settings': typeof DashboardSlugSettingsIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/_auth': typeof AuthRouteRouteWithChildren
  '/_dashboard': typeof DashboardRouteRouteWithChildren
  '/_dashboard/$slug': typeof DashboardSlugRouteRouteWithChildren
  '/_auth/login': typeof AuthLoginRoute
  '/_auth/reset-password': typeof AuthResetPasswordRoute
  '/_auth/signup': typeof AuthSignupRoute
  '/_auth/verify-email': typeof AuthVerifyEmailRoute
  '/_dashboard/': typeof DashboardIndexRoute
  '/_dashboard/$slug/settings': typeof DashboardSlugSettingsRouteRouteWithChildren
  '/_dashboard/$slug/expenses': typeof DashboardSlugExpensesRoute
  '/_dashboard/$slug/tasks': typeof DashboardSlugTasksRoute
  '/_dashboard/account/preferences': typeof DashboardAccountPreferencesRoute
  '/_dashboard/account/tokens': typeof DashboardAccountTokensRoute
  '/_dashboard/$slug/': typeof DashboardSlugIndexRoute
  '/_auth/invite/$id/accept': typeof AuthInviteIdAcceptRoute
  '/_dashboard/$slug/settings/library': typeof DashboardSlugSettingsLibraryRoute
  '/_dashboard/$slug/settings/members': typeof DashboardSlugSettingsMembersRoute
  '/_dashboard/$slug/settings/photos': typeof DashboardSlugSettingsPhotosRoute
  '/_dashboard/$slug/settings/workspace': typeof DashboardSlugSettingsWorkspaceRoute
  '/_dashboard/$slug/settings/': typeof DashboardSlugSettingsIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/$slug'
    | '/login'
    | '/reset-password'
    | '/signup'
    | '/verify-email'
    | '/'
    | '/$slug/settings'
    | '/$slug/expenses'
    | '/$slug/tasks'
    | '/account/preferences'
    | '/account/tokens'
    | '/$slug/'
    | '/invite/$id/accept'
    | '/$slug/settings/library'
    | '/$slug/settings/members'
    | '/$slug/settings/photos'
    | '/$slug/settings/workspace'
    | '/$slug/settings/'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/login'
    | '/reset-password'
    | '/signup'
    | '/verify-email'
    | '/'
    | '/$slug/expenses'
    | '/$slug/tasks'
    | '/account/preferences'
    | '/account/tokens'
    | '/$slug'
    | '/invite/$id/accept'
    | '/$slug/settings/library'
    | '/$slug/settings/members'
    | '/$slug/settings/photos'
    | '/$slug/settings/workspace'
    | '/$slug/settings'
  id:
    | '__root__'
    | '/_auth'
    | '/_dashboard'
    | '/_dashboard/$slug'
    | '/_auth/login'
    | '/_auth/reset-password'
    | '/_auth/signup'
    | '/_auth/verify-email'
    | '/_dashboard/'
    | '/_dashboard/$slug/settings'
    | '/_dashboard/$slug/expenses'
    | '/_dashboard/$slug/tasks'
    | '/_dashboard/account/preferences'
    | '/_dashboard/account/tokens'
    | '/_dashboard/$slug/'
    | '/_auth/invite/$id/accept'
    | '/_dashboard/$slug/settings/library'
    | '/_dashboard/$slug/settings/members'
    | '/_dashboard/$slug/settings/photos'
    | '/_dashboard/$slug/settings/workspace'
    | '/_dashboard/$slug/settings/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  AuthRouteRoute: typeof AuthRouteRouteWithChildren
  DashboardRouteRoute: typeof DashboardRouteRouteWithChildren
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_dashboard': {
      id: '/_dashboard'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof DashboardRouteRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_auth': {
      id: '/_auth'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthRouteRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_dashboard/': {
      id: '/_dashboard/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof DashboardIndexRouteImport
      parentRoute: typeof DashboardRouteRoute
    }
    '/_auth/verify-email': {
      id: '/_auth/verify-email'
      path: '/verify-email'
      fullPath: '/verify-email'
      preLoaderRoute: typeof AuthVerifyEmailRouteImport
      parentRoute: typeof AuthRouteRoute
    }
    '/_auth/signup': {
      id: '/_auth/signup'
      path: '/signup'
      fullPath: '/signup'
      preLoaderRoute: typeof AuthSignupRouteImport
      parentRoute: typeof AuthRouteRoute
    }
    '/_auth/reset-password': {
      id: '/_auth/reset-password'
      path: '/reset-password'
      fullPath: '/reset-password'
      preLoaderRoute: typeof AuthResetPasswordRouteImport
      parentRoute: typeof AuthRouteRoute
    }
    '/_auth/login': {
      id: '/_auth/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof AuthLoginRouteImport
      parentRoute: typeof AuthRouteRoute
    }
    '/_dashboard/$slug': {
      id: '/_dashboard/$slug'
      path: '/$slug'
      fullPath: '/$slug'
      preLoaderRoute: typeof DashboardSlugRouteRouteImport
      parentRoute: typeof DashboardRouteRoute
    }
    '/_dashboard/$slug/': {
      id: '/_dashboard/$slug/'
      path: '/'
      fullPath: '/$slug/'
      preLoaderRoute: typeof DashboardSlugIndexRouteImport
      parentRoute: typeof DashboardSlugRouteRoute
    }
    '/_dashboard/account/tokens': {
      id: '/_dashboard/account/tokens'
      path: '/account/tokens'
      fullPath: '/account/tokens'
      preLoaderRoute: typeof DashboardAccountTokensRouteImport
      parentRoute: typeof DashboardRouteRoute
    }
    '/_dashboard/account/preferences': {
      id: '/_dashboard/account/preferences'
      path: '/account/preferences'
      fullPath: '/account/preferences'
      preLoaderRoute: typeof DashboardAccountPreferencesRouteImport
      parentRoute: typeof DashboardRouteRoute
    }
    '/_dashboard/$slug/tasks': {
      id: '/_dashboard/$slug/tasks'
      path: '/tasks'
      fullPath: '/$slug/tasks'
      preLoaderRoute: typeof DashboardSlugTasksRouteImport
      parentRoute: typeof DashboardSlugRouteRoute
    }
    '/_dashboard/$slug/expenses': {
      id: '/_dashboard/$slug/expenses'
      path: '/expenses'
      fullPath: '/$slug/expenses'
      preLoaderRoute: typeof DashboardSlugExpensesRouteImport
      parentRoute: typeof DashboardSlugRouteRoute
    }
    '/_dashboard/$slug/settings': {
      id: '/_dashboard/$slug/settings'
      path: '/settings'
      fullPath: '/$slug/settings'
      preLoaderRoute: typeof DashboardSlugSettingsRouteRouteImport
      parentRoute: typeof DashboardSlugRouteRoute
    }
    '/_dashboard/$slug/settings/': {
      id: '/_dashboard/$slug/settings/'
      path: '/'
      fullPath: '/$slug/settings/'
      preLoaderRoute: typeof DashboardSlugSettingsIndexRouteImport
      parentRoute: typeof DashboardSlugSettingsRouteRoute
    }
    '/_dashboard/$slug/settings/workspace': {
      id: '/_dashboard/$slug/settings/workspace'
      path: '/workspace'
      fullPath: '/$slug/settings/workspace'
      preLoaderRoute: typeof DashboardSlugSettingsWorkspaceRouteImport
      parentRoute: typeof DashboardSlugSettingsRouteRoute
    }
    '/_dashboard/$slug/settings/photos': {
      id: '/_dashboard/$slug/settings/photos'
      path: '/photos'
      fullPath: '/$slug/settings/photos'
      preLoaderRoute: typeof DashboardSlugSettingsPhotosRouteImport
      parentRoute: typeof DashboardSlugSettingsRouteRoute
    }
    '/_dashboard/$slug/settings/members': {
      id: '/_dashboard/$slug/settings/members'
      path: '/members'
      fullPath: '/$slug/settings/members'
      preLoaderRoute: typeof DashboardSlugSettingsMembersRouteImport
      parentRoute: typeof DashboardSlugSettingsRouteRoute
    }
    '/_dashboard/$slug/settings/library': {
      id: '/_dashboard/$slug/settings/library'
      path: '/library'
      fullPath: '/$slug/settings/library'
      preLoaderRoute: typeof DashboardSlugSettingsLibraryRouteImport
      parentRoute: typeof DashboardSlugSettingsRouteRoute
    }
    '/_auth/invite/$id/accept': {
      id: '/_auth/invite/$id/accept'
      path: '/invite/$id/accept'
      fullPath: '/invite/$id/accept'
      preLoaderRoute: typeof AuthInviteIdAcceptRouteImport
      parentRoute: typeof AuthRouteRoute
    }
  }
}

interface AuthRouteRouteChildren {
  AuthLoginRoute: typeof AuthLoginRoute
  AuthResetPasswordRoute: typeof AuthResetPasswordRoute
  AuthSignupRoute: typeof AuthSignupRoute
  AuthVerifyEmailRoute: typeof AuthVerifyEmailRoute
  AuthInviteIdAcceptRoute: typeof AuthInviteIdAcceptRoute
}

const AuthRouteRouteChildren: AuthRouteRouteChildren = {
  AuthLoginRoute: AuthLoginRoute,
  AuthResetPasswordRoute: AuthResetPasswordRoute,
  AuthSignupRoute: AuthSignupRoute,
  AuthVerifyEmailRoute: AuthVerifyEmailRoute,
  AuthInviteIdAcceptRoute: AuthInviteIdAcceptRoute,
}

const AuthRouteRouteWithChildren = AuthRouteRoute._addFileChildren(
  AuthRouteRouteChildren,
)

interface DashboardSlugSettingsRouteRouteChildren {
  DashboardSlugSettingsLibraryRoute: typeof DashboardSlugSettingsLibraryRoute
  DashboardSlugSettingsMembersRoute: typeof DashboardSlugSettingsMembersRoute
  DashboardSlugSettingsPhotosRoute: typeof DashboardSlugSettingsPhotosRoute
  DashboardSlugSettingsWorkspaceRoute: typeof DashboardSlugSettingsWorkspaceRoute
  DashboardSlugSettingsIndexRoute: typeof DashboardSlugSettingsIndexRoute
}

const DashboardSlugSettingsRouteRouteChildren: DashboardSlugSettingsRouteRouteChildren =
  {
    DashboardSlugSettingsLibraryRoute: DashboardSlugSettingsLibraryRoute,
    DashboardSlugSettingsMembersRoute: DashboardSlugSettingsMembersRoute,
    DashboardSlugSettingsPhotosRoute: DashboardSlugSettingsPhotosRoute,
    DashboardSlugSettingsWorkspaceRoute: DashboardSlugSettingsWorkspaceRoute,
    DashboardSlugSettingsIndexRoute: DashboardSlugSettingsIndexRoute,
  }

const DashboardSlugSettingsRouteRouteWithChildren =
  DashboardSlugSettingsRouteRoute._addFileChildren(
    DashboardSlugSettingsRouteRouteChildren,
  )

interface DashboardSlugRouteRouteChildren {
  DashboardSlugSettingsRouteRoute: typeof DashboardSlugSettingsRouteRouteWithChildren
  DashboardSlugExpensesRoute: typeof DashboardSlugExpensesRoute
  DashboardSlugTasksRoute: typeof DashboardSlugTasksRoute
  DashboardSlugIndexRoute: typeof DashboardSlugIndexRoute
}

const DashboardSlugRouteRouteChildren: DashboardSlugRouteRouteChildren = {
  DashboardSlugSettingsRouteRoute: DashboardSlugSettingsRouteRouteWithChildren,
  DashboardSlugExpensesRoute: DashboardSlugExpensesRoute,
  DashboardSlugTasksRoute: DashboardSlugTasksRoute,
  DashboardSlugIndexRoute: DashboardSlugIndexRoute,
}

const DashboardSlugRouteRouteWithChildren =
  DashboardSlugRouteRoute._addFileChildren(DashboardSlugRouteRouteChildren)

interface DashboardRouteRouteChildren {
  DashboardSlugRouteRoute: typeof DashboardSlugRouteRouteWithChildren
  DashboardIndexRoute: typeof DashboardIndexRoute
  DashboardAccountPreferencesRoute: typeof DashboardAccountPreferencesRoute
  DashboardAccountTokensRoute: typeof DashboardAccountTokensRoute
}

const DashboardRouteRouteChildren: DashboardRouteRouteChildren = {
  DashboardSlugRouteRoute: DashboardSlugRouteRouteWithChildren,
  DashboardIndexRoute: DashboardIndexRoute,
  DashboardAccountPreferencesRoute: DashboardAccountPreferencesRoute,
  DashboardAccountTokensRoute: DashboardAccountTokensRoute,
}

const DashboardRouteRouteWithChildren = DashboardRouteRoute._addFileChildren(
  DashboardRouteRouteChildren,
)

const rootRouteChildren: RootRouteChildren = {
  AuthRouteRoute: AuthRouteRouteWithChildren,
  DashboardRouteRoute: DashboardRouteRouteWithChildren,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
