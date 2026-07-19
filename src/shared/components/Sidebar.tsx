import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	Building2,
	FileText,
	LayoutDashboard,
	LogOut,
	PanelLeft,
	PanelLeftClose,
	Wallet,
} from "lucide-react";
import { useState } from "react";
import { logoutServerFn } from "#/modules/auth/auth.api";

const navItemClass =
	"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 data-[status=active]:bg-blue-50 data-[status=active]:text-blue-700";

export function Sidebar({ userName }: { userName?: string }) {
	const [collapsed, setCollapsed] = useState(false);
	const logout = useServerFn(logoutServerFn);

	return (
		<aside
			className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-gray-200 bg-white transition-all ${
				collapsed ? "w-16" : "w-60"
			}`}
		>
			<div className="flex items-center justify-between px-3 py-4">
				{collapsed ? null : (
					<span className="text-base font-bold text-blue-600">Bapenda</span>
				)}
				<button
					type="button"
					onClick={() => setCollapsed((c) => !c)}
					className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
				>
					{collapsed ? (
						<PanelLeft className="size-5" />
					) : (
						<PanelLeftClose className="size-5" />
					)}
				</button>
			</div>

			<nav className="flex flex-1 flex-col gap-1 px-2">
				<Link to="/dashboard" className={navItemClass}>
					<LayoutDashboard className="size-5 shrink-0" />
					{collapsed ? null : "Dashboard"}
				</Link>
				<Link
					to="/wajib-pajak"
					search={{ tax: "hotel", q: "", status: "all", page: 1 }}
					className={navItemClass}
				>
					<Building2 className="size-5 shrink-0" />
					{collapsed ? null : "Wajib Pajak"}
				</Link>
				<Link
					to="/tunggakan"
					search={{ jenis: "all", q: "", status: "all", year: 2026, page: 1 }}
					className={navItemClass}
				>
					<Wallet className="size-5 shrink-0" />
					{collapsed ? null : "Tunggakan"}
				</Link>
				<Link to="/dokumen" className={navItemClass}>
					<FileText className="size-5 shrink-0" />
					{collapsed ? null : "Dokumen"}
				</Link>
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
	);
}
