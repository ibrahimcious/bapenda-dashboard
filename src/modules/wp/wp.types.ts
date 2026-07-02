/**
 * Wajib Pajak (taxpayer) registry types.
 *
 * Source: "data wp.xlsx" (8 sheets, one per tax type), converted to per-tax JSON
 * under ./data. Replace with a live Patriot query when DB access is available.
 */

export interface WajibPajak {
	npwpd: string | null;
	namaSubjek: string | null;
	alamatSubjek: string | null;
	telpSubjek: string | null;
	telpObjek: string | null;
	nopd: string | null;
	namaNopd: string | null;
	alamatNopd: string | null;
	kecamatan: string | null;
	kelurahan: string | null;
	status: string | null;
}

export interface TaxSheet {
	slug: string;
	label: string;
	count: number;
}

/** The 8 tax-type sheets, with their total registrant counts (for nav badges). */
export const TAX_SHEETS: TaxSheet[] = [
	{ slug: "hotel", label: "Hotel", count: 307 },
	{ slug: "restoran", label: "Restoran", count: 4256 },
	{ slug: "hiburan", label: "Hiburan", count: 204 },
	{ slug: "reklame", label: "Reklame", count: 6415 },
	{ slug: "ppj", label: "PPJ", count: 537 },
	{ slug: "parkir", label: "Parkir", count: 249 },
	{ slug: "air-tanah", label: "Air Tanah", count: 1658 },
	{ slug: "minerba", label: "Minerba", count: 179 },
];

export const TAX_SLUGS = TAX_SHEETS.map((s) => s.slug);

export interface WpResult {
	rows: WajibPajak[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
	counts: { total: number; aktif: number; nonAktif: number };
}
