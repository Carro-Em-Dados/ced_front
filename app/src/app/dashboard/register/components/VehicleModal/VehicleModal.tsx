"use client";

import {
	Autocomplete,
	AutocompleteItem,
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	useDisclosure,
} from "@nextui-org/react";
import clsx from "clsx";
import styles from "../../styles.module.scss";
import { useContext, useEffect, useState } from "react";
import {
	addDoc,
	collection,
	query,
	where,
	getDocs,
	updateDoc,
	doc,
} from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";
import { toast, Zoom } from "react-toastify";

interface Props {
	ownerId: string;
	setVehicles: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function VehicleModal({ ownerId, setVehicles }: Props) {
	const { db } = useContext(AuthContext);
	const [manufacturer, setManufacturer] = useState<string>();
	const [carModel, setCarModel] = useState<string>();
	const [year, setYear] = useState<string>();
	const [initialKm, setInitialKm] = useState(0);
	const [licensePlate, setLicensePlate] = useState("");
	const [vin, setVin] = useState("");
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [vehiclesBrands, setVehiclesBrands] = useState<any[]>([]);
	const [vehiclesModels, setVehiclesModels] = useState<any[]>([]);
	const [vehicleYears, setVehicleYears] = useState<any[]>([]);
	const [loadingFetch, setLoadingFetch] = useState(true);
	const [selectedBrand, setSelectedBrand] = useState<string>();
	const [selectedModel, setSelectedModel] = useState<string>();
	const [selectedYear, setSelectedYear] = useState<string>();
	const [failed, setFailed] = useState({
		brand: false,
		model: false,
		year: false,
	});
	const [loading, setLoading] = useState(false);

	const addVehicle = async () => {
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
			const vehicle = {
				manufacturer,
				car_model: carModel,
				year,
				initial_km: initialKm,
				license_plate: licensePlate,
				vin,
				owner: ownerId,
			};

			const q = query(
				collection(db, "vehicles"),
				where("license_plate", "==", licensePlate)
			);
			const querySnapshot = await getDocs(q);

			if (!querySnapshot.empty) {
				const existingVehicleDoc = querySnapshot.docs[0];
				const existingVehicle = existingVehicleDoc.data();

				if (existingVehicle.owner) {
					toast.error(
						"Já existe um veículo com a mesma placa associado a um proprietário",
						{
							position: "bottom-right",
							autoClose: 5000,
							hideProgressBar: true,
							closeOnClick: true,
							pauseOnHover: true,
							draggable: true,
							progress: undefined,
							theme: "dark",
							transition: Zoom,
						}
					);
					return;
				}

				const updatedVehicle = {
					manufacturer: manufacturer || existingVehicle.manufacturer,
					car_model: carModel || existingVehicle.car_model,
					year: year || existingVehicle.year,
					initial_km: initialKm || existingVehicle.initial_km,
					license_plate: licensePlate,
					vin: vin || existingVehicle.vin,
					owner: ownerId,
				};

				await updateDoc(
					doc(db, "vehicles", existingVehicleDoc.id),
					updatedVehicle
				);

				setVehicles((vehicles) =>
					vehicles.map((veh) =>
						veh.id === existingVehicleDoc.id
							? { ...veh, ...updatedVehicle }
							: veh
					)
				);
				onOpenChange();
				return;
			}

			const docRef = await addDoc(collection(db, "vehicles"), vehicle);
			setVehicles((vehicles) => [...vehicles, { ...vehicle, id: docRef.id }]);
			onOpenChange();
		} catch (error) {
			toast.error("Erro ao adicionar veículo", {
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

	const queryVehicles = async () => {
		try {
			await fetchVehiclesBrandsApi();

			const q = query(
				collection(db, "vehicles"),
				where("license_plate", "==", licensePlate),
				where("owner", "==", "")
			);
			const querySnapshot = await getDocs(q);

			if (!querySnapshot.empty) {
				const doc = querySnapshot.docs[0];
				const vehicleData = doc.data();
				setManufacturer(vehicleData.manufacturer || "");
				setCarModel(vehicleData.car_model || "");
				setYear(vehicleData.year || "");
				setVin(vehicleData.vin || "");
				setInitialKm(vehicleData.initial_km || 0);
			} else {
				setManufacturer(undefined);
				setCarModel(undefined);
				setYear(undefined);
				setVin("");
				setInitialKm(0);
			}
		} catch (error) {
			toast.error("Erro ao buscar veículos", {
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
			setSelectedYear(vehicleYears.find((yr) => yr.nome === year)?.nome || "");
		}
	}, [year, vehicleYears]);

	return (
		<>
			<Button
				color="success"
				className={styles.addVehicleBtn}
				onClick={onOpen}
			>
				Adicionar carro
			</Button>
			<Modal
				isOpen={isOpen}
				className={styles.modal}
				size="2xl"
				onOpenChange={onOpenChange}
			>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader
								className={clsx("flex flex-col gap-1", styles.modalTitle)}
							>
								Adicionar carro
							</ModalHeader>
							<ModalBody className="text-white">
								<div className={clsx(styles.form, "flex flex-col gap-4")}>
									<div>
										<Input
											type="text"
											label="Placa"
											value={licensePlate}
											onChange={(e) => setLicensePlate(e.target.value)}
											onBlur={queryVehicles}
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
												disabled={loadingFetch}
												onSelectionChange={(key) => {
													const keyString = key ? key.toString() : "";
													setSelectedBrand(
														vehiclesBrands.find(
															(brand) => brand.nome == keyString
														)?.codigo || ""
													);
													setManufacturer(keyString || "");
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
													const keyString = key ? key.toString() : "";
													setSelectedModel(
														vehiclesModels.find(
															(model) => model.nome == keyString
														)?.codigo || ""
													);
													setSelectedModel(keyString || "");
												}}
												disabled={!manufacturer || loadingFetch}
												selectedKey={carModel}
											>
												{vehiclesModels?.map((models) => (
													<AutocompleteItem
														value={models.nome}
														key={models.nome}
													>
														{models.nome}
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
												onKeyDown={(e: any) => e.continuePropagation()}
												onSelectionChange={(key) => {
													const keyString = key ? key.toString() : "";
													setYear(keyString || "");
												}}
												disabled={!manufacturer || loadingFetch}
												selectedKey={year}
											>
												{vehicleYears.map((years) => (
													<AutocompleteItem
														value={years.nome}
														key={years.nome}
													>
														{years.nome}
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
									<div>
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
									onClick={addVehicle}
									disabled={loadingFetch || loading}
								>
									Adicionar
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
}
