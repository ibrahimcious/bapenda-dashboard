/**
 * One-off import of "TaxMapper" field-mapping/monitoring data from
 * public/data/TAXMAPPER Bulan 1 - 12.csv into Postgres.
 *
 * Usage: node scripts/import-taxmapper.ts
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
const FILE = "TAXMAPPER Bulan 1 - 12.csv";

const MONTH_COLUMNS = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
];

/** "33.739.520" (Indonesian format, no decimals) -> "33739520.00". */
function parseIdInteger(raw: string | undefined): string {
	const s = raw?.trim();
	if (!s || s === "-") return "0.00";
	const normalized = s.replaceAll(".", "");
	return Number.isFinite(Number(normalized)) ? `${normalized}.00` : "0.00";
}

async function main() {
	const raw = readFileSync(join(DATA_DIR, FILE), "utf-8");
	const rows: Record<string, string>[] = parse(raw, {
		columns: true,
		bom: true,
		trim: true,
		skip_empty_lines: true,
		relax_column_count: true,
	});

	const data = [];
	for (const row of rows) {
		const no = Number.parseInt(row.No, 10);
		if (!Number.isFinite(no)) continue;
		for (let m = 0; m < 12; m++) {
			data.push({
				no,
				niop: row.NIOP,
				namaObjekPajak: row["Nama Objek Pajak"],
				type: row.Type,
				month: m + 1,
				amount: parseIdInteger(row[MONTH_COLUMNS[m]]),
			});
		}
	}

	await prisma.taxMapperRecord.deleteMany();
	await prisma.taxMapperRecord.createMany({ data });
	console.log(`tax_mapper_record: imported ${data.length} rows (${rows.length} objects x 12 months)`);
	await prisma.$disconnect();
}

main().catch(async (err) => {
	console.error(err);
	await prisma.$disconnect();
	process.exit(1);
});
