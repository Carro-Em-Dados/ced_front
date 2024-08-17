export interface Vehicle {
	id: string;
	manufacturer: string;
	car_model: string;
	license_plate: string;
	owner: string;
	vin: string;
	year: string;
	initial_km: number;
	obd2_mac: string;
	gps_mac: string;
	gas_capacity: number;
	battery_tension: number;
	engine_temp: number;
	oil_pressure: number;
	rpm: number;
	speed: number;
	car_id: string;
	gps_distance: number;
	tank_level: number;
	obd2_distance: number;
}
