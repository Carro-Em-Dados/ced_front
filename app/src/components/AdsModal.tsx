import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@nextui-org/react";
import { useContext, useState, useEffect } from "react";
import { collection, addDoc, Timestamp, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { AuthContext } from "@/contexts/auth.context";
import { toast, Zoom } from "react-toastify";
import { BiImageAdd } from "react-icons/bi";
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";
import { Ad } from "@/interfaces/adUserType";
import { MdMailOutline } from "react-icons/md";
import { FaPencil } from "react-icons/fa6";

interface AdsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshopId: string;
}

export default function AdsModal({
  isOpen,
  onClose,
  workshopId,
}: AdsModalProps) {
  const { db, storage } = useContext(AuthContext);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [start, setStart] = useState<Timestamp | null>(null);
  const [end, setEnd] = useState<Timestamp | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [canSend, setCanSend] = useState<boolean>(false);
  const [externalLink, setExternalLink] = useState<string>("");

  useEffect(() => {
    if (title && description && start && end && image && externalLink)
      setCanSend(true);
    else setCanSend(false);
  }, [title, description, start, end, image, externalLink]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 280) setDescription(e.target.value);
  };

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const date = new Date(e.target.value);

    if (type === "start") {
      if (end && date > end.toDate()) {
        toast.error(
          "A data de início não pode ser posterior à data de encerramento.",
          {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Zoom,
          }
        );
        setStart(null);
      } else {
        setStart(Timestamp.fromDate(date));
      }
    } else if (type === "end") {
      if (start && date < start.toDate()) {
        toast.error(
          "A data de encerramento não pode ser anterior à data de início.",
          {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Zoom,
          }
        );
        setEnd(null);
      } else {
        setEnd(Timestamp.fromDate(date));
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processImage(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    processImage(file);
  };

  const processImage = (file: File | undefined) => {
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAd = async () => {
    if (!title || !description || !start || !end || !image) {
      toast.error("Por favor, reencha todos os campos", {
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
      const storageRef = ref(storage, `images/${image.name}`);
      await uploadBytes(storageRef, image);
      const imageUrl = await getDownloadURL(storageRef);
      const ad = {
        workshop: workshopId,
        title,
        description,
        start,
        end,
        image_url: imageUrl,
        createdAt: Timestamp.now(),
        external_link: externalLink,
      } as Ad;

      const docRef = await addDoc(collection(db, "ads"), ad);

      await updateDoc(docRef, { id: docRef.id });

      toast.success("Promoção enviada com sucesso", {
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
      onClose();
    } catch (error) {
      console.error("Error saving promotion: ", error);
      toast.error("Erro ao criar promoção", {
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="outside"
    >
      <ModalContent className="bg-black border-2 border-slate-300 text-white">
        <ModalHeader>
          <div className="flex flex-col gap-1">Criar Promoção</div>
        </ModalHeader>
        <ModalBody className="flex flex-row justify-end gap-14 w-full">
          <div className="flex flex-col items-center py-4 gap-3">
            <div
              className="flex flex-col justify-center items-center w-[400px] max-w-full h-[300px] max-h-[300px] border-4 border-dashed border-stone-300 rounded-2xl text-center cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Promotional"
                  className="w-full h-full object-contain"
                />
              ) : (
                <p className="text-stone-400 w-[70%] text-xl">
                  Arraste e solte a imagem aqui ou clique abaixo para adicionar
                  uma imagem promocional.
                </p>
              )}
            </div>
            <Button
              className="flex items-center w-fit px-6 gap-2 rounded-full bg-gradient-to-b from-[#209730] to-[#056011] text-white"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <BiImageAdd size={40} />
              Selecionar Imagem Promocional
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div className="flex flex-col justify-between w-full">
            <p className="text-white text-xl font-bold">
              Informações da Promoção
            </p>
            <Input
              type="text"
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="bordered"
              className="dark w-96"
              startContent={<MdMailOutline size={20} />}
            />
            <div className="flex flex-col">
              <Textarea
                label="Descrição (até 280 caracteres)"
                value={description}
                onChange={handleDescriptionChange}
                maxRows={6}
                variant="bordered"
                className="dark w-96"
                classNames={{
                  input: ["bg-transparent text-white"],
                  inputWrapper: ["focus:border-white relative bg-transparent"],
                }}
                startContent={<FaPencil size={15} />}
              />
              <p className="text-white text-sm ml-2">
                {description.length}/280
              </p>
            </div>

            <Input
              type="text"
              label="Link Externo"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              variant="bordered"
              className="dark w-96"
              startContent={<FaPaperclip size={15} />}
            />

            <div className="flex flex-row gap-2">
              <Input
                type="date"
                label="Data de início"
                value={
                  start
                    ? new Date(start.toDate()).toISOString().slice(0, 10)
                    : ""
                }
                onChange={(e) => handleDateChange(e, "start")}
                variant="bordered"
                className="dark w-48"
                classNames={{
                  input: ["bg-transparent text-white"],
                  inputWrapper: ["focus:border-white relative"],
                  label: [
                    "absolute text-white transition-all duration-200 transform -translate-y-3 scale-75 top-1 left-3 origin-[0] bg-black px-2",
                    start || start === ""
                      ? "translate-y-0 scale-100"
                      : "scale-75 -translate-y-3",
                  ],
                }}
              />

              <Input
                type="date"
                label="Data de encerramento"
                value={
                  end ? new Date(end.toDate()).toISOString().slice(0, 10) : ""
                }
                onChange={(e) => handleDateChange(e, "end")}
                variant="bordered"
                className="dark w-48"
                classNames={{
                  input: ["bg-transparent text-white"],
                  inputWrapper: ["focus:border-white relative"],
                  label: [
                    "absolute text-white transition-all duration-200 transform -translate-y-3 scale-75 top-1 left-3 origin-[0] bg-black px-2",
                    end || end === ""
                      ? "translate-y-0 scale-100"
                      : "scale-75 -translate-y-3",
                  ],
                }}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-center mt-4">
          <Button
            className={`flex flex-row py-4 px-14 text-xl transition duration-300 rounded-xl
                ${
                  canSend
                    ? "text-white bg-gradient-to-b from-[#209730] to-[#056011] cursor-pointer"
                    : "cursor-not-allowed opacity-70 bg-gradient-to-b from-slate-500 to-slate-600 text-black"
                } 
              `}
            onClick={saveAd}
          >
            <FaPaperPlane size={20} />
            <p>Enviar Promoção</p>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
