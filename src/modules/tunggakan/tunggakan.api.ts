import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { dbMiddleware } from "#/shared/middleware/db.middleware";
import type {
	MonthlyTunggakan,
	TunggakanResult,
	TunggakanRow,
} from "./tunggakan.types";
import { TAX_TYPES } from "./tunggakan.types";
import { MONTH_LABELS, statusFor } from "./tunggakan.utils";

const PAGE_SIZE = 25;

const TunggakanQuerySchema = z.object({
	jenis: z.string().optional().default("all"),
	q: z.string().optional().default(""),
	status: z.string().optional().default("all"),
	kecamatan: z.string().optional().default("all"),
	year: z.number().int().optional().default(2026),
	page: z.number().int().min(1).optional().default(1),
});

export const getTunggakanServerFn = createServerFn()
	.middleware([dbMiddleware])
	.validator(TunggakanQuerySchema)
	.handler(async ({ data, context }): Promise<TunggakanResult> => {
		const taxType = TAX_TYPES.find((t) => t.slug === data.jenis);
		const where = taxType ? { jenisPajak: taxType.value } : {};

		const [ketetapanRows, penerimaanRows] = await Promise.all([
			context.db.sptpdKetetapan.findMany({
				where,
				select: {
					npwpd: true,
					jenisPajak: true,
					namaWp: true,
					kecamatan: true,
					kohir: true,
					jumlah: true,
					masaPajakYear: true,
					masaPajakMonth: true,
				},
			}),
			context.db.sptpdPenerimaan.findMany({
				where,
				select: { kohir: true, totalBayar: true },
			}),
		]);

		const years = Array.from(
			new Set(
				ketetapanRows
					.map((k) => k.masaPajakYear)
					.filter((y): y is number => y != null),
			),
		).sort((a, b) => b - a);

		const kecamatanList = Array.from(
			new Set(
				ketetapanRows.map((k) => k.kecamatan).filter((k): k is string => !!k),
			),
		).sort((a, b) => a.localeCompare(b));

		const terbayarByKohir = new Map<string, number>();
		for (const p of penerimaanRows) {
			if (!p.kohir) continue;
			terbayarByKohir.set(
				p.kohir,
				(terbayarByKohir.get(p.kohir) ?? 0) + Number(p.totalBayar),
			);
		}

		interface Group {
			npwpd: string;
			jenisPajak: string;
			namaWp: string;
			kecamatan: string | null;
			monthly: Map<number, { ketetapan: number; terbayar: number }>;
		}
		const groups = new Map<string, Group>();
		for (const k of ketetapanRows) {
			if (k.masaPajakYear !== data.year) continue;
			const key = `${k.npwpd}::${k.jenisPajak}::${k.kecamatan ?? ""}`;
			let g = groups.get(key);
			if (!g) {
				g = {
					npwpd: k.npwpd,
					jenisPajak: k.jenisPajak,
					namaWp: k.namaWp,
					kecamatan: k.kecamatan,
					monthly: new Map(),
				};
				groups.set(key, g);
			}
			const month = k.masaPajakMonth ?? 0;
			const entry = g.monthly.get(month) ?? { ketetapan: 0, terbayar: 0 };
			entry.ketetapan += Number(k.jumlah);
			entry.terbayar += terbayarByKohir.get(k.kohir) ?? 0;
			g.monthly.set(month, entry);
		}

		let allRows: TunggakanRow[] = Array.from(groups.values()).map((g) => {
			const months: MonthlyTunggakan[] = Array.from(g.monthly.entries())
				.filter(([month]) => month >= 1 && month <= 12)
				.sort((a, b) => a[0] - b[0])
				.map(([month, v]) => ({
					year: data.year,
					month,
					label: MONTH_LABELS[month],
					ketetapan: v.ketetapan,
					terbayar: v.terbayar,
					sisa: Math.max(0, v.ketetapan - v.terbayar),
					status: statusFor(v.ketetapan, v.terbayar),
				}));
			const totalKetetapan = months.reduce((s, m) => s + m.ketetapan, 0);
			const totalTerbayar = months.reduce((s, m) => s + m.terbayar, 0);
			return {
				npwpd: g.npwpd,
				jenisPajak: g.jenisPajak,
				namaWp: g.namaWp,
				kecamatan: g.kecamatan,
				totalKetetapan,
				totalTerbayar,
				sisaTunggakan: Math.max(0, totalKetetapan - totalTerbayar),
				progressPct:
					totalKetetapan > 0
						? Math.round((totalTerbayar / totalKetetapan) * 1000) / 10
						: 100,
				status: statusFor(totalKetetapan, totalTerbayar),
				months,
			};
		});

		// Per-kecamatan breakdown for the map/overview chart — always computed
		// across every kecamatan (jenis + year scoped only), independent of the
		// `kecamatan` filter below, so it stays a full map to drill into.
		const byKecamatanMap = new Map<
			string,
			{ totalKetetapan: number; totalTerbayar: number; sisaTunggakan: number }
		>();
		for (const r of allRows) {
			if (!r.kecamatan) continue;
			const entry = byKecamatanMap.get(r.kecamatan) ?? {
				totalKetetapan: 0,
				totalTerbayar: 0,
				sisaTunggakan: 0,
			};
			entry.totalKetetapan += r.totalKetetapan;
			entry.totalTerbayar += r.totalTerbayar;
			entry.sisaTunggakan += r.sisaTunggakan;
			byKecamatanMap.set(r.kecamatan, entry);
		}
		const byKecamatan = Array.from(byKecamatanMap.entries())
			.map(([kecamatan, v]) => ({ kecamatan, ...v }))
			.sort((a, b) => b.sisaTunggakan - a.sisaTunggakan);

		if (data.kecamatan !== "all") {
			allRows = allRows.filter((r) => r.kecamatan === data.kecamatan);
		}

		const counts = {
			total: allRows.length,
			lunas: allRows.filter((r) => r.status === "Lunas").length,
			sebagian: allRows.filter((r) => r.status === "Sebagian").length,
			belumBayar: allRows.filter((r) => r.status === "Belum Bayar").length,
		};
		const summary = allRows.reduce(
			(acc, r) => {
				acc.totalKetetapan += r.totalKetetapan;
				acc.totalTerbayar += r.totalTerbayar;
				acc.sisaTunggakan += r.sisaTunggakan;
				return acc;
			},
			{ totalKetetapan: 0, totalTerbayar: 0, sisaTunggakan: 0 },
		);

		if (
			data.status === "Lunas" ||
			data.status === "Sebagian" ||
			data.status === "Belum Bayar"
		) {
			allRows = allRows.filter((r) => r.status === data.status);
		}
		const q = data.q.trim().toLowerCase();
		if (q) {
			allRows = allRows.filter(
				(r) =>
					r.namaWp.toLowerCase().includes(q) ||
					r.npwpd.toLowerCase().includes(q),
			);
		}
		allRows = allRows.sort((a, b) => b.sisaTunggakan - a.sisaTunggakan);

		const total = allRows.length;
		const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
		const page = Math.min(data.page, totalPages);
		const rows = allRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

		return {
			rows,
			total,
			page,
			pageSize: PAGE_SIZE,
			totalPages,
			years,
			kecamatanList,
			byKecamatan,
			counts,
			summary,
		};
	});
