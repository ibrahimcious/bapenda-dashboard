import { createServerFn } from "@tanstack/react-start";
import { dbMiddleware } from "#/shared/middleware/db.middleware";
import { CURRENT_YEAR, TAX_CATALOG } from "./revenue.mock";
import type {
	MonthlyPoint,
	QuarterCell,
	QuarterlyReport,
	QuarterlyTaxRow,
	RevenueSummary,
	TaxMonthlySeries,
} from "./revenue.types";

/** Cumulative-through-end-of-quarter cutoffs within CURRENT_YEAR. */
const QUARTER_END = [
	new Date(Date.UTC(CURRENT_YEAR, 2, 31, 23, 59, 59)),
	new Date(Date.UTC(CURRENT_YEAR, 5, 30, 23, 59, 59)),
	new Date(Date.UTC(CURRENT_YEAR, 8, 30, 23, 59, 59)),
	new Date(Date.UTC(CURRENT_YEAR, 11, 31, 23, 59, 59)),
] as const;

const MONTH_LABELS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"Mei",
	"Jun",
	"Jul",
	"Agu",
	"Sep",
	"Okt",
	"Nov",
	"Des",
];

function pct(realisasi: number, target: number): number {
	return target ? (realisasi / target) * 100 : 0;
}

function sumQuarters(
	rows: QuarterlyTaxRow[],
): [QuarterCell, QuarterCell, QuarterCell, QuarterCell] {
	return [0, 1, 2, 3].map((i) => {
		const target = rows.reduce((s, r) => s + r.quarters[i].target, 0);
		const realisasi = rows.reduce((s, r) => s + r.quarters[i].realisasi, 0);
		return { quarter: i + 1, target, realisasi, pct: pct(realisasi, target) };
	}) as [QuarterCell, QuarterCell, QuarterCell, QuarterCell];
}

