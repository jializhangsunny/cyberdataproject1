"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface AppContextType {
  tefValue: number;
  setTefValue: (value: number) => void;
  totalLef: number;
  settotalLef: (value: number) => void;
  totalRisk: number;
  setTotalRisk: (value: number) => void;
  selectedThreatActorId: string | null;
  setSelectedThreatActorId: (id: string | null) => void;
  resetCalculations: () => void;
}

const STORAGE_KEYS = {
  TEF_VALUE: 'calc_tef_value',
  TOTAL_LEF: 'calc_total_lef', 
  TOTAL_RISK: 'calc_total_risk',
  SELECTED_THREAT_ACTOR: 'calc_selected_threat_actor'
} as const;

// Simple localStorage utilities
const storage = {
  get: (key: string, defaultValue: any) => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with localStorage values
  const [tefValue, setTefValueState] = useState<number>(() => 
    storage.get(STORAGE_KEYS.TEF_VALUE, 0)
  );
  
  const [totalLef, settotalLefState] = useState<number>(() => 
    storage.get(STORAGE_KEYS.TOTAL_LEF, 1)
  );
  
  const [totalRisk, setTotalRiskState] = useState<number>(() => 
    storage.get(STORAGE_KEYS.TOTAL_RISK, 0)
  );
  
  const [selectedThreatActorId, setSelectedThreatActorIdState] = useState<string | null>(() => 
    storage.get(STORAGE_KEYS.SELECTED_THREAT_ACTOR, null)
  );

  // Wrapped setters that persist to localStorage
  const setTefValue = (value: number) => {
    setTefValueState(value);
    storage.set(STORAGE_KEYS.TEF_VALUE, value);
  };

  const settotalLef = (value: number) => {
    settotalLefState(value);
    storage.set(STORAGE_KEYS.TOTAL_LEF, value);
  };

  const setTotalRisk = (value: number) => {
    setTotalRiskState(value);
    storage.set(STORAGE_KEYS.TOTAL_RISK, value);
  };

  const setSelectedThreatActorId = (id: string | null) => {
    setSelectedThreatActorIdState(id);
    storage.set(STORAGE_KEYS.SELECTED_THREAT_ACTOR, id);
  };

  // Reset all calculations (useful for starting fresh)
  const resetCalculations = () => {
    setTefValue(0);
    settotalLef(1);
    setTotalRisk(0);
    setSelectedThreatActorId(null);
  };

  return (
    <AppContext.Provider value={{ 
      tefValue, 
      setTefValue,
      totalLef,
      settotalLef, 
      totalRisk,
      setTotalRisk,
      selectedThreatActorId,
      setSelectedThreatActorId,
      resetCalculations
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};