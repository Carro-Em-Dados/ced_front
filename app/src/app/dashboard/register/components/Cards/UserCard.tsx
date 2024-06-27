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
				<div className={styles.cardsContainer}>
					<div className={clsx(styles.card, styles.infoCard)}>
						<h4 className={styles.cardTitle}>Dados</h4>
						<div className={styles.row}>
							<p className={styles.cardText}>Nome: {user.name}</p>
						</div>
						<div className={styles.row}>
							<p className={styles.cardText}>Email: {user.email}</p>
						</div>
					</div>
					<div className={clsx(styles.card, styles.vehiclesCard)}>
						<h4 className={styles.cardTitle}>Carros</h4>
						<div className="flex flex-col gap-2 w-full">
							<div className="grid grid-cols-3">
								<p className="font-bold">Modelo</p>
								<p className="font-bold">Placa</p>
							</div>
						</div>
					</div>
				</div>
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
						<UserModal />
					</div>
				</div>
			</div>
		);
	};

	return (
		<div style={{ margin: "0.5em 0" }}>
			<Accordion className={styles.accordion}>
				<AccordionItem
					title={`${user.name}`}
					className={styles.item}
					startContent={<IoPersonCircle className={styles.personIcon} />}
				>
					<Content />
				</AccordionItem>
			</Accordion>
		</div>
	);
}
