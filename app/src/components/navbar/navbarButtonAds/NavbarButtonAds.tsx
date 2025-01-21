"use client";
import React from "react";
import styles from "./NavbarButtonAds.module.scss";
import Button from "@/custom/button/Button";
import { BsFillMegaphoneFill } from "react-icons/bs";

interface NavbarButtonAdsProps {
	setIsOpen: (isOpen: boolean) => void;
}

function NavbarButtonAds({ setIsOpen }: NavbarButtonAdsProps) {

	const icon = () => {
		return <BsFillMegaphoneFill className={styles.icon} />;
	};

	return (
		<div className={styles.buttonContainer}>
			<Button
				Icon={icon}
				text="Anunciar"
				click={() => setIsOpen(true)}
			/>
		</div>
	);
}

export default NavbarButtonAds;