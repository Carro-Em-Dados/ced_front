import React, {
  useState,
  useContext,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
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
import {
  updateDoc,
  doc,
  getDocs,
  query,
  collection,
  where,
} from "firebase/firestore";
import { toast, Zoom } from "react-toastify";
import { User } from "@/interfaces/user.type";
import { Trash } from "lucide-react";

interface Props {
  workshop: Workshop;
  setUsers: Dispatch<SetStateAction<any[]>>;
  users: User[];
}

export default function AssociateWorkshop({
  setUsers,
  workshop,
  users,
}: Props) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { db } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    setFilteredUsers(
      users.filter(
        (user) =>
          (!user.workshops || user.workshops.length === 0) &&
          user.role === "user"
      )
    );
  }, [users]);

  const associateUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    if (selectedUser.workshops && selectedUser.workshops.length > 0) {
      toast.error("Usuário já está associado a uma oficina associada", {
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
      const userRef = doc(db, "users", selectedUser.id);
      await updateDoc(userRef, { workshops: workshop.id });

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === selectedUser.id ? { ...u, workshops: workshop.id } : u
        )
      );
      toast.success("Usuário associado com sucesso!", {
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
      handleClose();
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

  const handleClose = () => {
    setSelectedUser(null);
    onClose();
  };

  return (
    <>
      <Button color="success" className={styles.addVehicleBtn} onClick={onOpen}>
        Associar usuário
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
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
                Associar usuário
              </ModalHeader>
              <ModalBody>
                <div className="max-h-[400px] overflow-auto flex flex-col gap-1 bg-[#030303] text-white p-2">
                  {filteredUsers.length !== 0  ? (
                    filteredUsers
                    .map((user) => (
                      <div
                        key={user.id}
                        className={`flex flex-row justify-between w-full px-2 py-1 rounded-md cursor-pointer ${
                          selectedUser && selectedUser.id === user.id
                            ? "bg-[#209730]"
                            : "hover:bg-neutral-800"
                        }`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <p>{user.name}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center">Não há usuários sem oficina associada</p>
                  )}
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
                  disabled={!selectedUser || loading}
                  className={`${styles.modalButton}`}
                  onClick={associateUser}
                >
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
