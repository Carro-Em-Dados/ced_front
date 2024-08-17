import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import { useContext, useEffect, useState } from "react";
import styles from "../../register/styles.module.scss";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Contract } from "@/interfaces/contract.type";
import { AuthContext } from "@/contexts/auth.context";
import { toast, Zoom } from "react-toastify";

export default function EditBasicContract() {
	const { db } = useContext(AuthContext);

	const [clientMotoristCount, setClientMotoristCount] = useState(0);
	const [vehicleCount, setVehicleCount] = useState(0);
	const [alarmCount, setAlarmCount] = useState(0);
	const [maintenanceAlarmCount, setMaintenanceAlarmCount] = useState(0);
	const [workshopKmNotificationFactor, setWorkshopKmNotificationFactor] =
		useState(0);
	const [workshopDateNotificationFactor, setWorkshopDateNotificationFactor] =
		useState(0);
	const [userKmNotificationFactor, setUserKmNotificationFactor] = useState(0);
	const [userDateNotificationFactor, setUserDateNotificationFactor] =
		useState(0);
	const [loading, setLoading] = useState(true);

	const loadContract = async () => {
		const contractRef = doc(db, "contracts", "basic");
		const contractSnap = await getDoc(contractRef);

		if (contractSnap.exists()) {
			const contractData = contractSnap.data() as Contract;
			setClientMotoristCount(contractData.maxDrivers);
			setVehicleCount(contractData.maxVehiclesPerDriver);
			setAlarmCount(contractData.maxAlarmsPerVehicle);
			setMaintenanceAlarmCount(contractData.maxManuntenanceAlarmsPerUser);
			setWorkshopKmNotificationFactor(contractData.workshopKmLimitAlarm);
			setWorkshopDateNotificationFactor(contractData.workshopDateLimitAlarm);
			setUserKmNotificationFactor(contractData.userKmLimitAlarm);
			setUserDateNotificationFactor(contractData.userDateLimitAlarm);
		}

		setLoading(false);
	};

	useEffect(() => {
		loadContract();
	}, []);

	const handleEditContract = async () => {
		const updatedContract = {
			maxDrivers: +clientMotoristCount,
			maxVehiclesPerDriver: +vehicleCount,
			maxAlarmsPerVehicle: +alarmCount,
			maxManuntenanceAlarmsPerUser: +maintenanceAlarmCount,
			workshopKmLimitAlarm: +workshopKmNotificationFactor,
			workshopDateLimitAlarm: +workshopDateNotificationFactor,
			userKmLimitAlarm: +userKmNotificationFactor,
			userDateLimitAlarm: +userDateNotificationFactor,
		};
		setLoading(true);

		try {
			const contractDocRef = doc(db, "contracts", "basic");
			await updateDoc(contractDocRef, updatedContract);

			setClientMotoristCount(updatedContract.maxDrivers);
			setVehicleCount(updatedContract.maxVehiclesPerDriver);
			setAlarmCount(updatedContract.maxAlarmsPerVehicle);
			setMaintenanceAlarmCount(updatedContract.maxManuntenanceAlarmsPerUser);
			setWorkshopKmNotificationFactor(updatedContract.workshopKmLimitAlarm);
			setWorkshopDateNotificationFactor(updatedContract.workshopDateLimitAlarm);
			setUserKmNotificationFactor(updatedContract.userKmLimitAlarm);
			setUserDateNotificationFactor(updatedContract.userDateLimitAlarm);
		} catch (error) {
			toast.error("Erro ao atualizar contrato", {
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
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-2 text-white w-full">
			<>
				<fieldset className="flex flex-col gap-4">
					<div>
						<Input
							min={0}
							label="Qtd. cadastros de clientes-motoristas*"
							type="number"
							value={clientMotoristCount.toString()}
							onChange={(e) => setClientMotoristCount(+e.target.value)}
							variant="bordered"
							className="dark"
							classNames={{
								input: ["bg-transparent text-white"],
								inputWrapper: [
									"border border-2 !border-white focus:border-white",
								],
							}}
							disabled={loading}
							isDisabled={loading}
						/>
					</div>
					<div>
						<Input
							min={0}
							label="Qtd. cadastros de veículos por clientes-motoristas*"
							type="number"
							value={vehicleCount.toString()}
							onChange={(e) => setVehicleCount(+e.target.value)}
							variant="bordered"
							className="dark"
							classNames={{
								input: ["bg-transparent text-white"],
								inputWrapper: [
									"border border-2 !border-white focus:border-white",
								],
							}}
							disabled={loading}
							isDisabled={loading}
						/>
					</div>
					<div>
						<Input
							min={0}
							label="Qtd. de alarmes por KM limite/Data limite por veículo*"
							type="number"
							value={alarmCount.toString()}
							onChange={(e) => setAlarmCount(+e.target.value)}
							variant="bordered"
							className="dark"
							classNames={{
								input: ["bg-transparent text-white"],
								inputWrapper: [
									"border border-2 !border-white focus:border-white",
								],
							}}
							disabled={loading}
							isDisabled={loading}
						/>
					</div>
					<div>
						<Input
							min={0}
							label="Qtd. de alarmes de manutenção por cliente*"
							type="number"
							value={maintenanceAlarmCount.toString()}
							onChange={(e) => setMaintenanceAlarmCount(+e.target.value)}
							variant="bordered"
							className="dark"
							classNames={{
								input: ["bg-transparent text-white"],
								inputWrapper: [
									"border border-2 !border-white focus:border-white",
								],
							}}
							disabled={loading}
							isDisabled={loading}
						/>
					</div>
					<p className="self-end text-white text-sm">
						Campos com (*) são obrigatórios
					</p>
				</fieldset>
				<h2 className={styles.modalLabel}>
					Fator de disparo de notificação à oficina
				</h2>
				<fieldset className="text-white flex gap-2">
					<div className="flex flex-col gap-2 w-full">
						<label htmlFor="workshopKmLimitAlarm">KM Limite</label>
						<Select
							name="workshopKmLimitAlarm"
							variant="bordered"
							className="dark text-white"
							classNames={{
								trigger: "!border-white rounded-[1em]",
							}}
							defaultSelectedKeys={[workshopKmNotificationFactor.toString()]}
							onChange={(e) => setWorkshopKmNotificationFactor(+e.target.value)}
							aria-label="workshopKmLimitAlarm"
							disabled={loading}
							isDisabled={loading}
						>
							<SelectItem
								key={1000}
								value={"1000"}
							>
								1000 km
							</SelectItem>
							<SelectItem
								key={2000}
								value={"2000"}
							>
								2000 km
							</SelectItem>
							<SelectItem
								key={3000}
								value={"3000"}
							>
								3000 km
							</SelectItem>
							<SelectItem
								key={4000}
								value={"4000"}
							>
								4000 km
							</SelectItem>
							<SelectItem
								key={5000}
								value={"5000"}
							>
								5000 km
							</SelectItem>
						</Select>
					</div>
					<div className="flex flex-col gap-2 w-full">
						<label htmlFor="workshopDateNotificationFactor">Data Limite</label>
						<Select
							name="workshopDateNotificationFactor"
							variant="bordered"
							className="dark text-white"
							classNames={{
								trigger: "!border-white rounded-[1em]",
							}}
							defaultSelectedKeys={[workshopDateNotificationFactor.toString()]}
							onChange={(e) =>
								setWorkshopDateNotificationFactor(+e.target.value)
							}
							aria-label="workshopDateNotificationFactor"
							disabled={loading}
							isDisabled={loading}
						>
							<SelectItem
								key={1}
								value={"1"}
							>
								1 dia
							</SelectItem>
							<SelectItem
								key={5}
								value={"5"}
							>
								5 dias
							</SelectItem>
							<SelectItem
								key={10}
								value={"10"}
							>
								10 dias
							</SelectItem>
							<SelectItem
								key={15}
								value={"15"}
							>
								15 dias
							</SelectItem>
						</Select>
					</div>
				</fieldset>
				<h2 className={styles.modalLabel}>
					Fator de disparo de notificação ao usuário
				</h2>
				<fieldset className="text-white flex gap-2">
					<div className="flex flex-col gap-2 w-full">
						<label htmlFor="userKmLimitNotificationFactor">KM Limite</label>
						<Select
							name="userKmLimitNotificationFactor"
							variant="bordered"
							className="dark text-white"
							classNames={{
								trigger: "!border-white rounded-[1em]",
							}}
							defaultSelectedKeys={[userKmNotificationFactor.toString()]}
							onChange={(e) => setUserKmNotificationFactor(+e.target.value)}
							aria-label="userKmLimitNotificationFactor"
							disabled={loading}
							isDisabled={loading}
						>
							<SelectItem
								key={200}
								value={"200"}
							>
								200 km
							</SelectItem>
							<SelectItem
								key={400}
								value={"400"}
							>
								400 km
							</SelectItem>
							<SelectItem
								key={600}
								value={"600"}
							>
								600 km
							</SelectItem>
							<SelectItem
								key={800}
								value={"800"}
							>
								800 km
							</SelectItem>
							<SelectItem
								key={1000}
								value={"1000"}
							>
								1000 km
							</SelectItem>
						</Select>
					</div>
					<div className="flex flex-col gap-2 w-full">
						<label htmlFor="userDateNotificationFactor">Data Limite</label>
						<Select
							name="userDateNotificationFactor"
							variant="bordered"
							className="dark text-white"
							classNames={{
								trigger: "!border-white rounded-[1em]",
							}}
							defaultSelectedKeys={[userDateNotificationFactor.toString()]}
							onChange={(e) => setUserDateNotificationFactor(+e.target.value)}
							aria-label="userDateNotificationFactor"
							disabled={loading}
							isDisabled={loading}
						>
							<SelectItem
								key={1}
								value={"1"}
							>
								1 dia
							</SelectItem>
							<SelectItem
								key={2}
								value={"2"}
							>
								2 dias
							</SelectItem>
							<SelectItem
								key={4}
								value={"4"}
							>
								4 dias
							</SelectItem>
							<SelectItem
								key={6}
								value={"6"}
							>
								6 dias
							</SelectItem>
							<SelectItem
								key={8}
								value={"8"}
							>
								8 dias
							</SelectItem>
							<SelectItem
								key={10}
								value={"10"}
							>
								10 dias
							</SelectItem>
						</Select>
					</div>
				</fieldset>
				<Button
					color="success"
					className={styles.modalButton}
					disabled={loading}
					onPress={handleEditContract}
				>
					Salvar
				</Button>
			</>
		</div>
	);
}
