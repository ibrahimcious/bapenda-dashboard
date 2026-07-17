import { S3ServiceException } from "@aws-sdk/client-s3";
import { createFileRoute } from "@tanstack/react-router";
import { auth } from "#/modules/auth/auth.utils";
import { getDocumentBySlug } from "#/modules/documents/documents.config";
import { fetchDocumentRange } from "#/modules/documents/documents.r2";

export const Route = createFileRoute("/api/documents/$slug")({
	server: {
		handlers: {
			GET: async ({ request, params }) => {
				const session = await auth.api.getSession({ headers: request.headers });
				if (!session) {
					return new Response("Unauthorized", { status: 401 });
				}

				const doc = getDocumentBySlug(params.slug);
				if (!doc) {
					return new Response("Not Found", { status: 404 });
				}

				try {
					const range = request.headers.get("range");
					const result = await fetchDocumentRange(doc.key, range);

					const headers = new Headers({
						"Content-Type": result.contentType,
						"Accept-Ranges": "bytes",
						"Content-Disposition": `inline; filename="${doc.slug}.pdf"`,
						"Cache-Control": "private, no-store",
					});
					if (result.contentLength !== undefined) {
						headers.set("Content-Length", String(result.contentLength));
					}
					if (result.contentRange) {
						headers.set("Content-Range", result.contentRange);
					}

					return new Response(result.body, { status: result.status, headers });
				} catch (err) {
					if (
						err instanceof S3ServiceException &&
						err.name === "InvalidRange"
					) {
						return new Response("Range Not Satisfiable", { status: 416 });
					}
					console.error("Failed to fetch document from R2:", err);
					return new Response("Internal Server Error", { status: 500 });
				}
			},
		},
	},
});
