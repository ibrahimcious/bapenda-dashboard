import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { KecamatanTunggakan } from "../tunggakan.types";

const SERIES_COLOR = "#2a78d6";
const fmt = (n: number) => Math.round(n).toLocaleString("id-ID");

function ChartTooltip({
	active,
	payload,
}: {
	active?: boolean;
	payload?: { payload: KecamatanTunggakan }[];
}) {
	if (!active || !payload?.length) return null;
	const point = payload[0].payload;
	return (
		<div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-md">
			<div className="font-medium text-gray-900">{point.kecamatan}</div>
			<div className="text-red-600">Sisa: {fmt(point.sisaTunggakan)}</div>
			<div className="text-gray-500">
				Ketetapan: {fmt(point.totalKetetapan)}
			</div>
			<div className="text-emerald-600">
				Terbayar: {fmt(point.totalTerbayar)}
			</div>
		</div>
	);
}

export function KecamatanTunggakanChart({
	data,
	onSelect,
}: {
	data: KecamatanTunggakan[];
	onSelect?: (kecamatan: string) => void;
}) {
	const top = data.slice(0, 10);

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
			<h2 className="text-sm font-semibold text-gray-900">
				Sisa Tunggakan per Kecamatan
			</h2>
			<p className="mb-4 text-xs text-gray-400">
				10 kecamatan dengan tunggakan tertinggi — klik batang untuk memfilter
				tabel
			</p>
			{top.length === 0 ? (
				<div className="py-10 text-center text-sm text-gray-400">
					Tidak ada data.
				</div>
			) : (
				<ResponsiveContainer
					width="100%"
					height={Math.max(220, top.length * 32)}
				>
					<BarChart
						data={top}
						layout="vertical"
						margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
					>
						<CartesianGrid horizontal={false} stroke="#e1e0d9" />
						<XAxis
							type="number"
							axisLine={{ stroke: "#c3c2b7" }}
							tickLine={false}
							tick={{ fill: "#898781", fontSize: 12 }}
							tickFormatter={(v: number) => fmt(v)}
						/>
						<YAxis
							type="category"
							dataKey="kecamatan"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#52514e", fontSize: 12 }}
							width={100}
						/>
						<Tooltip cursor={{ fill: "#f9f9f7" }} content={<ChartTooltip />} />
						<Bar
							dataKey="sisaTunggakan"
							fill={SERIES_COLOR}
							radius={[0, 4, 4, 0]}
							maxBarSize={20}
							cursor={onSelect ? "pointer" : undefined}
							onClick={(d: unknown) => {
								const point = d as KecamatanTunggakan;
								onSelect?.(point.kecamatan);
							}}
						/>
					</BarChart>
				</ResponsiveContainer>
			)}
		</div>
	);
}
