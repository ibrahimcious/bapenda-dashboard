/**
 * Pure aggregation + formatting helpers. `buildSummary` turns the Patriot tax
 * rows + quarterly totals into the `RevenueSummary` the dashboard renders.
 */
import type { PatriotTaxInput, QuarterInput } from "./revenue.mock";
import type {
	CompositionSlice,
	QuarterPoint,
	RevenueSummary,
	TaxAchievement,
} from "./revenue.types";

export const QUARTER_LABELS = ["Tw I", "Tw II", "Tw III", "Tw IV"];

/** Full Rupiah, e.g. "Rp 85.000.000.000". */
export function formatIDR(value: number): string {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(value);
}

/** Compact Rupiah, e.g. "Rp 85 M", "Rp 1,2 T", "Rp 450 jt". */
export function formatCompactIDR(value: number): string {
	const abs = Math.abs(value);
	const sign = value < 0 ? "-" : "";
	const one = (n: number) =>
		n.toLocaleString("id-ID", { maximumFractionDigits: 1 });
	if (abs >= 1e12) return `${sign}Rp ${one(abs / 1e12)} T`;
	if (abs >= 1e9) return `${sign}Rp ${one(abs / 1e9)} M`;
	if (abs >= 1e6) return `${sign}Rp ${one(abs / 1e6)} jt`;
	if (abs >= 1e3) return `${sign}Rp ${one(abs / 1e3)} rb`;
	return `${sign}Rp ${Math.round(abs)}`;
}

interface BuildOpts {
	currentYear: number;
	asOfQuarter: number;
}

export function buildSummary(
	taxes: PatriotTaxInput[],
	quarterly: QuarterInput[],
	opts: BuildOpts,
): RevenueSummary {
	const { currentYear, asOfQuarter } = opts;

	// Per-tax achievement: realisasi-to-date vs annual target, biggest first.
	const achievements: TaxAchievement[] = taxes
		.map((t) => ({
			taxCode: t.code,
			name: t.name,
			shortName: t.shortName,
			group: t.group,
			target: t.targetTotal,
			realisasi: t.realisasi,
			pct: t.targetTotal ? (t.realisasi / t.targetTotal) * 100 : 0,
		}))
		.sort((a, b) => b.target - a.target);

	const totalTarget = achievements.reduce((acc, a) => acc + a.target, 0);
	const totalRealisasi = achievements.reduce((acc, a) => acc + a.realisasi, 0);

	const totals = {
		target: totalTarget,
		realisasi: totalRealisasi,
		pctAchievement: totalTarget ? (totalRealisasi / totalTarget) * 100 : 0,
		selisih: totalRealisasi - totalTarget,
	};

	const quarterlyPoints: QuarterPoint[] = quarterly.map((q) => ({
		quarter: q.quarter,
		label: QUARTER_LABELS[q.quarter - 1] ?? `Tw ${q.quarter}`,
		target: q.target,
		realisasi: q.realisasi,
	}));

	const composition: CompositionSlice[] = achievements
		.map((a) => ({
			taxCode: a.taxCode,
			name: a.name,
			shortName: a.shortName,
			value: a.realisasi,
			pct: totalRealisasi ? (a.realisasi / totalRealisasi) * 100 : 0,
		}))
		.sort((a, b) => b.value - a.value);

	return {
		currentYear,
		asOfQuarter,
		totals,
		achievements,
		quarterly: quarterlyPoints,
		composition,
	};
}
