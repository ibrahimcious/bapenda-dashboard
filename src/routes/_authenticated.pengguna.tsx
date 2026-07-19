import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
	adminCreateUserServerFn,
	listUsersServerFn,
} from "#/modules/auth/auth.api";

export const Route = createFileRoute("/_authenticated/pengguna")({
	beforeLoad: ({ context }) => {
		if (context.session?.user.role !== "admin") {
			throw redirect({ to: "/dashboard" });
		}
	},
	loader: async () => {
		const users = await listUsersServerFn();
		return { users };
	},
	component: RouteComponent,
});

const inputClass =
	"w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function RouteComponent() {
	const { users } = Route.useLoaderData();
	const router = useRouter();
	const createUser = useServerFn(adminCreateUserServerFn);

	const [form, setForm] = useState({ name: "", email: "", password: "" });
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setSuccess(null);
		setLoading(true);
		try {
			const user = await createUser({ data: form });
			setSuccess(`Akun ${user.email} berhasil dibuat.`);
			setForm({ name: "", email: "", password: "" });
			await router.invalidate();
		} catch {
			setError(
				"Gagal membuat akun. Periksa email (mungkin sudah terdaftar) dan coba lagi.",
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<div>
				<h1 className="text-lg font-semibold text-gray-900">Kelola Pengguna</h1>
				<p className="text-xs text-gray-400">
					Pendaftaran akun publik dinonaktifkan — hanya admin yang dapat membuat
					akun baru
				</p>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<form
					onSubmit={handleSubmit}
					className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-1"
				>
					<h2 className="text-sm font-semibold text-gray-900">
						Buat Akun Baru
					</h2>
					<div>
						<label
							htmlFor="name"
							className="mb-1 block text-sm font-medium text-gray-700"
						>
							Nama
						</label>
						<input
							id="name"
							type="text"
							required
							className={inputClass}
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
						/>
					</div>
					<div>
						<label
							htmlFor="email"
							className="mb-1 block text-sm font-medium text-gray-700"
						>
							Email
						</label>
						<input
							id="email"
							type="email"
							required
							className={inputClass}
							value={form.email}
							onChange={(e) => setForm({ ...form, email: e.target.value })}
						/>
					</div>
					<div>
						<label
							htmlFor="password"
							className="mb-1 block text-sm font-medium text-gray-700"
						>
							Kata Sandi
						</label>
						<input
							id="password"
							type="password"
							required
							minLength={8}
							placeholder="Minimal 8 karakter"
							className={inputClass}
							value={form.password}
							onChange={(e) => setForm({ ...form, password: e.target.value })}
						/>
					</div>

					{error ? <p className="text-sm text-red-600">{error}</p> : null}
					{success ? (
						<p className="text-sm text-emerald-600">{success}</p>
					) : null}

					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
					>
						{loading ? "Memproses…" : "Buat Akun"}
					</button>
				</form>

				<div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500">
								<th className="px-4 py-2.5">Nama</th>
								<th className="px-4 py-2.5">Email</th>
								<th className="px-4 py-2.5">Role</th>
								<th className="px-4 py-2.5">Dibuat</th>
							</tr>
						</thead>
						<tbody>
							{users.map((u) => (
								<tr
									key={u.id}
									className="border-b border-gray-100 last:border-0"
								>
									<td className="px-4 py-2.5 font-medium text-gray-900">
										{u.name}
									</td>
									<td className="px-4 py-2.5 text-gray-600">{u.email}</td>
									<td className="px-4 py-2.5">
										<span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
											{u.role ?? "user"}
										</span>
									</td>
									<td className="px-4 py-2.5 text-gray-500">
										{new Date(u.createdAt).toLocaleDateString("id-ID")}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
}
