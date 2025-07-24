export interface MaintenanceData {
  client: string;
  clientId: string;
  vehicle: string;
  vehicleId: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  maintenance: string;
  km_current: number;
  km_threshold: number;
  date_threshold: string;
  status: string;
  obd2Distance: number;
  gpsDistance: number;
  id?: string;
}
