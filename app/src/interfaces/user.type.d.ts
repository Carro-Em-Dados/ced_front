export interface User {
	id: string;
	uid: string;
	email: string;
	name: string;
	role: string;
	workshops?: string[];
}
