import { createContext, useContext } from 'react';

/** What an `AppShell` tells the components rendered inside its slots. */
export interface AppShellContextValue {
  /** True below the tablet breakpoint — the primary sidebar renders icon-only. */
  collapsed: boolean;
}

export const AppShellContext = createContext<AppShellContextValue | null>(null);

/** The surrounding `AppShell`'s state, or `null` outside one. */
export function useAppShell(): AppShellContextValue | null {
  return useContext(AppShellContext);
}
