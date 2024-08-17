export interface Reading {
  id?: string;
  battery_tension: number;
  engine_temp: number;
  oil_pressure: number;
  rpm: number;
  speed: number;
  car_id: string;
  gps_distance: number;
  tank_level: number;
  obd2_distance: number;
  createdAt: string;
}
