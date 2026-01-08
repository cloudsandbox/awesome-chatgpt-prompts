"use client";

import { createContext, useContext, type ReactNode } from "react";

interface RunDestination {
  id: string;
  name: string;
  url: string;
  icon?: string;
  supportsQuerystring?: boolean;
}

interface RunDestinationsContextValue {
  corporate: RunDestination[];
  showPublicPlatforms: boolean;
}

const RunDestinationsContext = createContext<RunDestinationsContextValue | null>(null);

interface RunDestinationsProviderProps {
  children: ReactNode;
  runDestinations?: {
    corporate?: RunDestination[];
    showPublicPlatforms?: boolean;
  };
}

export function RunDestinationsProvider({ children, runDestinations }: RunDestinationsProviderProps) {
  const value: RunDestinationsContextValue = {
    corporate: runDestinations?.corporate ?? [],
    showPublicPlatforms: runDestinations?.showPublicPlatforms ?? true,
  };

  return (
    <RunDestinationsContext.Provider value={value}>
      {children}
    </RunDestinationsContext.Provider>
  );
}

export function useRunDestinations(): RunDestinationsContextValue {
  const context = useContext(RunDestinationsContext);
  if (!context) {
    // Return default values if provider is not set up
    return {
      corporate: [],
      showPublicPlatforms: true,
    };
  }
  return context;
}
