/**
 * One-off import of SPTPD billing ("ketetapan") and payment receipt
 * ("penerimaan") data from public/data/*.csv into Postgres.
 *
 * Usage: node scripts/import-tunggakan.ts
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "csv-parse/sync";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DATA_DIR = join(import.meta.dirname, "..", "public", "data");
const BATCH_SIZE = 1000;

const MONTHS: Record<string, number> = {
	jan: 1,
	feb: 2,
	mar: 3,
	apr: 4,
	mei: 5,
	jun: 6,
	jul: 7,
	agu: 8,
	sep: 9,
	okt: 10,
	nov: 11,
	des: 12,
};

/** "65.736.100,00" (Indonesian format) -> "65736100.00", or null if blank/unparseable. */
function parseIdDecimal(raw: string | undefined): string | null {
	const s = raw?.trim();
	if (!s || s === "-") return null;
	const normalized = s.replaceAll(".", "").replace(",", ".");
	return Number.isFinite(Number(normalized)) ? normalized : null;
}

/** "17-07-2026" -> Date, or null if blank/unparseable. */
function parseDDMMYYYY(raw: string | undefined): Date | null {
	const s = raw?.trim();
	if (!s || s === "-") return null;
	const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
	if (!m) return null;
	return new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])));
}

/** "Des 2025" -> { year: 2025, month: 12 }, or null if blank/unparseable. */
function parseMasaPajak(raw: string | undefined): { year: number; month: number } | null {
	const s = raw?.trim();
	if (!s) return null;
	const m = s.match(/^([A-Za-z]{3})\s+(\d{4})$/);
	if (!m) return null;
	const month = MONTHS[m[1].toLowerCase()];
	if (!month) return null;
	return { year: Number(m[2]), month };
}

function readCsv(filename: string): Record<string, string>[] {
	const raw = readFileSync(join(DATA_DIR, filename), "utf-8");
	return parse(raw, {
		columns: true,
		bom: true,
		trim: true,
		skip_empty_lines: true,
		relax_column_count: true,
	});
}

async function importKetetapan() {
	const rows = readCsv("sptpd18juli.csv");
	const data = [];
	for (const row of rows) {
		const no = Number.parseInt(row.No, 10);
		if (!Number.isFinite(no)) continue; // skips the trailing TOTAL row
		// JUMLAH is already plain "123456.00" (no thousands separator), unlike
		// the Indonesian-formatted amounts in the penerimaan files.
		const jumlah = row.JUMLAH?.trim();
		if (!jumlah || !Number.isFinite(Number(jumlah))) continue;
		const masa = parseMasaPajak(row["MASA PAJAK"]);
		data.push({
			no,
			jenisPajak: row["JENIS PAJAK"],
			npwpd: row.NPWPD,
			namaRekening: row["NAMA REKENING"],
			nop: row.NOP || null,
			namaWp: row["NAMA WP"],
			namaObjek: row["NAMA OBJEK"] || null,
			alamatObjek: row["ALAMAT OBJEK"] || null,
			kecamatan: row.KECAMATAN || null,
			desa: row.DESA || null,
			// A handful of source rows have no KOHIR; since it's our join key to
			// payments, give those a synthetic unique value (never matches a real
			// payment) rather than leaving it blank/duplicated across rows.
			kohir: row.KOHIR?.trim() || `MISSING-${no}`,
			tglLapor: parseDDMMYYYY(row["TGL LAPOR"]),
			masaPajak: row["MASA PAJAK"] || null,
			masaPajakYear: masa?.year ?? null,
			masaPajakMonth: masa?.month ?? null,
			jumlah,
			keterangan: row.KETERANGAN || null,
			petugasInput: row["PETUGAS INPUT"] || null,
		});
	}

	await prisma.sptpdKetetapan.deleteMany();
	for (let i = 0; i < data.length; i += BATCH_SIZE) {
		await prisma.sptpdKetetapan.createMany({
			data: data.slice(i, i + BATCH_SIZE),
		});
	}
	console.log(`sptpd_ketetapan: imported ${data.length} / ${rows.length} rows`);
}

const PENERIMAAN_FILES: { file: string; jenisPajak: string }[] = [
	{ file: "Buku Bantu Penerimaan - SMART REPORT (1).csv", jenisPajak: "HOTEL" },
	{ file: "Buku Bantu Penerimaan - SMART REPORT (2).csv", jenisPajak: "RESTORAN" },
	{ file: "Buku Bantu Penerimaan - SMART REPORT (3).csv", jenisPajak: "HIBURAN" },
	{ file: "Buku Bantu Penerimaan - SMART REPORT (4).csv", jenisPajak: "REKLAME" },
	{ file: "Buku Bantu Penerimaan - SMART REPORT (5).csv", jenisPajak: "PPJ" },
	{ file: "Buku Bantu Penerimaan - SMART REPORT (6).csv", jenisPajak: "PARKIR" },
	{ file: "Buku Bantu Penerimaan - SMART REPORT (7).csv", jenisPajak: "AT" },
	{ file: "Buku Bantu Penerimaan - SMART REPORT (9).csv", jenisPajak: "MINERBA" },
];

async function importPenerimaan() {
	await prisma.sptpdPenerimaan.deleteMany();
	let totalImported = 0;
	let totalRows = 0;

	for (const { file, jenisPajak } of PENERIMAAN_FILES) {
		const rows = readCsv(file);
		totalRows += rows.length;
		const data = [];
		for (const row of rows) {
			const no = Number.parseInt(row.No, 10);
			if (!Number.isFinite(no)) continue; // skips the trailing Total row
			const totalBayar = parseIdDecimal(row["Total Bayar"]);
			if (!totalBayar) continue; // malformed/unattributable rows (e.g. bank-fee entries)
			data.push({
				no,
				jenisPajak,
				noRekening: row["No. Rekening"] || null,
				namaRekening: row["Nama Rekening"] || null,
				namaSipd: row["Nama SIPD"] || null,
				noBukti: row["No. Bukti"] || null,
				diterimaDari: row["Diterima dari"] || null,
				alamat: row.Alamat || null,
				desa: row.Desa || null,
				kecamatan: row.Kecamatan || null,
				pembayaranDari: row["Pembayaran dari"] || null,
				npwpd: row.NPWPD || null,
				kohir: row.KOHIR || null,
				nop: row.NOP || null,
				ket: row.KET || null,
				masaPajak: row["Masa Pajak"] || null,
				pokok: parseIdDecimal(row.Pokok),
				sanksi: parseIdDecimal(row.Sanksi),
				lain2: parseIdDecimal(row.Lain2),
				totalBayar,
				tglBayar: parseDDMMYYYY(row["Tgl Bayar"]),
				tglKetetapan: row["Tgl Ketetapan"] || null,
			});
		}
		for (let i = 0; i < data.length; i += BATCH_SIZE) {
			await prisma.sptpdPenerimaan.createMany({
				data: data.slice(i, i + BATCH_SIZE),
			});
		}
		totalImported += data.length;
		console.log(`  ${file}: imported ${data.length} / ${rows.length} rows`);
	}
	console.log(`sptpd_penerimaan: imported ${totalImported} / ${totalRows} rows total`);
}

async function main() {
	await importKetetapan();
	await importPenerimaan();
	await prisma.$disconnect();
}

main().catch(async (err) => {
	console.error(err);
	await prisma.$disconnect();
	process.exit(1);
});
