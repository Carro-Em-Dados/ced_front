"use client";
import React, { useContext, useEffect } from "react";
import styles from "./NavbarButtonConfig.module.scss";
import Button from "@/custom/button/Button";
import { FaGear } from "react-icons/fa6";
import { useRouter } from "next/navigation";

function NavbarButtonConfig() {
	const router = useRouter();

	function handleClick() {
		router.push("/dashboard/config");
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

export default NavbarButtonConfig;
