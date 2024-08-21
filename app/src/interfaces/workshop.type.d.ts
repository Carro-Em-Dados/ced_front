import { Contract } from "@/interfaces/contract.type";

export interface Workshop {
	id: string;
	contract_number: string;
	registration_number: string;
	fantasy_name: string;
	company_name: string;
	cnpj: string;
	contact: string;
	phone: string;
	website: string;
	email: string;
	state_code: string;
	city_code: string;
	cnae1: string;
	address: string;
	social: {
		instagram: string;
		facebook: string;
		youtube: string;
		linkedin: string;
		twitter: string;
		others: string;
	};
	branch: string;
	collaborators_amount: number;
	active_workers: number;
	average_ticket: number;
	monthly_goal: number;
	revenue: number;
	state_registration: string;
	municipal_registration: string;
	clients: string[];
	contract: string | Contract;
	google_calendar_id?: string;
}
