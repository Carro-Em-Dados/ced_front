import React, { useState, useContext, useEffect } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import styles from "../../styles.module.scss";
import clsx from "clsx";
import { AuthContext } from "@/contexts/auth.context";
import { Workshop } from "@/interfaces/workshop.type";
import { User } from "@/interfaces/user.type";
import { updateDoc, doc, deleteDoc } from "firebase/firestore";
import { toast, Zoom } from "react-toastify";
import { Role } from "@/types/enums/role.enum";

interface Props {
  user: User;
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  workshops: Workshop[];
}

export default function AssociateUser({ setUsers, workshops, user }: Props) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { db } = useContext(AuthContext);
  const [workshop, setWorkshop] = useState(user?.workshops || "");
  const [loading, setLoading] = useState(false);
  const { currentWorkshop, currentUser } = useContext(AuthContext);

  useEffect(() => {
    setWorkshop(user?.workshops || "");
  }, [user]);

  const associateUser = async () => {
    setLoading(true);

    try {
      const userRef = doc(db, "users", user.id);
      if (workshop === "DELETE") {
        await deleteDoc(userRef);
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
        setWorkshop("");
        onOpenChange();
        return;
      } else {
        await updateDoc(userRef, { workshops: workshop });
        setUsers((prevUsers) => prevUsers.map((u) => (u.id === user.id ? { ...u, workshops: workshop } : u)));
        setWorkshop("");
        onOpenChange();
      }
    } catch (error) {
      toast.error("Erro ao associar usuário a oficina", {
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
      <Modal isOpen={isOpen} className={styles.modal} size={"lg"} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className={clsx("flex flex-col gap-1", styles.modalTitle)}>Associar oficina</ModalHeader>
              <ModalBody>
                <div className="max-h-[400px] overflow-auto flex flex-col gap-1 bg-[#030303] text-white p-2">
                  <div
                    className={`w-full px-2 py-1 rounded-md cursor-pointer ${(workshop === "" || workshop === "DELETE") ? "bg-[#209730]" : "hover:bg-neutral-800"}`}
                    onClick={() => {
                      currentUser?.role === Role.MASTER ? setWorkshop("DELETE") : setWorkshop("");
                    }}
                  >
                    <p>{currentUser?.role === Role.MASTER ? "Excluir" : "Nenhuma"}</p>
                  </div>
                  {workshops.map((w) => (
                    <div
                      key={w.id}
                      className={`w-full px-2 py-1 rounded-md cursor-pointer ${
                        w.id === workshop ? "bg-[#209730]" : "hover:bg-neutral-800"
                      }`}
                      onClick={() => setWorkshop(w.id)}
                    >
                      <p>{w.company_name}</p>
                    </div>
                  ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" className="rounded-full px-5 text-white" onClick={onClose}>
                  Cancelar
                </Button>
                <Button color="success" disabled={loading} className={`${styles.modalButton}`} onClick={associateUser}>
                  {workshop === "" ? "Desassociar" : workshop === "DELETE" ? "Excluir" : "Associar"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
