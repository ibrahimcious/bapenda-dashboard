import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
			<h1 className="text-3xl font-bold text-blue-600 sm:text-4xl">Bapenda</h1>
			<p className="mt-3 max-w-md text-gray-500">
				Dashboard Pendapatan Daerah — pantau realisasi, target, dan tren
				penerimaan pajak daerah dalam satu tampilan.
			</p>

			<div className="mt-8 flex gap-3">
				<Link
					to="/login"
					className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
				>
					Masuk
				</Link>
				<Link
					to="/register"
					className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
				>
					Daftar
				</Link>
			</div>
		</div>
	);
}
