export interface Contract {
	id: string;
	maxDrivers: number;
	maxVehiclesPerDriver: number;
	maxAlarmsPerVehicle: number;
	workshopKmLimitAlarm: number;
	workshopDateLimitAlarm: number;
	userKmLimitAlarm: number;
	userDateLimitAlarm: number;
	trialPeriod: number;
}
