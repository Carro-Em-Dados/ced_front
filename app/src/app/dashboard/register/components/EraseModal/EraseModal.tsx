import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import clsx from "clsx";
import styles from "../../styles.module.scss";
import { FaRegTrashAlt } from "react-icons/fa";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/auth.context";
import {
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
  collection,
  getDocs,
  where,
  query,
} from "firebase/firestore";
import { toast, Zoom } from "react-toastify";
import { deleteUser } from "@/services/firebase-admin";
import { Role } from "@/types/enums/role.enum";

export enum DeleteModalTypes {
  driver = "driver",
  user = "user",
  organization = "organization",
  vehicle = "vehicle",
  appUser = "appUser",
}

interface Props {
  id: string;
  type: DeleteModalTypes;
  name: string;
  state: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function EraseModal({ id, type, name, state }: Props) {
  const { db, currentUser } = useContext(AuthContext);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [showTrash, setShowTrash] = useState(true);

  useEffect(() => {
    if (type === DeleteModalTypes.vehicle) {
      const fetchVehicle = async () => {
        const vehicleRef = doc(db, "vehicles", id);
        const vehicleData = (await getDoc(vehicleRef)).data();

        if (vehicleData?.owner === process.env.NEXT_PUBLIC_VIRTUAL_DRIVER_ID) {
          setShowTrash(false);
        }
      };

      fetchVehicle();
    }
  }, []);

  const moveAllSchedulesFromDriver = async (driverId: string) => {
    const schedulesRef = collection(db, "schedules");
    const q = query(schedulesRef, where("driver", "==", driverId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        workshop: process.env.NEXT_PUBLIC_VIRTUAL_WORKSHOP_ID,
      });
    });
  };

  const moveAllMaintenancesFromVehicle = async (vehicleId: string) => {
    const maintenancesRef = collection(db, "maintenances");
    const q = query(maintenancesRef, where("car_id", "==", vehicleId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        workshop: process.env.NEXT_PUBLIC_VIRTUAL_WORKSHOP_ID,
      });
    });
  };

  const moveClientToVirtualWorkshop = async (clientId: string) => {
    const vehiclesRef = collection(db, "vehicles");
    const q = query(vehiclesRef, where("owner", "==", clientId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      moveAllMaintenancesFromVehicle(doc.id);
    });

    moveAllSchedulesFromDriver(clientId);

    const clientRef = doc(collection(db, "clients"), clientId);
    await updateDoc(clientRef, {
      workshops: process.env.NEXT_PUBLIC_VIRTUAL_WORKSHOP_ID,
    });
  };

  const handleDeleteUser = async (userId: string) => {
    const userRef = doc(db, "users", userId);
    const userData = (await getDoc(userRef)).data();

    if (userData?.role === Role.ORGANIZATION) {
      const workshopsRef = collection(db, "workshops");
      const q = query(workshopsRef, where("owner", "==", userId));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (docWorkshop) => {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("workshops", "==", docWorkshop.id));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(async (docUser) => {
          const docData = docUser.data();
          // delete all basic users from the workshop
          if (docData.role === Role.USER) {
            await deleteUser(docUser.id);
            await deleteDoc(docUser.ref);
          }

          // transfer clients, appUsers, schedules and maintenances to the virtual workshop
          const maintenancesRef = query(
            collection(db, "maintenances"),
            where("workshop", "==", docWorkshop.id)
          );
          const schedulesRef = query(
            collection(db, "schedules"),
            where("workshop", "==", docWorkshop.id)
          );
          const clientsRef = query(
            collection(db, "clients"),
            where("workshops", "==", docWorkshop.id)
          );
          const appUsersRef = query(
            collection(db, "appUsers"),
            where("preferred_workshop", "==", docWorkshop.id)
          );

          const [
            maintenancesSnapshot,
            schedulesSnapshot,
            clientsSnapshot,
            appUsersSnapshot,
          ] = await Promise.all([
            getDocs(maintenancesRef),
            getDocs(schedulesRef),
            getDocs(clientsRef),
            getDocs(appUsersRef),
          ]);

          maintenancesSnapshot.forEach(async (doc) => {
            await updateDoc(doc.ref, {
              workshop: process.env.NEXT_PUBLIC_VIRTUAL_WORKSHOP_ID,
            });
          });

          schedulesSnapshot.forEach(async (doc) => {
            await updateDoc(doc.ref, {
              workshop: process.env.NEXT_PUBLIC_VIRTUAL_WORKSHOP_ID,
            });
          });

          clientsSnapshot.forEach(async (doc) => {
            await updateDoc(doc.ref, {
              workshops: process.env.NEXT_PUBLIC_VIRTUAL_WORKSHOP_ID,
            });
          });

          appUsersSnapshot.forEach(async (doc) => {
            await updateDoc(doc.ref, {
              preferred_workshop: process.env.NEXT_PUBLIC_VIRTUAL_WORKSHOP_ID,
            });
          });
        });
        await deleteDoc(docWorkshop.ref);
      });
      // delete login info
      deleteUser(userId);
    } else {
      toast.error("Erro ao deletar usuário", {
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

  const moveAllSchedulesFromVehicle = async (
    vehicleId: string,
    driverId: string,
    maintenanceId: string
  ) => {
    const schedulesRef = collection(db, "schedules");
    const q = query(schedulesRef, where("vehicle", "==", vehicleId), where("maintenance", "==", maintenanceId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return;
    }

    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        driver: driverId,
        maintenance: maintenanceId,
      });
    });
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    const maintenancesRef = collection(db, "maintenances");
    const q = query(maintenancesRef, where("car_id", "==", vehicleId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        workshop: process.env.NEXT_PUBLIC_VIRTUAL_WORKSHOP_ID,
      });
      moveAllSchedulesFromVehicle(vehicleId, process.env.NEXT_PUBLIC_VIRTUAL_DRIVER_ID!, doc.id);
    });

    const vehicleRef = doc(db, "vehicles", vehicleId);
    await updateDoc(vehicleRef, {
      owner: process.env.NEXT_PUBLIC_VIRTUAL_DRIVER_ID,
    });
  };

  const handleDeleteWorkshop = async (workshopId: string) => {
    const usersRef = query(
      collection(db, "users"),
      where("workshops", "==", workshopId), where("role", "==", Role.USER)
    )

    // transfer clients, appUsers, schedules and maintenances to the virtual workshop)
    const maintenancesRef = query(
      collection(db, "maintenances"),
      where("workshop", "==", workshopId)
    );
    const schedulesRef = query(
      collection(db, "schedules"),
      where("workshop", "==", workshopId)
    );
    const clientsRef = query(
      collection(db, "clients"),
      where("workshops", "==", workshopId)
    );
    const appUsersRef = query(
      collection(db, "appUsers"),
      where("preferred_workshop", "==", workshopId)
    );

    const [
      maintenancesSnapshot,
      schedulesSnapshot,
      clientsSnapshot,
      appUsersSnapshot,
      usersSnapshot
    ] = await Promise.all([
      getDocs(maintenancesRef),
      getDocs(schedulesRef),
      getDocs(clientsRef),
      getDocs(appUsersRef),
      getDocs(usersRef)
    ]);

    maintenancesSnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        workshop: process.env.NEXT_PUBLIC_VIRTUAL_WORKSHOP_ID,
      });
    });

    schedulesSnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        workshop: process.env.NEXT_PUBLIC_VIRTUAL_WORKSHOP_ID,
      });
    });

    clientsSnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        workshops: process.env.NEXT_PUBLIC_VIRTUAL_WORKSHOP_ID,
      });
    });

    appUsersSnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        preferred_workshop: process.env.NEXT_PUBLIC_VIRTUAL_WORKSHOP_ID,
      });
    });

    usersSnapshot.forEach(async (doc) => {
      await deleteUser(doc.id);
      await deleteDoc(doc.ref);
    });
  
  };

  const deleteItem = async () => {
    setLoading(true);

    let collectionName: string;
    let updateData: any;
    let additionalAction: (() => Promise<any>) | null = null;

    switch (type) {
      case DeleteModalTypes.driver:
        collectionName = "clients";
        additionalAction = async () => await moveClientToVirtualWorkshop(id);
        break;
      case DeleteModalTypes.vehicle:
        collectionName = "vehicles";
        additionalAction = async () => await handleDeleteVehicle(id);
        break;
      case DeleteModalTypes.user:
        collectionName = "users";
        additionalAction = async () => await handleDeleteUser(id);
        break;
      case DeleteModalTypes.organization:
        collectionName = "workshops";
        additionalAction = async () => await handleDeleteWorkshop(id);
        break;
      case DeleteModalTypes.appUser:
        collectionName = "appUsers";
        updateData = { preferred_workshop: "" };
        break;
      default:
        throw new Error("Invalid delete type");
    }

    const docRef = doc(db, collectionName, id);

    try {
      if (updateData) {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const hasEmptyFields = Object.keys(updateData).every(
            (key) => data[key] === ""
          );

          if (hasEmptyFields) {
            await deleteDoc(docRef);
            state((prevState) => prevState.filter((item) => item.id !== id));
            toast.success("Item excluído com sucesso!", {
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
          } else {
            await updateDoc(docRef, updateData);
            state((prevState) =>
              prevState.map((item) =>
                item.id === id ? { ...item, ...updateData } : item
              )
            );
            toast.success("Item desassociado com sucesso!", {
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
        } else {
          toast.error("Erro ao deletar item", {
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
      } else {
        state((prevState) => prevState.filter((item) => item.id !== id));
        if (
          type !== DeleteModalTypes.driver &&
          type !== DeleteModalTypes.vehicle
        ) {
          await deleteDoc(docRef);
        }
        toast.success("Item excluído com sucesso!", {
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
      if (additionalAction) {
        try {
          await additionalAction();
        } catch (error) {
          toast.error("Erro ao excluir credenciais do usuário", {
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
      }
      onOpenChange();
    } catch (error) {
      toast.error("Erro ao deletar item", {
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
      {showTrash && (
        <Button className={styles.deleteBtn} onClick={onOpen}>
          <FaRegTrashAlt />
          {type === DeleteModalTypes.appUser ? "Desassociar" : "Excluir"}
        </Button>
      )}

      <Modal
        isOpen={isOpen}
        className={styles.modal}
        size="lg"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader
                className={clsx("flex flex-col gap-1", styles.modalTitle)}
              >
                Confirmação
              </ModalHeader>
              <ModalBody className="text-white">
                <p>Tem certeza que deseja excluir {name}?</p>
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
                  color="danger"
                  className={styles.modalButton}
                  onClick={deleteItem}
                  disabled={loading}
                >
                  Excluir
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
