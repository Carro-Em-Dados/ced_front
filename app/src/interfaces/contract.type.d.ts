export interface Contract {
	id: string;
	maxDrivers: number;
	maxManuntenanceAlarmsPerUser: number;
	maxVehiclesPerDriver: number;
	maxAlarmsPerVehicle: number;
	workshopKmLimitAlarm: number;
	workshopDateLimitAlarm: number;
	userKmLimitAlarm: number;
	userDateLimitAlarm: number;
	trialPeriod: number;
	workshop: string;
}
