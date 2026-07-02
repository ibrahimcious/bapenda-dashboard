import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { logoutServerFn } from "#/modules/auth/auth.api";

const navClass =
	"rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 data-[status=active]:bg-blue-50 data-[status=active]:text-blue-700";

export function AppHeader({ userName }: { userName?: string }) {
	const logout = useServerFn(logoutServerFn);

	return (
		<header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
			<div className="flex items-center gap-6">
				<span className="text-base font-bold text-blue-600">Bapenda</span>
				<nav className="flex gap-1">
					<Link to="/dashboard" className={navClass}>
						Dashboard
					</Link>
					<Link
						to="/wajib-pajak"
						search={{ tax: "hotel", q: "", status: "all", page: 1 }}
						className={navClass}
					>
						Wajib Pajak
					</Link>
				</nav>
			</div>

			<div className="flex items-center gap-3">
				<div className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
					{userName?.charAt(0)}
				</div>
				<span className="hidden text-sm text-gray-700 sm:inline">
					{userName}
				</span>
				<button
					type="button"
					onClick={() => logout()}
					className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
				>
					Logout
				</button>
			</div>
		</header>
	);
}
