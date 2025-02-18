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
import BrandAutocomplete from "@/components/BrandAutocomplete";
import ModelAutocomplete from "@/components/ModelAutocomplete";
import YearAutocomplete from "@/components/YearAutocomplete";

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

      let processedData = data
        .map((item: any) => ({
          ...item,
          nome: item.nome.split(" ")[0],
        }))
        .filter(
          (item: any, index: any, self: any) =>
            index === self.findIndex((t: any) => t.nome === item.nome)
        );

      const currentYear = new Date().getFullYear();
      processedData = processedData.filter(
        (item: any) => Number(item.nome) <= currentYear
      );

      setVehicleYears(processedData);
    } catch (error) {
      setFailed({ ...failed, year: true });
    } finally {
      setLoadingFetch(false);
    }
  };

  const updateVehicle = async () => {
    if (!manufacturer || !carModel || !year || !licensePlate) {
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
      setSelectedBrand(vehiclesBrands.find((brand) => brand.nome == manufacturer)?.codigo || "");
    }
  }, [manufacturer, vehiclesBrands]);

  useEffect(() => {
    if (selectedBrand) {
      fetchVehiclesModelsApi(selectedBrand);
    }
  }, [selectedBrand]);

  useEffect(() => {
    if (manufacturer === "" || !manufacturer) {
      setCarModel("");
      setVehiclesModels([]);
    }
  }, [manufacturer]);

  useEffect(() => {
    if (carModel) {
      const selectedModelCode = vehiclesModels.find(
        (model) => model.nome === carModel
      )?.codigo;
      setSelectedModel(selectedModelCode || "");
    } else {
      setYear("");
      setVehicleYears([]);
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
      <Button color="success" className={styles.addVehicleBtn} onClick={onOpen}>
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
                    <BrandAutocomplete
                      brandState={manufacturer}
                      options={vehiclesBrands}
                      onChange={(nome) => {
                        setManufacturer(nome);
                        const resultBrand =
                          vehiclesBrands.find((brand) => brand.nome == nome)
                            ?.codigo || "";
                        if (resultBrand === "") {
                          setVehiclesModels([]);
                          setCarModel("");
                        }
                        setSelectedBrand(resultBrand);
                      }}
                    />
                    <ModelAutocomplete
                      models={vehiclesModels}
                      modelState={carModel}
                      onChange={(model) => {
                        setCarModel(model);
                        setSelectedModel(
                          vehiclesModels.find((model) => model.nome == model)
                            ?.codigo || ""
                        );
                      }}
                      manufacturer={manufacturer}
                      loadingFetch={loadingFetch}
                    />
                  </div>
                  <div className="flex gap-5">
                    <YearAutocomplete
                      years={vehicleYears}
                      yearState={year}
                      manufacturer={manufacturer}
                      onChange={(year) => setYear(year)}
                      loadingFetch={loadingFetch}
                    />
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
