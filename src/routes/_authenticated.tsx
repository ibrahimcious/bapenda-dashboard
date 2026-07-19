import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSessionServerFn } from "#/modules/auth/auth.api";
import { Sidebar } from "#/shared/components/Sidebar";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async () => {
		const session = await getSessionServerFn();
		if (!session) {
			throw redirect({ to: "/login" });
		}
		return { session };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { session } = Route.useRouteContext();

	return (
		<div className="flex min-h-screen bg-gray-50">
			<Sidebar userName={session?.user.name} userRole={session?.user.role} />
			<main className="flex-1 overflow-x-auto p-6">
				<div className="mx-auto max-w-7xl space-y-5">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
