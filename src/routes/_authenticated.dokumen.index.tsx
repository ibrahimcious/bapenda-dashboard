import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { DOCUMENTS } from "#/modules/documents/documents.config";

export const Route = createFileRoute("/_authenticated/dokumen/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<div>
				<h1 className="text-lg font-semibold text-gray-900">Dokumen</h1>
				<p className="text-xs text-gray-400">Laporan dalam format PDF</p>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{DOCUMENTS.map((doc) => (
					<Link
						key={doc.slug}
						to="/dokumen/$slug"
						params={{ slug: doc.slug }}
						className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50"
					>
						<div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
							<FileText className="size-5" />
						</div>
						<span className="text-sm font-medium text-gray-900">
							{doc.title}
						</span>
					</Link>
				))}
				{DOCUMENTS.length === 0 ? (
					<p className="text-sm text-gray-400">Belum ada dokumen.</p>
				) : null}
			</div>
		</>
	);
}
