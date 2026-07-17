import "#/modules/documents/pdf-worker.client";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import { Document, Page } from "react-pdf";

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
const SCALE_STEP = 0.25;

export default function PdfViewer({ documentUrl }: { documentUrl: string }) {
	const [numPages, setNumPages] = useState<number | null>(null);
	const [pageNumber, setPageNumber] = useState(1);
	const [scale, setScale] = useState(1);

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<button
						type="button"
						disabled={pageNumber <= 1}
						onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
						className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
					>
						<ChevronLeft className="size-4" />
					</button>
					<span className="text-sm text-gray-500">
						Hal {pageNumber} / {numPages ?? "–"}
					</span>
					<button
						type="button"
						disabled={!numPages || pageNumber >= numPages}
						onClick={() => setPageNumber((p) => Math.min(numPages ?? p, p + 1))}
						className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
					>
						<ChevronRight className="size-4" />
					</button>
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						disabled={scale <= MIN_SCALE}
						onClick={() => setScale((s) => Math.max(MIN_SCALE, s - SCALE_STEP))}
						className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
					>
						<ZoomOut className="size-4" />
					</button>
					<span className="w-12 text-center text-sm text-gray-500">
						{Math.round(scale * 100)}%
					</span>
					<button
						type="button"
						disabled={scale >= MAX_SCALE}
						onClick={() => setScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP))}
						className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
					>
						<ZoomIn className="size-4" />
					</button>
				</div>
			</div>

			<div className="flex justify-center overflow-auto rounded-lg bg-gray-50 p-4">
				<Document
					file={documentUrl}
					onLoadSuccess={({ numPages: total }) => {
						setNumPages(total);
						setPageNumber(1);
					}}
					loading={
						<div className="flex h-96 w-full items-center justify-center text-sm text-gray-400">
							Memuat dokumen…
						</div>
					}
					error={
						<div className="flex h-96 w-full items-center justify-center text-sm text-red-500">
							Gagal memuat dokumen.
						</div>
					}
				>
					<Page
						pageNumber={pageNumber}
						scale={scale}
						renderTextLayer
						renderAnnotationLayer
					/>
				</Document>
			</div>
		</div>
	);
}
