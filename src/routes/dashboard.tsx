import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSessionServerFn } from "#/modules/auth/auth.api";
import { KpiCards } from "#/modules/revenue/components/KpiCards";
import { RealizationVsTarget } from "#/modules/revenue/components/RealizationVsTarget";
import { RevenueCompositionChart } from "#/modules/revenue/components/RevenueCompositionChart";
import { RevenueQuarterlyChart } from "#/modules/revenue/components/RevenueQuarterlyChart";
import { getRevenueSummaryServerFn } from "#/modules/revenue/revenue.api";
import { QUARTER_LABELS } from "#/modules/revenue/revenue.utils";
import { AppHeader } from "#/shared/components/AppHeader";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await getSessionServerFn();
		if (!session) {
			throw redirect({
				to: "/login",
			});
		}
		return session;
	},
	loader: async () => {
		const summary = await getRevenueSummaryServerFn();
		return { summary };
	},
});

function RouteComponent() {
	const session = Route.useRouteContext();
	const { summary } = Route.useLoaderData();

	return (
		<div className="min-h-screen bg-gray-50">
			<AppHeader userName={session?.user.name} />

			<main className="mx-auto max-w-7xl space-y-6 p-6">
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
			</main>
		</div>
	);
}
