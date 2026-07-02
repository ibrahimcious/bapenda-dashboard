import { type ReactNode, useEffect, useState } from "react";

/**
 * Renders children only after mount. Use to keep components that don't support
 * SSR (e.g. recharts, which relies on client-side measurement) off the server
 * render — avoids dispatcher/hydration errors. `fallback` holds layout space
 * during SSR and the first client render.
 */
export function ClientOnly({
	children,
	fallback = null,
}: {
	children: ReactNode;
	fallback?: ReactNode;
}) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	return <>{mounted ? children : fallback}</>;
}
