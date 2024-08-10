"use client";
import React from "react";
import styles from "./NavbarButtonCalendar.module.scss";
import Button from "@/custom/button/Button";
import { useRouter } from "next/navigation";
import { FaCalendar } from "react-icons/fa";

function NavbarButtonCalendar() {
	const router = useRouter();

	function handleClick() {
		router.push("/dashboard/calendar");
	}

	const icon = () => {
		return <FaCalendar className={styles.icon} />;
	};

	return (
		<div className={styles.buttonContainer}>
			<Button
				Icon={icon}
				text="Agendamentos"
				click={handleClick}
			/>
		</div>
	);
}

export default NavbarButtonCalendar;
