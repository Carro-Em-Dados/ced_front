import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Radio,
	RadioGroup,
	useDisclosure,
} from "@nextui-org/react";
import clsx from "clsx";
import { MdLibraryAdd } from "react-icons/md";
import styles from "../../styles.module.scss";
import { useState } from "react";
import { profile } from "console";

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
				onPress={onOpen}
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
											<></>
										)}
									</div>
								)}
							</ModalBody>
							<ModalFooter>
								{tab !== "tab1" && (
									<Button
										className={`${styles.modalButton} bg-gradient-to-r from-blue-400 via-green-500 to-yellow-500`}
										onPress={prevPage}
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
									isDisabled={true}
								>
									<Radio value="tab1" />
									<Radio value="tab2" />
									<Radio value="tab3" />
									<Radio value="tab4" />
								</RadioGroup>
								<Button
									color="success"
									className={styles.modalButton}
									onPress={tab === "tab4" ? prevPage : nextPage}
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
