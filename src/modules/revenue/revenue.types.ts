/**
 * Domain contract for regional revenue (Pendapatan Asli Daerah) data.
 *
 * Realisasi (actual revenue collected) is computed live from
 * `sptpd_penerimaan` in revenue.api.ts. Targets have no live source and stay
 * transcribed from the Patriot app's quarterly report — see revenue.mock.ts.
 */

/** Cumulative target/realisasi/pct as of the end of one quarter (triwulan). */
export interface QuarterCell {
	quarter: 1 | 2 | 3 | 4;
	target: number;
	realisasi: number;
	pct: number; // realisasi / target * 100
}

/** One row of the "Realisasi Penerimaan Pajak Daerah Per-Tribulan" table. */
export interface QuarterlyTaxRow {
	code: string;
	name: string;
	shortName: string;
	/** Bold subtotal row with no data source of its own (e.g. "Pajak (PBJT)"). */
	isGroup?: boolean;
	/** Indented child row under a group (e.g. PBJT sub-types). */
	indent?: boolean;
	targetTotal: number;
	quarters: [QuarterCell, QuarterCell, QuarterCell, QuarterCell];
}

export interface QuarterlyReport {
	currentYear: number;
	rows: QuarterlyTaxRow[];
	total: QuarterlyTaxRow;
}

/** Total penerimaan (not cumulative) for one calendar month. */
export interface MonthlyPoint {
	month: number; // 1-12
	label: string;
	realisasi: number;
}

/** Monthly penerimaan for one tax type (or "ALL" for every type combined). */
export interface TaxMonthlySeries {
	code: string;
	label: string;
	points: MonthlyPoint[];
}

/** Summary used by the KPI tiles at the top of the dashboard. */
export interface RevenueSummary {
	currentYear: number;
	totals: {
		target: number;
		realisasi: number;
		pctAchievement: number;
		selisih: number; // realisasi - target (negative = kurang)
	};
}
