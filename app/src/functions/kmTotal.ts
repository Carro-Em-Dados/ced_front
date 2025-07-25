import { Reading } from "@/interfaces/readings.type";

export function getTotalKm(reading: Reading): number {
  if (!reading) return 0;
  const readingDistance = reading?.obd2_distance || reading?.gps_distance;
  const km_current = (readingDistance ?? 0);
  return km_current;
}
