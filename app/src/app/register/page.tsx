"use client";
import React, { useContext, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import Navbar from "@/components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import Image from "next/image";
import { Tabs, Tab, Card, CardBody, Button, useDisclosure } from "@nextui-org/react";
import DriverCard from "./driverCard/DriverCard";
import { MdLibraryAdd } from "react-icons/md";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { RadioGroup, Radio } from "@nextui-org/react";
import clsx from "clsx";
import { AppUser } from "../../interfaces/appUser.type";
import { Timestamp, addDoc, collection, doc, getDoc, getDocs } from "firebase/firestore";
import { Workshop } from "../../interfaces/workshop.type";
import { Client } from "../../interfaces/client.type";
import { AuthContext } from "../contexts/auth.context";
import { User } from "../../interfaces/user.type";
interface IDriver {
  name: string;
  email: string;
  birth: any;
  age: string;
  gender: string;
  address: string;
  commercialAddress?: string;
  phone: string;
  cnh: string;
}

interface Vehicle {
  id: string;
  car_model: string;
  license_plate: string;
  owner: string;
  gas_capacity: number;
  gps_mac: string;
  obd2_mac: string;
  vin: string;
  initial_km: number;
}

const Register = () => {
  const { db } = useContext(AuthContext);

  const mockDrivers: IDriver[] = [
    {
      name: "Temp",
      email: "temp@temp.com",
      birth: "01/01/2024",
      age: "23",
      gender: "Masculino",
      address: "Av Brigadeiro Faria Lima, 1234",
      phone: "(11) 99999-9999",
      cnh: "1090984471",
    },
  ];

  const [drivers, setDrivers] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState<User[]>([]);
  const [driverModal, setDriverModal] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);

  async function getClients() {
    const querySnapshot = await getDocs(collection(db, "clients"));
    let list: any = [];
    querySnapshot.forEach((doc) => {
      const d = doc.data() as any;
      // console.log("a")
      list = [...list, d];
    });
    // console.log(list)
    setDrivers(list);
  }

  async function getWorkshops() {
    const querySnapshot = await getDocs(collection(db, "workshops"));
    let list: any = [];
    querySnapshot.forEach((doc) => {
      const d = doc.data() as any;
      // console.log("a")
      list = [...list, d];
    });
    // console.log(list)
    setWorkshops(list);
  }

  async function getUsers() {
    const querySnapshot = await getDocs(collection(db, "users"));
    let list: any = [];
    querySnapshot.forEach((doc) => {
      const d = doc.data() as any;
      // console.log("a")
      list = [...list, d];
    });
    // console.log(list)
    setUsers(list);
  }

  async function getVehicles() {
    const querySnapshot = await getDocs(collection(db, "vehicles"));
    querySnapshot.forEach((doc) => {
      setVehicles([...vehicles, doc.data() as Vehicle]);
    });
  }

  // useEffect(() => {
  //     console.log(drivers)
  // }, [drivers])

  async function getVehiclesByClient(id: string) {
    let res = vehicles.map((i) => {
      if (i.owner == id) return i;
    });
    return res;
  }

  useEffect(() => {
    getClients();
    getWorkshops();
    getVehicles();
    getUsers();
  }, [db]);

  const DriverModal = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [name, setName] = useState<string>("");
    const [age, setAge] = useState<string>("");
    const [gender, setGender] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phoneRes, setPhoneRes] = useState<string>("");
    const [phoneCom, setPhoneCom] = useState<string>("");
    const [addressRes, setAddressRes] = useState<string>("");
    const [addressCom, setAddressCom] = useState<string>("");
    const [register, setRegister] = useState<string>("");
    const [cnh, setCNH] = useState<string>("");

    async function handleAddDriver() {
      let driver: Client = {
        name: name,
        age: age,
        gender: gender,
        email: email,
        cnh: cnh,
        address_commercial: addressCom,
        address_residential: addressRes,
        cpf: "",
        phone_residential: phoneRes,
        phone_commercial: phoneCom,
        uid: "",
        role: "client",
        register: register,
        workshops: [""],
      };

      const docRef = await addDoc(collection(db, "clients"), driver);
    }

    return (
      <>
        <Button color="success" className={styles.button} onPress={onOpen}>
          <MdLibraryAdd className={styles.addIcon} />
          Adicionar motorista
        </Button>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} className={styles.modal} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className={clsx("flex flex-col gap-1", styles.modalTitle)}>Adicionar Motorista</ModalHeader>
                <ModalBody>
                  <div className={styles.form}>
                    <div>
                      <input className={styles.modalInput} placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
                      {/* <span className={styles.horizontalSpace} /> */}
                      {/* <input className={styles.modalInput}
                                                placeholder='Sobrenome' /> */}
                    </div>
                    <div>
                      <input className={styles.modalInput} placeholder="Idade" value={age} onChange={(e) => setAge(e.target.value)} />
                      <span className={styles.horizontalSpace} />
                      <input
                        className={styles.modalInput}
                        placeholder="Gênero"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      />
                    </div>
                    <div>
                      <input className={styles.modalInput} placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                      <input
                        className={styles.modalInput}
                        placeholder="Celular"
                        value={phoneRes}
                        onChange={(e) => setPhoneRes(e.target.value)}
                      />
                      <span className={styles.horizontalSpace} />
                      <input
                        className={styles.modalInput}
                        placeholder="Telefone"
                        value={phoneCom}
                        onChange={(e) => setPhoneCom(e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        className={styles.modalInput}
                        placeholder="Endereço"
                        value={addressRes}
                        onChange={(e) => setAddressRes(e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        className={styles.modalInput}
                        placeholder="Registro"
                        value={register}
                        onChange={(e) => setRegister(e.target.value)}
                      />
                    </div>
                    <div>
                      <input className={styles.modalInput} placeholder="CNH" value={cnh} onChange={(e) => setCNH(e.target.value)} />
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    color="success"
                    className={styles.modalButton}
                    onPress={() => {
                      handleAddDriver();
                      onClose();
                    }}
                  >
                    Adicionar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  };

  const VehicleModal = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    return (
      <>
        <Button color="success" className={styles.button} onPress={onOpen}>
          <MdLibraryAdd className={styles.addIcon} />
          Adicionar veículo
        </Button>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} className={styles.modal}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className={clsx("flex flex-col gap-1", styles.modalTitle)}>Adicionar Veículo</ModalHeader>
                <ModalBody>
                  <div className={styles.form}>
                    <div>
                      <input className={styles.modalInput} placeholder="Fabricante" />
                      <span className={styles.horizontalSpace} />
                      <input className={styles.modalInput} placeholder="Modelo" />
                    </div>
                    <div>
                      <input className={styles.modalInput} placeholder="Placa" />
                      <span className={styles.horizontalSpace} />
                      <input className={styles.modalInput} placeholder="Ano" />
                    </div>
                    <div>
                      <input className={styles.modalInput} placeholder="Odômetro" />
                    </div>
                    <div>
                      <input className={styles.modalInput} placeholder="Chassi" />
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button color="success" className={styles.modalButton} onPress={onClose}>
                    Adicionar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  };

  const OrganizationModal = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    return (
      <>
        <Button color="success" className={styles.button} onPress={onOpen}>
          <MdLibraryAdd className={styles.addIcon} />
          Adicionar organização
        </Button>
        <Modal isOpen={isOpen} className={styles.modal} size={"2xl"} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className={clsx("flex flex-col gap-1", styles.modalTitle)}>Adicionar Organização</ModalHeader>
                <ModalBody>
                  <div className={styles.form}>
                    <div>
                      <input className={styles.modalInput} placeholder="Nome Fantasia" />
                    </div>
                    <div>
                      <input className={styles.modalInput} placeholder="N° Contrato" />
                      <span className={styles.horizontalSpace} />
                      <input className={styles.modalInput} placeholder="N° Cadastro" />
                    </div>
                    <div>
                      <input className={styles.modalInput} placeholder="Razão Social" />
                    </div>
                    <div>
                      <input className={styles.modalInput} placeholder="CNPJ" />
                    </div>
                    <div>
                      <input className={styles.modalInput} placeholder="Inscrição Estadual" />
                      <span className={styles.horizontalSpace} />
                      <input className={styles.modalInput} placeholder="Inscrição Municipal" />
                    </div>
                    <h2 className={styles.modalLabel}>Tipo de perfil</h2>
                    <RadioGroup orientation="horizontal" color="success">
                      <Radio value="basic">
                        <p className={styles.modalText}>Básico</p>
                      </Radio>
                      <span className={styles.horizontalSpace} />
                      <Radio value="custom">
                        <p className={styles.modalText}>Customizado</p>
                      </Radio>
                    </RadioGroup>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button color="success" className={styles.modalButton} onPress={onClose}>
                    Adicionar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  };

  const UserModal = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    return (
      <>
        <Button color="success" className={styles.button} onPress={onOpen}>
          <MdLibraryAdd className={styles.addIcon} />
          Adicionar usuário
        </Button>
        <Modal isOpen={isOpen} className={styles.modal} size={"lg"} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className={clsx("flex flex-col gap-1", styles.modalTitle)}>Adicionar Usuário</ModalHeader>
                <ModalBody>
                  <div className={styles.form}>
                    <div>
                      <input className={styles.modalInput} placeholder="Nome" />
                    </div>
                    <div>
                      <input className={styles.modalInput} placeholder="Sobrenome" />
                    </div>
                    <div>
                      <input className={styles.modalInput} placeholder="E-mail" />
                    </div>
                    <div>
                      <input className={styles.modalInput} placeholder="Função" />
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button color="success" className={styles.modalButton} onPress={onClose}>
                    Adicionar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.pageWrap}>
        <div className={styles.rectangleContainer}>
          <Image src="/rectangle.png" alt="Retângulo título" fill style={{ objectFit: "cover" }} />
        </div>
        <h1 className={styles.mainTitle}>Cadastramento</h1>
        <p className={styles.subtext}>Adicione usuários, organizações e veículos</p>
        <Tabs aria-label="config-tabs" className={styles.tabs}>
          <Tab className={styles.tabButton} key="drivers" title="Motoristas">
            <div className={styles.driverTab}>
              {drivers.map((driver, key) => (
                <DriverCard key={key} email={driver.email} name={driver.name} />
              ))}
              <div className={styles.buttonContainer}>
                <DriverModal />
              </div>
            </div>
          </Tab>
          <Tab className={styles.tabButton} key="organizations" title="Organizações">
            <div className={styles.driverTab}>
              {workshops.map((driver, key) => (
                <DriverCard key={key} email={driver.email} name={driver.company_name} />
              ))}
              <div className={styles.buttonContainer}>
                <OrganizationModal />
              </div>
            </div>
          </Tab>
          <Tab className={styles.tabButton} key="users" title="Usuários">
            <div className={styles.driverTab}>
              {users.map((driver, key) => (
                <DriverCard key={key} email={driver.email} name={driver.name} />
              ))}
              <div className={styles.buttonContainer}>
                <UserModal />
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
