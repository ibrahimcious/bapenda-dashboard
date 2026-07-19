import { Fragment } from "react";
import type { QuarterlyReport, QuarterlyTaxRow } from "../revenue.types";

const fmt = (n: number) => Math.round(n).toLocaleString("id-ID");

const TRIBULAN_LABELS = [
	"Tribulan 1",
	"Tribulan 2",
	"Tribulan 3",
	"Tribulan 4",
];

const th = "px-2.5 py-1.5 font-medium whitespace-nowrap";
const td = "px-2.5 py-1.5 text-right whitespace-nowrap";

/** First column stays visible when the table scrolls horizontally. */
const stickyCol = "sticky left-0 z-10 border-r border-gray-200";

function Row({ row, isTotal }: { row: QuarterlyTaxRow; isTotal?: boolean }) {
	const rowBg = isTotal
		? "bg-[#8fbc6c]"
		: row.isGroup
			? "bg-emerald-50"
			: "bg-white";
	const rowClass = isTotal
		? `${rowBg} font-bold text-white`
		: row.isGroup
			? `${rowBg} font-semibold text-gray-900`
			: `group ${rowBg} text-gray-700 hover:bg-gray-50`;
	const stickyBg = isTotal
		? rowBg
		: row.isGroup
			? rowBg
			: `${rowBg} group-hover:bg-gray-50`;

	return (
		<tr className={`border-b border-gray-100 last:border-0 ${rowClass}`}>
			<td
				className={`${td} ${stickyCol} ${stickyBg} text-left ${row.indent ? "pl-6 text-gray-500" : ""}`}
			>
				{row.indent ? `– ${row.name}` : row.name}
			</td>
			<td className={td}>{fmt(row.targetTotal)}</td>
			{row.quarters.map((q) => (
				<Fragment key={q.quarter}>
					<td className={`${td} border-l border-gray-100`}>{fmt(q.target)}</td>
					<td className={td}>{fmt(q.realisasi)}</td>
					<td className={`${td} ${isTotal ? "" : "text-gray-500"}`}>
						{isTotal ? q.pct.toFixed(2) : Math.round(q.pct)}
					</td>
				</Fragment>
			))}
		</tr>
	);
}

export function RealizationTable({ report }: { report: QuarterlyReport }) {
	return (
		<div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
			<table className="w-full border-collapse text-xs">
				<thead className="bg-[#8fbc6c] text-white">
					<tr>
						<th
							rowSpan={2}
							className={`${th} ${stickyCol} bg-[#8fbc6c] text-left`}
						>
							Nama Pajak
						</th>
						<th rowSpan={2} className={`${th} text-right`}>
							Target Total
						</th>
						{TRIBULAN_LABELS.map((label) => (
							<th
								key={label}
								colSpan={3}
								className={`${th} border-l border-white/20 text-center`}
							>
								{label}
							</th>
						))}
					</tr>
					<tr>
						{TRIBULAN_LABELS.map((label) => (
							<Fragment key={label}>
								<th className={`${th} border-l border-white/20 text-right`}>
									Target
								</th>
								<th className={`${th} text-right`}>Realisasi</th>
								<th className={`${th} text-right`}>%</th>
							</Fragment>
						))}
					</tr>
				</thead>
				<tbody>
					{report.rows.map((row) => (
						<Row key={row.code} row={row} />
					))}
					<Row row={report.total} isTotal />
				</tbody>
			</table>
		</div>
	);
}
