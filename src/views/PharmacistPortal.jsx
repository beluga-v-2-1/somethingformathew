import { useEffect, useRef, useState } from "react";
import { QrCode, CheckCircle2, Camera, CameraOff, PackagePlus, ChevronDown, AlertCircle } from "lucide-react";
import { MEDICINES, PHARMACIES, QR_PAYLOADS } from "../data/mockData";
import { useStock } from "../context/StockContext";
import { timeAgo, stockStatus } from "../utils/helpers";

// We load html5-qrcode lazily to avoid SSR issues
let Html5QrcodeScanner;

const DEMO_QR_CODES = Object.keys(QR_PAYLOADS);

export default function PharmacistPortal() {
  const { stock, updateStock } = useStock();

  // Form state
  const [selectedPharmacy, setSelectedPharmacy] = useState(PHARMACIES[0].id);
  const [scannedMedId, setScannedMedId]         = useState(null);
  const [scannedCode, setScannedCode]           = useState("");
  const [qty, setQty]                           = useState(1);
  const [scannerActive, setScannerActive]       = useState(false);
  const [scanError, setScanError]               = useState("");
  const [submitted, setSubmitted]               = useState(false);
  const [lastSubmit, setLastSubmit]             = useState(null);

  const scannerRef  = useRef(null);
  const scannerDivId = "qr-scanner-container";

  // Resolve medicine from QR payload
  function resolveMed(text) {
    // Direct QR payload match
    if (QR_PAYLOADS[text]) return QR_PAYLOADS[text];
    // Try matching medicine id directly (for demo manual entry)
    if (MEDICINES.find(m => m.id === text)) return text;
    return null;
  }

  // Start camera scanner
  async function startScanner() {
    setScanError("");
    setScannedMedId(null);
    setScannedCode("");
    setScannerActive(true);
  }

  // Stop camera scanner
  function stopScanner() {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setScannerActive(false);
  }

  // Init html5-qrcode when scannerActive turns true
  useEffect(() => {
    if (!scannerActive) return;

    let mounted = true;

    (async () => {
      try {
        const mod = await import("html5-qrcode");
        Html5QrcodeScanner = mod.Html5QrcodeScanner;

        if (!mounted) return;

        const scanner = new Html5QrcodeScanner(
          scannerDivId,
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            rememberLastUsedCamera: true,
            aspectRatio: 1.0,
          },
          false
        );

        scanner.render(
          (decodedText) => {
            const medId = resolveMed(decodedText.trim());
            if (medId) {
              setScannedMedId(medId);
              setScannedCode(decodedText.trim());
              setScanError("");
            } else {
              setScanError(`Unknown QR code: "${decodedText}". Please scan a valid medicine QR.`);
            }
            scanner.clear().catch(() => {});
            scannerRef.current = null;
            if (mounted) setScannerActive(false);
          },
          (err) => {
            // Ignore decode errors (happen every frame)
          }
        );

        scannerRef.current = scanner;
      } catch (e) {
        if (mounted) {
          setScanError("Could not access camera. Check permissions or use demo simulation below.");
          setScannerActive(false);
        }
      }
    })();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [scannerActive]);

  // Demo: simulate scanning a specific QR code
  function simulateScan(code) {
    stopScanner();
    const medId = resolveMed(code);
    if (medId) {
      setScannedMedId(medId);
      setScannedCode(code);
      setScanError("");
    }
  }

  // Submit restock
  function handleSubmit(e) {
    e.preventDefault();
    if (!scannedMedId || qty < 1) return;
    updateStock(selectedPharmacy, scannedMedId, qty, "QR Scan");
    const med = MEDICINES.find(m => m.id === scannedMedId);
    const ph  = PHARMACIES.find(p => p.id === selectedPharmacy);
    setLastSubmit({ medName: med?.name, phName: ph?.name, qty, time: new Date() });
    setSubmitted(true);
    // Reset form after 4 seconds
    setTimeout(() => {
      setSubmitted(false);
      setScannedMedId(null);
      setScannedCode("");
      setQty(1);
    }, 4000);
  }

  const resolvedMed = scannedMedId ? MEDICINES.find(m => m.id === scannedMedId) : null;
  const currentStockEntry = scannedMedId && selectedPharmacy
    ? stock[selectedPharmacy]?.[scannedMedId]
    : null;

  return (
    <div className="max-w-lg mx-auto space-y-5">

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <QrCode size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg">Pharmacist QR Portal</h2>
            <p className="text-purple-100 text-xs">Scan medicine QR to update stock instantly</p>
          </div>
        </div>
      </div>

      {/* Success toast */}
      {submitted && lastSubmit && (
        <div className="bg-green-50 border border-green-300 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800 text-sm">Stock Updated Successfully!</p>
            <p className="text-green-700 text-xs mt-0.5">
              +{lastSubmit.qty} units of <span className="font-bold">{lastSubmit.medName}</span> added to {lastSubmit.phName}.
            </p>
            <p className="text-green-600 text-xs mt-0.5">
              Timestamp updated to: {lastSubmit.time.toLocaleTimeString()} via QR Scan
            </p>
          </div>
        </div>
      )}

      {/* Step 1 – Select pharmacy */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center">1</span>
          <h3 className="font-semibold text-gray-800 text-sm">Select Your Facility</h3>
        </div>
        <div className="relative">
          <select
            value={selectedPharmacy}
            onChange={e => setSelectedPharmacy(e.target.value)}
            className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8"
          >
            {PHARMACIES.map(ph => (
              <option key={ph.id} value={ph.id}>{ph.name} ({ph.type})</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Step 2 – Scan QR */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center">2</span>
          <h3 className="font-semibold text-gray-800 text-sm">Scan Medicine QR Code</h3>
        </div>

        {/* Camera viewer */}
        {scannerActive ? (
          <div className="space-y-2">
            <div id={scannerDivId} className="rounded-xl overflow-hidden border border-purple-200" />
            <button
              onClick={stopScanner}
              className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700 font-medium"
            >
              <CameraOff size={13} /> Stop Camera
            </button>
          </div>
        ) : (
          <button
            onClick={startScanner}
            className="w-full flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 border-2 border-dashed border-purple-300 rounded-xl py-6 text-purple-600 font-semibold text-sm transition-colors"
          >
            <Camera size={20} />
            Open Camera to Scan QR
          </button>
        )}

        {/* Error */}
        {scanError && (
          <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            {scanError}
          </div>
        )}

        {/* Demo QR simulation */}
        <div>
          <p className="text-xs text-gray-400 mb-2 font-medium">Demo — simulate scanning a QR code:</p>
          <div className="grid grid-cols-3 gap-1.5">
            {DEMO_QR_CODES.map(code => {
              const medId = QR_PAYLOADS[code];
              const med = MEDICINES.find(m => m.id === medId);
              return (
                <button
                  key={code}
                  onClick={() => simulateScan(code)}
                  className={`text-[10px] px-2 py-1.5 rounded-lg border font-medium transition-colors text-left leading-tight
                    ${scannedCode === code
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600"
                    }`}
                >
                  <span className="block text-[9px] opacity-70">{code}</span>
                  <span>{med?.name?.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scanned result */}
        {resolvedMed && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center gap-3">
            <QrCode size={20} className="text-purple-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-purple-800 text-sm">{resolvedMed.name}</p>
              <p className="text-purple-600 text-xs">{resolvedMed.category} · Code: {scannedCode}</p>
              {currentStockEntry && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Current stock: <span className="font-bold">{currentStockEntry.qty}</span> units
                  {currentStockEntry.updatedAt && (
                    <> · Last updated {timeAgo(currentStockEntry.updatedAt)}</>
                  )}
                </p>
              )}
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${stockStatus(currentStockEntry?.qty ?? 0).color}`}>
              {stockStatus(currentStockEntry?.qty ?? 0).label}
            </span>
          </div>
        )}
      </div>

      {/* Step 3 – Enter quantity & submit */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center">3</span>
          <h3 className="font-semibold text-gray-800 text-sm">Enter Quantity Added</h3>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={9999}
            value={qty}
            onChange={e => setQty(Number(e.target.value))}
            className="w-28 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
          />
          <span className="text-sm text-gray-500">units to add</span>
        </div>

        <button
          type="submit"
          disabled={!scannedMedId || qty < 1 || submitted}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          <PackagePlus size={16} />
          {submitted ? "Stock Updated!" : "Submit Restock"}
        </button>

        {!scannedMedId && (
          <p className="text-xs text-center text-gray-400">Scan a medicine QR code first</p>
        )}
      </form>

      {/* Stock overview for selected pharmacy */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
        <h3 className="font-semibold text-gray-800 text-sm">
          Current Stock — {PHARMACIES.find(p => p.id === selectedPharmacy)?.name}
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {MEDICINES.map(med => {
            const entry = stock[selectedPharmacy]?.[med.id];
            const status = stockStatus(entry?.qty ?? 0);
            return (
              <div key={med.id} className="flex items-center gap-2 text-xs">
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="text-gray-700 font-medium truncate">{med.name}</span>
                </div>
                <span className="font-bold text-gray-800 w-8 text-right">{entry?.qty ?? 0}</span>
                <span className={`px-1.5 py-0.5 rounded-full border text-[10px] font-semibold ${status.color}`}>
                  {status.label}
                </span>
                {entry?.updatedAt && (
                  <span className="text-gray-400 w-20 text-right shrink-0">{timeAgo(entry.updatedAt)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
