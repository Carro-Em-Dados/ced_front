"use client";
import { ReactNode, createContext, useContext, useState } from 'react';

interface WorkshopContextData {

}

interface WorkshopProviderProps {
    children: ReactNode
}

export const WorkshopContext = createContext<WorkshopContextData>({} as WorkshopContextData);

export function AuthProvider({ children }: WorkshopProviderProps) {

    return (
        <WorkshopContext.Provider
            value={{}}>
            {children}
        </WorkshopContext.Provider>
    );
}

export default AuthProvider;