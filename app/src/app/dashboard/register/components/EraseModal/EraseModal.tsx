import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import clsx from "clsx";
import styles from "../../styles.module.scss";
import { FaRegTrashAlt } from "react-icons/fa";
import { useContext, useState } from "react";
import { AuthContext } from "@/contexts/auth.context";
import { updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { toast, Zoom } from "react-toastify";
import { deleteUser } from "@/services/firebase-admin";

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
  const { db } = useContext(AuthContext);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);

  const deleteItem = async () => {
    setLoading(true);

    let collectionName: string;
    let updateData: any;
    let additionalAction: (() => Promise<any>) | null = null;

    switch (type) {
      case DeleteModalTypes.driver:
        collectionName = "clients";
        updateData = { workshops: "" };
        break;
      case DeleteModalTypes.vehicle:
        collectionName = "vehicles";
        break;
      case DeleteModalTypes.user:
        collectionName = "users";
        additionalAction = async () => await deleteUser(id);
        break;
      case DeleteModalTypes.organization:
        collectionName = "workshops";
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
          const hasEmptyFields = Object.keys(updateData).every((key) => data[key] === "");

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
            state((prevState) => prevState.map((item) => (item.id === id ? { ...item, ...updateData } : item)));
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
      <Button className={styles.deleteBtn} onClick={onOpen}>
        <FaRegTrashAlt />
        {type === DeleteModalTypes.appUser ? "Desassociar" : "Excluir"}
      </Button>
      <Modal isOpen={isOpen} className={styles.modal} size="lg" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className={clsx("flex flex-col gap-1", styles.modalTitle)}>Confirmação</ModalHeader>
              <ModalBody className="text-white">
                <p>Tem certeza que deseja excluir {name}?</p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" className="rounded-full px-5 text-white" onClick={onClose}>
                  Cancelar
                </Button>
                <Button color="danger" className={styles.modalButton} onClick={deleteItem} disabled={loading}>
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
