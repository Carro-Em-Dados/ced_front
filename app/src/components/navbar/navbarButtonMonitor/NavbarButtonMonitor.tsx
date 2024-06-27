"use client";
import React, { useContext, useEffect } from "react";
import styles from "./NavbarButtonMonitor.module.scss";
import Button from "@/custom/button/Button";
import { useRouter } from "next/navigation";
import { MdAssignmentAdd } from "react-icons/md";
import { BsSpeedometer } from "react-icons/bs";

function NavbarButtonMonitor() {
	const router = useRouter();

	function handleClick() {
		router.push("/dashboard/monitor");
	}

	const icon = () => {
		return <BsSpeedometer className={styles.icon} />;
	};

	return (
		<div className={styles.buttonContainer}>
			<Button
				Icon={icon}
				text="Monitoramento"
				click={handleClick}
			/>
		</div>
	);
}

export default NavbarButtonMonitor;
