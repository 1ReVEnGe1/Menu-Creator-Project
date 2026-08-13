'use client'

import { createContext, useState } from "react"

interface DashboardContextType {
    sidebarOpen : boolean,
    setSidebarOpen : React.Dispatch<React.SetStateAction<boolean>>
}


export const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({children} : {children : React.ReactNode} ){
    const [sidebarOpen, setSidebarOpen]= useState(false)

    return (
        <DashboardContext.Provider
            value = {{
                sidebarOpen,
                setSidebarOpen
            }}
        >
            {children}
        </DashboardContext.Provider>
    )
}