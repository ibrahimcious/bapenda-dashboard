import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { dbMiddleware } from "#/shared/middleware/db.middleware";
import type {
	MonthlyAmount,
	TaxMapperObject,
	TaxMapperResult,
} from "./taxmapper.types";
import { MONTH_LABELS } from "./taxmapper.utils";

const PAGE_SIZE = 25;

const TaxMapperQuerySchema = z.object({
	type: z.string().optional().default("all"),
	q: z.string().optional().default(""),
	page: z.number().int().min(1).optional().default(1),
});

export const getTaxMapperServerFn = createServerFn()
	.middleware([dbMiddleware])
	.validator(TaxMapperQuerySchema)
	.handler(async ({ data, context }): Promise<TaxMapperResult> => {
		const records = await context.db.taxMapperRecord.findMany({
			select: {
				niop: true,
				namaObjekPajak: true,
				type: true,
				month: true,
				amount: true,
			},
		});

		const types = Array.from(new Set(records.map((r) => r.type))).sort((a, b) =>
			a.localeCompare(b),
		);

		const scoped =
			data.type === "all"
				? records
				: records.filter((r) => r.type === data.type);

		interface Group {
			niop: string;
			namaObjekPajak: string;
			type: string;
			months: number[];
		}
		const groups = new Map<string, Group>();
		const monthlyTotals = new Array(12).fill(0) as number[];
		for (const r of scoped) {
			let g = groups.get(r.niop);
			if (!g) {
				g = {
					niop: r.niop,
					namaObjekPajak: r.namaObjekPajak,
					type: r.type,
					months: new Array(12).fill(0),
				};
				groups.set(r.niop, g);
			}
			const amount = Number(r.amount);
			g.months[r.month - 1] += amount;
			monthlyTotals[r.month - 1] += amount;
		}

		let allRows: TaxMapperObject[] = Array.from(groups.values()).map((g) => {
			const months: MonthlyAmount[] = g.months.map((amount, i) => ({
				month: i + 1,
				label: MONTH_LABELS[i + 1],
				amount,
			}));
			return {
				niop: g.niop,
				namaObjekPajak: g.namaObjekPajak,
				type: g.type,
				total: months.reduce((s, m) => s + m.amount, 0),
				months,
			};
		});

		const grandTotal = allRows.reduce((s, r) => s + r.total, 0);
		const monthly: MonthlyAmount[] = monthlyTotals.map((amount, i) => ({
			month: i + 1,
			label: MONTH_LABELS[i + 1],
			amount,
		}));

		const q = data.q.trim().toLowerCase();
		if (q) {
			allRows = allRows.filter(
				(r) =>
					r.namaObjekPajak.toLowerCase().includes(q) ||
					r.niop.toLowerCase().includes(q),
			);
		}
		allRows = allRows.sort((a, b) => b.total - a.total);

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
			types,
			grandTotal,
			monthly,
		};
	});
