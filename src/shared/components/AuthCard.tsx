import type { ReactNode } from "react";

/**
 * Centered auth shell used by the login and register pages: app branding above a
 * white card with a title/subtitle, the form as children, and an optional footer
 * (e.g. the cross-link between login and register).
 */
export function AuthCard({
	title,
	subtitle,
	children,
	footer,
}: {
	title: string;
	subtitle?: string;
	children: ReactNode;
	footer?: ReactNode;
}) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-sm">
				<div className="mb-6 text-center">
					<h1 className="text-2xl font-bold text-blue-600">SIAPPAS</h1>
					<p className="text-sm text-gray-500">
						Sistem Informasi Analisis Pendapatan Pasuruan
					</p>
				</div>

				<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-gray-900">{title}</h2>
					{subtitle ? (
						<p className="mt-1 text-sm text-gray-500">{subtitle}</p>
					) : null}
					<div className="mt-5">{children}</div>
				</div>

				{footer ? (
					<p className="mt-4 text-center text-sm text-gray-500">{footer}</p>
				) : null}
			</div>
		</div>
	);
}
