/**
 * Tunggakan (arrears) types: compares SPTPD billing ("ketetapan") against
 * actual payment receipts ("penerimaan") per taxpayer, joined on `kohir`.
 */

export type PaymentStatus = "Lunas" | "Sebagian" | "Belum Bayar";

export interface TaxType {
	slug: string;
	label: string;
	/** Raw `jenisPajak` value as stored in sptpd_ketetapan / sptpd_penerimaan. */
	value: string;
}

export const TAX_TYPES: TaxType[] = [
	{ slug: "hotel", label: "Hotel", value: "HOTEL" },
	{ slug: "restoran", label: "Restoran", value: "RESTORAN" },
	{ slug: "hiburan", label: "Hiburan", value: "HIBURAN" },
	{ slug: "reklame", label: "Reklame", value: "REKLAME" },
	{ slug: "ppj", label: "PPJ", value: "PPJ" },
	{ slug: "parkir", label: "Parkir", value: "PARKIR" },
	{ slug: "air-tanah", label: "Air Tanah", value: "AT" },
	{ slug: "minerba", label: "Minerba", value: "MINERBA" },
];

export const TAX_SLUGS = TAX_TYPES.map((t) => t.slug);

export interface MonthlyTunggakan {
	year: number;
	month: number;
	label: string;
	ketetapan: number;
	terbayar: number;
	sisa: number;
	status: PaymentStatus;
}

export interface TunggakanRow {
	npwpd: string;
	jenisPajak: string;
	namaWp: string;
	totalKetetapan: number;
	totalTerbayar: number;
	sisaTunggakan: number;
	progressPct: number;
	status: PaymentStatus;
	months: MonthlyTunggakan[];
}

export interface TunggakanResult {
	rows: TunggakanRow[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
	years: number[];
	counts: { total: number; lunas: number; sebagian: number; belumBayar: number };
	summary: { totalKetetapan: number; totalTerbayar: number; sisaTunggakan: number };
}
