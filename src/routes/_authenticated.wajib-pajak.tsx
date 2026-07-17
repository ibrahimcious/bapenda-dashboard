import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getWajibPajakServerFn } from "#/modules/wp/wp.api";
import { TAX_SHEETS, TAX_SLUGS } from "#/modules/wp/wp.types";

interface WpSearch {
	tax: string;
	q: string;
	status: string;
	page: number;
}

export const Route = createFileRoute("/_authenticated/wajib-pajak")({
	validateSearch: (s: Record<string, unknown>): WpSearch => {
		const tax =
			typeof s.tax === "string" && TAX_SLUGS.includes(s.tax) ? s.tax : "hotel";
		const status =
			s.status === "Aktif" || s.status === "Non Aktif" ? s.status : "all";
		const page = Number(s.page);
		return {
			tax,
			q: typeof s.q === "string" ? s.q : "",
			status,
			page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1,
		};
	},
	loaderDeps: ({ search }) => search,
	loader: async ({ deps }) => {
		const result = await getWajibPajakServerFn({ data: deps });
		return { result };
	},
	component: RouteComponent,
});

const cell = "px-4 py-2.5 align-top";

function StatusBadge({ status }: { status: string | null }) {
	if (status === "Aktif") {
		return (
			<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
				Aktif
			</span>
		);
	}
	if (status === "Non Aktif") {
		return (
			<span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
				Non Aktif
			</span>
		);
	}
	return <span className="text-xs text-gray-300">—</span>;
}

function RouteComponent() {
	const search = Route.useSearch();
	const { result } = Route.useLoaderData();
	const navigate = Route.useNavigate();
	const [term, setTerm] = useState(search.q);

	const setSearch = (patch: Partial<WpSearch>) =>
		navigate({ search: (prev) => ({ ...prev, ...patch }) });

	const start =
		result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
	const end = Math.min(result.page * result.pageSize, result.total);

	return (
		<>
			<div>
				<h1 className="text-lg font-semibold text-gray-900">Wajib Pajak</h1>
				<p className="text-xs text-gray-400">
					Data registrasi wajib pajak per jenis pajak
				</p>
			</div>

			{/* Tax-type navigation menu */}
			<div className="flex flex-wrap gap-2">
				{TAX_SHEETS.map((t) => {
					const active = t.slug === search.tax;
					return (
						<button
							key={t.slug}
							type="button"
							onClick={() => setSearch({ tax: t.slug, page: 1 })}
							className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium ${
								active
									? "border-blue-200 bg-blue-50 text-blue-700"
									: "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
							}`}
						>
							{t.label}
							<span
								className={`rounded-full px-1.5 py-0.5 text-xs ${
									active
										? "bg-blue-100 text-blue-700"
										: "bg-gray-100 text-gray-500"
								}`}
							>
								{t.count.toLocaleString("id-ID")}
							</span>
						</button>
					);
				})}
			</div>

			{/* Summary + search/filter */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex gap-4 text-sm text-gray-500">
					<span>
						Total:{" "}
						<b className="text-gray-900">
							{result.counts.total.toLocaleString("id-ID")}
						</b>
					</span>
					<span>
						Aktif:{" "}
						<b className="text-emerald-600">
							{result.counts.aktif.toLocaleString("id-ID")}
						</b>
					</span>
					<span>
						Non Aktif:{" "}
						<b className="text-gray-600">
							{result.counts.nonAktif.toLocaleString("id-ID")}
						</b>
					</span>
				</div>

				<div className="flex gap-2">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							setSearch({ q: term, page: 1 });
						}}
					>
						<input
							value={term}
							onChange={(e) => setTerm(e.target.value)}
							placeholder="Cari nama, NPWPD, alamat…"
							className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
						/>
					</form>
					<select
						value={search.status}
						onChange={(e) => setSearch({ status: e.target.value, page: 1 })}
						className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
					>
						<option value="all">Semua Status</option>
						<option value="Aktif">Aktif</option>
						<option value="Non Aktif">Non Aktif</option>
					</select>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500">
							<th className="px-4 py-2.5 w-12">No</th>
							<th className="px-4 py-2.5">NPWPD</th>
							<th className="px-4 py-2.5">Nama Subjek</th>
							<th className="px-4 py-2.5">Objek (NOPD)</th>
							<th className="px-4 py-2.5">Kecamatan</th>
							<th className="px-4 py-2.5">Status</th>
						</tr>
					</thead>
					<tbody>
						{result.rows.map((r, i) => (
							<tr
								key={`${r.npwpd}-${r.nopd}`}
								className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
							>
								<td className={`${cell} text-gray-400`}>{start + i}</td>
								<td className={`${cell} font-mono text-xs text-gray-600`}>
									{r.npwpd ?? "—"}
								</td>
								<td className={cell}>
									<div className="font-medium text-gray-900">
										{r.namaSubjek ?? "—"}
									</div>
									{r.alamatSubjek ? (
										<div className="mt-0.5 max-w-xs truncate text-xs text-gray-400">
											{r.alamatSubjek}
										</div>
									) : null}
								</td>
								<td className={cell}>
									<div className="text-gray-700">{r.namaNopd ?? "—"}</div>
									{r.nopd ? (
										<div className="mt-0.5 text-xs text-gray-400">
											NOPD {r.nopd}
										</div>
									) : null}
								</td>
								<td className={cell}>
									<div className="text-gray-700">{r.kecamatan ?? "—"}</div>
									{r.kelurahan ? (
										<div className="mt-0.5 text-xs text-gray-400">
											{r.kelurahan}
										</div>
									) : null}
								</td>
								<td className={cell}>
									<StatusBadge status={r.status} />
								</td>
							</tr>
						))}
						{result.rows.length === 0 ? (
							<tr>
								<td
									colSpan={6}
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
