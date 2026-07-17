import { createFileRoute, notFound } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { getDocumentBySlug } from "#/modules/documents/documents.config";
import { ClientOnly } from "#/shared/components/ClientOnly";

const PdfViewer = lazy(
	() => import("#/modules/documents/components/PdfViewer"),
);

export const Route = createFileRoute("/_authenticated/dokumen/$slug")({
	beforeLoad: ({ params }) => {
		const doc = getDocumentBySlug(params.slug);
		if (!doc) {
			throw notFound();
		}
		return { doc };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { doc } = Route.useRouteContext();

	return (
		<>
			<div>
				<h1 className="text-lg font-semibold text-gray-900">{doc.title}</h1>
			</div>

			<ClientOnly
				fallback={
					<div className="h-96 w-full animate-pulse rounded-xl bg-gray-100" />
				}
			>
				<Suspense
					fallback={
						<div className="h-96 w-full animate-pulse rounded-xl bg-gray-100" />
					}
				>
					<PdfViewer documentUrl={`/api/documents/${doc.slug}`} />
				</Suspense>
			</ClientOnly>
		</>
	);
}
