"use client";

import React, { useContext } from "react";
import styles from "./Navbar.module.scss";
import NavbarButtonHome from "./navbarButtonHome/NavbarButtonHome";
import NavbarButtonProfile from "./navbarButtonProfile/NavbarButtonProfile";
import NavbarButtonLogout from "./navbarButtonLogout/NavbarButtonLogout";
import Image from "next/image";
import NavbarButtonRegistration from "./navbarButtonRegistration/NavbarButtonRegistration";
import NavbarButtonMonitor from "./navbarButtonMonitor/NavbarButtonMonitor";
import { AuthContext } from "@/contexts/auth.context";
import NavbarButtonCalendar from "./navbarButtonCalendar/NavbarButtonCalendar";

function Navbar() {
	const { currentWorkshop } = useContext(AuthContext);

	return (
		<div className={styles.navbar}>
			<div className={styles.logoContainer}>
				<Image
					src="/logo1.png"
					alt="Logotipo Carro em Dados"
					fill
					style={{ objectFit: "contain" }}
				/>
			</div>
			<div className={styles.buttonsContainer}>
				<NavbarButtonHome />
				<NavbarButtonCalendar />
				{currentWorkshop?.contract?.id !== "basic" && <NavbarButtonMonitor />}
				<NavbarButtonRegistration />
				<NavbarButtonProfile />
				<NavbarButtonLogout />
			</div>
		</div>
	);
}

export default Navbar;
