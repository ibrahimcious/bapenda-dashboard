import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Fragment, useState } from "react";
import { KecamatanTunggakanChart } from "#/modules/tunggakan/components/KecamatanTunggakanChart";
import { StatusDistributionChart } from "#/modules/tunggakan/components/StatusDistributionChart";
import { getTunggakanServerFn } from "#/modules/tunggakan/tunggakan.api";
import {
	type PaymentStatus,
	TAX_SLUGS,
	TAX_TYPES,
	type TunggakanRow,
} from "#/modules/tunggakan/tunggakan.types";

interface TunggakanSearch {
	jenis: string;
	q: string;
	status: string;
	kecamatan: string;
	year: number;
	page: number;
}

export const Route = createFileRoute("/_authenticated/tunggakan")({
	validateSearch: (s: Record<string, unknown>): TunggakanSearch => {
		const jenis =
			typeof s.jenis === "string" &&
			(s.jenis === "all" || TAX_SLUGS.includes(s.jenis))
				? s.jenis
				: "all";
		const status =
			s.status === "Lunas" ||
			s.status === "Sebagian" ||
			s.status === "Belum Bayar"
				? s.status
				: "all";
		const year = Number(s.year);
		const page = Number(s.page);
		return {
			jenis,
			q: typeof s.q === "string" ? s.q : "",
			status,
			kecamatan:
				typeof s.kecamatan === "string" && s.kecamatan ? s.kecamatan : "all",
			year: Number.isFinite(year) && year >= 2000 ? Math.floor(year) : 2026,
			page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1,
		};
	},
	loaderDeps: ({ search }) => search,
	loader: async ({ deps }) => {
		const result = await getTunggakanServerFn({ data: deps });
		return { result };
	},
	component: RouteComponent,
});

const fmt = (n: number) => Math.round(n).toLocaleString("id-ID");

function StatusBadge({ status }: { status: PaymentStatus }) {
	if (status === "Lunas") {
		return (
			<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
				Lunas
			</span>
		);
	}
	if (status === "Sebagian") {
		return (
			<span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
				Sebagian
			</span>
		);
	}
	return (
		<span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
			Belum Bayar
		</span>
	);
}

function MonthCard({ m }: { m: TunggakanRow["months"][number] }) {
	const pct =
		m.ketetapan > 0 ? Math.min(100, (m.terbayar / m.ketetapan) * 100) : 100;
	return (
		<div
			className={`rounded-lg border p-3 ${
				m.status === "Sebagian"
					? "border-amber-200 bg-amber-50"
					: m.status === "Belum Bayar"
						? "border-red-200 bg-red-50"
						: "border-gray-200 bg-white"
			}`}
		>
			<div className="flex items-center justify-between gap-2">
				<span className="text-sm font-medium text-gray-700">{m.label}</span>
				<StatusBadge status={m.status} />
			</div>
			<div className="mt-2 text-[10px] font-medium tracking-wide text-gray-400">
				KETETAPAN
			</div>
			<div className="text-sm font-semibold text-gray-900">
				{fmt(m.ketetapan)}
			</div>
			{m.status === "Lunas" ? (
				<>
					<div className="mt-1 text-[10px] font-medium tracking-wide text-gray-400">
						TERBAYAR
					</div>
					<div className="text-sm font-semibold text-emerald-600">
						{fmt(m.terbayar)}
					</div>
				</>
			) : (
				<>
					<div className="mt-1 text-[10px] font-medium tracking-wide text-gray-400">
						TUNGGAKAN
					</div>
					<div className="text-sm font-semibold text-red-600">
						{fmt(m.sisa)}
					</div>
				</>
			)}
			<div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
				<div
					className={`h-full rounded-full ${m.status === "Lunas" ? "bg-emerald-500" : "bg-amber-400"}`}
					style={{ width: `${pct}%` }}
				/>
			</div>
		</div>
	);
}

