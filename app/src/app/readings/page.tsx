"use client";
import React, { useContext, useEffect, useState } from "react";
import { collection, addDoc, updateDoc, getDocs } from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";
import { toast } from "react-toastify";
import { Input } from "@nextui-org/react";
import { clear } from "console";
import { ShadAutocomplete } from "@/components/ShadAutocomplete";
import { Vehicle } from "@/interfaces/vehicle.type";

interface Reading {
  battery_tension: number;
  car_id: string;
  createdAt: Date;
  dtc_readings: string[];
  engine_temp: number;
  gps_distance: number;
  id: string;
  obd2_distance: number;
  rpm: number;
  speed: number;
  tank_level: number;
  uid: string;
  vin: string;
}

export default function Reading() {
  const { db } = useContext(AuthContext);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [carId, setCarId] = useState<string>("");
  const [dtcReadings, setDtcReadings] = useState<string[]>([]);
  const [gps, setGps] = useState<string>("");
  const [obd2, setObd2] = useState<string>("");
  const [vin, setVin] = useState<string>("");
  const [batteryTension, setBatteryTension] = useState<string>("");
  const [engineTemp, setEngineTemp] = useState<string>("");
  const [rpm, setRpm] = useState<string>("");
  const [speedVehicle, setSpeedVehicle] = useState<string>("");
  const [tankLevel, setTankLevel] = useState<string>("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      const vehicles = await getVehicles();
      console.log(vehicles);
      setVehicles(vehicles);
    };
    fetchVehicles();
  }, []);
  
  const getVehicles = async () => {
    const vehicles: Vehicle[] = [];
    const vehiclesSnapshot = await getDocs(collection(db, "vehicles"));
    vehiclesSnapshot.forEach((doc) => {
      vehicles.push({ ...(doc.data() as Vehicle), id: doc.id });
    });
    return vehicles;
  };

  const addAllReadings = async () => {
    readings.forEach(async (reading) => {
      const docRef = await addDoc(collection(db, "readings"), reading);
      updateDoc(docRef, { id: docRef.id, uid: docRef.id });
    });
    toast.success("Readings added successfully", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const addToReadingsList = (
    carId: string,
    dtcReadings: string[],
    gps: number,
    obd2: number,
    vin: string,
    batteryTension: number,
    engineTemp: number,
    rpm: number,
    speedVehicle: number,
    tankLevel: number
  ) => {
    setReadings((prev) => [
      ...prev,
      {
        battery_tension: batteryTension,
        car_id: carId,
        createdAt: new Date(),
        dtc_readings: dtcReadings,
        engine_temp: engineTemp,
        gps_distance: gps,
        id: "",
        obd2_distance: obd2,
        rpm: rpm,
        speed: speedVehicle,
        tank_level: tankLevel,
        uid: "",
        vin: vin,
      },
    ]);
    clearConsts();
  };

  const clearConsts = () => {
    setCarId("");
    setDtcReadings([]);
    setGps("");
    setObd2("");
    setVin("");
    setBatteryTension("");
    setEngineTemp("");
    setRpm("");
    setSpeedVehicle("");
    setTankLevel("");
  };

  return (
    <>
      <div className="h-screen w-screen gap-2 flex flex-col justify-center items-center bg-black text-white">
        <ShadAutocomplete
          placeholder="Car ID"
          className="h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none col-span-5"
          items={vehicles.map((car) => ({
            label: car.car_model,
            value: car.id,
          }))}
          selectedValue={""}
          onSelectedValueChange={(value) => {
            setCarId(value?.value || "");
            
            console.log(value);
          }}
        />

        <Input
          placeholder="GPS"
          className="h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
          onChange={(e) => setGps(e.target.value)}
        />
        <Input
          placeholder="OBD2"
          className="h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
          value={obd2}
          onChange={(e) => setObd2(e.target.value)}
        />
        <Input
          placeholder="VIN"
          className="h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
          value={vin}
          onChange={(e) => setVin(e.target.value)}
        />
        <Input
          placeholder="Battery Tension"
          className="h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
          value={batteryTension}
          onChange={(e) => setBatteryTension(e.target.value)}
        />
        <Input
          placeholder="Engine Temp"
          className="h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
          value={engineTemp}
          onChange={(e) => setEngineTemp(e.target.value)}
        />
        <Input
          placeholder="RPM"
          className="h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
          value={rpm}
          onChange={(e) => setRpm(e.target.value)}
        />
        <Input
          placeholder="Speed"
          className="h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
          value={speedVehicle}
          onChange={(e) => setSpeedVehicle(e.target.value)}
        />
        <Input
          placeholder="Tank Level"
          className="h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
          value={tankLevel}
          onChange={(e) => setTankLevel(e.target.value)}
        />
        <button
          onClick={() =>
            addToReadingsList(
              carId,
              dtcReadings,
              parseInt(gps),
              parseInt(obd2),
              vin,
              parseInt(batteryTension),
              parseInt(engineTemp),
              parseInt(rpm),
              parseInt(speedVehicle),
              parseInt(tankLevel)
            )
          }
        >
          Add to readings
        </button>
        <button onClick={addAllReadings}>Add all readings</button>
      </div>
      <div>
        {readings.map((reading) => (
          <ul key={reading.id}>
            <li><b>-{reading.car_id}</b></li>
            <li>{reading.gps_distance}</li>
            <li>{reading.obd2_distance}</li>
            <li>{reading.vin}</li>
            <li>{reading.battery_tension}</li>
            <li>{reading.engine_temp}</li>
            <li>{reading.rpm}</li>
            <li>{reading.speed}</li>
            <li>{reading.tank_level}</li>
            <br/>
          </ul>
        ))}
      </div>
    </>
  );
}
