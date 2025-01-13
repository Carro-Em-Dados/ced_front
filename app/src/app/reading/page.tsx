"use client"
import React, { useContext } from 'react'
import { collection, addDoc, updateDoc } from 'firebase/firestore'
import { AuthContext } from '@/contexts/auth.context'
import { toast } from 'react-toastify';

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

const reading: Reading = {
    battery_tension: 200,
    car_id: "",
    createdAt: new Date(),
    dtc_readings: [],
    engine_temp: 200,
    gps_distance: 200,
    id: "",
    obd2_distance: 200,
    rpm: 200,
    speed: 100,
    tank_level: 40,
    uid: "",
    vin: ""
}

export default function Reading() {
    const { db } = useContext(AuthContext);

    const addReading = async (car_id: string, dtc_readings: string[], gps: number, obd2: number, vin: string) => {
        reading.car_id = car_id;
        reading.dtc_readings = dtc_readings;
        reading.gps_distance = gps;
        reading.obd2_distance = obd2;
        reading.vin = vin;
        const docRef = await addDoc(collection(db, "readings"), reading)
        updateDoc(docRef, { id: docRef.id, uid: docRef.id })
        
        toast.success("Reading added successfully", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });


    
    }

    return (
        <div>
        <button onClick={() => addReading("vh7UtaUEtpx6AdtDaax3", ["p001"], 308, 309, "780")}>Add Reading</button>
        </div>
    )
}