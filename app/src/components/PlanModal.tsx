import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useContext, useState, useEffect } from "react";
import { collection, addDoc, updateDoc, getDoc, doc, deleteDoc } from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";
import { toast, Zoom } from "react-toastify";
import { FaAngleDoubleDown, FaClipboard, FaClipboardList } from "react-icons/fa";
import { Contract } from "@/interfaces/contract.type";
import { Workshop } from "@/interfaces/workshop.type";
import { useMemo } from "react";
import { Input } from "./ui/input";

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshopId: string;
}

export default function PlanModal({
  isOpen,
  onClose,
  workshopId,
}: PlanModalProps) {
  const { db } = useContext(AuthContext);
  const [maxAlarmsPerVehicle, setMaxAlarmsPerVehicle] = useState<number>(0);
  const [maxDrivers, setMaxDrivers] = useState<number>(0);
  const [maxMaintenanceAlarmsPerUser, setMaxMaintenanceAlarmsPerUser] =
    useState<number>(0);
  const [maxVehiclesPerDriver, setMaxVehiclesPerDriver] = useState<number>(0);
  const [userDateLimitAlarm, setUserDateLimitAlarm] = useState<number>(0);
  const [userKmLimitAlarm, setUserKmLimitAlarm] = useState<number>(0);
  const [workshopDateLimitAlarm, setWorkshopDateLimitAlarm] =
    useState<number>(0);
  const [workshopKmLimitAlarm, setWorkshopKmLimitAlarm] = useState<number>(0);
  const [workshopScheduleLimit, setWorkshopScheduleLimit] = useState<number>(0);
  const [contractId, setContractId] = useState<string>("");
  const [canSend, setCanSend] = useState<boolean>(false);
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    const getContract = async () => {
      const workshopRef = doc(db, "workshops", workshopId);
      const workshop = await getDoc(workshopRef);
      const workshopData = workshop.data() as Workshop;
      if (workshopData?.contract) {
        setContractId(workshopData.contract as string);
      }
    };
    getContract();
  }),
    [];

  useEffect(() => {
    const fetchContractData = async () => {
      if (!contractId) return;
      const contractRef = doc(db, "contracts", contractId);
      const contract = await getDoc(contractRef);
      setContract(contract.data() as Contract);
    };
    fetchContractData();
  }, [contractId]);

  useEffect(() => {
    if (contract) {
      setMaxAlarmsPerVehicle(contract.maxAlarmsPerVehicle);
      setMaxDrivers(contract.maxDrivers);
      setMaxMaintenanceAlarmsPerUser(contract.maxMaintenanceAlarmsPerUser);
      setMaxVehiclesPerDriver(contract.maxVehiclesPerDriver);
      setUserDateLimitAlarm(contract.userDateLimitAlarm);
      setUserKmLimitAlarm(contract.userKmLimitAlarm);
      setWorkshopDateLimitAlarm(contract.workshopDateLimitAlarm);
      setWorkshopKmLimitAlarm(contract.workshopKmLimitAlarm);
      setWorkshopScheduleLimit(contract.workshopScheduleLimit);
    }
  }, [contract]);

  useEffect(() => {
    if (
      maxAlarmsPerVehicle &&
      maxDrivers &&
      maxMaintenanceAlarmsPerUser &&
      maxVehiclesPerDriver &&
      userDateLimitAlarm &&
      userKmLimitAlarm &&
      workshopDateLimitAlarm &&
      workshopKmLimitAlarm &&
      workshopScheduleLimit &&
      contractId
    )
      setCanSend(true);
    else setCanSend(false);
  }, [
    maxAlarmsPerVehicle,
    maxDrivers,
    maxMaintenanceAlarmsPerUser,
    maxVehiclesPerDriver,
    userDateLimitAlarm,
    userKmLimitAlarm,
    workshopDateLimitAlarm,
    workshopKmLimitAlarm,
    workshopScheduleLimit,
    contractId,
  ]);

  const updateContract = async () => {
    if (
      !maxAlarmsPerVehicle ||
      !maxDrivers ||
      !maxMaintenanceAlarmsPerUser ||
      !maxVehiclesPerDriver ||
      !userDateLimitAlarm ||
      !userKmLimitAlarm ||
      !workshopDateLimitAlarm ||
      !workshopKmLimitAlarm ||
      !workshopScheduleLimit
    ) {
      toast.error("Por favor, reencha todos os campos", {
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

    try {
      const premiumContract = {
        freemiumPeriod: 0,
        maxAlarmsPerVehicle,
        maxDrivers,
        maxMaintenanceAlarmsPerUser,
        maxVehiclesPerDriver,
        userDateLimitAlarm,
        userKmLimitAlarm,
        workshopDateLimitAlarm,
        workshopKmLimitAlarm,
        workshopScheduleLimit,
      } as Contract;

      if (contractId === "basic") {
        const contractRef = await addDoc(collection(db, "contracts"), {
          ...premiumContract,
        });
        setContractId(contractRef.id);
        updateDoc(contractRef, { id: contractRef.id });
        const workshopRef = doc(db, "workshops", workshopId);
        await updateDoc(workshopRef, { contract: contractRef.id });
      } else {
        const contractRef = doc(db, "contracts", contractId);
        await updateDoc(contractRef, { ...premiumContract });
      }

      toast.success("Contrato atualizado com sucesso", {
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
      onClose();
    } catch (error) {
      console.error("Error updating contract: ", error);
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
    }
  };

  const downgradeToBasic = async () => {
    try {
      if (contractId !== "basic") {
        const contractRef = doc(db, "contracts", contractId);
        await deleteDoc(contractRef);
        const workshopRef = doc(db, "workshops", workshopId);
        await updateDoc(workshopRef, { contract: "basic" });
        setContractId("basic");
        toast.success("Contrato atualizado com sucesso", {
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
        onClose();
      }
    } catch (error) {
      console.error("Error updating contract: ", error);
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
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="outside"
    >
      <ModalContent className="bg-black border-2 border-slate-300 text-white">
        <ModalHeader>
          <div className="flex flex-col gap-1">Alterar Plano</div>
        </ModalHeader>
        <ModalBody className="flex flex-row justify-end gap-14 w-full">
          <div className="flex flex-col gap-2 justify-between w-full">
            <div className="w-full flex flex-row justify-between">
              <div className="flex flex-col">
                <label className="text-white text-sm font-medium">
                  Máximo de Alarmes por Motorista:
                </label>
                <Input
                  type="text"
                  value={maxAlarmsPerVehicle.toString()}
                  onChange={(e) =>
                    setMaxAlarmsPerVehicle(parseInt(e.target.value) || 0)
                  }
                  className="rounded-2xl w-96"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-white text-sm font-medium">
                  Máximo de Motoristas:
                </label>
                <Input
                  type="text"
                  value={maxDrivers.toString()}
                  onChange={(e) => setMaxDrivers(parseInt(e.target.value) || 0)}
                  className="rounded-2xl w-96"
                />
              </div>
            </div>

            <div className="w-full flex flex-row justify-between">
              <div className="flex flex-col">
                <label className="text-white text-sm font-medium">
                  Máximo de Alarmes de Manutenção por Usuário
                </label>
                <Input
                  type="text"
                  value={maxMaintenanceAlarmsPerUser.toString()}
                  onChange={(e) =>
                    setMaxMaintenanceAlarmsPerUser(
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="rounded-2xl w-96"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-white text-sm font-medium">
                  Máximo de Veículos por Motorista
                </label>
                <Input
                  type="text"
                  value={maxVehiclesPerDriver.toString()}
                  onChange={(e) =>
                    setMaxVehiclesPerDriver(parseInt(e.target.value) || 0)
                  }
                  className="rounded-2xl w-96"
                />
              </div>
            </div>

            <div className="w-full flex flex-row justify-between">
              <div className="flex flex-col">
                <label className="text-white text-sm font-medium">
                  Limite de Data por Usuário
                </label>
                <Input
                  type="text"
                  value={userDateLimitAlarm.toString()}
                  onChange={(e) =>
                    setUserDateLimitAlarm(parseInt(e.target.value) || 0)
                  }
                  className="rounded-2xl w-96"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-white text-sm font-medium">
                  Limite de Km por Usuário
                </label>
                <Input
                  type="text"
                  value={userKmLimitAlarm.toString()}
                  onChange={(e) =>
                    setUserKmLimitAlarm(parseInt(e.target.value) || 0)
                  }
                  className="rounded-2xl w-96"
                />
              </div>
            </div>

            <div className="w-full flex flex-row justify-between">
              <div className="flex flex-col">
                <label className="text-white text-sm font-medium">
                  Limite de Data por Oficina
                </label>
                <Input
                  type="text"
                  value={workshopDateLimitAlarm.toString()}
                  onChange={(e) =>
                    setWorkshopDateLimitAlarm(parseInt(e.target.value) || 0)
                  }
                  className="rounded-2xl w-96"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-white text-sm font-medium">
                  Limite de Km por Oficina
                </label>
                <Input
                  type="text"
                  value={workshopKmLimitAlarm.toString()}
                  onChange={(e) =>
                    setWorkshopKmLimitAlarm(parseInt(e.target.value) || 0)
                  }
                  className="rounded-2xl w-96"
                />
              </div>
            </div>

            <div className="w-full flex flex-row justify-center">
              <div className="flex flex-col">
                <label className="text-white text-sm font-medium">
                  Limite de Agendamento por Oficina
                </label>
                <Input
                  type="text"
                  value={workshopScheduleLimit.toString()}
                  onChange={(e) =>
                    setWorkshopScheduleLimit(parseInt(e.target.value) || 0)
                  }
                  className="rounded-2xl w-96"
                />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-center mt-4">
          <Button
            className={`flex flex-row py-4 px-14 text-xl transition duration-300 rounded-xl
                ${
                  canSend
                    ? "text-white bg-gradient-to-b from-[#209730] to-[#056011] cursor-pointer"
                    : "cursor-not-allowed opacity-70 bg-gradient-to-b from-slate-500 to-slate-600 text-black"
                } 
              `}
            onClick={updateContract}
            disabled={!canSend}
          >
            <FaClipboardList size={20} />
            <p>Atualizar Contrato</p>
          </Button>
          {contractId !== "basic" && (
            <Button
              className={`flex flex-row py-4 px-14 text-xl transition duration-300 rounded-xl
                text-white bg-gradient-to-b from-[#972020] to-[#600505] cursor-pointer      
              `}
              onClick={downgradeToBasic}
            >
              <FaAngleDoubleDown size={20} />
              <p>Mudar Para Básico</p>
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
