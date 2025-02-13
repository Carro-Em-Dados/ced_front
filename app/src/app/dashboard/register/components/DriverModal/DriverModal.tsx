import { AuthContext } from "@/contexts/auth.context";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import clsx from "clsx";
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { ReactNode, useContext, useEffect, useState } from "react";
import { MdLibraryAdd } from "react-icons/md";
import styles from "../../styles.module.scss";
import { Workshop } from "@/interfaces/workshop.type";
import { toast, Zoom } from "react-toastify";
import InputMask from "react-input-mask";
import type { Driver } from "@/interfaces/driver.type";
import { Role } from "@/types/enums/role.enum";
import { Contract } from "@/interfaces/contract.type";
import GeneralObjectOptionAutocomplete from "@/components/GeneralObjectOptionAutocomplete";

interface Props {
  setDrivers: React.Dispatch<React.SetStateAction<any[]>>;
  drivers: Driver[];
  workshops: Workshop[];
  workshop?: Workshop & { contract: Contract };
}

export default function DriverModal({ workshop, workshops, setDrivers, drivers }: Props) {
  const { db, currentUser, currentWorkshop } = useContext(AuthContext);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [queriedEmail, setQueriedEmail] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneRes, setPhoneRes] = useState<string>("");
  const [phoneCom, setPhoneCom] = useState<string>("");
  const [addressRes, setAddressRes] = useState<string>("");
  const [addressCom, setAddressCom] = useState<string>("");
  const [register, setRegister] = useState<string>("");
  const [cnh, setCNH] = useState<string>("");
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>(workshop ? workshop?.id : "");
  const [loading, setLoading] = useState(false);

  const handleAddDriver = async () => {
    if (!currentUser) return;
    if (!workshop && currentUser?.role === Role.USER) {
      return toast.error("Nenhuma oficina encontrada no seu usuário", {
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
    if (currentUser.role !== Role.MASTER && workshop?.contract) {
      if (drivers.length > workshop.contract?.maxDrivers) {
        toast.error("Limite de motoristas excedido", {
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
    }

    setLoading(true);

    try {
      const querySnapshot = await getDocs(query(collection(db, "clients"), where("email", "==", email)));

      if (!querySnapshot.empty) {
        const existingDriverDoc = querySnapshot.docs[0];
        const existingDriver = existingDriverDoc.data();

        if ((existingDriver?.workshops ?? []).find((w: string) => w !== ""))
          return toast.error("Já existe um motorista com esse e-mail cadastrado em uma oficina", {
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

        const updatedDriver = {
          name: name || existingDriver.name,
          age: age || existingDriver.age,
          gender: gender || existingDriver.gender,
          email: email,
          cnh: cnh || existingDriver.cnh,
          address_commercial: addressCom || existingDriver.address_commercial,
          address_residential: addressRes || existingDriver.address_residential,
          phone_residential: phoneRes || existingDriver.phone_residential,
          phone_commercial: phoneCom || existingDriver.phone_commercial,
          role: "client",
          register: register || existingDriver.register,
          workshops: selectedWorkshop || existingDriver.workshops,
        };

        await updateDoc(doc(db, "clients", existingDriverDoc.id), updatedDriver);

        setDrivers((drivers) => drivers.map((drv) => (drv.email === email ? { ...drv, ...updatedDriver } : drv)));
        handleClose();
        return;
      }

      let driver = {
        name: name,
        age: age,
        gender: gender,
        email: email,
        cnh: cnh,
        address_commercial: addressCom,
        address_residential: addressRes,
        phone_residential: phoneRes,
        phone_commercial: phoneCom,
        role: "client",
        register: register,
        workshops: [Role.MASTER, Role.ORGANIZATION].includes(currentUser?.role as Role) ? selectedWorkshop : workshop?.id || "",
      };

      const docRef = await addDoc(collection(db, "clients"), driver);
      setDrivers((drivers) => {
        return [...drivers, { ...driver, id: docRef.id }];
      });
      handleClose();
    } catch (error) {
      toast.error("Erro ao adicionar motorista", {
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
    return;
  };

  const handleClose = () => {
    setName("");
    setAge("");
    setGender("");
    setPhoneRes("");
    setPhoneCom("");
    setAddressRes("");
    setAddressCom("");
    setRegister("");
    setCNH("");
    setEmail("");
    setSelectedWorkshop("");
    onClose();
  };

  const queryDrivers = async () => {
    setLoading(true);
    try {
      setQueriedEmail(email);
      const q = query(collection(db, "clients"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return;
      const driverData = querySnapshot.docs[0].data();

      if ((driverData?.workshops ?? []).find((w: string) => w !== "")) return;

      setName(driverData.name || "");
      setAge(driverData.age || "");
      setGender(driverData.gender || "");
      setPhoneRes(driverData.phone_residential || "");
      setPhoneCom(driverData.phone_commercial || "");
      setAddressRes(driverData.address_residential || "");
      setAddressCom(driverData.address_commercial || "");
      setRegister(driverData.register || "");
      setCNH(driverData.cnh || "");
    } catch (error) {
      toast.error("Erro ao consultar motoristas", {
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
      <Button color="success" className={clsx(styles.button, "!fixed bottom-0 right-0 z-10 shadow-md mb-5 mr-5")} onClick={onOpen}>
        <MdLibraryAdd className={styles.addIcon} />
        Adicionar motorista
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose} onOpenChange={onOpenChange} className={styles.modal} size="2xl" scrollBehavior="outside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className={clsx("flex flex-col gap-1", styles.modalTitle)}>Adicionar Motorista</ModalHeader>
              <ModalBody>
                <div className={clsx(styles.form, "flex flex-col gap-4")}>
                  <div>
                    <Input
                      label="Email*"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={(e) => (queriedEmail === email ? null : queryDrivers())}
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
                  <div className="flex flex-row gap-5">
                    <Input
                      min={18}
                      type="number"
                      label="Idade"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      variant="bordered"
                      className="dark"
                      classNames={{
                        input: ["bg-transparent text-white"],
                        inputWrapper: ["border border-2 !border-white focus:border-white"],
                      }}
                    />
                    <Select
                      variant="bordered"
                      className="dark text-white"
                      classNames={{
                        trigger: "!border-white rounded-medium",
                        value: "text-white",
                      }}
                      label="Gênero"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <SelectItem key={"m"} value={"m"}>
                        Masculino
                      </SelectItem>
                      <SelectItem key={"f"} value={"f"}>
                        Feminino
                      </SelectItem>
                    </Select>
                  </div>
                  <div className="flex flex-row gap-5">
                    <InputMask mask="(99) 99999-9999" value={phoneRes} onChange={(e) => setPhoneRes(e.target.value)} maskChar={null}>
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          type="text"
                          label="Celular"
                          variant="bordered"
                          className="dark"
                          classNames={{
                            input: ["bg-transparent text-white"],
                            inputWrapper: ["border border-2 !border-white focus:border-white"],
                          }}
                        />
                      )}
                    </InputMask>
                    <InputMask mask="9999-9999" value={phoneCom} onChange={(e) => setPhoneCom(e.target.value)} maskChar={null}>
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          type="text"
                          label="Telefone"
                          variant="bordered"
                          className="dark"
                          classNames={{
                            input: ["bg-transparent text-white"],
                            inputWrapper: ["border border-2 !border-white focus:border-white"],
                          }}
                        />
                      )}
                    </InputMask>
                  </div>
                  <div>
                    <Input
                      type="text"
                      label="Endereço"
                      value={addressRes}
                      onChange={(e) => setAddressRes(e.target.value)}
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
                      type="text"
                      label="Registro"
                      value={register}
                      onChange={(e) => setRegister(e.target.value)}
                      variant="bordered"
                      className="dark"
                      classNames={{
                        input: ["bg-transparent text-white"],
                        inputWrapper: ["border border-2 !border-white focus:border-white"],
                      }}
                    />
                  </div>
                  <div>
                    <InputMask mask="999999999" value={cnh} onChange={(e) => setCNH(e.target.value)} maskChar={null}>
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          type="text"
                          label="CNH"
                          variant="bordered"
                          className="dark"
                          classNames={{
                            input: ["bg-transparent text-white"],
                            inputWrapper: ["border border-2 !border-white focus:border-white"],
                          }}
                        />
                      )}
                    </InputMask>
                  </div>
                  {[Role.MASTER, Role.ORGANIZATION].includes(currentUser?.role as Role) && (
                    <div>
                      <GeneralObjectOptionAutocomplete
                        options={workshops.map((workshop) => ({
                          value: workshop.id.toString(),
                          label: workshop.fantasy_name,
                        }))}
                        placeholder="Selecione uma oficina..."
                        initialValue={Role.ORGANIZATION && workshop ? workshop.id : selectedWorkshop}
                        onSelectionChange={(option) => setSelectedWorkshop(option.value)}
                        isDisabled={currentUser?.role === Role.ORGANIZATION}
                      />
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" className="rounded-full px-5 text-white" onClick={onClose}>
                  Cancelar
                </Button>
                <Button color="success" className={styles.modalButton} disabled={!email || loading} onClick={handleAddDriver}>
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
