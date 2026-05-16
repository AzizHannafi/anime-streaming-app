import React, { createContext, useContext, useState, useEffect } from "react";

interface AgeVerificationContextType {
  isAgeVerified: boolean;
  verifyAge: () => void;
  resetAgeVerification: () => void;
}

const AgeVerificationContext = createContext<AgeVerificationContextType | undefined>(undefined);

export function AgeVerificationProvider({ children }: { children: React.ReactNode }) {
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load age verification status from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("animeverse_age_verified");
    if (stored === "true") {
      setIsAgeVerified(true);
    }
    setIsLoading(false);
  }, []);

  const verifyAge = () => {
    setIsAgeVerified(true);
    localStorage.setItem("animeverse_age_verified", "true");
  };

  const resetAgeVerification = () => {
    setIsAgeVerified(false);
    localStorage.removeItem("animeverse_age_verified");
  };

  if (isLoading) {
    return <div className="w-full h-screen bg-black" />;
  }

  return (
    <AgeVerificationContext.Provider value={{ isAgeVerified, verifyAge, resetAgeVerification }}>
      {children}
    </AgeVerificationContext.Provider>
  );
}

export function useAgeVerification() {
  const context = useContext(AgeVerificationContext);
  if (!context) {
    throw new Error("useAgeVerification must be used within AgeVerificationProvider");
  }
  return context;
}
