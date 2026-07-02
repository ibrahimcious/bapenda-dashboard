import { createFileRoute, isRedirect, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { registerServerFn } from "#/modules/auth/auth.api";
import { AuthCard } from "#/shared/components/AuthCard";

export const Route = createFileRoute("/register")({
	component: RouteComponent,
});

const inputClass =
	"w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function RouteComponent() {
	const registerServerFnHandler = useServerFn(registerServerFn);
	const [registerData, setRegisterData] = useState({
		name: "",
		email: "",
		password: "",
	});
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleRegisterUser(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			await registerServerFnHandler({
				data: {
					name: registerData.name,
					email: registerData.email,
					password: registerData.password,
				},
			});
		} catch (err) {
			if (isRedirect(err)) throw err;
			setError("Pendaftaran gagal. Periksa data Anda lalu coba lagi.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<AuthCard
			title="Daftar"
			subtitle="Buat akun untuk mulai menggunakan dashboard."
			footer={
				<>
					Sudah punya akun?{" "}
					<Link
						to="/login"
						className="font-medium text-blue-600 hover:underline"
					>
						Masuk
					</Link>
				</>
			}
		>
			<form onSubmit={handleRegisterUser} className="space-y-4">
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
						placeholder="Nama lengkap"
						value={registerData.name}
						onChange={(e) =>
							setRegisterData({ ...registerData, name: e.target.value })
						}
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
						placeholder="nama@email.com"
						value={registerData.email}
						onChange={(e) =>
							setRegisterData({ ...registerData, email: e.target.value })
						}
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
						className={inputClass}
						placeholder="Minimal 8 karakter"
						value={registerData.password}
						onChange={(e) =>
							setRegisterData({ ...registerData, password: e.target.value })
						}
					/>
				</div>

				{error ? <p className="text-sm text-red-600">{error}</p> : null}

				<button
					type="submit"
					disabled={loading}
					className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
				>
					{loading ? "Memproses…" : "Daftar"}
				</button>
			</form>
		</AuthCard>
	);
}
