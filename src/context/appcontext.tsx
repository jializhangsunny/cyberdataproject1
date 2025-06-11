"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

// 定义 Context 类型
interface AppContextType {
  tefValue: number;
  setTefValue: (value: number) => void;
  totalLef: number;
  settotalLef: (value: number) => void;
  totalRisk: number;
  setTotalRisk: (value: number) => void;
  // 新增：共享的威胁行为者状态
  selectedThreatActorId: string | null;
  setSelectedThreatActorId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// 创建 Provider
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [tefValue, setTefValue] = useState<number>(2.5); // 初始值为 2.5
  const [totalLef, settotalLef] = useState<number>(1); // 默认值为1
  const [totalRisk, setTotalRisk] = useState<number>(0); // 默认值为0
  
  // 新增：威胁行为者选择状态
  const [selectedThreatActorId, setSelectedThreatActorId] = useState<string | null>(null);

  return (
    <AppContext.Provider value={{ 
      tefValue, 
      setTefValue,
      totalLef,
      settotalLef, 
      totalRisk,
      setTotalRisk,
      selectedThreatActorId,
      setSelectedThreatActorId
    }}>
      {children}
    </AppContext.Provider>
  );
};

// 创建自定义 Hook 来访问 Context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};