import React, { createContext, useContext, useState, useEffect } from "react";

interface UserData {
  certificationType?: string; // "cca", "xxx", "lideranca"
  level?: number; // 1 or 2
  journeyType?: string; // "direct", "prep", "complete"
  basicInfo?: {
    name: string;
    cpf: string;
    email: string;
    phone: string;
  };
  professionalInfo?: {
    formation: string;
    experience: string;
    projects: string;
    highlights: string;
  };
  proofResult?: "approved" | "failed" | null;
}

interface UserDataContextType {
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
  clearUserData: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem("userData");
    return saved ? JSON.parse(saved) : {};
  });

  // Save to localStorage whenever userData changes
  useEffect(() => {
    localStorage.setItem("userData", JSON.stringify(userData));
  }, [userData]);

  const updateUserData = (data: Partial<UserData>) => {
    setUserData((prev) => ({ ...prev, ...data }));
  };

  const clearUserData = () => {
    setUserData({});
    localStorage.removeItem("userData");
  };

  return (
    <UserDataContext.Provider value={{ userData, updateUserData, clearUserData }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within UserDataProvider");
  }
  return context;
}
