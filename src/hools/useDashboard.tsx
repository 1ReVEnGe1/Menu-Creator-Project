import { DashboardContext } from "@/components/Providers/DashboardContext";
import { useContext } from "react";

export function useDashboard(){
    const context = useContext(DashboardContext)

    if(!context){
        throw new Error("useDashboard must be used inside DashboardProvider")
    }

    return context
}