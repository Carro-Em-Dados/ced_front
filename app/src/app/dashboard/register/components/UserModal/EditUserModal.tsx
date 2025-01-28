import React, { useState, useContext, useEffect } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Select,
  SelectItem,
  Input,
} from "@nextui-org/react";
import { MdLibraryAdd } from "react-icons/md";
import styles from "../../styles.module.scss";
import clsx from "clsx";
import { doc, setDoc } from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";
import {
  createUserWithEmailAndPassword,
  getAuth,
  deleteUser,
} from "firebase/auth";
import { toast, Zoom } from "react-toastify";
import { roleLabel } from "@/constants/rolesLabel";
import { BiEdit } from "react-icons/bi";
import { User } from "@/interfaces/user.type";

interface Props {
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  openState: boolean;
  setOpenState: React.Dispatch<React.SetStateAction<boolean>>;
  user: User;
}

export default function EditUserModal({
  setUsers,
  openState,
  setOpenState,
  user,
}: Props) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { db } = useContext(AuthContext);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  const editUser = async () => {
    if (!name || !email || !role) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      const userRef = doc(db, "users", user.id);
      await setDoc(
        userRef,
        {
          name,
          email,
          role,
        },
        { merge: true }
      );

      toast.success("Usuário editado com sucesso", {
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

      setUsers((prev) => [
        ...prev.filter((prevUser) => prevUser.id !== user.id),
        {
          ...user,
          name,
          email,
          role,
        },
      ]);
    } catch (error) {
      toast.error("Erro ao editar usuário", {
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
    setLoading(false);
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setRole("user");
    setOpenState(false);
  };

  useEffect(() => {
    if (openState) {
      onOpen();
    } else {
      onClose();
    }
  }, [openState]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        className={styles.modal}
        onClose={handleClose}
        size={"lg"}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader
                className={clsx("flex flex-col gap-1", styles.modalTitle)}
              >
                Adicionar Usuário
              </ModalHeader>
              <ModalBody>
                <div className={clsx(styles.form, "flex flex-col gap-4")}>
                  <div>
                    <Input
                      type="text"
                      label="Nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                    <Select
                      variant="bordered"
                      className="dark text-white"
                      classNames={{
                        trigger: "!border-white rounded-[1em]",
                      }}
                      label="Tipo de usuário"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      {Object.entries(roleLabel).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </Select>
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
                  onClick={editUser}
                  disabled={loading}
                >
                  Editar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
