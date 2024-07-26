import { useState, useEffect, useContext } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";
import { Button } from "@nextui-org/react";
import styles from "../../styles.module.scss";
import clsx from "clsx";
import { toast, Zoom } from "react-toastify";

interface Props {
	id: string;
}

export default function EcuLimits({ id }: Props) {
	const { db } = useContext(AuthContext);
	const [engineTemperature, setEngineTemperature] = useState(0);
	const [batteryTension, setBatteryTension] = useState(0);
	const [oilPressure, setOilPressure] = useState(0);
	const [rpm, setRpm] = useState(0);
	const [speed, setSpeed] = useState(0);

	const fetchReading = async () => {
		try {
			const vehicleDoc = doc(db, "vehicles", id);
			const docSnapshot = await getDoc(vehicleDoc);

			if (docSnapshot.exists()) {
				const data = docSnapshot.data();
				setEngineTemperature(data.engine_temp || 0);
				setBatteryTension(data.battery_tension || 0);
				setOilPressure(data.oil_pressure || 0);
				setRpm(data.rpm || 0);
				setSpeed(data.speed || 0);
			} else {
				toast.error("Veículo não encontrado", {
					position: "bottom-right",
					autoClose: 5000,
					hideProgressBar: true,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					theme: "dark",
					transition: Zoom,
				});
			}
		} catch (error) {
			toast.error("Erro ao buscar leituras", {
				position: "bottom-right",
				autoClose: 5000,
				hideProgressBar: true,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: "dark",
				transition: Zoom,
			});
		}
	};

	const saveReading = async () => {
		try {
			const vehicleDoc = doc(db, "vehicles", id);
			const readingData = {
				battery_tension: batteryTension,
				engine_temp: engineTemperature,
				oil_pressure: oilPressure,
				rpm: rpm,
				speed: speed,
			};

			await setDoc(vehicleDoc, readingData, { merge: true });
			toast.success("Leituras salvas com sucesso!", {
				position: "bottom-right",
				autoClose: 5000,
				hideProgressBar: true,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: "dark",
				transition: Zoom,
			});
		} catch (error) {
			toast.error("Erro ao salvar leituras", {
				position: "bottom-right",
				autoClose: 5000,
				hideProgressBar: true,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: "dark",
				transition: Zoom,
			});
		}
	};

	useEffect(() => {
		fetchReading();
	}, [db, id]);

	return (
		<div className={clsx(styles.form, "flex flex-col gap-5 w-full")}>
			<div className="flex flex-col gap-4">
				<div className="grid grid-cols-2 items-center justify-items-end">
					<label htmlFor="engineTemperature">Temperatura do motor</label>
					<input
						type="number"
						id="engineTemperature"
						className={styles.modalInput}
						value={engineTemperature}
						onChange={(e) => setEngineTemperature(Number(e.target.value))}
					/>
				</div>
				<div className="grid grid-cols-2 items-center justify-items-end">
					<label htmlFor="batteryTension">Tensão de saída do alternador</label>
					<input
						type="number"
						id="batteryTension"
						className={styles.modalInput}
						value={batteryTension}
						onChange={(e) => setBatteryTension(Number(e.target.value))}
					/>
				</div>
				<div className="grid grid-cols-2 items-center justify-items-end">
					<label htmlFor="oilPressure">Pressão do óleo</label>
					<input
						type="number"
						id="oilPressure"
						className={styles.modalInput}
						value={oilPressure}
						onChange={(e) => setOilPressure(Number(e.target.value))}
					/>
				</div>
				<div className="grid grid-cols-2 items-center justify-items-end">
					<label htmlFor="rpm">Rotação do motor</label>
					<input
						type="number"
						id="rpm"
						className={styles.modalInput}
						value={rpm}
						onChange={(e) => setRpm(Number(e.target.value))}
					/>
				</div>
				<div className="grid grid-cols-2 items-center justify-items-end">
					<label htmlFor="speed">Velocidade</label>
					<input
						type="number"
						id="speed"
						className={styles.modalInput}
						value={speed}
						onChange={(e) => setSpeed(Number(e.target.value))}
					/>
				</div>
			</div>
			<div className="flex flex-col gap-2 w-fit ml-auto">
				<Button
					type="button"
					onPress={saveReading}
					className={styles.addVehicleBtn}
				>
					Salvar
				</Button>
			</div>
		</div>
	);
}
