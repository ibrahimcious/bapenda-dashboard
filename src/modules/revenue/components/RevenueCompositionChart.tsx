import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";
import { ClientOnly } from "#/shared/components/ClientOnly";
import type { RevenueSummary } from "../revenue.types";
import { formatIDR } from "../revenue.utils";

const COLORS = [
	"#2563eb",
	"#16a34a",
	"#f59e0b",
	"#dc2626",
	"#7c3aed",
	"#0891b2",
	"#db2777",
	"#65a30d",
	"#ea580c",
	"#0d9488",
	"#9333ea",
];

export function RevenueCompositionChart({
	summary,
}: {
	summary: RevenueSummary;
}) {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 className="mb-1 text-base font-semibold text-gray-900">
				Komposisi Penerimaan
			</h2>
			<p className="mb-4 text-xs text-gray-400">
				Kontribusi per jenis pajak (YTD {summary.currentYear})
			</p>
			<div className="h-72 w-full">
				<ClientOnly
					fallback={
						<div className="h-full w-full animate-pulse rounded-lg bg-gray-50" />
					}
				>
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={summary.composition}
								dataKey="value"
								nameKey="shortName"
								cx="50%"
								cy="50%"
								innerRadius={55}
								outerRadius={90}
								paddingAngle={2}
							>
								{summary.composition.map((slice, i) => (
									<Cell key={slice.taxCode} fill={COLORS[i % COLORS.length]} />
								))}
							</Pie>
							<Tooltip
								formatter={(value, name) => [
									formatIDR(Number(value)),
									String(name),
								]}
							/>
							<Legend
								formatter={(value) => (
									<span className="text-xs text-gray-600">{value}</span>
								)}
							/>
						</PieChart>
					</ResponsiveContainer>
				</ClientOnly>
			</div>
		</div>
	);
}
