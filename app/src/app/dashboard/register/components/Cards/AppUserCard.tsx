"use client";
import React from "react";
import styles from "./DriverCard.module.scss";
import { IoPersonCircle } from "react-icons/io5";
import { Accordion, AccordionItem } from "@nextui-org/react";
import clsx from "clsx";
import EraseModal, { DeleteModalTypes } from "../EraseModal/EraseModal";
import { Vehicle } from "@/interfaces/vehicle.type";
import { AppUser } from "@/interfaces/appUser.type";
import VehicleModal from "../VehicleModal/VehicleModal";
import SeeVehicleModal from "../VehicleModal/SeeVehicleModal";

interface Props {
	appUser: AppUser;
	setAppUsers: React.Dispatch<React.SetStateAction<AppUser[]>>;
	vehicles: Vehicle[];
	setVehicles: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function AppUserCard({
	appUser,
	setAppUsers,
	vehicles,
	setVehicles,
}: Props) {
	const AppUsers = () => {
		console.log(vehicles);
		return (
			<div className={styles.contentContainer}>
				<div className={styles.cardsContainer}>
					<div className={clsx(styles.card, styles.infoCard)}>
						<div className="flex flex-row justify-between w-full">
							<h4 className={styles.cardTitle}>Dados</h4>
						</div>
						<div className={styles.row}>
							<p className={styles.cardText}>Nome: {appUser.name}</p>
						</div>
						<div className={styles.row}>
							<p className={styles.cardText}>Email: {appUser.email}</p>
						</div>
						<div className={styles.row}>
							<p className={styles.cardText}>Telefone: {appUser.phone}</p>
						</div>
					</div>
					<div className={`${clsx(styles.card, styles.vehiclesCard)} gap-2`}>
						<h4 className={styles.cardTitle}>Carros</h4>
						<div className="flex flex-col gap-2 w-full">
							<div className="grid grid-cols-3">
								<p className="font-bold">Modelo</p>
								<p className="font-bold">Placa</p>
							</div>
							<div className="w-full flex flex-col gap-2">
								{vehicles?.map((vehicle, index) => (
									<div
										key={index}
										className="grid grid-cols-3 items-center gap-2 w-full bg-[#2D2F2D] px-6 py-3 rounded-full"
									>
										<p>
											{vehicle?.manufacturer} {vehicle?.car_model}
										</p>
										<p>{vehicle?.license_plate}</p>
										<div className="justify-self-end text-xl">
											<SeeVehicleModal
												vehicle={vehicle}
												setVehicles={setVehicles}
											/>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
				<div className={styles.contentFooter}>
					<div className={styles.deleteBtnWrap}>
						<EraseModal
							type={DeleteModalTypes.appUser}
							name={appUser.name}
							id={appUser.id}
							state={setAppUsers}
						/>
					</div>
					<div className={styles.addVehicleBtnWrap}>
						<VehicleModal
							ownerId={appUser.id}
							setVehicles={setVehicles}
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
					title={`${appUser.name}`}
					className={styles.item}
					startContent={<IoPersonCircle className={styles.personIcon} />}
				>
					<AppUsers />
				</AccordionItem>
			</Accordion>
		</div>
	);
}
