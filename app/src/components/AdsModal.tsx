import { Button } from "@nextui-org/react";
import { IoClose } from "react-icons/io5";
import { FaPaperPlane } from "react-icons/fa";
import { BiImageAdd } from "react-icons/bi";
import { Input, Textarea } from "@nextui-org/react";
import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { AuthContext } from "@/contexts/auth.context";
import { useContext } from "react";

interface ModalProps {
  onClose: () => void;
}

export default function AdsModal({ onClose }: ModalProps) {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [validity, setValidity] = useState<Timestamp | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { db, storage } = useContext(AuthContext);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 280) {
      setDescription(e.target.value);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setValidity(Timestamp.fromDate(date));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
    if (!title || !description || !validity || !image) {
      alert("Please fill out all fields and select an image.");
      return;
    }

    try {
      const storageRef = ref(storage, `images/${image.name}`);
      await uploadBytes(storageRef, image);
      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "ads"), {
        title,
        description,
        validity,
        imageUrl,
      });

      alert("Promotion saved successfully!");
      onClose();
    } catch (error) {
      console.error("Error saving promotion: ", error);
      alert("Failed to save the promotion.");
    }
  };

  return (
    <div className="fixed bottom-10 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
      <div className="w-4/5 h-4/5 bg-black border-2 border-stone-300 px-4 rounded-2xl">
        <div className="flex flex-col h-full w-full gap-5 grid-cols-8">
          <div className="flex flex-row justify-end col-span-1">
            <Button onClick={onClose} className="bg-black text-white text-4xl">
              <IoClose />
            </Button>
          </div>
          <div className="flex flex-row items-center h-auto gap-5 col-span-4">
            <div className="flex flex-col items-center gap-2 h-[90%] max-h-[90%]">
              <div className="flex flex-col items-center border-4 w-[70%] max-w-[70%] h-[70%] border-stone-300 border-dashed rounded-2xl overflow-hidden max-h-[70%]">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Promotional"
                    className="w-auto h-auto max-w-full max-h-full object-contain rounded-2xl"
                  />
                ) : (
                  <p className="text-stone-400 w-[80%] text-lg text-center font-extrabold">
                    Adicionar Imagem Promocional
                  </p>
                )}
              </div>

              <Button className="text-base rounded-full bg-gradient-to-b from-[#209730] to-[#056011] text-white w-fit flex flex-row">
                <BiImageAdd size={30} />
                <label htmlFor="image-upload" className="cursor-pointer">
                  Selecionar Imagem Promocional
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </Button>
            </div>
            <div className="flex flex-col gap-3 w-full h-full">
              <p className="text-white text-xl font-bold">
                Informações da Promoção
              </p>
              <Input
                type="text"
                label="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                variant="bordered"
                className="dark"
                classNames={{
                  input: ["bg-transparent text-white"],
                  inputWrapper: [
                    "border border-2 !border-white focus:border-white",
                  ],
                }}
              />
              <div className="flex flex-col">
                <Textarea
                  label="Descrição (até 280 caracteres)"
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleDescriptionChange(e)
                  }
                  maxRows={6}
                  className="dark"
                  classNames={{
                    input: ["bg-transparent text-white"],
                    inputWrapper: [
                      "border border-2 !border-white focus:border-white",
                    ],
                  }}
                />
                <p className="text-white text-sm">{description.length}/280</p>
              </div>
              <Input
                type="date"
                label="Validade"
                value={
                  validity
                    ? new Date(validity.toDate()).toISOString().slice(0, 10)
                    : ""
                }
                onChange={handleDateChange}
                variant="bordered"
                className="dark"
                classNames={{
                  input: ["bg-transparent text-white"],
                  inputWrapper: [
                    "border border-2 !border-white focus:border-white relative",
                  ],
                  label: [
                    "absolute text-white transition-all duration-200 transform -translate-y-3 scale-75 top-1 left-3 origin-[0] bg-black px-2",
                    validity || validity === ""
                      ? "translate-y-0 scale-100"
                      : "scale-75 -translate-y-3",
                  ],
                }}
              />
            </div>
          </div>
          <div className="w-full flex flex-row justify-center items-center col-span-3 grow">
            <Button className="flex flex-row py-7 px-14 text-white text-xl bg-gradient-to-b from-[#209730] to-[#056011]">
              <FaPaperPlane size={20} />
              <p>Enviar Promoção</p>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}