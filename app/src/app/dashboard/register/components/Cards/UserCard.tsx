"use client";
import React from "react";
import styles from "./DriverCard.module.scss";
import { IoPersonCircle } from "react-icons/io5";
import { Accordion, AccordionItem } from "@nextui-org/react";
import EraseModal, { DeleteModalTypes } from "../EraseModal/EraseModal";
import { User } from "@/interfaces/user.type";
import AssociateUser from "../UserModal/AssociateUser";
import { Workshop } from "@/interfaces/workshop.type";

interface Props {
	user: User;
	workshops: Workshop[];
	setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export default function UserCard({ user, setUsers, workshops }: Props) {
	return (
		<div style={{ margin: "0.5em 0" }}>
			<Accordion className={styles.accordion}>
				<AccordionItem
					title={`${user.name} - ${user.email} - ${user.role}`}
					className={styles.item}
					startContent={<IoPersonCircle className={styles.personIcon} />}
				>
					<div className={styles.contentContainer}>
						<div className={styles.contentFooter}>
							<div className={styles.deleteBtnWrap}>
								<EraseModal
									type={DeleteModalTypes.user}
									name={user.name}
									id={user.id}
									state={setUsers}
								/>
							</div>
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
