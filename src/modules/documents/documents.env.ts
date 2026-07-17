import { createServerOnlyFn } from "@tanstack/react-start";
import { z } from "zod";

const R2EnvSchema = z.object({
	accountId: z.string().min(1, "R2_ACCOUNT_ID is not set"),
	accessKeyId: z.string().min(1, "R2_ACCESS_KEY_ID is not set"),
	secretAccessKey: z.string().min(1, "R2_SECRET_ACCESS_KEY is not set"),
	bucketName: z.string().min(1, "R2_BUCKET_NAME is not set"),
});

export type R2Config = z.infer<typeof R2EnvSchema>;

export const getR2Config = createServerOnlyFn((): R2Config => {
	const parsed = R2EnvSchema.safeParse({
		accountId: process.env.R2_ACCOUNT_ID,
		accessKeyId: process.env.R2_ACCESS_KEY_ID,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
		bucketName: process.env.R2_BUCKET_NAME,
	});
	if (!parsed.success) {
		throw new Error(`Invalid R2 configuration: ${parsed.error.message}`);
	}
	return parsed.data;
});
