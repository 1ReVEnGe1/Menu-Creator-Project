"use client";

import { signOut } from "next-auth/react";
import styles from "./DashHeaderComp.module.css";
import { MdMenu } from "react-icons/md";
import { useDashboard } from "@/hooks/useDashboard";

interface DashHeaderType {
  fullname: string;
}

const DashHeader = ({ fullname }: DashHeaderType) => {
  const {setSidebarOpen} = useDashboard()


  return (
    <header className="mb-8 flex justify-between items-center bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-slate-100">
      <MdMenu onClick={()=> setSidebarOpen(prev => !prev) } className="block md:hidden text-3xl" />
      <span className="text-sm md:text-lg font-bold text-slate-700">
        خوش آمدید {fullname} 👋
      </span>
       
      <div className={`${styles["dropdown-container"]} flex justify-center items-center gap-2`}>
        
        <button className=" w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
          A
        </button>
        <div className={`${styles["dropdown-content"]}`}>
          <ul>
            <li className="text-red-600" onClick={() => signOut()}>
              {" "}
              خروج{" "}
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default DashHeader;
