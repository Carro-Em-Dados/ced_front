"use client";
import React, { useState } from "react";
import styles from "./styles.module.scss";
import Navbar from "@/components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import Image from "next/image";
import { Input } from "@nextui-org/react";
import { AppUser } from "../../../interfaces/appUser.type";

const Profile = () => {
	const mockUser: AppUser = {
		uid: "1",
		name: "Bruno Miura",
		role: "user",
		email: "bruno.miura@conpec.com.br",
		workshops: [],
		cpf: "489.044.928-07",
		phone_residential: "(11)9999-9999",
		phone_commercial: "(11)99999-9999",
		address_residential: "Av. Endereço Residencial, 98213",
		address_commercial: "Av. Endereço Comercial, 1234",
		gender: "Masculino",
		age: "23",
		register: "",
		cnh: "123456789",
	};
	const [currentUser, setCurrentUser] = useState(mockUser);

	function AdminProfile() {
		return (
			<>
				<p className={styles.subtext}>Minhas informações - Admin</p>
				<Input
					className={styles.input}
					isReadOnly
					label="Nome"
					variant="bordered"
					value={currentUser.name}
				/>
				<Input
					className={styles.input}
					isReadOnly
					type="email"
					label="Email"
					variant="bordered"
					value={currentUser.email}
				/>
			</>
		);
	}
	function UserProfile() {
		return (
			<>
				<p className={styles.subtext}>Minhas informações - Usuário</p>
				<div className={styles.row}>
					<Input
						className={styles.input}
						isReadOnly
						type="text"
						label="Nome"
						variant="bordered"
						value={currentUser.name}
					/>
					<span className={styles.horizontalSpace} />
					<Input
						className={styles.input}
						isReadOnly
						type="email"
						label="Email"
						variant="bordered"
						value={currentUser.email}
					/>
				</div>
				<div className={styles.row}>
					<Input
						className={styles.input}
						isReadOnly
						type="text"
						label="CPF"
						variant="bordered"
						value={currentUser.cpf}
					/>
					<span className={styles.horizontalSpace} />
					<Input
						className={styles.input}
						isReadOnly
						type="text"
						label="CNH"
						variant="bordered"
						value={currentUser.cnh}
					/>
				</div>

				<div className={styles.row}>
					<Input
						className={styles.input}
						isReadOnly
						type="text"
						label="Telefone Residencial"
						variant="bordered"
						value={currentUser.phone_residential}
					/>
					<span className={styles.horizontalSpace} />
					<Input
						className={styles.input}
						isReadOnly
						type="text"
						label="Telefone Comercial"
						variant="bordered"
						value={currentUser.phone_commercial}
					/>
				</div>

				<Input
					className={styles.input}
					isReadOnly
					type="text"
					label="Endereço Residencial"
					variant="bordered"
					value={currentUser.address_residential}
				/>
				<Input
					className={styles.input}
					isReadOnly
					type="text"
					label="Endereço Comercial"
					variant="bordered"
					value={currentUser.address_commercial}
				/>
				<div className={styles.row}>
					<Input
						className={styles.input}
						isReadOnly
						type="text"
						label="Gênero"
						variant="bordered"
						value={currentUser.gender}
					/>
					<span className={styles.horizontalSpace} />

					<Input
						className={styles.input}
						isReadOnly
						type="text"
						label="Idade"
						variant="bordered"
						value={currentUser.age}
					/>
				</div>
				<div className={styles.row}>
					<Input
						className={styles.input}
						isReadOnly
						type="text"
						label="Registro"
						variant="bordered"
						value={currentUser.register}
					/>
				</div>
			</>
		);
	}

	return (
		<div className={styles.page}>
			<Navbar />
			<div className={styles.pageWrap}>
				<div className={styles.header}>
					<div className={styles.titleContainer}>
						<div className={styles.rectangleContainer}>
							<Image
								src="/rectangle.png"
								alt="Retângulo título"
								fill
								style={{ objectFit: "cover" }}
							/>
						</div>
						<h1 className={styles.mainTitle}>Perfil</h1>
					</div>
				</div>
				<div className={styles.content}>
					{currentUser.role == "admin" ? (
						<AdminProfile />
					) : currentUser.role == "user" ? (
						<UserProfile />
					) : (
						<>No user role found</>
					)}
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default Profile;
