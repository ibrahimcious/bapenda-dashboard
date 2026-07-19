import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const STATUS_COLORS = {
	Lunas: "#0ca30c",
	Sebagian: "#fab219",
	"Belum Bayar": "#d03b3b",
} as const;

interface StatusSlice {
	label: keyof typeof STATUS_COLORS;
	value: number;
}

function ChartTooltip({
	active,
	payload,
}: {
	active?: boolean;
	payload?: { payload: StatusSlice }[];
}) {
	if (!active || !payload?.length) return null;
	const point = payload[0].payload;
	return (
		<div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-md">
			<div className="font-medium text-gray-900">{point.label}</div>
			<div className="text-gray-500">
				{point.value.toLocaleString("id-ID")} wajib pajak
			</div>
		</div>
	);
}

export function StatusDistributionChart({
	counts,
}: {
	counts: { lunas: number; sebagian: number; belumBayar: number };
}) {
	const data: StatusSlice[] = [
		{ label: "Lunas", value: counts.lunas },
		{ label: "Sebagian", value: counts.sebagian },
		{ label: "Belum Bayar", value: counts.belumBayar },
	];
	const total = counts.lunas + counts.sebagian + counts.belumBayar;

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
			<h2 className="text-sm font-semibold text-gray-900">
				Distribusi Status Pembayaran
			</h2>
			<p className="mb-4 text-xs text-gray-400">
				Proporsi wajib pajak berdasarkan status pembayaran
			</p>
			{total === 0 ? (
				<div className="py-10 text-center text-sm text-gray-400">
					Tidak ada data.
				</div>
			) : (
				<div className="flex items-center gap-6">
					<ResponsiveContainer width={160} height={160}>
						<PieChart>
							<Pie
								data={data}
								dataKey="value"
								nameKey="label"
								innerRadius={45}
								outerRadius={70}
								paddingAngle={2}
								stroke="#fcfcfb"
								strokeWidth={2}
							>
								{data.map((d) => (
									<Cell key={d.label} fill={STATUS_COLORS[d.label]} />
								))}
							</Pie>
							<Tooltip content={<ChartTooltip />} />
						</PieChart>
					</ResponsiveContainer>
					<div className="space-y-2 text-sm">
						{data.map((d) => (
							<div key={d.label} className="flex items-center gap-2">
								<span
									className="size-2.5 shrink-0 rounded-full"
									style={{ backgroundColor: STATUS_COLORS[d.label] }}
								/>
								<span className="text-gray-700">{d.label}</span>
								<span className="font-medium text-gray-900">
									{d.value.toLocaleString("id-ID")}
								</span>
								<span className="text-xs text-gray-400">
									({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
								</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
