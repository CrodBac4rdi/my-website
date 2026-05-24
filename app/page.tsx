import { Rocket, TrendingUp, Users, Bell, Search, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 font-sans overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10 text-blue-500">
          <Rocket size={28} />
          <span className="text-xl font-bold tracking-wider text-white">HORIZON</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <a href="#" className="flex items-center gap-3 text-blue-400 bg-blue-900/20 px-4 py-3 rounded-lg transition border border-blue-900/50">
            <Activity size={20} /> Mission Control
          </a>
          <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-slate-50 hover:bg-slate-800 px-4 py-3 rounded-lg transition">
            <TrendingUp size={20} /> Market Data
          </a>
          <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-slate-50 hover:bg-slate-800 px-4 py-3 rounded-lg transition">
            <Users size={20} /> Social Sentiment
          </a>
        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* HEADER */}
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-10 bg-slate-950/80 sticky top-0 backdrop-blur-md">
          <h1 className="text-2xl font-semibold">Overview</h1>
          <div className="flex items-center gap-6 text-slate-400">
            <Search className="hover:text-white cursor-pointer transition" size={20} />
            <Bell className="hover:text-white cursor-pointer transition" size={20} />
            {/* Profilbild-Dummy */}
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full border-2 border-slate-800 cursor-pointer"></div>
          </div>
        </header>

        {/* DASHBOARD WIDGETS */}
        <div className="p-10 space-y-8">
          
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: ASTS Stock */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between shadow-lg shadow-black/20 hover:border-slate-700 transition">
              <div>
                <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">ASTS Stock Price</p>
                <p className="text-3xl font-bold text-green-400">$24.50 <span className="text-sm font-normal text-green-500/70 ml-2">+12.4%</span></p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg text-green-500">
                <TrendingUp size={24} />
              </div>
            </div>

            {/* Card 2: Next Launch */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between shadow-lg shadow-black/20 hover:border-slate-700 transition">
              <div>
                <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Next RKLB Launch</p>
                <p className="text-3xl font-bold text-white">T- 3 Days</p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg text-blue-500">
                <Rocket size={24} />
              </div>
            </div>

            {/* Card 3: Sentiment */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between shadow-lg shadow-black/20 hover:border-slate-700 transition">
              <div>
                <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Reddit Sentiment</p>
                <p className="text-3xl font-bold text-purple-400">Bullish</p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-lg text-purple-500">
                <Users size={24} />
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold mb-6 text-white">Upcoming Orbital Missions</h2>
            <div className="w-full">
              
              {/* Table Header */}
              <div className="grid grid-cols-4 text-slate-400 text-sm border-b border-slate-800 pb-3 mb-3 uppercase tracking-wider font-semibold">
                <div>Company</div>
                <div>Payload</div>
                <div>Date</div>
                <div>Status</div>
              </div>
              
              {/* Table Row 1 */}
              <div className="grid grid-cols-4 items-center py-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition px-2 -mx-2 rounded-lg">
                <div className="font-medium text-white flex items-center gap-2">Rocket Lab</div>
                <div className="text-slate-300">Kinéis Killed the RadIoT Star</div>
                <div className="text-slate-400">June 20, 2026</div>
                <div><span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-medium">Scheduled</span></div>
              </div>
              
              {/* Table Row 2 */}
              <div className="grid grid-cols-4 items-center py-4 hover:bg-slate-800/30 transition px-2 -mx-2 rounded-lg">
                <div className="font-medium text-white">SpaceX</div>
                <div className="text-slate-300">Starlink Group 9-2</div>
                <div className="text-slate-400">June 23, 2026</div>
                <div><span className="bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">Go for Launch</span></div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}