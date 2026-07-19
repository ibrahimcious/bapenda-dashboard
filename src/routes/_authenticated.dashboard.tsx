import { createFileRoute } from "@tanstack/react-router";
import { KpiCards } from "#/modules/revenue/components/KpiCards";
import { MonthlyRealizationChart } from "#/modules/revenue/components/MonthlyRealizationChart";
import { RealizationTable } from "#/modules/revenue/components/RealizationTable";
import { getRevenueSummaryServerFn } from "#/modules/revenue/revenue.api";

export const Route = createFileRoute("/_authenticated/dashboard")({
	component: RouteComponent,
	loader: async () => {
		const { summary, quarterlyReport, monthlyByTax } =
			await getRevenueSummaryServerFn();
		return { summary, quarterlyReport, monthlyByTax };
	},
});

function RouteComponent() {
	const { summary, quarterlyReport, monthlyByTax } = Route.useLoaderData();

	return (
		<>
			<div>
				<h1 className="text-lg font-semibold text-gray-900">
					Dashboard Pendapatan Daerah
				</h1>
				<p className="text-xs text-gray-400">
					Realisasi {summary.currentYear} — data hingga hari ini
				</p>
			</div>

			<KpiCards summary={summary} />
			<RealizationTable report={quarterlyReport} />
			<MonthlyRealizationChart series={monthlyByTax} />
		</>
	);
}
