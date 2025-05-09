export interface Contract {
  id: string;
  maxDrivers: number;
  maxMaintenanceAlarmsPerUser: number;
  maxVehiclesPerDriver: number;
  maxAlarmsPerVehicle: number;
  workshopKmLimitAlarm: number;
  workshopDateLimitAlarm: number;
  userKmLimitAlarm: number;
  userDateLimitAlarm: number;
  freemiumPeriod: number;
  workshopScheduleLimit: number;
}
