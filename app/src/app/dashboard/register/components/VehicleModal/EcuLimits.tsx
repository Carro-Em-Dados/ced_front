import { useState, useEffect, useContext } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";
import { Button, Input } from "@nextui-org/react";
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
				<div>
					<Input
						label="Temperatura do motor"
						type="number"
						value={engineTemperature.toString()}
						onChange={(e) => setEngineTemperature(Number(e.target.value))}
						variant="bordered"
						className="dark"
						classNames={{
							input: ["bg-transparent text-white"],
							inputWrapper: [
								"border border-2 !border-white focus:border-white",
							],
						}}
					/>
				</div>
				<div>
					<Input
						label="Tensão de saída do alternador"
						type="number"
						value={batteryTension.toString()}
						onChange={(e) => setBatteryTension(Number(e.target.value))}
						variant="bordered"
						className="dark"
						classNames={{
							input: ["bg-transparent text-white"],
							inputWrapper: [
								"border border-2 !border-white focus:border-white",
							],
						}}
					/>
				</div>
				<div>
					<Input
						label="Pressão do óleo"
						type="number"
						value={oilPressure.toString()}
						onChange={(e) => setOilPressure(Number(e.target.value))}
						variant="bordered"
						className="dark"
						classNames={{
							input: ["bg-transparent text-white"],
							inputWrapper: [
								"border border-2 !border-white focus:border-white",
							],
						}}
					/>
				</div>
				<div>
					<Input
						label="Rotação do motor"
						type="number"
						value={rpm.toString()}
						onChange={(e) => setRpm(Number(e.target.value))}
						variant="bordered"
						className="dark"
						classNames={{
							input: ["bg-transparent text-white"],
							inputWrapper: [
								"border border-2 !border-white focus:border-white",
							],
						}}
					/>
				</div>
				<div>
					<Input
						label="Velocidade"
						type="number"
						value={speed.toString()}
						onChange={(e) => setSpeed(Number(e.target.value))}
						variant="bordered"
						className="dark"
						classNames={{
							input: ["bg-transparent text-white"],
							inputWrapper: [
								"border border-2 !border-white focus:border-white",
							],
						}}
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
