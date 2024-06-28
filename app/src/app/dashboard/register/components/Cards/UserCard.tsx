"use client";
import React from "react";
import styles from "./DriverCard.module.scss";
import { IoPersonCircle } from "react-icons/io5";
import { Accordion, AccordionItem, Button } from "@nextui-org/react";
import clsx from "clsx";
import EraseModal, { DeleteModalTypes } from "../EraseModal/EraseModal";
import VehicleModal from "../VehicleModal/VehicleModal";
import { FaEye } from "react-icons/fa";
import { User } from "@/interfaces/user.type";
import UserModal from "../UserModal/UserModal";

interface Props {
	user: User;
	setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export default function UserCard({ user, setUsers }: Props) {
	const Content = () => {
		return (
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
				</div>
			</div>
		);
	};

	return (
		<div style={{ margin: "0.5em 0" }}>
			<Accordion className={styles.accordion}>
				<AccordionItem
					title={`${user.name} - ${user.email} - ${user.role}`}
					className={styles.item}
					startContent={<IoPersonCircle className={styles.personIcon} />}
				>
					<Content />
				</AccordionItem>
			</Accordion>
		</div>
	);
}