export const getRevenueSummaryServerFn = createServerFn()
	.middleware([dbMiddleware])
	.handler(
		async ({
			context,
		}): Promise<{
			summary: RevenueSummary;
			quarterlyReport: QuarterlyReport;
			monthlyByTax: TaxMonthlySeries[];
		}> => {
			const payments = await context.db.sptpdPenerimaan.findMany({
				where: {
					tglBayar: {
						gte: new Date(Date.UTC(CURRENT_YEAR, 0, 1)),
						lt: new Date(Date.UTC(CURRENT_YEAR + 1, 0, 1)),
					},
				},
				select: {
					jenisPajak: true,
					tglBayar: true,
					pokok: true,
					lain2: true,
					pokokMblb: true,
					lain2Mblb: true,
				},
			});

			// Cumulative "realisasi" (Pokok + Lain2, excluding Sanksi) per
			// jenisPajak, bucketed by quarter. Minerba's official realisasi is the
			// base MBLB tax only, excluding the newer Opsen MBLB surcharge. Also
			// bucketed per calendar month (not cumulative, per jenisPajak) for the
			// monthly penerimaan chart's per-tax dropdown.
			const byJenis = new Map<string, [number, number, number, number]>();
			const monthlyByJenis = new Map<string, number[]>();
			for (const p of payments) {
				if (!p.tglBayar) continue;
				const amount =
					p.jenisPajak === "MINERBA"
						? Number(p.pokokMblb ?? 0) + Number(p.lain2Mblb ?? 0)
						: Number(p.pokok ?? 0) + Number(p.lain2 ?? 0);
				let quarters = byJenis.get(p.jenisPajak);
				if (!quarters) {
					quarters = [0, 0, 0, 0];
					byJenis.set(p.jenisPajak, quarters);
				}
				for (let q = 0; q < 4; q++) {
					if (p.tglBayar <= QUARTER_END[q]) quarters[q] += amount;
				}
				let months = monthlyByJenis.get(p.jenisPajak);
				if (!months) {
					months = new Array(12).fill(0) as number[];
					monthlyByJenis.set(p.jenisPajak, months);
				}
				months[p.tglBayar.getUTCMonth()] += amount;
			}

			const toPoints = (totals: number[]): MonthlyPoint[] =>
				totals.map((realisasi, i) => ({
					month: i + 1,
					label: MONTH_LABELS[i],
					realisasi,
				}));

			// One series per tax with a live data source (PBB has none — no
			// Buku Bantu Penerimaan file imported for it, so it's excluded from
			// the dropdown rather than showing an always-empty option), plus an
			// "ALL" series combining every one of them.
			const allMonthly = new Array(12).fill(0) as number[];
			const monthlyByTax: TaxMonthlySeries[] = [];
			for (const t of TAX_CATALOG) {
				if (!t.jenisPajak) continue;
				const keys = Array.isArray(t.jenisPajak)
					? t.jenisPajak
					: [t.jenisPajak];
				const totals = new Array(12).fill(0) as number[];
				for (const k of keys) {
					const months = monthlyByJenis.get(k);
					if (!months) continue;
					for (let m = 0; m < 12; m++) totals[m] += months[m];
				}
				for (let m = 0; m < 12; m++) allMonthly[m] += totals[m];
				monthlyByTax.push({
					code: t.code,
					label: t.shortName,
					points: toPoints(totals),
				});
			}
			monthlyByTax.unshift({
				code: "ALL",
				label: "Semua Pajak",
				points: toPoints(allMonthly),
			});

			const leafRows: (QuarterlyTaxRow & { group?: string })[] =
				TAX_CATALOG.map((t) => {
					const keys = t.jenisPajak
						? Array.isArray(t.jenisPajak)
							? t.jenisPajak
							: [t.jenisPajak]
						: [];
					const realisasiByQuarter: [number, number, number, number] =
						keys.length
							? ([0, 1, 2, 3].map((i) =>
									keys.reduce((sum, k) => sum + (byJenis.get(k)?.[i] ?? 0), 0),
								) as [number, number, number, number])
							: (t.fallbackQuarterlyRealisasi ?? [0, 0, 0, 0]);
					const quarters = t.quarterlyTarget.map((target, i) => ({
						quarter: i + 1,
						target,
						realisasi: realisasiByQuarter[i],
						pct: pct(realisasiByQuarter[i], target),
					})) as [QuarterCell, QuarterCell, QuarterCell, QuarterCell];
					return {
						code: t.code,
						name: t.name,
						shortName: t.shortName,
						group: t.group,
						targetTotal: t.quarterlyTarget[3],
						quarters,
					};
				});

			const pbjtChildren = leafRows.filter((r) => r.group === "PBJT");
			const otherRows = leafRows.filter((r) => !r.group);

			const pbjtGroup: QuarterlyTaxRow = {
				code: "PBJT",
				name: "Pajak (PBJT)",
				shortName: "PBJT",
				isGroup: true,
				targetTotal: pbjtChildren.reduce((s, r) => s + r.targetTotal, 0),
				quarters: sumQuarters(pbjtChildren),
			};

			const rows: QuarterlyTaxRow[] = [
				pbjtGroup,
				...pbjtChildren.map((r) => ({ ...r, indent: true })),
				...otherRows,
			];

			const total: QuarterlyTaxRow = {
				code: "TOTAL",
				name: "TOTAL",
				shortName: "TOTAL",
				targetTotal:
					pbjtGroup.targetTotal +
					otherRows.reduce((s, r) => s + r.targetTotal, 0),
				quarters: sumQuarters([pbjtGroup, ...otherRows]),
			};

			const summary: RevenueSummary = {
				currentYear: CURRENT_YEAR,
				totals: {
					target: total.targetTotal,
					realisasi: total.quarters[3].realisasi,
					pctAchievement: pct(total.quarters[3].realisasi, total.targetTotal),
					selisih: total.quarters[3].realisasi - total.targetTotal,
				},
			};

			return {
				summary,
				quarterlyReport: { currentYear: CURRENT_YEAR, rows, total },
				monthlyByTax,
			};
		},
	);
