import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { ClientOnly } from "#/shared/components/ClientOnly";
import type { RevenueSummary } from "../revenue.types";
import { formatCompactIDR, formatIDR } from "../revenue.utils";

export function RevenueQuarterlyChart({
	summary,
}: {
	summary: RevenueSummary;
}) {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 className="mb-1 text-base font-semibold text-gray-900">
				Target vs Realisasi per Triwulan
			</h2>
			<p className="mb-4 text-xs text-gray-400">
				Kumulatif {summary.currentYear}
			</p>
			<div className="h-72 w-full">
				<ClientOnly
					fallback={
						<div className="h-full w-full animate-pulse rounded-lg bg-gray-50" />
					}
				>
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={summary.quarterly}
							margin={{ top: 5, right: 12, left: 0, bottom: 0 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="#f0f0f0"
								vertical={false}
							/>
							<XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
							<YAxis
								tickFormatter={(v) => formatCompactIDR(Number(v))}
								tick={{ fontSize: 11 }}
								stroke="#9ca3af"
								width={72}
							/>
							<Tooltip
								formatter={(value, name) => [
									formatIDR(Number(value)),
									String(name),
								]}
								cursor={{ fill: "#f9fafb" }}
							/>
							<Legend />
							<Bar
								dataKey="target"
								name="Target"
								fill="#cbd5e1"
								radius={[4, 4, 0, 0]}
							/>
							<Bar
								dataKey="realisasi"
								name="Realisasi"
								fill="#2563eb"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</ClientOnly>
			</div>
		</div>
	);
}
