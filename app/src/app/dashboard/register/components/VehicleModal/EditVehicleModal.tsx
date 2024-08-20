import {
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	Autocomplete,
	AutocompleteItem,
	useDisclosure,
	ModalFooter,
} from "@nextui-org/react";
import clsx from "clsx";
import styles from "../../styles.module.scss";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/auth.context";
import { Vehicle } from "@/interfaces/vehicle.type";
import { updateDoc, doc } from "firebase/firestore";
import { toast, Zoom } from "react-toastify";

interface Props {
	vehicle: Vehicle;
	setVehicles: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function EditVehicleModal({ vehicle, setVehicles }: Props) {
	const { db } = useContext(AuthContext);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [manufacturer, setManufacturer] = useState<string>(
		vehicle.manufacturer
	);
	const [carModel, setCarModel] = useState<string>(vehicle.car_model);
	const [year, setYear] = useState<string>(vehicle.year);
	const [vin, setVin] = useState<string>(vehicle.vin);
	const [initialKm, setInitialKm] = useState(vehicle.initial_km);
	const [vehiclesBrands, setVehiclesBrands] = useState<any[]>([]);
	const [vehiclesModels, setVehiclesModels] = useState<any[]>([]);
	const [vehicleYears, setVehicleYears] = useState<any[]>([]);
	const [selectedBrand, setSelectedBrand] = useState<string>();
	const [selectedModel, setSelectedModel] = useState<string>();
	const [licensePlate, setLicensePlate] = useState<string>(
		vehicle.license_plate
	);
	const [loadingFetch, setLoadingFetch] = useState(true);
	const [failed, setFailed] = useState({
		brand: false,
		model: false,
		year: false,
	});
	const [loading, setLoading] = useState(false);

	const fetchVehiclesBrandsApi = async () => {
		setLoadingFetch(true);
		try {
			const response = await fetch(
				"https://parallelum.com.br/fipe/api/v1/carros/marcas"
			);
			const data = await response.json();
			setVehiclesBrands(data);
		} catch (error) {
			setFailed({ ...failed, brand: true });
		} finally {
			setLoadingFetch(false);
		}
	};

	const fetchVehiclesModelsApi = async (manufacturerCode: string) => {
		if (!manufacturerCode) return;
		setLoadingFetch(true);
		try {
			const response = await fetch(
				`https://parallelum.com.br/fipe/api/v1/carros/marcas/${manufacturerCode}/modelos`
			);
			const data = await response.json();
			setVehiclesModels(data.modelos);
		} catch (error) {
			setFailed({ ...failed, model: true });
		} finally {
			setLoadingFetch(false);
		}
	};

	const fetchVehicleYears = async (
		manufacturerCode: string,
		modelCode: string
	) => {
		if (!modelCode) return;
		setLoadingFetch(true);
		try {
			const response = await fetch(
				`https://parallelum.com.br/fipe/api/v1/carros/marcas/${manufacturerCode}/modelos/${modelCode}/anos`
			);
			const data = await response.json();

			const processedData = data
				.map((item: any) => ({
					...item,
					nome: item.nome.split(" ")[0],
				}))
				.filter(
					(item: any, index: any, self: any) =>
						index === self.findIndex((t: any) => t.nome === item.nome)
				);

			setVehicleYears(processedData);
		} catch (error) {
			setFailed({ ...failed, year: true });
		} finally {
			setLoadingFetch(false);
		}
	};

	const updateVehicle = async () => {
		if (!manufacturer || !carModel || !year || !initialKm || !licensePlate) {
			toast.error("Preencha todos os campos", {
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
			return;
		}
		setLoading(true);
		try {
			const updatedVehicle = {
				license_plate: licensePlate,
				manufacturer,
				car_model: carModel,
				year,
				initial_km: initialKm,
				vin,
			};

			await updateDoc(doc(db, "vehicles", vehicle.id), updatedVehicle);

			setVehicles((vehicles) =>
				vehicles.map((veh) =>
					veh.id === vehicle.id ? { ...veh, ...updatedVehicle } : veh
				)
			);

			onOpenChange();
		} catch (error) {
			toast.error("Erro ao atualizar veículo", {
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

	useEffect(() => {
		fetchVehiclesBrandsApi();
	}, []);

	useEffect(() => {
		if (manufacturer) {
			const selectedBrandCode = vehiclesBrands.find(
				(brand) => brand.nome === manufacturer
			)?.codigo;
			setSelectedBrand(selectedBrandCode || "");
		}
	}, [manufacturer, vehiclesBrands]);

	useEffect(() => {
		if (selectedBrand) {
			fetchVehiclesModelsApi(selectedBrand);
		}
	}, [selectedBrand]);

	useEffect(() => {
		if (carModel) {
			const selectedModelCode = vehiclesModels.find(
				(model) => model.nome === carModel
			)?.codigo;
			setSelectedModel(selectedModelCode || "");
		}
	}, [carModel, vehiclesModels]);

	useEffect(() => {
		if (selectedModel) {
			fetchVehicleYears(selectedBrand || "", selectedModel);
		}
	}, [selectedModel, selectedBrand]);

	useEffect(() => {
		if (year) {
			setSelectedModel(vehicleYears.find((yr) => yr.nome === year)?.nome || "");
		}
	}, [year, vehicleYears]);

	return (
		<>
			<Button
				color="success"
				className={styles.addVehicleBtn}
				onClick={onOpen}
			>
				Editar carro
			</Button>
			<Modal
				isOpen={isOpen}
				className={styles.modal}
				size="2xl"
				scrollBehavior="outside"
				onOpenChange={onOpenChange}
			>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader
								className={clsx("flex flex-col gap-1", styles.modalTitle)}
							>
								{vehicle.car_model} - {vehicle.license_plate}
							</ModalHeader>
							<ModalBody className="text-white">
								<div className={clsx(styles.form, "flex flex-col gap-4")}>
									<Input
										type="text"
										label="Placa"
										value={licensePlate}
										onChange={(e) => setLicensePlate(e.target.value)}
										variant="bordered"
										className="dark"
										classNames={{
											input: ["bg-transparent text-white"],
											inputWrapper: [
												"border border-2 !border-white focus:border-white",
											],
										}}
									/>
									<div className="flex gap-5">
										{failed.brand ? (
											<Input
												type="text"
												label="Marca"
												value={manufacturer}
												onChange={(e) => setManufacturer(e.target.value)}
												variant="bordered"
												className="dark"
												classNames={{
													input: ["bg-transparent text-white"],
													inputWrapper: [
														"border border-2 !border-white focus:border-white",
													],
												}}
											/>
										) : (
											<Autocomplete
												label="Marca"
												variant="bordered"
												className="dark"
												onKeyDown={(e: any) => e.continuePropagation()}
												onSelectionChange={(key) => {
													setSelectedBrand(
														vehiclesBrands.find(
															(brand) => brand.nome == key.toString()
														)?.codigo || ""
													);
													setManufacturer(key.toString() || "");
												}}
												selectedKey={manufacturer}
											>
												{vehiclesBrands.map((brand) => (
													<AutocompleteItem
														value={brand.nome}
														key={brand.nome}
													>
														{brand.nome}
													</AutocompleteItem>
												))}
											</Autocomplete>
										)}
										{failed.model ? (
											<Input
												type="text"
												label="Modelo"
												value={carModel}
												onChange={(e) => setCarModel(e.target.value)}
												variant="bordered"
												className="dark"
												classNames={{
													input: ["bg-transparent text-white"],
													inputWrapper: [
														"border border-2 !border-white focus:border-white",
													],
												}}
											/>
										) : (
											<Autocomplete
												label="Modelo"
												variant="bordered"
												className="dark"
												onKeyDown={(e: any) => e.continuePropagation()}
												onSelectionChange={(key) => {
													setSelectedModel(
														vehiclesModels.find(
															(model) => model.nome == key.toString()
														)?.codigo || ""
													);
													setCarModel(key.toString() || "");
												}}
												disabled={!manufacturer}
												selectedKey={carModel}
											>
												{vehiclesModels.map((model) => (
													<AutocompleteItem
														value={model.nome}
														key={model.nome}
													>
														{model.nome}
													</AutocompleteItem>
												))}
											</Autocomplete>
										)}
									</div>
									<div className="flex gap-5">
										{failed.year ? (
											<Input
												type="number"
												min={1900}
												max={2100}
												label="Ano"
												value={year}
												onChange={(e) => setYear(e.target.value)}
												variant="bordered"
												className="dark"
												classNames={{
													input: ["bg-transparent text-white"],
													inputWrapper: [
														"border border-2 !border-white focus:border-white",
													],
												}}
											/>
										) : (
											<Autocomplete
												label="Ano"
												variant="bordered"
												className="dark"
												onSelectionChange={(key) =>
													setYear(key ? key.toString() : "")
												}
												disabled={!manufacturer || !carModel}
												selectedKey={year}
												onKeyDown={(e: any) => e.continuePropagation()}
											>
												{vehicleYears.map((yearItem) => (
													<AutocompleteItem
														value={yearItem.nome}
														key={yearItem.nome}
													>
														{yearItem.nome}
													</AutocompleteItem>
												))}
											</Autocomplete>
										)}
										<Input
											type="text"
											label="Chassi"
											value={vin}
											onChange={(e) => setVin(e.target.value)}
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
									<Input
										type="number"
										min={0}
										label="Odômetro"
										value={initialKm.toString()}
										onChange={(e) => setInitialKm(Number(e.target.value))}
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
							</ModalBody>
							<ModalFooter>
								<Button
									color="default"
									variant="light"
									className="rounded-full px-5 text-white"
									onClick={onClose}
								>
									Cancelar
								</Button>
								<Button
									color="success"
									className={styles.modalButton}
									onClick={updateVehicle}
									disabled={loading}
								>
									Salvar
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
}
