"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

// 定义 Context 类型
interface AppContextType {
  tefValue: number;
  setTefValue: (value: number) => void;
    totalLef: number;
  settotalLef: (value: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);


// 创建 Provider
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [tefValue, setTefValue] = useState<number>(2.5); // 初始值为 2.5
const [totalLef, settotalLef] = useState(1); // 默认值为1
  return (
    <AppContext.Provider value={{ tefValue, setTefValue,totalLef,settotalLef}}>
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