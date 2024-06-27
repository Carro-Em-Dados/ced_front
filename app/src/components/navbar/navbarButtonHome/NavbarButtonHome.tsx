"use client";
import React, { useContext, useEffect } from "react";
import styles from "./NavbarButtonHome.module.scss";
import Button from "@/custom/button/Button";
import { FaHome } from "react-icons/fa";
import { useRouter } from "next/navigation";

function NavbarButtonHome() {
	const router = useRouter();

	function handleClick() {
		router.push("/dashboard/home");
	}

	const icon = () => {
		return <FaHome className={styles.icon} />;
	};

	return (
		<div className={styles.buttonContainer}>
			<Button
				Icon={icon}
				text="Início"
				click={handleClick}
			/>
		</div>
	);
}

export default NavbarButtonHome;
