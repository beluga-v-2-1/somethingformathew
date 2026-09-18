import { useState } from "react";
import { Search, QrCode, ReceiptText, Heart, Shield } from "lucide-react";
import { StockProvider } from "./context/StockContext";
import PatientSearch   from "./views/PatientSearch";
import PharmacistPortal from "./views/PharmacistPortal";
import POSSimulator    from "./views/POSSimulator";

const TABS = [
  {
    id: "patient",
    label: "Patient Search",
    shortLabel: "Search",
    icon: Search,
    description: "Find medicines at nearby government facilities",
    color: "text-blue-600",
    activeBg: "bg-blue-600",
    activeText: "text-white",
    hoverBg: "hover:bg-blue-50",
  },
  {
    id: "pharmacist",
    label: "Pharmacist Portal",
    shortLabel: "QR Stocking",
    icon: QrCode,
    description: "Scan QR codes to update stock",
    color: "text-purple-600",
    activeBg: "bg-purple-600",
    activeText: "text-white",
    hoverBg: "hover:bg-purple-50",
  },
  {
    id: "pos",
    label: "POS Auto-Sync",
    shortLabel: "POS Sync",
    icon: ReceiptText,
    description: "Simulate billing software purchase events",
    color: "text-teal-600",
    activeBg: "bg-teal-600",
    activeText: "text-white",
    hoverBg: "hover:bg-teal-50",
  },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState("patient");
  const tab = TABS.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top app bar ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          {/* Brand */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <Heart size={15} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-sm leading-tight">MediFind Gov</h1>
                <p className="text-[10px] text-gray-400 leading-tight">SC-10 · Medicine Availability Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full">
              <Shield size={11} />
              <span>Government of India</span>
            </div>
          </div>

          {/* Tab bar */}
          <nav className="flex gap-1 py-2">
            {TABS.map(t => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                    ${isActive
                      ? `${t.activeBg} ${t.activeText} shadow-sm`
                      : `text-gray-500 ${t.hoverBg} hover:text-gray-700`
                    }
                  `}
                >
                  <Icon size={15} />
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">{t.shortLabel}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === "patient"    && <PatientSearch />}
        {activeTab === "pharmacist" && <PharmacistPortal />}
        {activeTab === "pos"        && <POSSimulator />}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white mt-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-gray-400">
          <span>MediFind Gov · Problem Statement SC-10</span>
          <span>Built for Smart India Hackathon 2024</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <StockProvider>
      <AppContent />
    </StockProvider>
  );
}
