export interface Client {
	uid: string;
	name: string;
	email: string;
	role: string;
	workshops?: string[];
	cpf?: string;
	phone_residential?: string;
	phone_commercial?: string;
	address_residential?: string;
	address_commercial?: string;
	gender?: string;
	age?: string;
	register?: string;
	cnh?: string;
}
