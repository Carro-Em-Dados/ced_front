import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
  Tab,
  Tabs,
  useDisclosure,
} from "@nextui-org/react";
import clsx from "clsx";
import styles from "../../styles.module.scss";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/auth.context";
import { FaEye, FaRegEdit } from "react-icons/fa";
import { Vehicle } from "@/interfaces/vehicle.type";
import EditVehicleModal from "./EditVehicleModal";
import EraseModal, { DeleteModalTypes } from "../EraseModal/EraseModal";
import EcuLimits from "./EcuLimits";
import { defaultMaintenance } from "@/constants/defaultMaintenance";
import { collection, getDocs, addDoc, Timestamp, deleteDoc, doc, updateDoc, query, where } from "firebase/firestore";
import { FaRegTrashCan } from "react-icons/fa6";
import { Maintenance } from "@/interfaces/maintenances.type";
import { toast, Zoom } from "react-toastify";
import { Role } from "@/types/enums/role.enum";
import { WorkshopContext } from "@/contexts/workshop.context";

interface Props {
  vehicle: Vehicle;
  setVehicles: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function SeeVehicleModal({ vehicle, setVehicles }: Props) {
  const { db, currentWorkshop, currentUser } = useContext(AuthContext);
  const { workshopInView } = useContext(WorkshopContext);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [maintenancesDeleting, setMaintenancesDeleting] = useState<Maintenance[]>([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const workshop = currentUser?.role === Role.ORGANIZATION ? workshopInView : currentWorkshop;

  const fetchMaintenances = async () => {
    try {
      if (!workshop?.id && currentUser?.role !== Role.MASTER) return;

      const maintenanceCollection = collection(db, "maintenances");

      const queryParams = [where("car_id", "==", vehicle.id)];
      if (currentUser?.role !== Role.MASTER) queryParams.push(where("workshop", "==", workshop?.id));

      const q = query(maintenanceCollection, ...queryParams);
      const querySnapshot = await getDocs(q);
      const maintenanceData: Maintenance[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        maintenanceData.push({
          id: doc.id,
          ...data,
          dateLimit: data?.dateLimit?.toDate() || null,
        } as Maintenance);
      });
      setMaintenances(maintenanceData);
    } catch (error) {
      console.log("error:", error);
      toast.error("Erro ao buscar manutenções", {
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
    fetchMaintenances();
  }, []);

  const addMaintenance = () => {
    if (!workshop) return;
    if (!workshop.contract) return;
    if (maintenances.length >= workshop?.contract?.maxAlarmsPerVehicle!) return;
    const newMaintenance: Maintenance = {
      service: "",
      workshop: workshop!.id,
      date: Timestamp.now(),
      price: 0,
      car_id: vehicle.id,
      kmLimit: 0,
      dateLimit: new Date(),
    };
    setMaintenances([...maintenances, newMaintenance]);
  };

  const updateMaintenance = (index: number, field: keyof Maintenance, value: any) => {
    console.log("field:", field);
    console.log("value:", value);
    const updatedMaintenances = [...maintenances];
    updatedMaintenances[index] = {
      ...updatedMaintenances[index],
      [field]: value,
    };
    setMaintenances(updatedMaintenances);
  };

  const saveMaintenancesOnDb = async () => {
    try {
      const existingMaintenancesSnapshot = await getDocs(collection(db, "maintenances"));
      const existingMaintenances: Maintenance[] = [];
      existingMaintenancesSnapshot.forEach((doc) => {
        if (doc.data().car_id === vehicle.id) {
          existingMaintenances.push({
            id: doc.id,
            ...doc.data(),
          } as Maintenance);
        }
      });

      const deletions = maintenancesDeleting.map((m) => {
        if (m.id) {
          return deleteDoc(doc(db, "maintenances", m.id));
        }
        return Promise.resolve();
      });

      const upserts = maintenances.map((maintenance) => {
        const maintenanceData = {
          ...maintenance,
          dateLimit: Timestamp.fromDate(maintenance.dateLimit),
        };

        if (maintenance.id) {
          return updateDoc(doc(db, "maintenances", maintenance.id), maintenanceData);
        } else {
          return addDoc(collection(db, "maintenances"), maintenanceData);
        }
      });

      await Promise.all([...deletions, ...upserts]);

      setMaintenancesDeleting([]);

      toast.success("Manutenções atualizadas com sucesso", {
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
      toast.error("Erro ao atualizar manutenções", {
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

  const deleteMaintenance = (index: number) => {
    setMaintenances(maintenances.filter((_, i) => i !== index));
    setMaintenancesDeleting([...maintenancesDeleting, maintenances[index]]);
  };

  return (
    <>
      <button color="success" onClick={onOpen}>
        <FaEye />
      </button>
      <Modal isOpen={isOpen} className={styles.modal} size="2xl" scrollBehavior="outside" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className={clsx("flex flex-col gap-1", styles.modalTitle)}>
                {vehicle.car_model} - {vehicle.license_plate}
              </ModalHeader>
              <ModalBody className="text-white">
                <Tabs aria-label="config-tabs" className={`${styles.tabs} !text-xs !m-0`}>
                  <Tab className={`${styles.tabButton} !p-0`} key="info" title="Informações">
                    <div className="flex flex-col gap-2 text-sm">
                      <p>
                        Placa: <span>{vehicle.license_plate}</span>
                      </p>
                      <p>
                        Marca: <span>{vehicle.car_model}</span>
                      </p>
                      <p>
                        Ano de fabricação: <span>{vehicle.year}</span>
                      </p>
                      <p>
                        Chassi: <span>{vehicle.vin}</span>
                      </p>
                      <p>
                        Odômetro: <span>{vehicle.initial_km}</span>
                      </p>
                      <div className="flex gap-2 mt-5">
                        <EraseModal id={vehicle.id} type={DeleteModalTypes.vehicle} name={vehicle.car_model} state={setVehicles} />
                        <EditVehicleModal vehicle={vehicle} setVehicles={setVehicles} />
                      </div>
                    </div>
                  </Tab>
                  <Tab className={`${styles.tabButton} !p-0`} key="alarms" title="Manutenções">
                    <div className="flex flex-col gap-5 justify-between w-full">
                      {maintenances?.map((maintenance, index) => (
                        <div className="grid grid-cols-12 gap-2 items-center" key={`${maintenance.id} ${index}`}>
                          <Select
                            variant="bordered"
                            className="dark text-white col-span-5"
                            classNames={{
                              trigger: "!border-white rounded-medium",
                              value: "text-white",
                            }}
                            aria-label="maintenance"
                            defaultSelectedKeys={[maintenance.service]}
                            onChange={(e) => updateMaintenance(index, "service", e.target.value)}
                          >
                            {defaultMaintenance.map((maintenance) => (
                              <SelectItem key={maintenance} value={maintenance}>
                                {maintenance}
                              </SelectItem>
                            ))}
                          </Select>
                          <Input
                            type="number"
                            min={0}
                            label="KM Limite"
                            value={maintenance.kmLimit.toString()}
                            onChange={(e) => updateMaintenance(index, "kmLimit", Number(e.target.value))}
                            variant="bordered"
                            className="dark col-span-2"
                            classNames={{
                              input: ["bg-transparent text-white"],
                              inputWrapper: ["border border-2 !border-white focus:border-white"],
                            }}
                          />
                          <Input
                            type="date"
                            min={0}
                            label="Data Limite"
                            value={maintenance?.dateLimit instanceof Date ? maintenance.dateLimit.toISOString().split("T")[0] : ""}
                            onChange={(e) => updateMaintenance(index, "dateLimit", new Date(e.target.value + "T00:00:00"))}
                            variant="bordered"
                            className="dark col-span-2"
                            classNames={{
                              input: ["bg-transparent text-white"],
                              inputWrapper: ["border border-2 !border-white focus:border-white"],
                            }}
                          />
                          <Input
                            type="number"
                            min={0}
                            label="Valor"
                            value={maintenance.price.toString()}
                            onChange={(e) => updateMaintenance(index, "price", Number(e.target.value))}
                            variant="bordered"
                            className="dark col-span-2"
                            classNames={{
                              input: ["bg-transparent text-white"],
                              inputWrapper: ["border border-2 !border-white focus:border-white"],
                            }}
                            startContent={
                              <div className="pointer-events-none flex items-center">
                                <span className="text-default-400 text-small">R$</span>
                              </div>
                            }
                          />
                          <button
                            className="col-span-1 h-full w-auto flex items-center justify-center p-2 rounded-full hover:bg-white/10"
                            onClick={() => deleteMaintenance(index)}
                          >
                            <FaRegTrashCan />
                          </button>
                        </div>
                      ))}
                      <Button type="button" className={clsx(styles.addVehicleBtn, "w-fit")} onClick={addMaintenance}>
                        <FaRegEdit /> Adicionar manutenção
                      </Button>
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-sm">
                          {workshop?.contract?.maxAlarmsPerVehicle !== undefined
                            ? workshop.contract.maxAlarmsPerVehicle - maintenances.length
                            : 0}{" "}
                          alarmes restantes
                        </p>
                        <Button type="button" className={styles.addVehicleBtn} onClick={saveMaintenancesOnDb}>
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </Tab>
                  <Tab className={`${styles.tabButton} !p-0`} key="ecu" title="Limites ECU">
                    <EcuLimits id={vehicle.id} />
                  </Tab>
                </Tabs>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
