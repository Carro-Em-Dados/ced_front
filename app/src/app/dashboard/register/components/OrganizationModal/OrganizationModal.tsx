import React, { useEffect, useState } from "react";
import {
	Button,
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

export default function OrganizationModal() {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [tab, setTab] = useState("tab1");
	const [fantasyName, setFantasyName] = useState("");
	const [contractNumber, setContractNumber] = useState("");
	const [registrationNumber, setRegistrationNumber] = useState("");
	const [corporateName, setCorporateName] = useState("");
	const [cnpj, setCnpj] = useState("");
	const [stateRegistration, setStateRegistration] = useState("");
	const [municipalRegistration, setMunicipalRegistration] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [contact, setContact] = useState("");
	const [profileType, setProfileType] = useState("basic");
	const [clientMotoristCount, setClientMotoristCount] = useState("");
	const [vehicleCount, setVehicleCount] = useState("");
	const [alarmCount, setAlarmCount] = useState("");
	const [maintenanceAlarmCount, setMaintenanceAlarmCount] = useState("");
	const [notificationFactor, setNotificationFactor] = useState("");
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

	useEffect(() => {
		setClientMotoristCount("");
		setVehicleCount("");
		setAlarmCount("");
		setMaintenanceAlarmCount("");
		setNotificationFactor("");
		if (profileType === "basic") {
			setClientMotoristCount("10");
			setVehicleCount("10");
			setAlarmCount("10");
			setMaintenanceAlarmCount("10");
			setNotificationFactor("10");
		}
	}, [profileType]);

	const tabs = ["tab1", "tab2", "tab3", "tab4"];

	const requiredFields = {
		tab1: [
			{ value: fantasyName, name: "Nome Fantasia" },
			{ value: contractNumber, name: "N° Contrato" },
			{ value: registrationNumber, name: "N° Cadastro" },
			{ value: corporateName, name: "Razão Social" },
			{ value: cnpj, name: "CNPJ" },
			{ value: email, name: "E-mail" },
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
				value: notificationFactor,
				name: "Fator de disparo de notificação à oficina",
			},
		],
		tab3: [
			{ value: address, name: "Endereço" },
			{ value: website, name: "Site" },
			{ value: cnae, name: "CNAE" },
			{ value: employeesCount, name: "Qtd. Colaboradores" },
			{ value: productiveVacanciesCount, name: "Qtd. Vagas produtivas" },
			{ value: branch, name: "Filial (S/N)" },
			{ value: averageTicket, name: "Ticket médio" },
			{ value: billing, name: "Faturamento" },
			{ value: monthlyFinancialGoal, name: "Meta financeira mensal" },
		],
	};

	const nextPage = () => {
		const currentFields = requiredFields[tab as keyof typeof requiredFields];
		for (const field of currentFields) {
			if (!field.value) {
				alert(`Por favor, preencha o campo: ${field.name}`);
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

	return (
		<>
			<Button
				color="success"
				className={styles.button}
				onClick={onOpen}
			>
				<MdLibraryAdd className={styles.addIcon} />
				Adicionar organização
			</Button>
			<Modal
				isOpen={isOpen}
				className={`${styles.modal} overflow-auto`}
				size={"2xl"}
				onOpenChange={onOpenChange}
				placement="top-center"
				scrollBehavior="outside"
			>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader
								className={clsx("flex flex-col gap-1", styles.modalTitle)}
							>
								Adicionar Organização
							</ModalHeader>
							<ModalBody>
								{tab === "tab1" && (
									<div className={styles.form}>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Nome Fantasia*"
												value={fantasyName}
												onChange={(e) => setFantasyName(e.target.value)}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="N° Contrato*"
												value={contractNumber}
												onChange={(e) => setContractNumber(e.target.value)}
											/>
											<span className={styles.horizontalSpace} />
											<input
												className={styles.modalInput}
												placeholder="N° Cadastro*"
												value={registrationNumber}
												onChange={(e) => setRegistrationNumber(e.target.value)}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Razão Social*"
												value={corporateName}
												onChange={(e) => setCorporateName(e.target.value)}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="CNPJ*"
												value={cnpj}
												onChange={(e) => setCnpj(e.target.value)}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Inscrição Estadual"
												value={stateRegistration}
												onChange={(e) => setStateRegistration(e.target.value)}
											/>
											<span className={styles.horizontalSpace} />
											<input
												className={styles.modalInput}
												placeholder="Inscrição Municipal"
												value={municipalRegistration}
												onChange={(e) =>
													setMunicipalRegistration(e.target.value)
												}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="E-mail*"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Telefone*"
												value={phone}
												onChange={(e) => setPhone(e.target.value)}
											/>
											<span className={styles.horizontalSpace} />
											<input
												className={styles.modalInput}
												placeholder="Contato*"
												value={contact}
												onChange={(e) => setContact(e.target.value)}
											/>
										</div>
										<p className="self-end text-white text-sm">
											Campos com (*) são obrigatórios
										</p>
										<h2 className={styles.modalLabel}>Tipo de perfil</h2>
										<RadioGroup
											orientation="horizontal"
											color="success"
											value={profileType}
											onChange={(e) => {
												setProfileType(e.target.value);
											}}
										>
											<Radio value="basic">
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
													<p>Qtd. de cadastros de clientes-motoristas: 999</p>
													<p>
														Qtd. de cadastros de veículos por
														clientes-motoristas: 999
													</p>
													<p>
														Qtd. de alarmes por KM limite/Data limite por
														veículo: 999
													</p>
													<p>
														Período (dias) de experimentação do plano
														customizado: 999
													</p>
												</div>
											</div>
										) : (
											<>
												<div>
													<input
														className={styles.modalInput}
														placeholder="Qtd. cadastros de clientes-motoristas*"
														type="number"
														value={clientMotoristCount}
														onChange={(e) =>
															setClientMotoristCount(e.target.value)
														}
													/>
												</div>
												<div>
													<input
														className={styles.modalInput}
														placeholder="Qtd. cadastros de veículos por clientes-motoristas*"
														type="number"
														value={vehicleCount}
														onChange={(e) => setVehicleCount(e.target.value)}
													/>
												</div>
												<div>
													<input
														className={styles.modalInput}
														placeholder="Qtd. de alarmes por KM limite/Data limite por veículo*"
														type="number"
														value={alarmCount}
														onChange={(e) => setAlarmCount(e.target.value)}
													/>
												</div>
												<div>
													<input
														className={styles.modalInput}
														placeholder="Qtd. de alarmes de manutenção por cliente*"
														type="number"
														value={maintenanceAlarmCount}
														onChange={(e) =>
															setMaintenanceAlarmCount(e.target.value)
														}
													/>
												</div>
												<p className="self-end text-white text-sm">
													Campos com (*) são obrigatórios
												</p>
												<h2 className={styles.modalLabel}>
													Fator de disparo de notificação à oficina
												</h2>
												<Select
													value={notificationFactor}
													onChange={(e) =>
														setNotificationFactor(e.target.value)
													}
												>
													<SelectItem
														key={"1"}
														value="1"
													>
														1
													</SelectItem>
													<SelectItem
														key={"2"}
														value="2"
													>
														2
													</SelectItem>
													<SelectItem
														key={"3"}
														value="3"
													>
														3
													</SelectItem>
													<SelectItem
														key={"4"}
														value="4"
													>
														4
													</SelectItem>
												</Select>
											</>
										)}
									</div>
								)}
								{tab === "tab3" && (
									<div className={styles.form}>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Endereço*"
												value={address}
												onChange={(e) => setAddress(e.target.value)}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Site*"
												value={website}
												onChange={(e) => setWebsite(e.target.value)}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="CNAE*"
												value={cnae}
												onChange={(e) => setCnae(e.target.value)}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="CNAE outros"
												value={cnaeOthers}
												onChange={(e) => setCnaeOthers(e.target.value)}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Qtd. Colaboradores*"
												type="number"
												value={employeesCount}
												onChange={(e) => setEmployeesCount(e.target.value)}
											/>
											<span className={styles.horizontalSpace} />
											<input
												className={styles.modalInput}
												placeholder="Qtd. Vagas produtivas*"
												type="number"
												value={productiveVacanciesCount}
												onChange={(e) =>
													setProductiveVacanciesCount(e.target.value)
												}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Filial (S/N)"
												value={branch}
												onChange={(e) => setBranch(e.target.value)}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Ticket médio*"
												value={averageTicket}
												type="number"
												onChange={(e) => setAverageTicket(e.target.value)}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Faturamento*"
												value={billing}
												type="number"
												onChange={(e) => setBilling(e.target.value)}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Meta financeira mensal*"
												value={monthlyFinancialGoal}
												type="number"
												onChange={(e) =>
													setMonthlyFinancialGoal(e.target.value)
												}
											/>
										</div>
										<p className="self-end text-white text-sm">
											Campos com (*) são obrigatórios
										</p>
									</div>
								)}
								{tab === "tab4" && (
									<div className={styles.form}>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Instagram"
												value={instagram}
												onChange={(e) => {
													setInstagram(e.target.value);
												}}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Facebook"
												value={facebook}
												onChange={(e) => {
													setFacebook(e.target.value);
												}}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Youtube"
												value={youtube}
												onChange={(e) => {
													setYoutube(e.target.value);
												}}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="LinkedIn"
												value={linkedin}
												onChange={(e) => {
													setLinkedin(e.target.value);
												}}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Twitter"
												value={twitter}
												onChange={(e) => {
													setTwitter(e.target.value);
												}}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Outros 1"
												value={other1}
												onChange={(e) => {
													setOther1(e.target.value);
												}}
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Outros 2"
												value={other2}
												onChange={(e) => {
													setOther2(e.target.value);
												}}
											/>
										</div>
									</div>
								)}
							</ModalBody>
							<ModalFooter>
								{tab !== "tab1" && (
									<Button
										className={`${styles.modalButton} bg-gradient-to-r from-blue-400 via-green-500 to-yellow-500`}
										onClick={prevPage}
									>
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
										<Radio
											key={tabValue}
											value={tabValue}
										/>
									))}
								</RadioGroup>
								<Button
									color="success"
									className={styles.modalButton}
									onClick={tab === "tab4" ? prevPage : nextPage}
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
