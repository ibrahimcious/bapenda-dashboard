import { useMemo, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { MonthlyPoint, TaxMonthlySeries } from "../revenue.types";
import { formatCompactIDR, formatIDR } from "../revenue.utils";

const SERIES_COLOR = "#2a78d6";

function ChartTooltip({
	active,
	payload,
}: {
	active?: boolean;
	payload?: { payload: MonthlyPoint }[];
}) {
	if (!active || !payload?.length) return null;
	const point = payload[0].payload;
	return (
		<div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-md">
			<div className="font-medium text-gray-900">{point.label}</div>
			<div className="text-gray-500">{formatIDR(point.realisasi)}</div>
		</div>
	);
}

export function MonthlyRealizationChart({
	series,
}: {
	series: TaxMonthlySeries[];
}) {
	const [selected, setSelected] = useState(series[0]?.code ?? "ALL");
	const active = useMemo(
		() => series.find((s) => s.code === selected) ?? series[0],
		[series, selected],
	);

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
			<div className="mb-4 flex flex-wrap items-start justify-between gap-3">
				<div>
					<h2 className="text-sm font-semibold text-gray-900">
						Penerimaan per Bulan
					</h2>
					<p className="text-xs text-gray-400">
						Realisasi {active?.label.toLowerCase()}, per bulan berjalan
					</p>
				</div>
				<select
					value={selected}
					onChange={(e) => setSelected(e.target.value)}
					className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
				>
					{series.map((s) => (
						<option key={s.code} value={s.code}>
							{s.label}
						</option>
					))}
				</select>
			</div>
			<ResponsiveContainer width="100%" height={280}>
				<BarChart
					data={active?.points ?? []}
					margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
				>
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
						tickFormatter={(v: number) => formatCompactIDR(v)}
						width={64}
					/>
					<Tooltip cursor={{ fill: "#f9f9f7" }} content={<ChartTooltip />} />
					<Bar
						dataKey="realisasi"
						fill={SERIES_COLOR}
						radius={[4, 4, 0, 0]}
						maxBarSize={24}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
