import type { RevenueSummary } from "../revenue.types";
import { formatCompactIDR } from "../revenue.utils";

/** Mid-year pacing: ~50% of an annual target is "on track". */
function barColor(pct: number): string {
	if (pct >= 50) return "bg-emerald-500";
	if (pct >= 35) return "bg-amber-500";
	return "bg-red-500";
}

export function RealizationVsTarget({ summary }: { summary: RevenueSummary }) {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
			<div className="mb-1 flex items-baseline justify-between">
				<h2 className="text-base font-semibold text-gray-900">
					Realisasi vs Target
				</h2>
				<span className="text-sm font-medium text-gray-700">
					{summary.totals.pctAchievement.toFixed(1)}% total
				</span>
			</div>
			<p className="mb-4 text-xs text-gray-400">
				Realisasi YTD terhadap target tahunan {summary.currentYear}
			</p>

			<div className="space-y-3">
				{summary.achievements.map((a) => (
					<div key={a.taxCode}>
						<div className="mb-1 flex items-center justify-between text-sm">
							<span className="font-medium text-gray-700">{a.shortName}</span>
							<span className="text-gray-500">
								{formatCompactIDR(a.realisasi)}{" "}
								<span className="text-gray-300">/</span>{" "}
								{formatCompactIDR(a.target)}
								<span className="ml-2 font-medium tabular-nums text-gray-700">
									{a.pct.toFixed(0)}%
								</span>
							</span>
						</div>
						<div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
							<div
								className={`h-full rounded-full ${barColor(a.pct)}`}
								style={{ width: `${Math.min(a.pct, 100)}%` }}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