function ExpandedDetail({ row }: { row: TunggakanRow }) {
	return (
		<tr>
			<td colSpan={6} className="bg-gray-50/70 p-0">
				<div className="p-4">
					<div className="mb-3 flex items-center gap-2">
						<span className="h-4 w-1 rounded bg-red-500" />
						<h3 className="text-xs font-semibold tracking-wide text-gray-600">
							RINCIAN TUNGGAKAN PER BULAN — {row.months[0]?.year ?? ""}
						</h3>
					</div>
					<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<div className="flex flex-wrap gap-8 text-sm">
								<div>
									<div className="text-[10px] font-medium tracking-wide text-gray-400">
										TOTAL KETETAPAN
									</div>
									<div className="font-semibold text-gray-900">
										{fmt(row.totalKetetapan)}
									</div>
								</div>
								<div>
									<div className="text-[10px] font-medium tracking-wide text-gray-400">
										TERBAYAR
									</div>
									<div className="font-semibold text-emerald-600">
										{fmt(row.totalTerbayar)}
									</div>
								</div>
								<div>
									<div className="text-[10px] font-medium tracking-wide text-gray-400">
										SISA TUNGGAKAN
									</div>
									<div className="font-semibold text-red-600">
										{fmt(row.sisaTunggakan)}
									</div>
								</div>
							</div>
							<div className="text-right">
								<div className="text-[10px] font-medium tracking-wide text-gray-400">
									PROGRESS BAYAR
								</div>
								<div className="text-lg font-bold text-amber-500">
									{row.progressPct}%
								</div>
							</div>
						</div>
						<div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
							<div
								className="h-full rounded-full bg-amber-400"
								style={{ width: `${Math.min(100, row.progressPct)}%` }}
							/>
						</div>

						{row.months.length > 0 ? (
							<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
								{row.months.map((m) => (
									<MonthCard key={m.month} m={m} />
								))}
							</div>
						) : (
							<div className="py-6 text-center text-sm text-gray-400">
								Tidak ada data ketetapan untuk tahun ini.
							</div>
						)}
					</div>
				</div>
			</td>
		</tr>
	);
}

const cell = "px-4 py-2.5 align-top";

