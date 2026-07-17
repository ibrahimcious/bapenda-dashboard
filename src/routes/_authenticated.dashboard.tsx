import { createFileRoute } from "@tanstack/react-router";
import { KpiCards } from "#/modules/revenue/components/KpiCards";
import { RealizationVsTarget } from "#/modules/revenue/components/RealizationVsTarget";
import { RevenueCompositionChart } from "#/modules/revenue/components/RevenueCompositionChart";
import { RevenueQuarterlyChart } from "#/modules/revenue/components/RevenueQuarterlyChart";
import { getRevenueSummaryServerFn } from "#/modules/revenue/revenue.api";
import { QUARTER_LABELS } from "#/modules/revenue/revenue.utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
	component: RouteComponent,
	loader: async () => {
		const summary = await getRevenueSummaryServerFn();
		return { summary };
	},
});

function RouteComponent() {
	const { summary } = Route.useLoaderData();

	return (
		<>
			<div>
				<h1 className="text-lg font-semibold text-gray-900">
					Dashboard Pendapatan Daerah
				</h1>
				<p className="text-xs text-gray-400">
					Data s.d. {QUARTER_LABELS[summary.asOfQuarter - 1]}{" "}
					{summary.currentYear}
				</p>
			</div>

			<KpiCards summary={summary} />
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<RealizationVsTarget summary={summary} />
				</div>
				<div className="lg:col-span-1">
					<RevenueCompositionChart summary={summary} />
				</div>
			</div>
			<RevenueQuarterlyChart summary={summary} />
		</>
	);
}
