import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { MonthlyAmount } from "../taxmapper.types";

const SERIES_COLOR = "#2a78d6";

const fmtCompact = (v: number) => {
	const abs = Math.abs(v);
	if (abs >= 1e9)
		return `${(v / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
	if (abs >= 1e6)
		return `${(v / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
	if (abs >= 1e3)
		return `${(v / 1e3).toLocaleString("id-ID", { maximumFractionDigits: 1 })} rb`;
	return `${Math.round(v)}`;
};

function ChartTooltip({
	active,
	payload,
}: {
	active?: boolean;
	payload?: { payload: MonthlyAmount }[];
}) {
	if (!active || !payload?.length) return null;
	const point = payload[0].payload;
	return (
		<div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-md">
			<div className="font-medium text-gray-900">{point.label}</div>
			<div className="text-gray-500">
				Rp {point.amount.toLocaleString("id-ID")}
			</div>
		</div>
	);
}

export function TaxMapperMonthlyChart({ data }: { data: MonthlyAmount[] }) {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
			<h2 className="text-sm font-semibold text-gray-900">Omzet per Bulan</h2>
			<p className="mb-4 text-xs text-gray-400">
				Total omzet objek pajak yang dipetakan, per bulan
			</p>
			<ResponsiveContainer width="100%" height={280}>
				<BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
					<CartesianGrid vertical={false} stroke="#e1e0d9" />
					<XAxis
						dataKey="label"
						axisLine={{ stroke: "#c3c2b7" }}
						tickLine={false}
						tick={{ fill: "#898781", fontSize: 12 }}
					/>
					<YAxis
						axisLine={false}
						tickLine={false}
						tick={{ fill: "#898781", fontSize: 12 }}
						tickFormatter={(v: number) => fmtCompact(v)}
						width={56}
					/>
					<Tooltip cursor={{ fill: "#f9f9f7" }} content={<ChartTooltip />} />
					<Bar
						dataKey="amount"
						fill={SERIES_COLOR}
						radius={[4, 4, 0, 0]}
						maxBarSize={24}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
