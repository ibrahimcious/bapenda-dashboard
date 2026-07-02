import { Percent, Scale, Target, Wallet } from "lucide-react";
import type { RevenueSummary } from "../revenue.types";
import { formatCompactIDR } from "../revenue.utils";

export function KpiCards({ summary }: { summary: RevenueSummary }) {
	const { totals } = summary;
	const kurang = totals.selisih < 0;

	const cards = [
		{
			label: "Realisasi",
			value: formatCompactIDR(totals.realisasi),
			icon: Wallet,
			accent: "bg-blue-50 text-blue-600",
		},
		{
			label: `Target ${summary.currentYear}`,
			value: formatCompactIDR(totals.target),
			icon: Target,
			accent: "bg-violet-50 text-violet-600",
		},
		{
			label: "Capaian",
			value: `${totals.pctAchievement.toFixed(1)}%`,
			icon: Percent,
			accent: "bg-emerald-50 text-emerald-600",
		},
		{
			label: kurang ? "Kurang dari Target" : "Lebih dari Target",
			value: formatCompactIDR(totals.selisih),
			icon: Scale,
			accent: kurang
				? "bg-red-50 text-red-600"
				: "bg-emerald-50 text-emerald-600",
		},
	];

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{cards.map((c) => (
				<div
					key={c.label}
					className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
				>
					<div
						className={`flex size-11 items-center justify-center rounded-lg ${c.accent}`}
					>
						<c.icon className="size-5" />
					</div>
					<div>
						<div className="text-sm text-gray-500">{c.label}</div>
						<div className="text-xl font-semibold text-gray-900">{c.value}</div>
					</div>
				</div>
			))}
		</div>
	);
}
