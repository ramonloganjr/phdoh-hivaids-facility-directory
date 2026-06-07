/**
 * HIV & AIDS Surveillance — Philippines, Apr–Jun 2025 (Q2)
 * Source: Department of Health · Epidemiology Bureau · 2025 Q2 Surveillance Report.
 * Figures are reproduced verbatim from the report tables and narrative.
 */

export const reportMeta = {
  period: "April – June 2025",
  quarter: "Q2 2025",
  publisher: "DOH Epidemiology Bureau",
  asOf: "30 June 2025",
} as const;

/** National 95-95-95 cascade — as of June 2025. */
export const nationalCascade = {
  estimatedPLHIV: 252_800,
  diagnosed: 144_192,
  onART: 95_556,
  vlTested: 51_206,
  vlSuppressed: 44_714,
  /** % of diagnosed / estimated */
  first95: 57,
  /** % of on ART / diagnosed */
  second95: 66,
  /** % suppressed / on ART */
  third95: 47,
} as const;

/** Quarterly snapshot numbers. */
export const quarterSnapshot = {
  newlyDiagnosedAvgMonthly: 1_679,
  yoyChangePct: 16,
  newlyReportedDeaths: 161,
  totalReportedSince1984: 153_798,
  totalDeathsSince1984: 9_606,
  newlyEnrolledART: 4_316,
  medianBaselineCD4: 202,
} as const;

/** Average monthly newly diagnosed HIV cases, 2021 → Q2 2025. */
export const monthlyAvgByYear: { year: string; cases: number }[] = [
  { year: "2021", cases: 1_027 },
  { year: "2022", cases: 1_244 },
  { year: "2023", cases: 1_435 },
  { year: "2024", cases: 1_459 },
  { year: "2025 Q2", cases: 1_679 },
];

/** Cumulative diagnosed by sex (1984 – Jun 2025). */
export const sexBreakdown = [
  { label: "Male", value: 145_147, pct: 94 },
  { label: "Female", value: 8_641, pct: 6 },
];

/** Newly diagnosed by age group, Q2 2025 (narrative, p.1). */
export const ageDistribution = [
  { group: "<15", pct: 1 },
  { group: "15–24", pct: 32 },
  { group: "25–34", pct: 46 },
  { group: "35–49", pct: 18 },
  { group: "50+", pct: 3 },
];

/** Mode of transmission, Q2 2025 newly reported (n = 4,947). */
export const transmissionMode = [
  { mode: "Male-to-male sex", count: 3_544 },
  { mode: "Male-male / female sex", count: 641 },
  { mode: "Male-female sex", count: 571 },
  { mode: "No data", count: 191 },
  { mode: "Needle sharing", count: 23 },
  { mode: "Mother-to-child", count: 9 },
];

/** Regional 95-95-95 cascade (Table, p.7). */
export type RegionCascadeRow = {
  region: string;
  estimated: number;
  diagnosed: number;
  onART: number;
  vlTested: number;
  vlSuppressed: number;
  first95: number;
  second95: number;
  third95: number;
  vlCoverage: number;
};

