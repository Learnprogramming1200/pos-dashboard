// This file is for server components only - it exports both ServerActionslib and ServerApilib
// Client components should use '@/lib' instead (which only exports ServerActionslib)
import * as ServerActionslib from "./server-actions";
import * as ServerApilib from "./ssr-api";

export const ServerActions = {
  ServerActionslib,
  ServerApilib,
}

