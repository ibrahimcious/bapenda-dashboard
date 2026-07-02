/**
 * Revenue data transcribed from the Patriot app dashboard
 * ("Realisasi Penerimaan Pajak Daerah Per-Tribulan").
 *
 * Notes on the source:
 * - Figures are cumulative-to-date. Realisasi currently runs through Triwulan II,
 *   so the later quarters carry the same realisasi value forward.
 * - `realisasi` below is the latest cumulative realisasi (= Triwulan IV column,
 *   which equals the to-date value); `targetTotal` is the annual target.
 * - PBJT is split into its sub-types (Hotel/Restoran/Hiburan/PPJ/Parkir); the
 *   12 leaf rows sum exactly to the Patriot TOTAL.
 *
 * Replace this provider with a live Patriot query once DB access is available.
 */

export const CURRENT_YEAR = 2026;
/** Realisasi data is available through this quarter. */
export const AS_OF_QUARTER = 2; // Triwulan II

export interface PatriotTaxInput {
	code: string;
	name: string;
	shortName: string;
	group?: string;
	targetTotal: number;
	realisasi: number;
}

export const TAXES: PatriotTaxInput[] = [
	{
		code: "PBJT_HOTEL",
		name: "PBJT - Hotel",
		shortName: "Hotel",
		group: "PBJT",
		targetTotal: 13_016_383_831,
		realisasi: 5_588_602_270,
	},
	{
		code: "PBJT_RESTORAN",
		name: "PBJT - Restoran",
		shortName: "Restoran",
		group: "PBJT",
		targetTotal: 41_378_696_986,
		realisasi: 22_809_950_761,
	},
	{
		code: "PBJT_HIBURAN",
		name: "PBJT - Hiburan",
		shortName: "Hiburan",
		group: "PBJT",
		targetTotal: 16_379_496_468,
		realisasi: 8_283_392_148,
	},
	{
		code: "PBJT_PPJ",
		name: "PBJT - Penerangan Jalan",
		shortName: "PPJ",
		group: "PBJT",
		targetTotal: 168_435_917_755,
		realisasi: 89_196_484_079,
	},
	{
		code: "PBJT_PARKIR",
		name: "PBJT - Parkir",
		shortName: "Parkir",
		group: "PBJT",
		targetTotal: 766_375_792,
		realisasi: 487_920_163,
	},
	{
		code: "REKLAME",
		name: "Pajak Reklame",
		shortName: "Reklame",
		targetTotal: 4_275_133_224,
		realisasi: 2_744_666_420,
	},
	{
		code: "AT",
		name: "Pajak Air Tanah",
		shortName: "Air Tanah",
		targetTotal: 50_032_822_919,
		realisasi: 23_671_095_238,
	},
	{
		code: "MINERBA",
		name: "Pajak MBLB (Minerba)",
		shortName: "Minerba",
		targetTotal: 20_804_018_469,
		realisasi: 8_872_403_801,
	},
	{
		code: "PBB",
		name: "PBB-P2",
		shortName: "PBB",
		targetTotal: 107_969_996_373,
		realisasi: 71_109_414_473,
	},
	{
		code: "BPHTB",
		name: "BPHTB",
		shortName: "BPHTB",
		targetTotal: 107_120_937_057,
		realisasi: 49_033_672_769,
	},
	{
		code: "PKB",
		name: "Pajak Kendaraan Bermotor",
		shortName: "PKB",
		targetTotal: 83_704_909_700,
		realisasi: 38_165_840_350,
	},
	{
		code: "BBNKB",
		name: "Bea Balik Nama Kendaraan Bermotor",
		shortName: "BBNKB",
		targetTotal: 39_398_566_800,
		realisasi: 18_011_813_500,
	},
];

export interface QuarterInput {
	quarter: number;
	target: number;
	realisasi: number;
}

/** Cumulative target & realisasi per triwulan (Patriot TOTAL row). */
export const QUARTERLY: QuarterInput[] = [
	{ quarter: 1, target: 130_237_162_839, realisasi: 169_924_427_685 },
	{ quarter: 2, target: 280_207_729_545, realisasi: 337_975_255_972 },
	{ quarter: 3, target: 472_642_756_721, realisasi: 337_975_255_972 },
	{ quarter: 4, target: 653_283_255_374, realisasi: 337_975_255_972 },
];

export function getRevenueData(): {
	taxes: PatriotTaxInput[];
	quarterly: QuarterInput[];
} {
	return { taxes: TAXES, quarterly: QUARTERLY };
}
