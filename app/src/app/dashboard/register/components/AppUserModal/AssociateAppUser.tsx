import React, { useState, useContext, useEffect } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import styles from "../../styles.module.scss";
import clsx from "clsx";
import { AuthContext } from "@/contexts/auth.context";
import { Workshop } from "@/interfaces/workshop.type";
import { Driver } from "@/interfaces/driver.type";
import {
  updateDoc,
  doc,
  getDoc,
  collection,
  query,
  getDocs,
  where,
} from "firebase/firestore";
import { toast, Zoom } from "react-toastify";
import { Vehicle } from "@/interfaces/vehicle.type";
import { get } from "http";
import { Role } from "@/types/enums/role.enum";
import { AppUser } from "@/interfaces/appUser.type";

interface Props {
  appUser: AppUser;
  setAppUsers: React.Dispatch<React.SetStateAction<any[]>>;
  workshops: Workshop[];
}

export default function AssociateAppUser({
  setAppUsers,
  workshops,
  appUser,
}: Props) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { db } = useContext(AuthContext);
  const [workshop, setWorkshop] = useState(appUser?.preferred_workshop || "");
  const [loading, setLoading] = useState(false);
  const { currentWorkshop, currentUser } = useContext(AuthContext);

  useEffect(() => {
    setWorkshop(appUser?.preferred_workshop || "");
  }, [appUser]);

  const moveAllSchedulesFromAppUser = async (
    driverId: string,
    workshopId: string
  ) => {
    const schedulesRef = collection(db, "schedules");
    const q = query(schedulesRef, where("driver", "==", driverId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, { workshop: workshopId });
    });
  };

  const moveAllMaintenancesFromVehicle = async (
    vehicleId: string,
    workshopId: string
  ) => {
    const maintenancesRef = collection(db, "maintenances");
    const q = query(maintenancesRef, where("car_id", "==", vehicleId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, { workshop: workshopId });
    });
  };

  const getAllVehiclesFromAppUser = async (driverId: string) => {
    const vehiclesRef = collection(db, "vehicles");
    const q = query(vehiclesRef, where("owner", "==", driverId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...(doc.data() as Vehicle),
      id: doc.id,
    }));
  };

  const associateAppUser = async () => {
    setLoading(true);
    const appUserRef = doc(db, "appUsers", appUser.id);
    try {
      await updateDoc(appUserRef, { preferred_workshop: workshop });
      setAppUsers((prevAppUser) =>
        prevAppUser.map((a) =>
          a.id === appUser.id ? { ...a, preferred_workshop: workshop } : a
        )
      );
      setWorkshop("");
      onOpenChange();
    } catch (error) {
      toast.error("Erro ao associar motorista a oficina", {
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
    <>
      <Button color="success" className={styles.addVehicleBtn} onClick={onOpen}>
        Associar oficina
      </Button>
      <Modal
        isOpen={isOpen}
        className={styles.modal}
        size={"lg"}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader
                className={clsx("flex flex-col gap-1", styles.modalTitle)}
              >
                Associar oficina
              </ModalHeader>
              <ModalBody>
                <div className="max-h-[400px] overflow-auto flex flex-col gap-1 bg-[#030303] text-white p-2">
                  {currentUser?.role !== Role.MASTER && (
                    <div
                      className={`w-full px-2 py-1 rounded-md cursor-pointer ${
                        workshop === process.env.NEXT_PUBLIC_VIRTUAL_WORKSHOP_ID
                          ? "bg-[#209730]"
                          : "hover:bg-neutral-800"
                      }`}
                      onClick={() =>
                        setWorkshop(
                          process.env.NEXT_PUBLIC_VIRTUAL_WORKSHOP_ID!
                        )
                      }
                    >
                      <p>Nenhuma</p>
                    </div>
                  )}
                  {workshops.map((w) => (
                    <div
                      key={w.id}
                      className={`w-full px-2 py-1 rounded-md cursor-pointer ${
                        w.id === workshop
                          ? "bg-[#209730]"
                          : "hover:bg-neutral-800"
                      }`}
                      onClick={() => setWorkshop(w.id)}
                    >
                      <p>{w.company_name}</p>
                    </div>
                  ))}
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
                  disabled={loading}
                  className={`${styles.modalButton}`}
                  onClick={associateAppUser}
                >
                  {workshop === "" ? "Desassociar" : "Associar"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