function RouteComponent() {
	const search = Route.useSearch();
	const { result } = Route.useLoaderData();
	const navigate = Route.useNavigate();
	const [term, setTerm] = useState(search.q);
	const [expanded, setExpanded] = useState<Set<string>>(new Set());

	const setSearch = (patch: Partial<TunggakanSearch>) =>
		navigate({ search: (prev) => ({ ...prev, ...patch }) });

	const toggle = (key: string) =>
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});

	const start =
		result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
	const end = Math.min(result.page * result.pageSize, result.total);
	const years = result.years.length > 0 ? result.years : [search.year];

	return (
		<>
			<div>
				<h1 className="text-lg font-semibold text-gray-900">Tunggakan</h1>
				<p className="text-xs text-gray-400">
					Perbandingan ketetapan (SPTPD) vs pembayaran per wajib pajak
				</p>
			</div>

			{/* Tax-type navigation menu */}
			<div className="flex flex-wrap gap-2">
				<button
					type="button"
					onClick={() => setSearch({ jenis: "all", page: 1 })}
					className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
						search.jenis === "all"
							? "border-blue-200 bg-blue-50 text-blue-700"
							: "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
					}`}
				>
					Semua
				</button>
				{TAX_TYPES.map((t) => {
					const active = t.slug === search.jenis;
					return (
						<button
							key={t.slug}
							type="button"
							onClick={() => setSearch({ jenis: t.slug, page: 1 })}
							className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
								active
									? "border-blue-200 bg-blue-50 text-blue-700"
									: "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
							}`}
						>
							{t.label}
						</button>
					);
				})}
			</div>

			{/* Summary + search/filter */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap gap-4 text-sm text-gray-500">
					<span>
						Wajib Pajak:{" "}
						<b className="text-gray-900">
							{result.counts.total.toLocaleString("id-ID")}
						</b>
					</span>
					<span>
						Lunas:{" "}
						<b className="text-emerald-600">
							{result.counts.lunas.toLocaleString("id-ID")}
						</b>
					</span>
					<span>
						Sebagian:{" "}
						<b className="text-amber-600">
							{result.counts.sebagian.toLocaleString("id-ID")}
						</b>
					</span>
					<span>
						Belum Bayar:{" "}
						<b className="text-red-600">
							{result.counts.belumBayar.toLocaleString("id-ID")}
						</b>
					</span>
					<span>
						Sisa Tunggakan:{" "}
						<b className="text-red-600">{fmt(result.summary.sisaTunggakan)}</b>
					</span>
				</div>

				<div className="flex gap-2">
					<select
						value={search.year}
						onChange={(e) =>
							setSearch({ year: Number(e.target.value), page: 1 })
						}
						className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
					>
						{years.map((y) => (
							<option key={y} value={y}>
								{y}
							</option>
						))}
					</select>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							setSearch({ q: term, page: 1 });
						}}
					>
						<input
							value={term}
							onChange={(e) => setTerm(e.target.value)}
							placeholder="Cari nama, NPWPD…"
							className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
						/>
					</form>
					<select
						value={search.status}
						onChange={(e) => setSearch({ status: e.target.value, page: 1 })}
						className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
					>
						<option value="all">Semua Status</option>
						<option value="Lunas">Lunas</option>
						<option value="Sebagian">Sebagian</option>
						<option value="Belum Bayar">Belum Bayar</option>
					</select>
					<select
						value={search.kecamatan}
						onChange={(e) => setSearch({ kecamatan: e.target.value, page: 1 })}
						className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
					>
						<option value="all">Semua Kecamatan</option>
						{result.kecamatanList.map((k) => (
							<option key={k} value={k}>
								{k}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Analysis charts */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<KecamatanTunggakanChart
					data={result.byKecamatan}
					onSelect={(kecamatan) => setSearch({ kecamatan, page: 1 })}
				/>
				<StatusDistributionChart counts={result.counts} />
			</div>

			{/* Table */}
			<div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500">
							<th className="px-4 py-2.5 w-12">No</th>
							<th className="px-4 py-2.5">Wajib Pajak</th>
							<th className="px-4 py-2.5">Status</th>
							<th className="px-4 py-2.5 text-right">Ketetapan</th>
							<th className="px-4 py-2.5 text-right">Terbayar</th>
							<th className="px-4 py-2.5 text-right">Sisa Tunggakan</th>
						</tr>
					</thead>
					<tbody>
						{result.rows.map((r, i) => {
							const key = `${r.npwpd}::${r.jenisPajak}::${r.kecamatan ?? ""}`;
							const isOpen = expanded.has(key);
							const taxLabel =
								TAX_TYPES.find((t) => t.value === r.jenisPajak)?.label ??
								r.jenisPajak;
							return (
								<Fragment key={key}>
									<tr
										onClick={() => toggle(key)}
										className="cursor-pointer border-b border-gray-100 last:border-0 hover:bg-gray-50"
									>
										<td className={`${cell} text-gray-400`}>
											<div className="flex items-center gap-1.5">
												{isOpen ? (
													<ChevronUp className="size-3.5 shrink-0" />
												) : (
													<ChevronDown className="size-3.5 shrink-0" />
												)}
												{start + i}
											</div>
										</td>
										<td className={cell}>
											<div className="font-medium text-gray-900">
												{r.namaWp}
											</div>
											<div className="mt-0.5 text-xs text-gray-400">
												{r.npwpd} / {taxLabel}
												{r.kecamatan ? ` / ${r.kecamatan}` : ""}
											</div>
										</td>
										<td className={cell}>
											<StatusBadge status={r.status} />
										</td>
										<td className={`${cell} text-right text-gray-700`}>
											{fmt(r.totalKetetapan)}
										</td>
										<td className={`${cell} text-right text-emerald-600`}>
											{fmt(r.totalTerbayar)}
										</td>
										<td
											className={`${cell} text-right font-medium text-red-600`}
										>
											{fmt(r.sisaTunggakan)}
										</td>
									</tr>
									{isOpen ? <ExpandedDetail row={r} /> : null}
								</Fragment>
							);
						})}
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
