import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import type { WajibPajak, WpResult } from "./wp.types";

/**
 * Per-tax lazy loaders — only the requested sheet's JSON is imported, on the
 * server, keeping the (large) datasets out of the client bundle.
 */
const loaders: Record<string, () => Promise<{ default: WajibPajak[] }>> = {
	hotel: () => import("./data/hotel.json"),
	restoran: () => import("./data/restoran.json"),
	hiburan: () => import("./data/hiburan.json"),
	reklame: () => import("./data/reklame.json"),
	ppj: () => import("./data/ppj.json"),
	parkir: () => import("./data/parkir.json"),
	"air-tanah": () => import("./data/air-tanah.json"),
	minerba: () => import("./data/minerba.json"),
};

const PAGE_SIZE = 25;

const WpQuerySchema = z.object({
	tax: z.string(),
	q: z.string().optional().default(""),
	status: z.string().optional().default("all"),
	page: z.number().int().min(1).optional().default(1),
});

function matches(row: WajibPajak, q: string): boolean {
	return [
		row.npwpd,
		row.namaSubjek,
		row.namaNopd,
		row.kecamatan,
		row.kelurahan,
		row.alamatSubjek,
		row.alamatNopd,
	].some((v) => v?.toLowerCase().includes(q));
}

export const getWajibPajakServerFn = createServerFn()
	.validator(WpQuerySchema)
	.handler(async ({ data }): Promise<WpResult> => {
		const load = loaders[data.tax] ?? loaders.hotel;
		const all = (await load()).default;

		let filtered = all;
		if (data.status === "Aktif" || data.status === "Non Aktif") {
			filtered = filtered.filter((r) => r.status === data.status);
		}
		const q = data.q.trim().toLowerCase();
		if (q) filtered = filtered.filter((r) => matches(r, q));

		const total = filtered.length;
		const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
		const page = Math.min(data.page, totalPages);
		const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

		const aktif = all.filter((r) => r.status === "Aktif").length;
		const nonAktif = all.filter((r) => r.status === "Non Aktif").length;

		return {
			rows,
			total,
			page,
			pageSize: PAGE_SIZE,
			totalPages,
			counts: { total: all.length, aktif, nonAktif },
		};
	});
