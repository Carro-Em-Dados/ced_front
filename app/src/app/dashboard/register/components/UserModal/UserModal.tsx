import React, { useState, useContext } from "react";
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
import { createUserWithEmailAndPassword, getAuth, deleteUser } from "firebase/auth";
import { toast, Zoom } from "react-toastify";
import { roleLabel } from "@/constants/rolesLabel";

interface Props {
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function UserModal({ setUsers }: Props) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { db, currentUser } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const filteredRoleLabels = currentUser?.role === "master" 
    ? roleLabel 
    : Object.fromEntries(Object.entries(roleLabel).filter(([key]) => key === "user"));


  const addUser = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const newUser = {
        email: userCredential.user.email!,
        name: name,
        id: userCredential.user.uid,
        role: role,
        workshops: "",
      };

      const docRef = doc(db, "users", newUser.id);
      await setDoc(docRef, newUser);

      setUsers((prevUsers) => [...prevUsers, newUser]);
      handleClose();
    } catch (error: any) {
      toast.error("Erro ao adicionar usuário", {
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
    setName("");
    setEmail("");
    setPassword("");
    setRole("user");
    onClose();
  };

  return (
    <>
      <Button color="success" className={clsx(styles.button, "!fixed bottom-0 right-0 z-10 shadow-md mb-5 mr-5")} onClick={onOpen}>
        <MdLibraryAdd className={styles.addIcon} />
        Adicionar usuário
      </Button>
      <Modal isOpen={isOpen} className={styles.modal} onClose={handleClose} size={"lg"} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className={clsx("flex flex-col gap-1", styles.modalTitle)}>Adicionar Usuário</ModalHeader>
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
                        inputWrapper: ["border border-2 !border-white focus:border-white"],
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
                        inputWrapper: ["border border-2 !border-white focus:border-white"],
                      }}
                    />
                  </div>
                  <div>
                    <Input
                      label="Senha"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      variant="bordered"
                      className="dark"
                      classNames={{
                        input: ["bg-transparent text-white"],
                        inputWrapper: ["border border-2 !border-white focus:border-white"],
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
                      {Object.entries(filteredRoleLabels).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" className="rounded-full px-5 text-white" onClick={onClose}>
                  Cancelar
                </Button>
                <Button color="success" className={styles.modalButton} onClick={addUser} disabled={loading}>
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
