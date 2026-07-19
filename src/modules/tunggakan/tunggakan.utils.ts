import type { PaymentStatus } from "./tunggakan.types";

export const MONTH_LABELS = [
	"",
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"Mei",
	"Jun",
	"Jul",
	"Agu",
	"Sep",
	"Okt",
	"Nov",
	"Des",
];

export function statusFor(ketetapan: number, terbayar: number): PaymentStatus {
	if (ketetapan <= 0 || terbayar >= ketetapan) return "Lunas";
	if (terbayar > 0) return "Sebagian";
	return "Belum Bayar";
}
