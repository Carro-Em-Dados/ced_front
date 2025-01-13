import { Vehicle } from "@/interfaces/vehicle.type";
import { Reading } from "@/interfaces/readings.type";

export function getKmTotalOfMaintenanceImp1(vehicle: Vehicle, reading: Reading): number {
    // If one of the readings is undefined, the greatest value is taken, whether it is 
    // from a reading or the initial_km of the vehicle.
	const obd2Distance = reading?.obd2_distance || vehicle.initial_km;
    const gpsDistance = reading?.gps_distance || vehicle.initial_km;
    const km_current = obd2Distance > gpsDistance ? obd2Distance : gpsDistance;
    return km_current;
}

export function getKmTotalOfMaintenanceImp2(vehicle: Vehicle, reading: Reading): number {
    // Only is set as vehicle_initial_km if both obd2Distance and gpsDistance are 0.
    // That is, only nothing meaningful is set in the readings.
    const obd2Distance = reading?.obd2_distance || 0;
    const gpsDistance = reading?.gps_distance || 0;
    let kmAddition = obd2Distance > gpsDistance ? obd2Distance : gpsDistance;
    let km_current = kmAddition === 0 ? vehicle.initial_km : kmAddition;
    return km_current;
}

export function getKmTotalOfMaintenanceImp3(reading: Reading): number {
    // The sum of the two readings is taken as the current km.
    // It was the first rule being used in the previous implementation.
    const obd2Distance = reading?.obd2_distance || 0;
    const gpsDistance = reading?.gps_distance || 0;
    const km_current = obd2Distance + gpsDistance;
    return km_current;
}

export function getKmTotalOfMaintenanceImp4(vehicle: Vehicle, reading: Reading): number {
    // The sum of the two readings is taken as the current km.
    // If the sum is 0, the initial_km of the vehicle is taken.
    const obd2Distance = reading?.obd2_distance || 0;
    const gpsDistance = reading?.gps_distance || 0;
    const kmAddition = obd2Distance + gpsDistance;
    const km_current = kmAddition === 0 ? vehicle.initial_km : kmAddition;
    return km_current;
}

export function getKmTotalOfMaintenanceImp5(vehicle: Vehicle, reading: Reading): number {
    const obd2Distance = reading?.obd2_distance || 0;
    const gpsDistance = reading?.gps_distance || 0;
    let kmAddition = obd2Distance > gpsDistance ? obd2Distance : gpsDistance;
    let km_current = kmAddition + vehicle.initial_km;
    return km_current;
}

export function getKmTotalOfMaintenanceImp6(vehicle: Vehicle, reading: Reading): number {
    // The sum of the two readings is taken as the current km.
    // If the sum is 0, the initial_km of the vehicle is taken.
    const obd2Distance = reading?.obd2_distance || 0;
    const gpsDistance = reading?.gps_distance || 0;
    const kmAddition = obd2Distance + gpsDistance;
    const km_current = kmAddition + vehicle.initial_km;
    return km_current;
}

/* Analysis of the implementations:

Well, first of all, in the real scenario of the application, none of the
readings obd2_distance and gps_distance will be undefined. So the first
function will never consider the initial_km of the vehicle as the current km.

The second function could be used if we want to consider the initial_km of the
vehicle as the current km when both readings are 0, that is, when the app hasn't
tracked any distance from the vehicle yet.
So, the vehicle's initial_km would only be used in a very brief period of time.

The third function is the one that was being used in the previous implementation.
It doesn't consider the initial_km of the vehicle at all. It just sums the two readings.

The fourth function is similar the third one, since the vehicle's initial_km is only
considered when the sum of the readings is 0. Which means that the vehicle's initial_km
is only used when the app hasn't tracked any distance from the vehicle yet and so,
it would used in a very brief period of time too.

The fifth function is similar to the second one, but the vehicle's initial_km is added
to the sum of the readings. So, the vehicle's initial_km is always considered.

The sixth function is similar to the fourth one, but the vehicle's initial_km is added
to the sum of the readings. So, the vehicle's initial_km is always considered.

*/