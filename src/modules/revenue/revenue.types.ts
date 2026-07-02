/**
 * Domain contract for regional revenue (Pendapatan Asli Daerah) data.
 *
 * Shapes mirror the Patriot app's quarterly ("per-tribulan") report. The current
 * provider transcribes that report (revenue.mock.ts); when DB access to Patriot
 * is available, only the provider changes — the aggregated `RevenueSummary` and
 * the server-function signature stay the same.
 */

export interface TaxType {
	code: string;
	name: string;
	shortName: string;
	/** Children of a parent category (e.g. PBJT) share a group key. */
	group?: string;
}

/** Per-type realisasi-to-date measured against the annual target. */
export interface TaxAchievement {
	taxCode: string;
	name: string;
	shortName: string;
	group?: string;
	target: number;
	realisasi: number;
	pct: number; // realisasi / target * 100
}

/** Cumulative target & realisasi at the end of one quarter (triwulan). */
export interface QuarterPoint {
	quarter: number; // 1-4
	label: string;
	target: number;
	realisasi: number;
}

/** One slice of the composition donut. */
export interface CompositionSlice {
	taxCode: string;
	name: string;
	shortName: string;
	value: number;
	pct: number;
}

/** Aggregated shape consumed by the dashboard. */
export interface RevenueSummary {
	currentYear: number;
	asOfQuarter: number;
	totals: {
		target: number;
		realisasi: number;
		pctAchievement: number;
		selisih: number; // realisasi - target (negative = kurang)
	};
	achievements: TaxAchievement[];
	quarterly: QuarterPoint[];
	composition: CompositionSlice[];
}
