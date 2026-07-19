/** Full Rupiah, e.g. "Rp 85.000.000.000". */
export function formatIDR(value: number): string {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(value);
}

/** Compact Rupiah, e.g. "Rp 85 M", "Rp 1,2 T", "Rp 450 jt". */
export function formatCompactIDR(value: number): string {
	const abs = Math.abs(value);
	const sign = value < 0 ? "-" : "";
	const one = (n: number) =>
		n.toLocaleString("id-ID", { maximumFractionDigits: 1 });
	if (abs >= 1e12) return `${sign}Rp ${one(abs / 1e12)} T`;
	if (abs >= 1e9) return `${sign}Rp ${one(abs / 1e9)} M`;
	if (abs >= 1e6) return `${sign}Rp ${one(abs / 1e6)} jt`;
	if (abs >= 1e3) return `${sign}Rp ${one(abs / 1e3)} rb`;
	return `${sign}Rp ${Math.round(abs)}`;
}
