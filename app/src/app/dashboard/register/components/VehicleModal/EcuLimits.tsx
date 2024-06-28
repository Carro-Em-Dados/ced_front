import { useState, useEffect, useContext } from "react";
import {
	collection,
	doc,
	setDoc,
	getDoc,
	DocumentSnapshot,
} from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";
import { Button } from "@nextui-org/react";
import styles from "../../styles.module.scss";

interface Props {
	vin: string;
}

export default function EcuLimits({ vin }: Props) {
	const { db } = useContext(AuthContext);
	const [engineTemperature, setEngineTemperature] = useState(0);
	const [batteryTension, setBatteryTension] = useState(0);
	const [oilPressure, setOilPressure] = useState(0);
	const [rpm, setRpm] = useState(0);
	const [speed, setSpeed] = useState(0);

	const fetchReading = async () => {
		const readingsRef = collection(db, "readings");
		const readingDoc = doc(readingsRef, vin);
		const docSnapshot = await getDoc(readingDoc);

		if (docSnapshot.exists()) {
			const data = docSnapshot.data();
			setEngineTemperature(data.engine_temp || 0);
			setBatteryTension(data.battery_tension || 0);
			setOilPressure(data.oil_pressure || 0);
			setRpm(data.rpm || 0);
			setSpeed(data.speed || 0);
		}
	};

	useEffect(() => {
		fetchReading();
	}, [db, vin]);

	const saveReading = async () => {
		const readingsRef = collection(db, "readings");
		const readingDoc = doc(readingsRef, vin);

		const readingData = {
			battery_tension: batteryTension,
			engine_temp: engineTemperature,
			id: vin,
			oil_pressure: oilPressure,
			rpm: rpm,
			speed: speed,
			vin: vin,
		};

		try {
			if ((await getDoc(readingDoc)).exists()) {
				await setDoc(readingDoc, readingData, { merge: true });
			} else {
				await setDoc(readingDoc, readingData);
			}
			console.log("Reading saved successfully!");
		} catch (error) {
			console.error("Error saving reading: ", error);
		}
	};

	return (
		<div className={styles.form}>
			<div className="flex flex-col gap-2">
				<label htmlFor="engineTemperature">Temperatura do motor</label>
				<input
					type="number"
					id="engineTemperature"
					className={styles.modalInput}
					value={engineTemperature}
					onChange={(e) => setEngineTemperature(Number(e.target.value))}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<label htmlFor="batteryTension">Tensão de saída do alternador</label>
				<input
					type="number"
					id="batteryTension"
					className={styles.modalInput}
					value={batteryTension}
					onChange={(e) => setBatteryTension(Number(e.target.value))}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<label htmlFor="oilPressure">Pressão do óleo</label>
				<input
					type="number"
					id="oilPressure"
					className={styles.modalInput}
					value={oilPressure}
					onChange={(e) => setOilPressure(Number(e.target.value))}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<label htmlFor="rpm">Rotação do motor</label>
				<input
					type="number"
					id="rpm"
					className={styles.modalInput}
					value={rpm}
					onChange={(e) => setRpm(Number(e.target.value))}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<label htmlFor="speed">Velocidade</label>
				<input
					type="number"
					id="speed"
					className={styles.modalInput}
					value={speed}
					onChange={(e) => setSpeed(Number(e.target.value))}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<Button
					type="button"
					onClick={saveReading}
					className={styles.addVehicleBtn}
				>
					Salvar
				</Button>
			</div>
		</div>
	);
}
