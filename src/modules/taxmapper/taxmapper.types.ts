/**
 * TaxMapper: independently observed monthly revenue per tax object
 * (field-mapping/monitoring data), not tied to SPTPD billing/payment
 * records — no NPWPD/KOHIR join key, just an object identifier (NIOP).
 */

export interface MonthlyAmount {
	month: number; // 1-12
	label: string;
	amount: number;
}

export interface TaxMapperObject {
	niop: string;
	namaObjekPajak: string;
	type: string;
	total: number;
	months: MonthlyAmount[];
}

export interface TaxMapperResult {
	rows: TaxMapperObject[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
	types: string[];
	grandTotal: number;
	monthly: MonthlyAmount[];
}
