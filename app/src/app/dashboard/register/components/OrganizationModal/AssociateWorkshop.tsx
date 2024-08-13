import React, { useState, useContext } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import styles from "../../styles.module.scss";
import clsx from "clsx";
import { AuthContext } from "@/contexts/auth.context";
import { Workshop } from "@/interfaces/workshop.type";
import { updateDoc, doc } from "firebase/firestore";
import { Driver } from "@/interfaces/driver.type";
import { toast, Zoom } from "react-toastify";

interface Props {
  workshop: Workshop;
  setDrivers: React.Dispatch<React.SetStateAction<any[]>>;
  drivers: Driver[];
}

export default function AssociateWorkshop({ setDrivers, workshop, drivers }: Props) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { db } = useContext(AuthContext);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const associateDriver = async () => {
    if (!selectedDriver) return;

    if (selectedDriver.workshops && selectedDriver.workshops.length > 0) {
      toast.error("Motorista já possui uma organização associada", {
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
      const driverRef = doc(db, "clients", selectedDriver.id);
      await updateDoc(driverRef, { workshops: workshop.id });
      setDrivers((prevDrivers) => prevDrivers.map((d) => (d.id === selectedDriver.id ? { ...d, workshops: workshop.id } : d)));
      setSelectedDriver(null);
      onOpenChange();
    } catch (error) {
      toast.error("Erro ao associar motorista a organização", {
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
    <>
      <Button color="success" className={styles.addVehicleBtn} onPress={onOpen}>
        Associar usuário
      </Button>
      <Modal isOpen={isOpen} className={styles.modal} size={"lg"} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className={clsx("flex flex-col gap-1", styles.modalTitle)}>Associar usuário</ModalHeader>
              <ModalBody>
                <div className="max-h-[400px] overflow-auto flex flex-col gap-1 bg-[#030303] text-white p-2">
                  {drivers
                    .filter((driver) => !driver.workshops || driver.workshops.length === 0)
                    .map((driver) => (
                      <div
                        key={driver.id}
                        className={`w-full px-2 py-1 rounded-md cursor-pointer ${
                          selectedDriver && selectedDriver.id === driver.id ? "bg-[#209730]" : "hover:bg-neutral-800"
                        }`}
                        onClick={() => setSelectedDriver(driver)}
                      >
                        <p>{driver.name}</p>
                      </div>
                    ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose} className="!text-white rounded-full">
                  Cancelar
                </Button>
                <Button color="success" disabled={!selectedDriver} className={`${styles.modalButton}`} onPress={associateDriver}>
                  Associar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
