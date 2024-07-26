import { AuthContext } from "@/contexts/auth.context";
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	useDisclosure,
} from "@nextui-org/react";
import clsx from "clsx";
import { doc, updateDoc } from "firebase/firestore";
import { useContext, useState } from "react";
import styles from "../../styles.module.scss";
import { BiEdit } from "react-icons/bi";
import { Workshop } from "@/interfaces/workshop.type";
import { toast, Zoom } from "react-toastify";

interface Props {
	workshop: Workshop;
	setWorkshops: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function EditOrganization({ workshop, setWorkshops }: Props) {
	const { db } = useContext(AuthContext);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [fantasyName, setFantasyName] = useState(workshop.fantasy_name || "");
	const [contractNumber, setContractNumber] = useState(
		workshop.contract_number || ""
	);
	const [registrationNumber, setRegistrationNumber] = useState(
		workshop.registration_number || ""
	);
	const [corporateName, setCorporateName] = useState(
		workshop.company_name || ""
	);
	const [cnpj, setCnpj] = useState(workshop.cnpj || "");
	const [stateRegistration, setStateRegistration] = useState(
		workshop.state_registration || ""
	);
	const [municipalRegistration, setMunicipalRegistration] = useState(
		workshop.municipal_registration || ""
	);
	const [email, setEmail] = useState(workshop.email || "");
	const [phone, setPhone] = useState(workshop.phone || "");
	const [contact, setContact] = useState(workshop.contact || "");

	const handleEditOrganization = async () => {
		const updatedWorkshop = {
			fantasy_name: fantasyName,
			contract_number: contractNumber,
			registration_number: registrationNumber,
			company_name: corporateName,
			cnpj: cnpj,
			state_registration: stateRegistration,
			municipal_registration: municipalRegistration,
			email: email,
			phone: phone,
			contact: contact,
		};

		try {
			const workshopDocRef = doc(db, "workshops", workshop.id);
			await updateDoc(workshopDocRef, updatedWorkshop);
			setWorkshops((prevWorkshops) =>
				prevWorkshops.map((w) =>
					w.id === workshop.id ? { ...w, ...updatedWorkshop } : w
				)
			);
			onOpenChange();
		} catch (error) {
			toast.error("Erro ao editar organização", {
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
		<>
			<button onClick={onOpen}>
				<BiEdit className={styles.addIcon} />
			</button>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				className={styles.modal}
				size="2xl"
				scrollBehavior="outside"
			>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader
								className={clsx("flex flex-col gap-1", styles.modalTitle)}
							>
								Editar Organização
							</ModalHeader>
							<ModalBody>
								<div className={clsx(styles.form, "flex flex-col gap-4")}>
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
											type="number"
											value={contractNumber}
											onChange={(e) => setContractNumber(e.target.value)}
										/>
										<span className={styles.horizontalSpace} />
										<input
											className={styles.modalInput}
											placeholder="N° Cadastro*"
											type="number"
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
											onChange={(e) => setMunicipalRegistration(e.target.value)}
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
								</div>
							</ModalBody>
							<ModalFooter>
								<Button
									color="danger"
									variant="light"
									onPress={onClose}
								>
									Cancelar
								</Button>
								<Button
									color="success"
									className={styles.modalButton}
									onPress={() => {
										handleEditOrganization();
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
