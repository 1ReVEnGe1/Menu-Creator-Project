

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    
      <main className="max-w-md min-h-screen mx-auto text-[#f3edf2] antialiased selection:bg-[#85004E] selection:text-white dir-rtl relative overflow-x-hidden">
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[20%] w-112.5 h-112.5 bg-[#85004E]/30 rounded-full blur-[130px] animate-pulse" />
          <div className="absolute top-[40%] right-[-20%] w-95 h-95 bg-[#b5006b]/20 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-100 h-=100 bg-[#50002e]/30 rounded-full blur-[150px]" />
        </div>
        <div className=" min-h-screen mx-auto  bg-white/1 backdrop-blur-3xl relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] border-x border-white/10 flex flex-col z-10">
          {children}
        </div>
      </main>
    
  );
}
