import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Radio,
	RadioGroup,
	Tab,
	Tabs,
	useDisclosure,
} from "@nextui-org/react";
import clsx from "clsx";
import { MdLibraryAdd } from "react-icons/md";
import styles from "../../styles.module.scss";
import { useState } from "react";

export default function OrganizationModal() {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [tab, setTab] = useState("tab1");
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
												placeholder="Nome Fantasia"
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="N° Contrato"
											/>
											<span className={styles.horizontalSpace} />
											<input
												className={styles.modalInput}
												placeholder="N° Cadastro"
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Razão Social"
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="CNPJ"
											/>
										</div>
										<div>
											<input
												className={styles.modalInput}
												placeholder="Inscrição Estadual"
											/>
											<span className={styles.horizontalSpace} />
											<input
												className={styles.modalInput}
												placeholder="Inscrição Municipal"
											/>
										</div>
										<h2 className={styles.modalLabel}>Tipo de perfil</h2>
										<RadioGroup
											orientation="horizontal"
											color="success"
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
								<RadioGroup
									orientation="horizontal"
									color="success"
									className="mx-auto mt-4"
									onValueChange={(value) => setTab(value)}
									value={tab}
								>
									<Radio value="tab1" />
									<Radio value="tab2" />
									<Radio value="tab3" />
									<Radio value="tab4" />
								</RadioGroup>
							</ModalBody>
							<ModalFooter>
								<Button
									color="success"
									className={styles.modalButton}
									onPress={onClose}
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
}
