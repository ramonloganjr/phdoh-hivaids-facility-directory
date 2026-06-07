// Lightweight metadata that does NOT import the 9579-line FACILITIES dataset.
// Use this in pages that only need counts or region labels so they avoid
// pulling the full directory into their route chunk (keeps navigation snappy).

import type { RegionCode } from "./facilities.types";

export const REGION_LABELS: Record<RegionCode, string> = {
  "CAR": "Cordillera Administrative Region",
  "R1": "Region 1 — Ilocos",
  "R2": "Region 2 — Cagayan Valley",
  "R3": "Region 3 — Central Luzon",
  "R4A": "Region 4-A — CALABARZON",
  "R4B": "Region 4-B — MIMAROPA",
  "R5": "Region 5 — Bicol",
  "R6": "Region 6 — Western Visayas",
  "R7": "Region 7 — Central Visayas",
  "R8": "Region 8 — Eastern Visayas",
  "NIR": "Negros Island Region & Siquijor",
  "R9": "Region 9 — Zamboanga Peninsula",
  "R10": "Region 10 — Northern Mindanao",
  "R11": "Region 11 — Davao",
  "R12": "Region 12 — SOCCSKSARGEN",
  "R13": "Region 13 — CARAGA",
  "NCR": "National Capital Region",
  "BARMM": "Bangsamoro Autonomous Region",
};

export const REGION_ORDER: RegionCode[] = [
  "CAR", "R1", "R2", "R3", "R4A", "R4B", "R5", "R6", "R7", "R8",
  "NIR", "R9", "R10", "R11", "R12", "R13", "NCR", "BARMM",
];

export const FACILITY_COUNT = 338;
export const TREATMENT_HUB_COUNT = 192;
export const PRIMARY_CARE_COUNT = 146;

export const REGION_COUNTS: Record<RegionCode, number> = {
  "CAR": 8,
  "R1": 7,
  "R2": 6,
  "R3": 42,
  "R4A": 45,
  "R4B": 6,
  "R5": 8,
  "R6": 25,
  "R7": 19,
  "R8": 24,
  "NIR": 9,
  "R9": 15,
  "R10": 18,
  "R11": 8,
  "R12": 18,
  "R13": 13,
  "NCR": 64,
  "BARMM": 3,
};
