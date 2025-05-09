import React, { ReactNode, useContext, useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import clsx from "clsx";
import { MdLibraryAdd } from "react-icons/md";
import styles from "../../styles.module.scss";
import { addDoc, collection, doc, getDoc, getDocs, query, Timestamp, where } from "firebase/firestore";
import { AuthContext } from "@/contexts/auth.context";
import { defaultServices } from "@/constants/defaultServices";
import { toast, Zoom } from "react-toastify";
import { Contract } from "@/interfaces/contract.type";
import InputMask from "react-input-mask";
import { createGoogleCalendar } from "@/services/google-calendar";
import { FaArrowLeft } from "react-icons/fa";
import { Role } from "@/types/enums/role.enum";
import { User } from "@/interfaces/user.type";
import { WorkshopContext } from "@/contexts/workshop.context";

interface Props {
  setWorkshops: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function WorkshopModal({ setWorkshops }: Props) {
  const { db, currentUser } = useContext(AuthContext);
  const { refecth } = useContext(WorkshopContext);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [tab, setTab] = useState("tab1");
  const [fantasyName, setFantasyName] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [corporateName, setCorporateName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [stateRegistration, setStateRegistration] = useState("");
  const [municipalRegistration, setMunicipalRegistration] = useState("");
  const [email, setEmail] = useState("");
  const [owner, setOwner] = useState(currentUser?.role === Role.ORGANIZATION ? currentUser?.id : "");
  const [phone, setPhone] = useState("");
  const [contact, setContact] = useState("");
  const [profileType, setProfileType] = useState("basic");
  const [clientMotoristCount, setClientMotoristCount] = useState("");
  const [vehicleCount, setVehicleCount] = useState("");
  const [alarmCount, setAlarmCount] = useState("");
  const [schedulesLimit, setSchedulesLimit] = useState("");
  const [maintenanceAlarmCount, setMaintenanceAlarmCount] = useState("");
  const [workshopKmNotificationFactor, setWorkshopKmNotificationFactor] = useState("");
  const [workshopDateNotificationFactor, setWorkshopDateNotificationFactor] = useState("");
  const [userKmNotificationFactor, setUserKmNotificationFactor] = useState("");
  const [userDateNotificationFactor, setUserDateNotificationFactor] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [cnae, setCnae] = useState("");
  const [cnaeOthers, setCnaeOthers] = useState("");
  const [employeesCount, setEmployeesCount] = useState("");
  const [productiveVacanciesCount, setProductiveVacanciesCount] = useState("");
  const [branch, setBranch] = useState("");
  const [averageTicket, setAverageTicket] = useState("");
  const [billing, setBilling] = useState("");
  const [monthlyFinancialGoal, setMonthlyFinancialGoal] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [youtube, setYoutube] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [other1, setOther1] = useState("");
  const [other2, setOther2] = useState("");
  const [loading, setLoading] = useState(false);

  const [basicContractData, setBasicContractData] = useState<Contract>({
    maxAlarmsPerVehicle: 0,
    maxDrivers: 0,
    maxMaintenanceAlarmsPerUser: 0,
    maxVehiclesPerDriver: 0,
    freemiumPeriod: 0,
    userDateLimitAlarm: 0,
    userKmLimitAlarm: 0,
    workshopDateLimitAlarm: 0,
    workshopKmLimitAlarm: 0,
    workshopScheduleLimit: 0,
    id: "",
  });

  const [organizationUsers, setOrganizationUsers] = useState<User[]>([]);

  useEffect(() => {
    getBasicContract();
    getOrganizationUsers();
  }, []);

  useEffect(() => {
    const isBasicContract = profileType === "basic";

    setClientMotoristCount(isBasicContract ? basicContractData?.maxDrivers?.toString() : "");
    setVehicleCount(isBasicContract ? basicContractData?.maxVehiclesPerDriver?.toString() : "");
    setAlarmCount(isBasicContract ? basicContractData?.maxAlarmsPerVehicle?.toString() : "");
    setMaintenanceAlarmCount(isBasicContract ? basicContractData?.maxMaintenanceAlarmsPerUser?.toString() : "");
    setWorkshopKmNotificationFactor(isBasicContract ? basicContractData?.workshopKmLimitAlarm?.toString() : "");
    setWorkshopDateNotificationFactor(isBasicContract ? basicContractData?.workshopDateLimitAlarm?.toString() : "");
    setUserKmNotificationFactor(isBasicContract ? basicContractData?.userKmLimitAlarm?.toString() : "");
    setUserDateNotificationFactor(isBasicContract ? basicContractData?.userDateLimitAlarm?.toString() : "");
    setSchedulesLimit(isBasicContract ? basicContractData?.workshopScheduleLimit?.toString() : "");
  }, [profileType, basicContractData]);

  const tabs = ["tab1", "tab2", "tab3", "tab4"];

  const requiredFields = {
    tab1: [
      { value: owner, name: "Usúario responsável" },
      { value: fantasyName, name: "Nome Fantasia" },
      { value: contractNumber, name: "N° Contrato" },
      { value: registrationNumber, name: "N° Cadastro" },
      { value: corporateName, name: "Razão Social" },
      { value: cnpj, name: "CNPJ" },
      { value: phone, name: "Telefone" },
      { value: contact, name: "Contato" },
      { value: profileType, name: "Tipo de perfil" },
    ],
    tab2: [
      {
        value: clientMotoristCount,
        name: "Qtd. cadastros de clientes-motoristas",
      },
      {
        value: vehicleCount,
        name: "Qtd. cadastros de veículos por clientes-motoristas",
      },
      {
        value: alarmCount,
        name: "Qtd. de alarmes por KM limite/Data limite por veículo",
      },
      {
        value: maintenanceAlarmCount,
        name: "Qtd. de alarmes de manutenção por cliente",
      },
      {
        value: workshopKmNotificationFactor,
        name: "Fator de notificação KM por Workshop",
      },
      {
        value: workshopDateNotificationFactor,
        name: "Fator de notificação Data por Workshop",
      },
      {
        value: userKmNotificationFactor,
        name: "Fator de notificação KM por Usuário",
      },
      {
        value: userDateNotificationFactor,
        name: "Fator de notificação Data por Usuário",
      },
    ],
    tab3: [
      { value: address, name: "Endereço" },
      { value: website, name: "Site" },
      { value: cnae, name: "CNAE" },
      { value: employeesCount, name: "Qtd. Colaboradores" },
      { value: productiveVacanciesCount, name: "Qtd. Vagas produtivas" },
      { value: averageTicket, name: "Ticket médio" },
      { value: billing, name: "Faturamento" },
      { value: monthlyFinancialGoal, name: "Meta financeira mensal" },
    ],
  };

  const nextPage = () => {
    const currentFields = requiredFields[tab as keyof typeof requiredFields];
    for (const field of currentFields) {
      if (!field.value) {
        toast.error(`Por favor, preencha todos os campos obrigatórios: ${field.name}`, {
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

    const currentIndex = tabs.indexOf(tab);
    if (currentIndex < tabs.length - 1) {
      setTab(tabs[currentIndex + 1]);
    }
  };

  const prevPage = () => {
    const currentIndex = tabs.indexOf(tab);
    if (currentIndex > 0) {
      setTab(tabs[currentIndex - 1]);
    }
  };

  const createWorkshop = async () => {
    setLoading(true);
    const contract = {
      maxAlarmsPerVehicle: +alarmCount,
      maxMaintenanceAlarmsPerUser: +maintenanceAlarmCount,
      maxDrivers: +clientMotoristCount,
      maxVehiclesPerDriver: +vehicleCount,
      workshopKmLimitAlarm: +workshopKmNotificationFactor,
      workshopDateLimitAlarm: +workshopDateNotificationFactor,
      userKmLimitAlarm: +userKmNotificationFactor,
      userDateLimitAlarm: +userDateNotificationFactor,
      freemiumPeriod: 0,
      workshopScheduleLimit: +schedulesLimit,
    };

    try {
      const contractRef = profileType === "basic" ? { id: "basic" } : await addDoc(collection(db, "contracts"), contract);

      const workshop = {
        fantasy_name: fantasyName,
        contract_number: +contractNumber,
        registration_number: +registrationNumber,
        company_name: corporateName,
        cnpj: cnpj,
        email: email,
        owner: owner,
        phone: phone,
        contact: contact,
        address: address,
        website: website,
        cnae1: cnae,
        cnae2: cnaeOthers,
        collaborators_amount: +employeesCount,
        active_workers: +productiveVacanciesCount,
        branch: branch,
        average_ticket: +averageTicket,
        billing: +billing,
        monthly_goal: +monthlyFinancialGoal,
        state_registration: stateRegistration,
        municipal_registration: municipalRegistration,
        social: {
          instagram,
          facebook,
          youtube,
          linkedin,
          twitter,
          other1,
          other2,
        },
        contract: profileType === "basic" ? "basic" : contractRef.id,
        createdAt: Timestamp.now(),
        google_calendar_id: "disabled",
      };

      // (workshop as any).google_calendar_id = await createGoogleCalendar(`${workshop.fantasy_name} - ${workshop.cnpj}`, [
      //   workshop.email,
      //   "carroemdados@gmail.com",
      // ]);

      const workshopRef = await addDoc(collection(db, "workshops"), workshop);

      const workshopServices = defaultServices.map((service) => ({
        ...service,
        workshop: workshopRef.id,
      }));

      const servicesPromises = workshopServices.map((service) => addDoc(collection(db, "services"), service));
      await Promise.all(servicesPromises);

      setWorkshops((workshops) => [...workshops, { ...workshop, id: workshopRef.id }]);
      refecth();
      handleClose();
    } catch (error) {
      toast.error("Erro ao criar oficina", {
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

  const getBasicContract = async () => {
    const contractDocRef = doc(db, "contracts", "basic");
    const contractDoc = await getDoc(contractDocRef);

    if (contractDoc.exists()) {
      setBasicContractData(contractDoc.data() as Contract);
    }
  };

  const getOrganizationUsers = async () => {
    const q = query(collection(db, "users"), where("role", "==", Role.ORGANIZATION));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) setOrganizationUsers(querySnapshot.docs.map((doc) => doc.data() as User));
  };

  const handleClose = () => {
    setTab("tab1");
    setProfileType("basic");
    setFantasyName("");
    setContractNumber("");
    setRegistrationNumber("");
    setCorporateName("");
    setCnpj("");
    setStateRegistration("");
    setMunicipalRegistration("");
    setEmail("");
    setOwner(currentUser?.role === Role.ORGANIZATION ? currentUser?.id : "");
    setPhone("");
    setContact("");
    setClientMotoristCount("");
    setVehicleCount("");
    setAlarmCount("");
    setSchedulesLimit("");
    setMaintenanceAlarmCount("");
    setWorkshopKmNotificationFactor("");
    setWorkshopDateNotificationFactor("");
    setUserKmNotificationFactor("");
    setUserDateNotificationFactor("");
    setAddress("");
    setWebsite("");
    setCnae("");
    setCnaeOthers("");
    setEmployeesCount("");
    setProductiveVacanciesCount("");
    setBranch("");
    setAverageTicket("");
    setBilling("");
    setMonthlyFinancialGoal("");
    setInstagram("");
    setFacebook("");
    setYoutube("");
    setLinkedin("");
    setTwitter("");
    setOther1("");
    setOther2("");
    onClose();
  };

  return (
    <>
      <Button color="success" className={clsx(styles.button, "!fixed bottom-0 right-0 z-10 shadow-md mb-5 mr-5")} onClick={onOpen}>
        <MdLibraryAdd className={styles.addIcon} />
        Adicionar oficina
      </Button>
      <Modal
        isOpen={isOpen}
        className={`${styles.modal} overflow-auto`}
        size={"2xl"}
        onOpenChange={onOpenChange}
        onClose={handleClose}
        placement="top-center"
        scrollBehavior="outside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className={clsx("flex flex-col gap-1", styles.modalTitle)}>Adicionar Oficina</ModalHeader>
              <ModalBody>
                {tab === "tab1" && (
                  <div className={clsx(styles.form, "flex flex-col gap-4")}>
                    {currentUser?.role === Role.MASTER && (<div>
                      <Select
                        label="Usuário responsável*"
                        variant="bordered"
                        className="dark"
                        classNames={{
                          trigger: "!border-white rounded-[1em]",
                        }}
                        value={owner}
                        onChange={(e) => setOwner(e.target.value)}
                      >
                        {organizationUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    )}
                    <div>
                      <Input
                        label="E-mail*"
                        value={email}
                        type="email"
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
                        type="text"
                        value={fantasyName}
                        onChange={(e) => setFantasyName(e.target.value)}
                        variant="bordered"
                        label="Nome Fantasia*"
                        className="dark"
                        classNames={{
                          input: ["bg-transparent text-white"],
                          inputWrapper: ["border border-2 !border-white focus:border-white"],
                        }}
                      />
                    </div>
                    <div className="flex flex-row gap-5">
                      <Input
                        min={0}
                        label="N° Contrato*"
                        type="number"
                        value={contractNumber}
                        onChange={(e) => setContractNumber(e.target.value)}
                        variant="bordered"
                        className="dark"
                        classNames={{
                          input: ["bg-transparent text-white"],
                          inputWrapper: ["border border-2 !border-white focus:border-white"],
                        }}
                      />
                      <Input
                        min={0}
                        type="number"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        label="N° Cadastro*"
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
                        label="Razão Social*"
                        value={corporateName}
                        onChange={(e) => setCorporateName(e.target.value)}
                        variant="bordered"
                        className="dark"
                        classNames={{
                          input: ["bg-transparent text-white"],
                          inputWrapper: ["border border-2 !border-white focus:border-white"],
                        }}
                      />
                    </div>
                    <div>
                      <InputMask mask="99.999.999/9999-99" value={cnpj} onChange={(e) => setCnpj(e.target.value)} maskChar={null}>
                        {
                          ((inputProps: any) => (
                            <Input
                              type="text"
                              label="CNPJ*"
                              variant="bordered"
                              className="dark"
                              classNames={{
                                input: ["bg-transparent text-white"],
                                inputWrapper: ["border border-2 !border-white focus:border-white"],
                              }}
                            />
                          ))
                        }
                      </InputMask>
                    </div>
                    <div className="flex flex-row gap-5">
                      <Input
                        type="text"
                        label="Inscrição Estadual"
                        value={stateRegistration}
                        onChange={(e) => setStateRegistration(e.target.value)}
                        variant="bordered"
                        className="dark"
                        classNames={{
                          input: ["bg-transparent text-white"],
                          inputWrapper: ["border border-2 !border-white focus:border-white"],
                        }}
                      />
                      <Input
                        type="text"
                        label="Inscrição Municipal"
                        value={municipalRegistration}
                        onChange={(e) => setMunicipalRegistration(e.target.value)}
                        variant="bordered"
                        className="dark"
                        classNames={{
                          input: ["bg-transparent text-white"],
                          inputWrapper: ["border border-2 !border-white focus:border-white"],
                        }}
                      />
                    </div>
                    <div className="flex flex-row gap-5">
                      <InputMask mask="(99) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} maskChar={null}>
                        {
                          ((inputProps: any) => (
                            <Input
                              type="tel"
                              label="Telefone*"
                              variant="bordered"
                              className="dark"
                              classNames={{
                                input: ["bg-transparent text-white"],
                                inputWrapper: ["border border-2 !border-white focus:border-white"],
                              }}
                            />
                          ))
                        }
                      </InputMask>
                      <InputMask mask="(99) 99999-9999" value={contact} onChange={(e) => setContact(e.target.value)} maskChar={null}>
                        {
                          ((inputProps: any) => (
                            <Input
                              {...inputProps}
                              type="text"
                              label="Contato*"
                              variant="bordered"
                              className="dark"
                              classNames={{
                                input: ["bg-transparent text-white"],
                                inputWrapper: ["border border-2 !border-white focus:border-white"],
                              }}
                            />
                          ))
                        }
                      </InputMask>
                    </div>
                    <p className="self-end text-white text-sm">Campos com (*) são obrigatórios</p>
                    <h2 className={styles.modalLabel}>Tipo de perfil</h2>
                    <RadioGroup
                      orientation="horizontal"
                      color="success"
                      value={profileType}
                      onChange={(e) => {
                        setProfileType(e.target.value);
                      }}
                    >
                      <Radio value="basic" disabled={!basicContractData.id}>
                        <p className={styles.modalText}>Básico</p>
                      </Radio>
                      <span className={styles.horizontalSpace} />
                      <Radio value="custom">
                        <p className={styles.modalText}>Customizado</p>
                      </Radio>
                    </RadioGroup>
                  </div>
                )}
                {tab === "tab2" && (
                  <div className={styles.form}>
                    {profileType === "basic" ? (
                      <div className="flex flex-col gap-5 text-white">
                        <p className="text-lg font-medium">Plano básico</p>
                        <div className="flex flex-col gap-2">
                          <p>Qtd. de cadastros de clientes-motoristas: {clientMotoristCount}</p>
                          <p>Qtd. de cadastros de veículos por clientes-motoristas: {vehicleCount}</p>
                          <p>Qtd. de alarmes por KM limite/Data limite por veículo: {alarmCount}</p>
                          <p>Qtd. de agendamentos de manutenções: {schedulesLimit}</p>
                          <p>Período (dias) de experimentação do plano customizado: {basicContractData?.freemiumPeriod ?? 0}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-4">
                          <div>
                            <Input
                              min={0}
                              label="Qtd. cadastros de clientes-motoristas*"
                              type="number"
                              value={clientMotoristCount}
                              onChange={(e) => setClientMotoristCount(e.target.value)}
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
                              min={0}
                              label="Qtd. cadastros de veículos por clientes-motoristas*"
                              type="number"
                              value={vehicleCount}
                              onChange={(e) => setVehicleCount(e.target.value)}
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
                              min={0}
                              label="Qtd. de alarmes por KM limite/Data limite por veículo*"
                              type="number"
                              value={alarmCount}
                              onChange={(e) => setAlarmCount(e.target.value)}
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
                              min={0}
                              label="Qtd. de alarmes de manutenção por cliente*"
                              type="number"
                              value={maintenanceAlarmCount}
                              onChange={(e) => setMaintenanceAlarmCount(e.target.value)}
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
                              min={0}
                              label="Qtd. de agendamentos de manutenções*"
                              type="number"
                              value={schedulesLimit}
                              onChange={(e) => setSchedulesLimit(e.target.value)}
                              variant="bordered"
                              className="dark"
                              classNames={{
                                input: ["bg-transparent text-white"],
                                inputWrapper: ["border border-2 !border-white focus:border-white"],
                              }}
                            />
                          </div>
                          <p className="self-end text-white text-sm">Campos com (*) são obrigatórios</p>
                        </div>
                        <h2 className={styles.modalLabel}>Fator de disparo de notificação à oficina</h2>
                        <fieldset className="text-white flex gap-2">
                          <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="workshopKmLimitAlarm">KM antes do Limite</label>
                            <Select
                              name="workshopKmLimitAlarm"
                              variant="bordered"
                              className="dark text-white"
                              classNames={{
                                trigger: "!border-white rounded-[1em]",
                              }}
                              value={workshopKmNotificationFactor}
                              onChange={(e) => setWorkshopKmNotificationFactor(e.target.value)}
                              aria-label="workshopKmLimitAlarm"
                            >
                              <SelectItem key={"1000"} value="1000">
                                1000 km
                              </SelectItem>
                              <SelectItem key={"2000"} value="2000">
                                2000 km
                              </SelectItem>
                              <SelectItem key={"3000"} value="3000">
                                3000 km
                              </SelectItem>
                              <SelectItem key={"4000"} value="4000">
                                4000 km
                              </SelectItem>
                              <SelectItem key={"5000"} value="5000">
                                5000 km
                              </SelectItem>
                            </Select>
                          </div>
                          <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="workshopDateNotificationFactor">Data antes do Limite</label>
                            <Select
                              name="workshopDateNotificationFactor"
                              variant="bordered"
                              className="dark text-white"
                              classNames={{
                                trigger: "!border-white rounded-[1em]",
                              }}
                              value={workshopDateNotificationFactor}
                              onChange={(e) => setWorkshopDateNotificationFactor(e.target.value)}
                              aria-label="workshopDateNotificationFactor"
                            >
                              <SelectItem key={"1"} value="1">
                                1 dia
                              </SelectItem>
                              <SelectItem key={"5"} value="5">
                                5 dias
                              </SelectItem>
                              <SelectItem key={"10"} value="10">
                                10 dias
                              </SelectItem>
                              <SelectItem key={"15"} value="15">
                                15 dias
                              </SelectItem>
                            </Select>
                          </div>
                        </fieldset>
                        <h2 className={styles.modalLabel}>Fator de disparo de notificação ao usuário</h2>
                        <fieldset className="text-white flex gap-2">
                          <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="userKmLimitNotificationFactor">KM Limite</label>
                            <Select
                              name="userKmLimitNotificationFactor"
                              variant="bordered"
                              className="dark text-white"
                              classNames={{
                                trigger: "!border-white rounded-[1em]",
                              }}
                              value={userKmNotificationFactor}
                              onChange={(e) => setUserKmNotificationFactor(e.target.value)}
                              aria-label="userKmLimitNotificationFactor"
                            >
                              <SelectItem key={"200"} value="200">
                                200 km
                              </SelectItem>
                              <SelectItem key={"400"} value="400">
                                400 km
                              </SelectItem>
                              <SelectItem key={"600"} value="600">
                                600 km
                              </SelectItem>
                              <SelectItem key={"800"} value="800">
                                800 km
                              </SelectItem>
                              <SelectItem key={"1000"} value="1000">
                                1000 km
                              </SelectItem>
                            </Select>
                          </div>
                          <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="userDateNotificationFactor">Data Limite</label>
                            <Select
                              name="userDateNotificationFactor"
                              variant="bordered"
                              className="dark text-white"
                              classNames={{
                                trigger: "!border-white rounded-[1em]",
                              }}
                              value={userDateNotificationFactor}
                              onChange={(e) => setUserDateNotificationFactor(e.target.value)}
                              aria-label="userDateNotificationFactor"
                            >
                              <SelectItem key={"1"} value="1">
                                1 dia
                              </SelectItem>
                              <SelectItem key={"2"} value="2">
                                2 dias
                              </SelectItem>
                              <SelectItem key={"4"} value="4">
                                4 dias
                              </SelectItem>
                              <SelectItem key={"6"} value="6">
                                6 dias
                              </SelectItem>
                              <SelectItem key={"8"} value="8">
                                8 dias
                              </SelectItem>
                              <SelectItem key={"10"} value="10">
                                10 dias
                              </SelectItem>
                            </Select>
                          </div>
                        </fieldset>
                      </>
                    )}
                  </div>
                )}
                {tab === "tab3" && (
                  <div className={clsx(styles.form, "flex flex-col gap-4")}>
                    <div>
                      <Input
                        type="text"
                        label="Endereço*"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
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
                        label="Site*"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
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
                        label="CNAE*"
                        value={cnae}
                        onChange={(e) => setCnae(e.target.value)}
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
                        label="CNAE outros"
                        value={cnaeOthers}
                        onChange={(e) => setCnaeOthers(e.target.value)}
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
                        min={0}
                        label="Qtd. Colaboradores*"
                        type="number"
                        value={employeesCount}
                        onChange={(e) => setEmployeesCount(e.target.value)}
                        variant="bordered"
                        className="dark"
                        classNames={{
                          input: ["bg-transparent text-white"],
                          inputWrapper: ["border border-2 !border-white focus:border-white"],
                        }}
                      />
                      <Input
                        min={0}
                        label="Qtd. Vagas produtivas*"
                        type="number"
                        value={productiveVacanciesCount}
                        onChange={(e) => setProductiveVacanciesCount(e.target.value)}
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
                        min={0}
                        type="text"
                        label="Filial (S/N)"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
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
                        min={0}
                        label="Ticket médio*"
                        value={averageTicket}
                        type="number"
                        onChange={(e) => setAverageTicket(e.target.value)}
                        variant="bordered"
                        className="dark"
                        classNames={{
                          input: ["bg-transparent text-white"],
                          inputWrapper: ["border border-2 !border-white focus:border-white"],
                        }}
                        startContent={
                          <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">R$</span>
                          </div>
                        }
                      />
                    </div>
                    <div>
                      <Input
                        min={0}
                        label="Faturamento*"
                        value={billing}
                        type="number"
                        onChange={(e) => setBilling(e.target.value)}
                        variant="bordered"
                        className="dark"
                        classNames={{
                          input: ["bg-transparent text-white"],
                          inputWrapper: ["border border-2 !border-white focus:border-white"],
                        }}
                        startContent={
                          <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">R$</span>
                          </div>
                        }
                      />
                    </div>
                    <div>
                      <Input
                        min={0}
                        label="Meta financeira mensal*"
                        value={monthlyFinancialGoal}
                        type="number"
                        onChange={(e) => setMonthlyFinancialGoal(e.target.value)}
                        variant="bordered"
                        className="dark"
                        classNames={{
                          input: ["bg-transparent text-white"],
                          inputWrapper: ["border border-2 !border-white focus:border-white"],
                        }}
                        startContent={
                          <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">R$</span>
                          </div>
                        }
                      />
                    </div>
                    <p className="self-end text-white text-sm">Campos com (*) são obrigatórios</p>
                  </div>
                )}
                {tab === "tab4" && (
                  <div className={clsx(styles.form, "flex flex-col gap-4")}>
                    <div>
                      <Input
                        type="text"
                        label="Instagram"
                        value={instagram}
                        onChange={(e) => {
                          setInstagram(e.target.value);
                        }}
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
                        label="Facebook"
                        value={facebook}
                        onChange={(e) => {
                          setFacebook(e.target.value);
                        }}
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
                        label="Youtube"
                        value={youtube}
                        onChange={(e) => {
                          setYoutube(e.target.value);
                        }}
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
                        label="LinkedIn"
                        value={linkedin}
                        onChange={(e) => {
                          setLinkedin(e.target.value);
                        }}
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
                        label="Twitter"
                        value={twitter}
                        onChange={(e) => {
                          setTwitter(e.target.value);
                        }}
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
                        label="Outros 1"
                        value={other1}
                        onChange={(e) => {
                          setOther1(e.target.value);
                        }}
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
                        label="Outros 2"
                        value={other2}
                        onChange={(e) => {
                          setOther2(e.target.value);
                        }}
                        variant="bordered"
                        className="dark"
                        classNames={{
                          input: ["bg-transparent text-white"],
                          inputWrapper: ["border border-2 !border-white focus:border-white"],
                        }}
                      />
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                {tab !== "tab1" && (
                  <Button variant="light" onClick={prevPage} className="rounded-full px-5 text-white">
                    <FaArrowLeft />
                    Voltar
                  </Button>
                )}
                <RadioGroup
                  orientation="horizontal"
                  color="success"
                  className="mx-auto mt-4"
                  onValueChange={(value) => setTab(value)}
                  value={tab}
                  isDisabled
                >
                  {tabs.map((tabValue) => (
                    <Radio key={tabValue} value={tabValue} />
                  ))}
                </RadioGroup>
                <Button
                  color="success"
                  className={styles.modalButton}
                  onClick={tab === "tab4" ? createWorkshop : nextPage}
                  disabled={loading}
                >
                  {tab === "tab4" ? "Adicionar" : "Próximo"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
