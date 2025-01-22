"use client";
import React from "react";
import styles from "./NavbarButtonMonitor.module.scss";
import Button from "@/custom/button/Button";
import { useRouter } from "next/navigation";
import { BsSpeedometer } from "react-icons/bs";

interface NavbarButtonMonitorProps {
	workshop?: string;
}

function NavbarButtonMonitor({ workshop }: NavbarButtonMonitorProps) {
	const router = useRouter();

	function handleClick() {
		router.push(`/dashboard/monitor?workshop=${workshop}`);
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
