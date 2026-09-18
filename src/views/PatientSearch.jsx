import { useState, useMemo } from "react";
import {
  Search, MapPin, Clock, Phone, Building2, AlertTriangle,
  ArrowRight, ChevronDown, ChevronUp, RefreshCw
} from "lucide-react";
import { MEDICINES, PHARMACIES, GENERIC_MAP } from "../data/mockData";
import { useStock } from "../context/StockContext";
import { timeAgo, stockStatus, normalize } from "../utils/helpers";

// ── Sync method icon colour ───────────────────────────────────────────────────
function SyncBadge({ method }) {
  const map = {
    "POS Sync":     "bg-blue-100 text-blue-700",
    "QR Scan":      "bg-purple-100 text-purple-700",
    "Manual Entry": "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${map[method] ?? "bg-gray-100 text-gray-600"}`}>
      {method}
    </span>
  );
}

// ── Single pharmacy card ──────────────────────────────────────────────────────
function PharmacyCard({ pharmacy, medicine, stockEntry }) {
  const [expanded, setExpanded] = useState(false);
  const status = stockStatus(stockEntry?.qty ?? 0);
  const qty    = stockEntry?.qty ?? 0;
  const upd    = stockEntry?.updatedAt;
  const sync   = stockEntry?.syncMethod ?? "Unknown";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Building2 size={18} className="text-blue-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-800 text-sm leading-tight">{pharmacy.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{pharmacy.type}</p>
            </div>
            <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${status.color}`}>
              {status.label}
            </span>
          </div>

          {/* Distance + address */}
          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
            <MapPin size={11} className="shrink-0" />
            <span>{pharmacy.distance} km away · {pharmacy.address}</span>
          </div>

          {/* Stock qty */}
          {qty > 0 && (
            <p className="mt-1 text-xs text-gray-600">
              <span className="font-semibold text-gray-800">{qty}</span> units available
            </p>
          )}

          {/* Data freshness timestamp — PROMINENT */}
          {upd && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <Clock size={11} className="text-indigo-400 shrink-0" />
              <span className="text-indigo-600 font-medium">
                Updated {timeAgo(upd)} via
              </span>
              <SyncBadge method={sync} />
            </div>
          )}
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2 border-t border-gray-100 text-xs text-gray-500 hover:bg-gray-50 transition-colors rounded-b-2xl"
      >
        <span>{expanded ? "Hide details" : "Show details"}</span>
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50 rounded-b-2xl text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-1.5">
            <Phone size={11} /> <span>{pharmacy.phone}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={11} /> <span>Lat {pharmacy.lat}, Lng {pharmacy.lng}</span>
          </div>
          {upd && (
            <div className="flex items-center gap-1.5">
              <RefreshCw size={11} />
              <span>Last synced: {new Date(upd).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Generic substitution banner ───────────────────────────────────────────────
function GenericBanner({ query, matchedMed }) {
  const key = normalize(query);
  const mapping = GENERIC_MAP[key];

  // Only show if user typed a brand name and the matched medicine is out of stock
  // across ALL pharmacies or has zero stock
  if (!mapping) return null;

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
        <AlertTriangle size={16} className="text-amber-600" />
      </div>
      <div>
        <p className="font-semibold text-amber-800 text-sm">
          Brand "{mapping.brand}" may be unavailable at some centres.
        </p>
        <p className="text-amber-700 text-xs mt-1">
          Nearby generic equivalent available:{" "}
          <span className="font-bold text-amber-900">{mapping.generic}</span>
        </p>
        <p className="text-amber-600 text-xs mt-0.5">
          Generic medicines have the same active ingredient and efficacy as branded equivalents.
        </p>
      </div>
    </div>
  );
}

// ── Full Out-of-Stock banner shown per pharmacy ───────────────────────────────
function OutOfStockBanner({ pharmacyName, genericName }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-xs text-red-700">
      <AlertTriangle size={13} className="shrink-0 text-red-500" />
      <span>
        <span className="font-semibold">{pharmacyName}</span> — Out of stock.
        {genericName && (
          <> Generic <span className="font-bold">{genericName}</span> may be available.</>
        )}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PatientSearch() {
  const { stock } = useStock();
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [locationUsed, setLocationUsed] = useState(false);

  // Resolve query → medicine(s)
  const matchedMedicines = useMemo(() => {
    if (!query.trim()) return [];
    const q = normalize(query);

    // Direct generic name match
    const direct = MEDICINES.filter(m => normalize(m.name).includes(q));

    // Brand → generic redirect
    const via = GENERIC_MAP[q];
    if (via) {
      const extra = MEDICINES.filter(m => normalize(m.name).includes(normalize(via.generic)));
      const combined = [...direct];
      for (const m of extra) {
        if (!combined.find(c => c.id === m.id)) combined.push(m);
      }
      return combined;
    }
    return direct;
  }, [query]);

  // Check if query is a known brand name
  const isBrandQuery = useMemo(() => !!GENERIC_MAP[normalize(query)], [query]);

  const handleSearch = () => {
    if (query.trim()) {
      setSearched(true);
      setLocationUsed(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // Build result rows: for each matched medicine × each pharmacy
  const results = useMemo(() => {
    if (!matchedMedicines.length) return [];
    return matchedMedicines.map(med => ({
      medicine: med,
      pharmacies: PHARMACIES.map(ph => ({
        pharmacy: ph,
        stockEntry: stock[ph.id]?.[med.id] ?? { qty: 0, updatedAt: null, syncMethod: "Unknown" },
      })).sort((a, b) => {
        // In-stock first, then by distance
        const aOut = a.stockEntry.qty === 0 ? 1 : 0;
        const bOut = b.stockEntry.qty === 0 ? 1 : 0;
        if (aOut !== bOut) return aOut - bOut;
        return a.pharmacy.distance - b.pharmacy.distance;
      }),
    }));
  }, [matchedMedicines, stock]);

  const genericName = isBrandQuery ? GENERIC_MAP[normalize(query)]?.generic : null;

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Search bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Find Your Medicine</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Search by brand name (e.g. Crocin) or generic name (e.g. Paracetamol)
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSearched(false); }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Crocin, Paracetamol, Metformin…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Search size={14} /> Search
          </button>
        </div>

        {locationUsed && (
          <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <MapPin size={12} />
            <span>Using your location · Showing 6 nearest government health facilities</span>
          </div>
        )}
      </div>

      {/* Quick search chips */}
      {!searched && (
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">Common searches:</p>
          <div className="flex flex-wrap gap-2">
            {["Paracetamol", "Crocin", "Metformin", "Azithromycin", "Amlodipine", "Omeprazole"].map(s => (
              <button
                key={s}
                onClick={() => { setQuery(s); setSearched(true); setLocationUsed(true); }}
                className="bg-white border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {searched && (
        <>
          {matchedMedicines.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No medicines found for "<span className="font-semibold">{query}</span>"</p>
              <p className="text-xs mt-1">Try a generic name like Paracetamol or Metformin</p>
            </div>
          ) : (
            results.map(({ medicine, pharmacies }) => {
              const allOut = pharmacies.every(p => p.stockEntry.qty === 0);
              const key = normalize(query);
              const mapping = GENERIC_MAP[key] ?? (isBrandQuery ? GENERIC_MAP[normalize(medicine.name)] : null);

              return (
                <div key={medicine.id} className="space-y-3">
                  {/* Medicine header */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {medicine.name}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {medicine.category}
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Generic substitution banner */}
                  {(isBrandQuery || allOut) && (
                    <GenericBanner query={query} matchedMed={medicine} />
                  )}

                  {/* Out-of-stock alert if all pharmacies are empty */}
                  {allOut && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                      <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-700">
                          {medicine.name} is currently out of stock at all 6 nearby facilities.
                        </p>
                        {genericName && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <ArrowRight size={11} />
                            Generic alternative: <span className="font-bold ml-1">{genericName}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pharmacy cards */}
                  <div className="space-y-3">
                    {pharmacies.map(({ pharmacy, stockEntry }) => (
                      <PharmacyCard
                        key={pharmacy.id}
                        pharmacy={pharmacy}
                        medicine={medicine}
                        stockEntry={stockEntry}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
}
