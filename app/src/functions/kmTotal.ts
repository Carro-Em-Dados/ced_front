import { Vehicle } from "@/interfaces/vehicle.type";
import { Reading } from "@/interfaces/readings.type";

export function getTotalKm(vehicle: Vehicle, reading: Reading): number {
  const readingDistance = reading?.obd2_distance || reading?.gps_distance;
  const km_current = vehicle.initial_km + (readingDistance ?? 0);
  return km_current;
}
