import { useState, useRef } from "react";
import {
  ShoppingCart, Zap, CheckCircle2, XCircle, ChevronDown,
  ReceiptText, RefreshCw, Wifi, Database, Clock
} from "lucide-react";
import { MEDICINES, PHARMACIES } from "../data/mockData";
import { useStock } from "../context/StockContext";
import { timeAgo, stockStatus } from "../utils/helpers";

// ── Event log entry ───────────────────────────────────────────────────────────
function LogEntry({ entry }) {
  const isSuccess = entry.type === "success";
  return (
    <div className={`flex items-start gap-2.5 text-xs py-2 border-b border-gray-100 last:border-0
      ${isSuccess ? "text-gray-700" : "text-red-600"}`}>
      {isSuccess
        ? <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-green-500" />
        : <XCircle size={13} className="shrink-0 mt-0.5 text-red-500" />
      }
      <div className="flex-1 min-w-0">
        <p className="font-medium leading-tight">{entry.message}</p>
        <p className="text-gray-400 mt-0.5">{entry.timestamp.toLocaleTimeString()} · {entry.endpoint}</p>
      </div>
      {isSuccess && (
        <span className="shrink-0 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
          200 OK
        </span>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function POSSimulator() {
  const { stock, updateStock } = useStock();

  const [selectedPharmacy, setSelectedPharmacy] = useState(PHARMACIES[0].id);
  const [selectedMed, setSelectedMed]           = useState(MEDICINES[0].id);
  const [deductQty, setDeductQty]               = useState(1);
  const [firing, setFiring]                     = useState(false);
  const [log, setLog]                           = useState([]);
  const [lastResult, setLastResult]             = useState(null);
  const logRef = useRef(null);

  const pharmacy = PHARMACIES.find(p => p.id === selectedPharmacy);
  const medicine = MEDICINES.find(m => m.id === selectedMed);
  const entry    = stock[selectedPharmacy]?.[selectedMed];
  const status   = stockStatus(entry?.qty ?? 0);

  // Simulate a customer purchase (POS webhook → deduct stock)
  async function simulatePurchase() {
    if (firing) return;
    setFiring(true);
    setLastResult(null);

    // Simulate API latency
    await new Promise(r => setTimeout(r, 800));

    const currentQty = entry?.qty ?? 0;

    if (currentQty <= 0) {
      const errEntry = {
        type: "error",
        message: `Purchase FAILED — ${medicine.name} is out of stock at ${pharmacy.name}`,
        endpoint: `POST /api/pos/webhook → pharmacy=${selectedPharmacy}&med=${selectedMed}`,
        timestamp: new Date(),
      };
      setLog(prev => [errEntry, ...prev]);
      setLastResult({ success: false, message: "Out of stock — cannot process purchase." });
      setFiring(false);
      return;
    }

    const actualDeduct = Math.min(deductQty, currentQty);
    updateStock(selectedPharmacy, selectedMed, -actualDeduct, "POS Sync");

    const successEntry = {
      type: "success",
      message: `${medicine.name} × ${actualDeduct} sold at ${pharmacy.name} · Stock: ${currentQty} → ${currentQty - actualDeduct}`,
      endpoint: `POST /api/pos/webhook · payload: { pharmacyId: "${selectedPharmacy}", medicineId: "${selectedMed}", qty: -${actualDeduct} }`,
      timestamp: new Date(),
    };
    setLog(prev => [successEntry, ...prev]);
    setLastResult({
      success: true,
      message: `Deducted ${actualDeduct} unit(s). New stock: ${currentQty - actualDeduct}`,
      newQty: currentQty - actualDeduct,
    });
    setFiring(false);
  }

  // Batch simulate: multiple random purchases
  async function simulateBatch() {
    if (firing) return;
    const count = 5;
    for (let i = 0; i < count; i++) {
      const randPh  = PHARMACIES[Math.floor(Math.random() * PHARMACIES.length)];
      const randMed = MEDICINES[Math.floor(Math.random() * MEDICINES.length)];
      const qty     = Math.floor(Math.random() * 5) + 1;
      const cur     = stock[randPh.id]?.[randMed.id]?.qty ?? 0;
      if (cur > 0) {
        const actual = Math.min(qty, cur);
        updateStock(randPh.id, randMed.id, -actual, "POS Sync");
        setLog(prev => [{
          type: "success",
          message: `${randMed.name} × ${actual} sold at ${randPh.name}`,
          endpoint: `POST /api/pos/webhook · batch event ${i + 1}/${count}`,
          timestamp: new Date(),
        }, ...prev]);
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <ReceiptText size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg">POS Billing Auto-Sync Simulator</h2>
            <p className="text-emerald-100 text-xs">
              Simulates the local pharmacy billing software firing purchase webhooks
            </p>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 mt-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span className="text-xs text-white/80">Webhook endpoint: POST /api/pos/webhook · Listening</span>
        </div>
      </div>

      {/* API flow diagram */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">How POS Auto-Sync Works</h3>
        <div className="flex items-center gap-1 text-xs overflow-x-auto pb-1">
          {[
            { icon: <ReceiptText size={13} />, label: "POS Billing\nSoftware", color: "bg-teal-50 border-teal-200 text-teal-700" },
            { arrow: true },
            { icon: <Wifi size={13} />, label: "HTTP Webhook\nPOST /api/pos", color: "bg-blue-50 border-blue-200 text-blue-700" },
            { arrow: true },
            { icon: <Database size={13} />, label: "Stock DB\nUpdate", color: "bg-purple-50 border-purple-200 text-purple-700" },
            { arrow: true },
            { icon: <RefreshCw size={13} />, label: "Timestamp\nRefreshed", color: "bg-green-50 border-green-200 text-green-700" },
          ].map((step, i) =>
            step.arrow ? (
              <div key={i} className="text-gray-300 font-bold px-0.5 shrink-0">→</div>
            ) : (
              <div key={i} className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl border shrink-0 ${step.color}`}>
                {step.icon}
                <span className="text-center leading-tight whitespace-pre-wrap font-medium text-[10px]">{step.label}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Control panel */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm">Simulate Customer Purchase</h3>

        {/* Pharmacy selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Pharmacy / Health Centre</label>
          <div className="relative">
            <select
              value={selectedPharmacy}
              onChange={e => setSelectedPharmacy(e.target.value)}
              className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-400 pr-8"
            >
              {PHARMACIES.map(ph => (
                <option key={ph.id} value={ph.id}>{ph.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Medicine selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Medicine</label>
          <div className="relative">
            <select
              value={selectedMed}
              onChange={e => setSelectedMed(e.target.value)}
              className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-400 pr-8"
            >
              {MEDICINES.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Current stock display */}
        <div className={`rounded-xl p-3 border flex items-center gap-3 ${
          (entry?.qty ?? 0) === 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
        }`}>
          <div className="flex-1">
            <p className="text-xs text-gray-500">Current Stock at Selected Facility</p>
            <p className="font-bold text-gray-800 text-lg">{entry?.qty ?? 0} <span className="text-sm font-normal text-gray-500">units</span></p>
            {entry?.updatedAt && (
              <div className="flex items-center gap-1 text-xs text-indigo-600 mt-0.5">
                <Clock size={10} />
                <span>Updated {timeAgo(entry.updatedAt)} via {entry.syncMethod}</span>
              </div>
            )}
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Quantity */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Units to Deduct (customer purchase)</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDeductQty(q => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold"
            >−</button>
            <input
              type="number"
              min={1}
              value={deductQty}
              onChange={e => setDeductQty(Math.max(1, Number(e.target.value)))}
              className="w-20 text-center border border-gray-200 rounded-xl py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"
            />
            <button
              onClick={() => setDeductQty(q => q + 1)}
              className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold"
            >+</button>
            <span className="text-sm text-gray-500">units</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={simulatePurchase}
            disabled={firing}
            className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {firing ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                Firing webhook…
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                Simulate Customer Purchase
              </>
            )}
          </button>
          <button
            onClick={simulateBatch}
            disabled={firing}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-colors"
            title="Simulate 5 random purchases across all pharmacies"
          >
            <Zap size={15} />
            Batch ×5
          </button>
        </div>

        {/* Result banner */}
        {lastResult && (
          <div className={`rounded-xl p-3 flex items-center gap-2 text-sm font-medium border
            ${lastResult.success
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
            }`}>
            {lastResult.success
              ? <CheckCircle2 size={16} className="shrink-0" />
              : <XCircle size={16} className="shrink-0" />
            }
            {lastResult.message}
          </div>
        )}
      </div>

      {/* Webhook event log */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
            <Database size={14} className="text-gray-400" />
            Webhook Event Log
          </h3>
          {log.length > 0 && (
            <button
              onClick={() => setLog([])}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {log.length === 0 ? (
          <div className="text-center text-gray-400 py-6 text-xs">
            <Database size={28} className="mx-auto mb-2 opacity-30" />
            No events yet. Click "Simulate Customer Purchase" to fire a webhook.
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto" ref={logRef}>
            {log.map((entry, i) => <LogEntry key={i} entry={entry} />)}
          </div>
        )}
      </div>

      {/* Live stock overview */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
        <h3 className="font-semibold text-gray-800 text-sm">Live Stock Snapshot — All Facilities</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="text-left py-1.5 font-medium">Medicine</th>
                {PHARMACIES.map(ph => (
                  <th key={ph.id} className="text-center py-1.5 font-medium px-1 whitespace-nowrap">
                    {ph.name.split(" ").slice(0, 2).join(" ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEDICINES.map(med => (
                <tr key={med.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-1.5 font-medium text-gray-700 pr-2 whitespace-nowrap">{med.name}</td>
                  {PHARMACIES.map(ph => {
                    const e = stock[ph.id]?.[med.id];
                    const s = stockStatus(e?.qty ?? 0);
                    return (
                      <td key={ph.id} className="text-center py-1.5 px-1">
                        <span className={`inline-block px-1.5 py-0.5 rounded-full border text-[10px] font-bold ${s.color}`}>
                          {e?.qty ?? 0}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
