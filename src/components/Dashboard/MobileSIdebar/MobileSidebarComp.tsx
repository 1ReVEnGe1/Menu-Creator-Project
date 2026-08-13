"use client";

import Link from "next/link";
import { CgClose } from "react-icons/cg";
import DashSidebarComp from "../Sidebar/DashSidebarComp";
import { useState } from "react";
import { useDashboard } from "@/hools/useDashboard";

interface MobileSidebarCompProps {
  role: string;
  permissions: string[];
}

const MobileSidebarComp = ({ role, permissions }: MobileSidebarCompProps) => {
    const {sidebarOpen, setSidebarOpen} = useDashboard()

  if (sidebarOpen) {
    return (
      <aside className="w-56 h-screen fixed left-0 z-10 bg-white p-4 shadow-[10px_0_20px_-10px_rgba(0,0,0,0.2)]">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-2xl font-bold flex justify-center items-center bg-gray-50 p-1 rounded-md"
          >
            <CgClose />
          </button>
          <Link
            className=" block bg-indigo-50 w-fit py-1.5 px-2.5 hover:bg-gray-200 text-sm rounded-lg text-blue-700"
            href={"/"}
          >
            مشاهده سایت
          </Link>
        </div>

        <div className="mt-5">
          <hr className="border border-gray-200" />

          {/* منوی ناوبری پویا */}
          <DashSidebarComp
            role={role}
            permissions={permissions}
            isOnMobile={true}
          />
        </div>
      </aside>
    );
  } else {
    return null;
  }
};

export default MobileSidebarComp;
