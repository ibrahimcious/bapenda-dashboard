import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TaxMapperMonthlyChart } from "#/modules/taxmapper/components/TaxMapperMonthlyChart";
import { getTaxMapperServerFn } from "#/modules/taxmapper/taxmapper.api";
import { MONTH_LABELS } from "#/modules/taxmapper/taxmapper.utils";

interface TaxMapperSearch {
	type: string;
	q: string;
	page: number;
}

export const Route = createFileRoute("/_authenticated/taxmapper")({
	validateSearch: (s: Record<string, unknown>): TaxMapperSearch => {
		const page = Number(s.page);
		return {
			type: typeof s.type === "string" && s.type ? s.type : "all",
			q: typeof s.q === "string" ? s.q : "",
			page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1,
		};
	},
	loaderDeps: ({ search }) => search,
	loader: async ({ deps }) => {
		const result = await getTaxMapperServerFn({ data: deps });
		return { result };
	},
	component: RouteComponent,
});

const fmt = (n: number) => Math.round(n).toLocaleString("id-ID");
const cell = "px-3 py-2.5 align-top whitespace-nowrap";

function RouteComponent() {
	const search = Route.useSearch();
	const { result } = Route.useLoaderData();
	const navigate = Route.useNavigate();
	const [term, setTerm] = useState(search.q);

	const setSearch = (patch: Partial<TaxMapperSearch>) =>
		navigate({ search: (prev) => ({ ...prev, ...patch }) });

	const start =
		result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
	const end = Math.min(result.page * result.pageSize, result.total);

	return (
		<>
			<div>
				<h1 className="text-lg font-semibold text-gray-900">TaxMapper</h1>
				<p className="text-xs text-gray-400">
					Data pemetaan omzet objek pajak per bulan (hasil monitoring lapangan)
				</p>
			</div>

			{/* Type navigation menu */}
			<div className="flex flex-wrap gap-2">
				<button
					type="button"
					onClick={() => setSearch({ type: "all", page: 1 })}
					className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
						search.type === "all"
							? "border-blue-200 bg-blue-50 text-blue-700"
							: "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
					}`}
				>
					Semua
				</button>
				{result.types.map((t) => {
					const active = t === search.type;
					return (
						<button
							key={t}
							type="button"
							onClick={() => setSearch({ type: t, page: 1 })}
							className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
								active
									? "border-blue-200 bg-blue-50 text-blue-700"
									: "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
							}`}
						>
							{t}
						</button>
					);
				})}
			</div>

			{/* Summary + search */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap gap-4 text-sm text-gray-500">
					<span>
						Objek Pajak:{" "}
						<b className="text-gray-900">
							{result.total.toLocaleString("id-ID")}
						</b>
					</span>
					<span>
						Total Omzet:{" "}
						<b className="text-gray-900">{fmt(result.grandTotal)}</b>
					</span>
				</div>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						setSearch({ q: term, page: 1 });
					}}
				>
					<input
						value={term}
						onChange={(e) => setTerm(e.target.value)}
						placeholder="Cari nama objek, NIOP…"
						className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
					/>
				</form>
			</div>

			<TaxMapperMonthlyChart data={result.monthly} />

			{/* Table */}
			<div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500">
							<th className={cell}>No</th>
							<th className={cell}>NIOP</th>
							<th className={cell}>Nama Objek Pajak</th>
							<th className={cell}>Type</th>
							{MONTH_LABELS.slice(1).map((label) => (
								<th key={label} className={`${cell} text-right`}>
									{label}
								</th>
							))}
							<th className={`${cell} text-right`}>Total</th>
						</tr>
					</thead>
					<tbody>
						{result.rows.map((r, i) => (
							<tr
								key={r.niop}
								className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
							>
								<td className={`${cell} text-gray-400`}>{start + i}</td>
								<td className={`${cell} font-mono text-xs text-gray-600`}>
									{r.niop}
								</td>
								<td className={cell}>
									<div className="font-medium text-gray-900">
										{r.namaObjekPajak}
									</div>
								</td>
								<td className={cell}>
									<span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
										{r.type}
									</span>
								</td>
								{r.months.map((m) => (
									<td
										key={m.month}
										className={`${cell} text-right text-gray-700`}
									>
										{m.amount > 0 ? fmt(m.amount) : "—"}
									</td>
								))}
								<td
									className={`${cell} text-right font-semibold text-gray-900`}
								>
									{fmt(r.total)}
								</td>
							</tr>
						))}
						{result.rows.length === 0 ? (
							<tr>
								<td
									colSpan={17}
									className="px-4 py-10 text-center text-gray-400"
								>
									Tidak ada data yang cocok.
								</td>
							</tr>
						) : null}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between text-sm text-gray-500">
				<span>
					Menampilkan {start.toLocaleString("id-ID")}–
					{end.toLocaleString("id-ID")} dari{" "}
					{result.total.toLocaleString("id-ID")}
				</span>
				<div className="flex items-center gap-2">
					<button
						type="button"
						disabled={result.page <= 1}
						onClick={() => setSearch({ page: result.page - 1 })}
						className="rounded-lg border border-gray-200 px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
					>
						Sebelumnya
					</button>
					<span className="text-gray-500">
						Hal {result.page} / {result.totalPages}
					</span>
					<button
						type="button"
						disabled={result.page >= result.totalPages}
						onClick={() => setSearch({ page: result.page + 1 })}
						className="rounded-lg border border-gray-200 px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
					>
						Berikutnya
					</button>
				</div>
			</div>
		</>
	);
}
