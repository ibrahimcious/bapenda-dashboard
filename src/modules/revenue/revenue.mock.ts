/**
 * Revenue targets transcribed from the Patriot app's "Realisasi Penerimaan
 * Pajak Daerah Per-Tribulan" report. There's no live source for targets, so
 * `quarterlyTarget` (cumulative target through the end of each quarter)
 * stays a manually-transcribed figure.
 *
 * Realisasi is computed live in revenue.api.ts from `sptpd_penerimaan`,
 * summed per `jenisPajak` and bucketed by cumulative quarter — see that file
 * for the Pokok+Lain2 (excluding Sanksi) formula, and the Minerba Pokok MBLB
 * special case. PBB has no imported payment file yet, so it keeps its last
 * transcribed figures via `fallbackQuarterlyRealisasi`.
 */

export const CURRENT_YEAR = 2026;

export interface TaxCatalogEntry {
	code: string;
	name: string;
	shortName: string;
	/** Children of a parent category (e.g. PBJT) share a group key. */
	group?: string;
	/** Cumulative target through the end of each quarter (Q1..Q4). */
	quarterlyTarget: [number, number, number, number];
	/** sptpd_penerimaan.jenisPajak value(s) to sum for live realisasi. */
	jenisPajak?: string | string[];
	/** Used only when `jenisPajak` is omitted — no payment data source yet. */
	fallbackQuarterlyRealisasi?: [number, number, number, number];
}

export const TAX_CATALOG: TaxCatalogEntry[] = [
	{
		code: "PBJT_HOTEL",
		name: "PBJT - Hotel",
		shortName: "Hotel",
		group: "PBJT",
		quarterlyTarget: [
			2_603_276_766, 5_857_372_724, 9_762_287_873, 13_016_383_831,
		],
		jenisPajak: "HOTEL",
	},
	{
		code: "PBJT_RESTORAN",
		name: "PBJT - Restoran",
		shortName: "Restoran",
		group: "PBJT",
		quarterlyTarget: [
			10_344_674_247, 20_689_348_493, 31_034_022_740, 41_378_696_986,
		],
		jenisPajak: "RESTORAN",
	},
	{
		code: "PBJT_HIBURAN",
		name: "PBJT - Hiburan",
		shortName: "Hiburan",
		group: "PBJT",
		quarterlyTarget: [
			4_094_874_117, 8_189_748_234, 12_284_622_351, 16_379_496_468,
		],
		jenisPajak: "HIBURAN",
	},
	{
		code: "PBJT_PPJ",
		name: "PBJT - Penerangan Jalan",
		shortName: "PPJ",
		group: "PBJT",
		quarterlyTarget: [
			37_898_081_495, 75_796_162_990, 117_905_142_429, 168_435_917_755,
		],
		jenisPajak: "PPJ",
	},
	{
		code: "PBJT_PARKIR",
		name: "PBJT - Parkir",
		shortName: "Parkir",
		group: "PBJT",
		quarterlyTarget: [191_593_948, 383_187_896, 574_781_844, 766_375_792],
		jenisPajak: "PARKIR",
	},
	{
		code: "REKLAME",
		name: "Pajak Reklame",
		shortName: "Reklame",
		quarterlyTarget: [
			1_068_783_306, 2_137_566_612, 3_206_349_918, 4_275_133_224,
		],
		jenisPajak: "REKLAME",
	},
	{
		code: "AT",
		name: "Pajak Air Tanah",
		shortName: "Air Tanah",
		quarterlyTarget: [
			11_257_385_157, 22_514_770_314, 35_022_976_043, 50_032_822_919,
		],
		jenisPajak: "AT",
	},
	{
		code: "MINERBA",
		name: "Pajak MBLB (Minerba)",
		shortName: "Minerba",
		quarterlyTarget: [
			4_680_904_156, 9_361_808_311, 14_562_812_928, 20_804_018_469,
		],
		jenisPajak: "MINERBA",
	},
	{
		code: "PBB",
		name: "PBB-P2",
		shortName: "PBB",
		quarterlyTarget: [
			21_593_999_275, 43_187_998_549, 80_977_497_280, 107_969_996_373,
		],
		jenisPajak: "PBB",
	},
	{
		code: "BPHTB",
		name: "BPHTB",
		shortName: "BPHTB",
		quarterlyTarget: [
			16_068_140_559, 42_848_374_823, 74_984_655_940, 107_120_937_057,
		],
		jenisPajak: "BPHTB",
	},
	{
		code: "PKB",
		name: "Opsen PKB",
		shortName: "Opsen PKB",
		quarterlyTarget: [
			12_555_736_455, 33_481_963_880, 62_778_682_275, 83_704_909_700,
		],
		// The province collects PKB itself; the kabupaten only collects the
		// opsen (surcharge) on top of it, so that's the real data source here.
		jenisPajak: "OPSEN_PKB",
	},
	{
		code: "BBNKB",
		name: "Opsen BBNKB",
		shortName: "Opsen BBNKB",
		quarterlyTarget: [
			7_879_713_360, 15_759_426_720, 29_548_925_100, 39_398_566_800,
		],
		jenisPajak: "OPSEN_BBNKB",
	},
];
