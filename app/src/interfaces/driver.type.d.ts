export interface Driver {
	id: string;
	name: string;
	email: string;
	address_commercial: string;
	address_residential?: string;
	age?: number;
	gender?: string;
	phone_commercial?: string;
	phone_residential?: string;
	register?: string;
	cnh?: string;
}
