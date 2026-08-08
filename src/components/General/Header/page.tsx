import React from "react";

const Header = () => {
  return (
    <header className="h-20 px-6 sticky top-0 z-40 bg-white/3 backdrop-blur-2xl backdrop-saturate-200 border-b border-white/10 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-3.5">
        <div className="relative w-10 h-10 rounded-2xl bg-linear-to-br from-white/20 to-white/5 border border-white/30 p-0.5 shadow-lg shadow-[#85004E]/30 backdrop-blur-md">
          <div className="w-full h-full rounded-[14px] bg-linear-to-br from-[#b5006b] to-[#85004E] flex items-center justify-center font-black text-base text-white">
            B
          </div>
        </div>
        <div>
          <span className="tracking-[4px] font-black text-sm bg-linear-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent block drop-shadow-sm">
            BARMAN
          </span>
          <span className="text-[8px] tracking-[2px] text-[#e250a2] font-extrabold block -mt-0.5 uppercase">
            Events & Services
          </span>
        </div>
      </div>

    </header>
  );
};

export default Header;
