import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { dbMiddleware } from "#/shared/middleware/db.middleware";
import { CreateUserSchema, LoginUserSchema } from "./auth.schema";
import { auth } from "./auth.utils";

export const loginServerFn = createServerFn()
	.validator(LoginUserSchema)
	.handler(async ({ data }) => {
		await auth.api.signInEmail({
			body: {
				email: data.email,
				password: data.password,
			},
		});
		throw redirect({
			to: "/dashboard",
		});
	});

export const logoutServerFn = createServerFn().handler(async () => {
	const headers = getRequestHeaders();
	await auth.api.signOut({ headers });
	throw redirect({
		to: "/",
	});
});
export const getSessionServerFn = createServerFn().handler(async () => {
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({ headers });
	return session;
});

/** Admin-only: create a new account. Public sign-up is disabled — see
 * auth.utils.ts's `emailAndPassword.disableSignUp`. */
export const adminCreateUserServerFn = createServerFn()
	.validator(CreateUserSchema)
	.handler(async ({ data }) => {
		const headers = getRequestHeaders();
		const { user } = await auth.api.createUser({
			headers,
			body: {
				name: data.name,
				email: data.email,
				password: data.password,
			},
		});
		return { id: user.id, name: user.name, email: user.email };
	});

export const listUsersServerFn = createServerFn()
	.middleware([dbMiddleware])
	.handler(async ({ context }) => {
		const headers = getRequestHeaders();
		const session = await auth.api.getSession({ headers });
		if (session?.user.role !== "admin") {
			throw new Error("Forbidden");
		}
		return context.db.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				createdAt: true,
			},
			orderBy: { createdAt: "desc" },
		});
	});
