import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createServerOnlyFn } from "@tanstack/react-start";
import { getR2Config } from "./documents.env";

const getS3Client = createServerOnlyFn(() => {
	const { accountId, accessKeyId, secretAccessKey } = getR2Config();
	return new S3Client({
		region: "auto",
		endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
		credentials: { accessKeyId, secretAccessKey },
	});
});

export interface DocumentFetchResult {
	body: ReadableStream<Uint8Array>;
	status: 200 | 206;
	contentType: string;
	contentLength?: number;
	contentRange?: string;
}

export async function fetchDocumentRange(
	key: string,
	rangeHeader: string | null,
): Promise<DocumentFetchResult> {
	const { bucketName } = getR2Config();
	const client = getS3Client();
	const command = new GetObjectCommand({
		Bucket: bucketName,
		Key: key,
		Range: rangeHeader ?? undefined,
	});
	const output = await client.send(command);
	if (!output.Body) {
		throw new Error("R2 object body is empty");
	}

	return {
		body: output.Body.transformToWebStream(),
		status: output.ContentRange ? 206 : 200,
		contentType: output.ContentType ?? "application/pdf",
		contentLength: output.ContentLength,
		contentRange: output.ContentRange,
	};
}
