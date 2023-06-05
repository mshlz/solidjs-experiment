import { lazy } from "solid-js"
import type { RouteDefinition } from "@solidjs/router"

export const routes: RouteDefinition[] = [
  {
    path: "/login",
    component: lazy(() => import("./pages/login/LoginScene"))
  },
  {
    path: "/home",
    component: lazy(() => import("./pages/home/HomeScene"))
  },
  {
    path: "**",
    component: lazy(() => import("./pages/errors/404"))
  }
]