export const regionCascade: RegionCascadeRow[] = [
  { region: "NCR",    estimated: 73_700, diagnosed: 46_695, onART: 29_094, vlTested: 16_468, vlSuppressed: 14_692, first95: 63, second95: 62, vlCoverage: 57, third95: 50 },
  { region: "4A",     estimated: 43_800, diagnosed: 24_455, onART: 16_020, vlTested: 9_123,  vlSuppressed: 7_838,  first95: 56, second95: 66, vlCoverage: 57, third95: 49 },
  { region: "3",      estimated: 30_000, diagnosed: 14_942, onART: 10_105, vlTested: 6_140,  vlSuppressed: 5_305,  first95: 50, second95: 68, vlCoverage: 61, third95: 52 },
  { region: "7",      estimated: 19_200, diagnosed: 10_614, onART: 5_918,  vlTested: 2_585,  vlSuppressed: 2_252,  first95: 55, second95: 56, vlCoverage: 44, third95: 38 },
  { region: "11",     estimated: 14_600, diagnosed: 8_199,  onART: 5_234,  vlTested: 2_417,  vlSuppressed: 2_150,  first95: 56, second95: 64, vlCoverage: 46, third95: 41 },
  { region: "6",      estimated: 11_500, diagnosed: 5_763,  onART: 4_513,  vlTested: 3_107,  vlSuppressed: 2_750,  first95: 50, second95: 78, vlCoverage: 69, third95: 61 },
  { region: "1",      estimated: 7_900,  diagnosed: 4_076,  onART: 2_721,  vlTested: 1_548,  vlSuppressed: 1_336,  first95: 52, second95: 67, vlCoverage: 57, third95: 49 },
  { region: "12",     estimated: 7_700,  diagnosed: 4_172,  onART: 2_971,  vlTested: 902,    vlSuppressed: 735,    first95: 54, second95: 71, vlCoverage: 30, third95: 25 },
  { region: "NIR",    estimated: 7_100,  diagnosed: 3_516,  onART: 2_531,  vlTested: 1_698,  vlSuppressed: 1_525,  first95: 50, second95: 72, vlCoverage: 67, third95: 60 },
  { region: "10",     estimated: 6_900,  diagnosed: 3_870,  onART: 2_259,  vlTested: 602,    vlSuppressed: 466,    first95: 56, second95: 58, vlCoverage: 27, third95: 21 },
  { region: "5",      estimated: 6_100,  diagnosed: 3_228,  onART: 2_208,  vlTested: 1_431,  vlSuppressed: 1_229,  first95: 53, second95: 68, vlCoverage: 65, third95: 56 },
  { region: "2",      estimated: 4_800,  diagnosed: 2_521,  onART: 1_884,  vlTested: 1_265,  vlSuppressed: 1_108,  first95: 53, second95: 75, vlCoverage: 67, third95: 59 },
  { region: "8",      estimated: 4_500,  diagnosed: 2_534,  onART: 1_493,  vlTested: 605,    vlSuppressed: 536,    first95: 56, second95: 59, vlCoverage: 41, third95: 36 },
  { region: "4B",     estimated: 4_200,  diagnosed: 2_517,  onART: 1_643,  vlTested: 730,    vlSuppressed: 623,    first95: 60, second95: 65, vlCoverage: 44, third95: 38 },
  { region: "9",      estimated: 4_200,  diagnosed: 2_402,  onART: 1_523,  vlTested: 540,    vlSuppressed: 455,    first95: 57, second95: 63, vlCoverage: 35, third95: 30 },
  { region: "CARAGA", estimated: 3_300,  diagnosed: 1_926,  onART: 1_212,  vlTested: 636,    vlSuppressed: 510,    first95: 58, second95: 63, vlCoverage: 52, third95: 42 },
  { region: "CAR",    estimated: 2_300,  diagnosed: 1_286,  onART: 924,    vlTested: 620,    vlSuppressed: 562,    first95: 56, second95: 72, vlCoverage: 67, third95: 61 },
  { region: "BARMM",  estimated: 900,    diagnosed: 565,    onART: 315,    vlTested: 131,    vlSuppressed: 104,    first95: 63, second95: 56, vlCoverage: 42, third95: 33 },
];

/** Key population cascade. */
export const keyPopulationCascade = [
  { group: "MSM",            estimated: 194_300, diagnosed: 120_027, onART: 81_626, suppressed: 39_109, first95: 62, second95: 68, third95: 48 },
  { group: "Other Males",    estimated: 36_500,  diagnosed: 13_865,  onART: 6_974,  suppressed: 3_275,  first95: 38, second95: 50, third95: 47 },
  { group: "Other Females",  estimated: 18_000,  diagnosed: 7_741,   onART: 3_271,  suppressed: 1_629,  first95: 43, second95: 42, third95: 50 },
  { group: "PWID",           estimated: 2_800,   diagnosed: 2_358,   onART: 580,    suppressed: 211,    first95: 84, second95: 25, third95: 36 },
];
