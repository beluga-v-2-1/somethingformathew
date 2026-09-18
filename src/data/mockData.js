// ─── Generic Substitution Dictionary ────────────────────────────────────────
export const GENERIC_MAP = {
  crocin:        { generic: "Paracetamol 500mg",   brand: "Crocin" },
  dolo:          { generic: "Paracetamol 650mg",   brand: "Dolo 650" },
  combiflam:     { generic: "Ibuprofen + Paracetamol", brand: "Combiflam" },
  ibuprofen:     { generic: "Ibuprofen 400mg",     brand: "Brufen" },
  augmentin:     { generic: "Amoxicillin-Clavulanate 625mg", brand: "Augmentin" },
  amoxicillin:   { generic: "Amoxicillin 500mg",   brand: "Mox 500" },
  metformin:     { generic: "Metformin 500mg",      brand: "Glycomet" },
  glycomet:      { generic: "Metformin 500mg",      brand: "Glycomet" },
  amlodipine:    { generic: "Amlodipine 5mg",       brand: "Amlokind" },
  amlokind:      { generic: "Amlodipine 5mg",       brand: "Amlokind" },
  atorvastatin:  { generic: "Atorvastatin 10mg",    brand: "Lipitor" },
  lipitor:       { generic: "Atorvastatin 10mg",    brand: "Lipitor" },
  omeprazole:    { generic: "Omeprazole 20mg",      brand: "Omez" },
  omez:          { generic: "Omeprazole 20mg",      brand: "Omez" },
  azithromycin:  { generic: "Azithromycin 500mg",   brand: "Azithral" },
  azithral:      { generic: "Azithromycin 500mg",   brand: "Azithral" },
  cetirizine:    { generic: "Cetirizine 10mg",      brand: "Alerid" },
  alerid:        { generic: "Cetirizine 10mg",      brand: "Alerid" },
  pantoprazole:  { generic: "Pantoprazole 40mg",    brand: "Pan 40" },
  "pan 40":      { generic: "Pantoprazole 40mg",    brand: "Pan 40" },
};

// ─── Medicine Catalogue ──────────────────────────────────────────────────────
export const MEDICINES = [
  { id: "m1",  name: "Paracetamol 500mg",              category: "Analgesic" },
  { id: "m2",  name: "Paracetamol 650mg",              category: "Analgesic" },
  { id: "m3",  name: "Ibuprofen 400mg",                category: "NSAID" },
  { id: "m4",  name: "Ibuprofen + Paracetamol",        category: "NSAID" },
  { id: "m5",  name: "Amoxicillin 500mg",              category: "Antibiotic" },
  { id: "m6",  name: "Amoxicillin-Clavulanate 625mg",  category: "Antibiotic" },
  { id: "m7",  name: "Metformin 500mg",                category: "Antidiabetic" },
  { id: "m8",  name: "Amlodipine 5mg",                 category: "Antihypertensive" },
  { id: "m9",  name: "Atorvastatin 10mg",              category: "Statin" },
  { id: "m10", name: "Omeprazole 20mg",                category: "Antacid" },
  { id: "m11", name: "Azithromycin 500mg",             category: "Antibiotic" },
  { id: "m12", name: "Cetirizine 10mg",                category: "Antihistamine" },
  { id: "m13", name: "Pantoprazole 40mg",              category: "Antacid" },
];

// ─── Government Pharmacies / Health Centres ──────────────────────────────────
export const PHARMACIES = [
  {
    id: "ph1",
    name: "District Government Hospital Pharmacy",
    type: "District Hospital",
    address: "Civil Lines, Sector 12",
    distance: 0.8,
    lat: 28.6139,
    lng: 77.2090,
    phone: "011-23456789",
  },
  {
    id: "ph2",
    name: "PHC Rajiv Nagar",
    type: "Primary Health Centre",
    address: "Rajiv Nagar, Block B",
    distance: 1.4,
    lat: 28.6200,
    lng: 77.2150,
    phone: "011-23456700",
  },
  {
    id: "ph3",
    name: "CHC Sector 8 Health Centre",
    type: "Community Health Centre",
    address: "Sector 8, Near Bus Stand",
    distance: 2.1,
    lat: 28.6080,
    lng: 77.2200,
    phone: "011-23456711",
  },
  {
    id: "ph4",
    name: "Taluk Hospital Pharmacy",
    type: "Taluk Hospital",
    address: "MG Road, Taluk Office Campus",
    distance: 3.3,
    lat: 28.6300,
    lng: 77.2050,
    phone: "011-23456722",
  },
  {
    id: "ph5",
    name: "Urban Health Post Laxmi Nagar",
    type: "Urban Health Post",
    address: "Laxmi Nagar, Plot 44",
    distance: 4.0,
    lat: 28.6350,
    lng: 77.2250,
    phone: "011-23456733",
  },
  {
    id: "ph6",
    name: "ESI Dispensary Nehru Place",
    type: "ESI Dispensary",
    address: "Nehru Place, ESI Complex",
    distance: 5.2,
    lat: 28.6020,
    lng: 77.2300,
    phone: "011-23456744",
  },
];

