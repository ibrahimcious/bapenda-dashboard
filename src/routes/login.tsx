import { createFileRoute, isRedirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { loginServerFn } from "#/modules/auth/auth.api";
import { AuthCard } from "#/shared/components/AuthCard";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

const inputClass =
	"w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function RouteComponent() {
	const loginServerFnHandler = useServerFn(loginServerFn);
	const [loginData, setLoginData] = useState({ email: "", password: "" });
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleLoginUser(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			await loginServerFnHandler({
				data: { email: loginData.email, password: loginData.password },
			});
		} catch (err) {
			if (isRedirect(err)) throw err;
			setError("Email atau kata sandi salah.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<AuthCard title="Masuk" subtitle="Masuk untuk mengakses dashboard.">
			<form onSubmit={handleLoginUser} className="space-y-4">
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
						value={loginData.email}
						onChange={(e) =>
							setLoginData({ ...loginData, email: e.target.value })
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
						className={inputClass}
						placeholder="••••••••"
						value={loginData.password}
						onChange={(e) =>
							setLoginData({ ...loginData, password: e.target.value })
						}
					/>
				</div>

				{error ? <p className="text-sm text-red-600">{error}</p> : null}

				<button
					type="submit"
					disabled={loading}
					className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
				>
					{loading ? "Memproses…" : "Masuk"}
				</button>
			</form>
		</AuthCard>
	);
}
