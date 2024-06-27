"use client";
import React, { useContext, useEffect } from "react";
import styles from "./NavbarButtonRegistration.module.scss";
import Button from "@/custom/button/Button";
import { useRouter } from "next/navigation";
import { MdAssignmentAdd } from "react-icons/md";
import { FaGear } from "react-icons/fa6";

function NavbarButtonRegistration() {
	const router = useRouter();

	function handleClick() {
		router.push("/dashboard/register");
	}

	const icon = () => {
		return <FaGear className={styles.icon} />;
	};

	return (
		<div className={styles.buttonContainer}>
			<Button
				Icon={icon}
				text="Configurações"
				click={handleClick}
			/>
		</div>
	);
}

export default NavbarButtonRegistration;