// ─── Sync Methods ─────────────────────────────────────────────────────────────
export const SYNC_METHODS = ["POS Sync", "QR Scan", "Manual Entry", "POS Sync", "QR Scan", "POS Sync"];

// ─── Initial Stock State ──────────────────────────────────────────────────────
// stockState[pharmacyId][medicineId] = { qty, updatedAt, syncMethod }
function minsAgo(n) {
  return new Date(Date.now() - n * 60 * 1000);
}

export function buildInitialStock() {
  const state = {};

  const seed = [
    // ph1
    { ph: "ph1", m: "m1",  qty: 240, mins: 4,   sync: "POS Sync" },
    { ph: "ph1", m: "m2",  qty: 18,  mins: 61,  sync: "QR Scan" },
    { ph: "ph1", m: "m3",  qty: 0,   mins: 130, sync: "POS Sync" },
    { ph: "ph1", m: "m4",  qty: 95,  mins: 12,  sync: "POS Sync" },
    { ph: "ph1", m: "m5",  qty: 7,   mins: 45,  sync: "Manual Entry" },
    { ph: "ph1", m: "m6",  qty: 150, mins: 5,   sync: "POS Sync" },
    { ph: "ph1", m: "m7",  qty: 300, mins: 3,   sync: "POS Sync" },
    { ph: "ph1", m: "m8",  qty: 0,   mins: 200, sync: "POS Sync" },
    { ph: "ph1", m: "m9",  qty: 60,  mins: 20,  sync: "QR Scan" },
    { ph: "ph1", m: "m10", qty: 11,  mins: 90,  sync: "POS Sync" },
    { ph: "ph1", m: "m11", qty: 200, mins: 8,   sync: "POS Sync" },
    { ph: "ph1", m: "m12", qty: 5,   mins: 55,  sync: "QR Scan" },
    { ph: "ph1", m: "m13", qty: 80,  mins: 15,  sync: "POS Sync" },
    // ph2
    { ph: "ph2", m: "m1",  qty: 0,   mins: 180, sync: "POS Sync" },
    { ph: "ph2", m: "m2",  qty: 120, mins: 10,  sync: "POS Sync" },
    { ph: "ph2", m: "m3",  qty: 45,  mins: 30,  sync: "QR Scan" },
    { ph: "ph2", m: "m4",  qty: 0,   mins: 250, sync: "Manual Entry" },
    { ph: "ph2", m: "m5",  qty: 80,  mins: 20,  sync: "POS Sync" },
    { ph: "ph2", m: "m6",  qty: 6,   mins: 70,  sync: "POS Sync" },
    { ph: "ph2", m: "m7",  qty: 190, mins: 5,   sync: "POS Sync" },
    { ph: "ph2", m: "m8",  qty: 34,  mins: 22,  sync: "QR Scan" },
    { ph: "ph2", m: "m9",  qty: 0,   mins: 300, sync: "POS Sync" },
    { ph: "ph2", m: "m10", qty: 75,  mins: 11,  sync: "POS Sync" },
    { ph: "ph2", m: "m11", qty: 14,  mins: 80,  sync: "Manual Entry" },
    { ph: "ph2", m: "m12", qty: 200, mins: 6,   sync: "POS Sync" },
    { ph: "ph2", m: "m13", qty: 9,   mins: 95,  sync: "QR Scan" },
    // ph3
    { ph: "ph3", m: "m1",  qty: 55,  mins: 25,  sync: "POS Sync" },
    { ph: "ph3", m: "m2",  qty: 0,   mins: 400, sync: "POS Sync" },
    { ph: "ph3", m: "m3",  qty: 130, mins: 15,  sync: "QR Scan" },
    { ph: "ph3", m: "m4",  qty: 8,   mins: 65,  sync: "POS Sync" },
    { ph: "ph3", m: "m5",  qty: 0,   mins: 500, sync: "Manual Entry" },
    { ph: "ph3", m: "m6",  qty: 90,  mins: 18,  sync: "POS Sync" },
    { ph: "ph3", m: "m7",  qty: 7,   mins: 50,  sync: "QR Scan" },
    { ph: "ph3", m: "m8",  qty: 110, mins: 7,   sync: "POS Sync" },
    { ph: "ph3", m: "m9",  qty: 25,  mins: 40,  sync: "POS Sync" },
    { ph: "ph3", m: "m10", qty: 0,   mins: 350, sync: "POS Sync" },
    { ph: "ph3", m: "m11", qty: 60,  mins: 33,  sync: "QR Scan" },
    { ph: "ph3", m: "m12", qty: 180, mins: 9,   sync: "POS Sync" },
    { ph: "ph3", m: "m13", qty: 4,   mins: 120, sync: "Manual Entry" },
    // ph4
    { ph: "ph4", m: "m1",  qty: 160, mins: 7,   sync: "POS Sync" },
    { ph: "ph4", m: "m2",  qty: 90,  mins: 14,  sync: "POS Sync" },
    { ph: "ph4", m: "m3",  qty: 0,   mins: 420, sync: "QR Scan" },
    { ph: "ph4", m: "m4",  qty: 50,  mins: 28,  sync: "POS Sync" },
    { ph: "ph4", m: "m5",  qty: 120, mins: 3,   sync: "QR Scan" },
    { ph: "ph4", m: "m6",  qty: 0,   mins: 600, sync: "POS Sync" },
    { ph: "ph4", m: "m7",  qty: 11,  mins: 88,  sync: "Manual Entry" },
    { ph: "ph4", m: "m8",  qty: 200, mins: 5,   sync: "POS Sync" },
    { ph: "ph4", m: "m9",  qty: 70,  mins: 17,  sync: "POS Sync" },
    { ph: "ph4", m: "m10", qty: 35,  mins: 44,  sync: "QR Scan" },
    { ph: "ph4", m: "m11", qty: 5,   mins: 100, sync: "POS Sync" },
    { ph: "ph4", m: "m12", qty: 90,  mins: 22,  sync: "POS Sync" },
    { ph: "ph4", m: "m13", qty: 150, mins: 6,   sync: "POS Sync" },
    // ph5
    { ph: "ph5", m: "m1",  qty: 6,   mins: 75,  sync: "QR Scan" },
    { ph: "ph5", m: "m2",  qty: 0,   mins: 280, sync: "POS Sync" },
    { ph: "ph5", m: "m3",  qty: 85,  mins: 19,  sync: "POS Sync" },
    { ph: "ph5", m: "m4",  qty: 220, mins: 2,   sync: "POS Sync" },
    { ph: "ph5", m: "m5",  qty: 0,   mins: 700, sync: "Manual Entry" },
    { ph: "ph5", m: "m6",  qty: 40,  mins: 38,  sync: "QR Scan" },
    { ph: "ph5", m: "m7",  qty: 180, mins: 12,  sync: "POS Sync" },
    { ph: "ph5", m: "m8",  qty: 9,   mins: 62,  sync: "POS Sync" },
    { ph: "ph5", m: "m9",  qty: 115, mins: 8,   sync: "POS Sync" },
    { ph: "ph5", m: "m10", qty: 60,  mins: 29,  sync: "QR Scan" },
    { ph: "ph5", m: "m11", qty: 0,   mins: 450, sync: "POS Sync" },
    { ph: "ph5", m: "m12", qty: 3,   mins: 110, sync: "Manual Entry" },
    { ph: "ph5", m: "m13", qty: 70,  mins: 16,  sync: "POS Sync" },
    // ph6
    { ph: "ph6", m: "m1",  qty: 90,  mins: 11,  sync: "POS Sync" },
    { ph: "ph6", m: "m2",  qty: 45,  mins: 36,  sync: "QR Scan" },
    { ph: "ph6", m: "m3",  qty: 10,  mins: 78,  sync: "POS Sync" },
    { ph: "ph6", m: "m4",  qty: 0,   mins: 320, sync: "POS Sync" },
    { ph: "ph6", m: "m5",  qty: 55,  mins: 24,  sync: "POS Sync" },
    { ph: "ph6", m: "m6",  qty: 130, mins: 9,   sync: "QR Scan" },
    { ph: "ph6", m: "m7",  qty: 0,   mins: 510, sync: "POS Sync" },
    { ph: "ph6", m: "m8",  qty: 70,  mins: 13,  sync: "POS Sync" },
    { ph: "ph6", m: "m9",  qty: 8,   mins: 85,  sync: "Manual Entry" },
    { ph: "ph6", m: "m10", qty: 200, mins: 4,   sync: "POS Sync" },
    { ph: "ph6", m: "m11", qty: 40,  mins: 27,  sync: "QR Scan" },
    { ph: "ph6", m: "m12", qty: 110, mins: 16,  sync: "POS Sync" },
    { ph: "ph6", m: "m13", qty: 0,   mins: 600, sync: "POS Sync" },
  ];

  for (const row of seed) {
    if (!state[row.ph]) state[row.ph] = {};
    state[row.ph][row.m] = {
      qty: row.qty,
      updatedAt: minsAgo(row.mins),
      syncMethod: row.sync,
    };
  }
  return state;
}

// ─── QR Code payload map (medicine id → what a QR sticker would encode) ───────
export const QR_PAYLOADS = {
  "MED-P500":  "m1",
  "MED-P650":  "m2",
  "MED-IBU":   "m3",
  "MED-COMBI": "m4",
  "MED-AMX":   "m5",
  "MED-AMXC":  "m6",
  "MED-MET":   "m7",
  "MED-AMLO":  "m8",
  "MED-ATOR":  "m9",
  "MED-OME":   "m10",
  "MED-AZI":   "m11",
  "MED-CET":   "m12",
  "MED-PAN":   "m13",
};
