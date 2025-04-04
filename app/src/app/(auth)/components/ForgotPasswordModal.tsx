"use client";

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { useContext, useState } from "react";
import styles from "../../dashboard/register/styles.module.scss";
import { AuthContext } from "@/contexts/auth.context";
import { clsx } from "clsx";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast, Zoom } from "react-toastify";

export default function ForgotPasswordModal() {
  const { db, auth } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [message, setMessage] = useState({
    message: "",
    type: "error",
  });

  const handleClose = () => {
    setEmail("");
    onClose();
  };

  const forgotPassword = async () => {
    if (!email) {
      setMessage({
        message: "Por favor, insira um email.",
        type: "error",
      });
      return;
    }
    await sendPasswordResetEmail(auth, email)
      .then(() => {
        setMessage({
          message: "Email enviado com sucesso!",
          type: "success",
        });
        handleClose();
      })
      .catch((error) => {
        toast.error("Algo deu errado!", {
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
      });
  };

  return (
    <>
      <button className="text-[#27A338] underline" onClick={onOpen}>
        Clique aqui
      </button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={handleClose} className={styles.modal} size="2xl" scrollBehavior="outside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className={clsx("flex flex-col gap-1", styles.modalTitle)}>Esqueci minha senha</ModalHeader>
              <ModalBody>
                <div className={`${styles.form} flex flex-col`}>
                  <div className="flex flex-col">
                    <Input
                      type="email"
                      label="Email"
                      value={email}
                      onChange={(e: any) => setEmail(e.target.value)}
                      variant="bordered"
                      className="dark"
                      classNames={{
                        input: ["bg-transparent text-white"],
                        inputWrapper: ["border border-2 !border-white focus:border-white"],
                      }}
                    />
                    {message && (
                      <p className={`text-sm ${message.type === "error" ? "text-red-500" : "text-[#27A338]"}`}>{message.message}</p>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" className="rounded-full px-5 text-white" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="success"
                  className={styles.modalButton}
                  onClick={() => {
                    forgotPassword();
                  }}
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
