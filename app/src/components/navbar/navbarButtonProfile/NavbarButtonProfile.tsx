"use client";
import React from "react";
import styles from "./NavbarButtonProfile.module.scss";
import Button from "@/custom/button/Button";
import { BsFillPersonFill } from "react-icons/bs";
import { useRouter } from "next/navigation";

function NavbarButtonHome() {
	const router = useRouter();

	function handleClick() {
		router.push("/dashboard/profile");
	}

	const icon = () => {
		return <BsFillPersonFill className={styles.icon} />;
	};

	return (
		<div className={styles.buttonContainer}>
			<Button
				Icon={icon}
				text="Perfil"
				click={handleClick}
			/>
		</div>
	);
}

export default NavbarButtonHome;
