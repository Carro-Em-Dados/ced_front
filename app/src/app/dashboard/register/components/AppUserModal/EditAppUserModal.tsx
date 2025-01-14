import { AuthContext } from "@/contexts/auth.context";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import clsx from "clsx";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ReactNode, useContext, useEffect, useState } from "react";
import styles from "../../styles.module.scss";
import { FaEye } from "react-icons/fa";
import InputMask from "react-input-mask";
import { toast, Zoom } from "react-toastify";

interface Props {
  id: string;
  setAppUser: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function EditAppUser({ id, setAppUser }: Props) {
  const { db } = useContext(AuthContext);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, "appUsers", id));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setName(userData.name);
        setPhone(userData.phone);
      }
    } catch (error) {
      toast.error("Erro ao buscar usuário", {
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

  async function handleEditUser() {
    setLoading(true);
    try {
      const userRef = doc(db, "appUsers", id);

      await updateDoc(userRef, {
        name,
        phone,
      });

      setAppUser((prevUsers) => prevUsers.map((user) => (user.id === id ? { ...user, name, phone } : user)));
      handleClose();
    } catch (error) {
      toast.error("Erro ao atualizar usuário", {
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
  }

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <button onClick={onOpen}>
        <FaEye />
      </button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={handleClose} className={styles.modal} size="2xl" scrollBehavior="outside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className={clsx("flex flex-col gap-1", styles.modalTitle)}>Editar Usuário</ModalHeader>
              <ModalBody>
                <div className={clsx(styles.form, "flex flex-col gap-4")}>
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
                  <InputMask mask="(99) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} maskChar={null}>
                    {(inputProps: any) => (
                      <Input
                        type="tel"
                        label="Telefone*"
                        variant="bordered"
                        className="dark"
                        classNames={{
                          input: ["bg-transparent text-white"],
                          inputWrapper: ["border border-2 !border-white focus:border-white"],
                        }}
                        {...inputProps}
                      />
                    )}
                  </InputMask>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" className="rounded-full px-5 text-white" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="success"
                  className={styles.modalButton}
                  onClick={async () => {
                    await handleEditUser();
                    onClose();
                  }}
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
