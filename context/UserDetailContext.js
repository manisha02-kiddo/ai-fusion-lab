"use client";

import { createContext, useContext } from "react";

// Correctly create and export the context
export const UserDetailContext = createContext(null);

// Optional hook for convenience
export const useUserDetail = () => useContext(UserDetailContext);
