import { createServerFn } from "@tanstack/react-start";
import { AS_OF_QUARTER, CURRENT_YEAR, getRevenueData } from "./revenue.mock";
import type { RevenueSummary } from "./revenue.types";
import { buildSummary } from "./revenue.utils";

export const getRevenueSummaryServerFn = createServerFn().handler(
	async (): Promise<RevenueSummary> => {
		// TODO: swap getRevenueData() for a live Patriot query once DB access is
		// available. buildSummary and the return shape stay the same.
		const { taxes, quarterly } = getRevenueData();
		return buildSummary(taxes, quarterly, {
			currentYear: CURRENT_YEAR,
			asOfQuarter: AS_OF_QUARTER,
		});
	},
);
