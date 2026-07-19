import { Link, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	Building2,
	ChevronDown,
	ChevronRight,
	Database,
	FileText,
	LayoutDashboard,
	LogOut,
	MapPinned,
	Menu,
	PanelLeft,
	PanelLeftClose,
	UserCog,
	Wallet,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { logoutServerFn } from "#/modules/auth/auth.api";

const navItemClass =
	"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 data-[status=active]:bg-blue-50 data-[status=active]:text-blue-700";

const DATA_MENU_PATHS = ["/wajib-pajak", "/tunggakan", "/taxmapper"];

export function Sidebar({
	userName,
	userRole,
}: {
	userName?: string;
	userRole?: string | null;
}) {
	// Desktop-only icon-rail toggle. Never set on mobile (that toggle button
	// is hidden there), so the off-canvas drawer never has to render the
	// cramped icon-only layout.
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [dataOpen, setDataOpen] = useState(() =>
		DATA_MENU_PATHS.some((p) => pathname.startsWith(p)),
	);
	const logout = useServerFn(logoutServerFn);

	// Close the mobile drawer whenever the route changes (after a nav click).
	// biome-ignore lint/correctness/useExhaustiveDependencies: pathname is a trigger, not read in the effect
	useEffect(() => {
		setMobileOpen(false);
	}, [pathname]);

	const closeMobile = () => setMobileOpen(false);

	return (
		<>
			{/* Mobile hamburger trigger — lives outside the drawer so it's still
			 * reachable while the drawer is off-canvas. */}
			<button
				type="button"
				onClick={() => setMobileOpen(true)}
				className={`fixed top-3 left-3 z-40 rounded-lg border border-gray-200 bg-white p-2 text-gray-600 shadow-sm md:hidden ${
					mobileOpen ? "hidden" : ""
				}`}
			>
				<Menu className="size-5" />
			</button>

			{/* Backdrop */}
			{mobileOpen ? (
				<button
					type="button"
					aria-label="Tutup menu"
					onClick={closeMobile}
					className="fixed inset-0 z-40 bg-black/30 md:hidden"
				/>
			) : null}

			<aside
				className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white transition-transform duration-200 md:sticky md:top-0 md:translate-x-0 md:transition-[width] md:duration-200 ${
					mobileOpen ? "translate-x-0" : "-translate-x-full"
				} ${collapsed ? "md:w-16" : "md:w-60"}`}
			>
				<div className="flex items-center justify-between px-3 py-4">
					{collapsed ? null : (
						<span className="text-base font-bold text-blue-600">Bapenda</span>
					)}
					{/* Desktop icon-rail toggle */}
					<button
						type="button"
						onClick={() => setCollapsed((c) => !c)}
						className="hidden rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:block"
					>
						{collapsed ? (
							<PanelLeft className="size-5" />
						) : (
							<PanelLeftClose className="size-5" />
						)}
					</button>
					{/* Mobile drawer close */}
					<button
						type="button"
						onClick={closeMobile}
						className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden"
					>
						<X className="size-5" />
					</button>
				</div>

				<nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2">
					<Link to="/dashboard" className={navItemClass}>
						<LayoutDashboard className="size-5 shrink-0" />
						{collapsed ? null : "Dashboard"}
					</Link>

					<button
						type="button"
						onClick={() => setDataOpen((o) => !o)}
						className={`${navItemClass} w-full justify-between`}
					>
						<span className="flex items-center gap-3">
							<Database className="size-5 shrink-0" />
							{collapsed ? null : "Data"}
						</span>
						{collapsed ? null : dataOpen ? (
							<ChevronDown className="size-4 shrink-0" />
						) : (
							<ChevronRight className="size-4 shrink-0" />
						)}
					</button>
					{!collapsed && dataOpen ? (
						<div className="ml-4 flex flex-col gap-1 border-l border-gray-200 pl-2">
							<Link
								to="/wajib-pajak"
								search={{ tax: "hotel", q: "", status: "all", page: 1 }}
								className={navItemClass}
							>
								<Building2 className="size-5 shrink-0" />
								Wajib Pajak
							</Link>
							<Link
								to="/tunggakan"
								search={{
									jenis: "all",
									q: "",
									status: "all",
									kecamatan: "all",
									year: 2026,
									page: 1,
								}}
								className={navItemClass}
							>
								<Wallet className="size-5 shrink-0" />
								Tunggakan
							</Link>
							<Link
								to="/taxmapper"
								search={{ type: "all", q: "", page: 1 }}
								className={navItemClass}
							>
								<MapPinned className="size-5 shrink-0" />
								TaxMapper
							</Link>
						</div>
					) : null}

					<Link to="/dokumen" className={navItemClass}>
						<FileText className="size-5 shrink-0" />
						{collapsed ? null : "Dokumen"}
					</Link>

					{userRole === "admin" ? (
						<Link to="/pengguna" className={navItemClass}>
							<UserCog className="size-5 shrink-0" />
							{collapsed ? null : "Kelola Pengguna"}
						</Link>
					) : null}
				</nav>

				<div className="border-t border-gray-200 p-2">
					<div className="flex items-center gap-3 px-1 py-2">
						<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
							{userName?.charAt(0)}
						</div>
						{collapsed ? null : (
							<span className="truncate text-sm text-gray-700">{userName}</span>
						)}
					</div>
					<button
						type="button"
						onClick={() => logout()}
						className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
					>
						<LogOut className="size-5 shrink-0" />
						{collapsed ? null : "Logout"}
					</button>
				</div>
			</aside>
		</>
	);
}
