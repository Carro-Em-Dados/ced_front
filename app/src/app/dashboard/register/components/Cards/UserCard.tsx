"use client";
import React, { useContext } from "react";
import styles from "./DriverCard.module.scss";
import { IoPersonCircle } from "react-icons/io5";
import { Accordion, AccordionItem } from "@nextui-org/react";
import EraseModal, { DeleteModalTypes } from "../EraseModal/EraseModal";
import { User } from "@/interfaces/user.type";
import AssociateUser from "../UserModal/AssociateUser";
import { Workshop } from "@/interfaces/workshop.type";
import { AuthContext } from "@/contexts/auth.context";

interface Props {
	user: User;
	workshops: Workshop[];
	setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export default function UserCard({ user, setUsers, workshops }: Props) {
	const { currentUser } = useContext(AuthContext);
	return (
		<div style={{ margin: "0.5em 0" }}>
			<Accordion className={styles.accordion}>
				<AccordionItem
					title={`${user.name} - ${user.email} - ${
						workshops.find((workshop) => workshop.id === user.workshops)
							?.fantasy_name || "Nenhuma organização"
					}`}
					className={styles.item}
					startContent={<IoPersonCircle className={styles.personIcon} />}
				>
					<div className={styles.contentContainer}>
						<div className={styles.contentFooter}>
							{currentUser?.role === "master" && (
								<div className={styles.deleteBtnWrap}>
									<EraseModal
										type={DeleteModalTypes.user}
										name={user.name}
										id={user.id}
										state={setUsers}
									/>
								</div>
							)}
							<div className={styles.addVehicleBtnWrap}>
								<AssociateUser
									setUsers={setUsers}
									workshops={workshops}
									user={user}
								/>
							</div>
						</div>
					</div>
				</AccordionItem>
			</Accordion>
		</div>
	);
}
