"use client";
import React, { useState } from "react";
import styles from "./styles.module.scss";
import Navbar from "@/components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import Image from "next/image";
import DropdownComponent from "@/custom/dropdown/Dropdown";
import { Input } from "@nextui-org/react";
import { FaSearch } from "react-icons/fa";
import { MdDateRange } from "react-icons/md";
import { BsThermometerHalf } from "react-icons/bs";
import { BiSolidCarBattery } from "react-icons/bi";
import { FaOilCan } from "react-icons/fa6";
import { ImSpinner9 } from "react-icons/im";
import { RiPinDistanceFill } from "react-icons/ri";
import { IoCloseCircle, IoSpeedometer } from "react-icons/io5";

const Monitor = () => {
	const verificationOptions = [
		{
			label: "Email",
			key: "Email",
		},
		{
			label: "Nome do cliente",
			key: "Nome do cliente",
		},
		{
			label: "Placa do veículo",
			key: "Placa do veículo",
		},
		{
			label: "Chassi do veículo",
			key: "Chassi do veículo",
		},
		{
			label: "Telefone",
			key: "Telefone",
		},
	];
	const [verification, setVerification] = useState<string | null>(null);
	const [searchValue, setSearchValue] = useState<string>();
	const [showMonitor, setShowMonitor] = useState(false);

	function handleSearch() {
		setShowMonitor(true);
	}

	const KmCard = () => (
		<div className={styles.card}>
			<span className={styles.greenRectangle} />
			<h4 className={styles.cardTitle}>KM ATUAL</h4>
			<div className={styles.cardIconContainer}>
				<RiPinDistanceFill className={styles.cardIcon} />
			</div>
			<h1 className={styles.cardValue}>200,5</h1>
		</div>
	);
	const TempCard = () => (
		<div className={styles.card}>
			<span className={styles.greenRectangle} />
			<h4 className={styles.cardTitle}>TEMPERATURA MOTOR</h4>
			<div className={styles.cardIconContainer}>
				<BsThermometerHalf
					className={styles.cardIcon}
					style={{ fontSize: "3.6em" }}
				/>
			</div>
			<h1 className={styles.cardValue}>15,4°</h1>
		</div>
	);
	const TensionCard = () => (
		<div className={styles.card}>
			<span className={styles.redRectangle} />
			<h4 className={styles.cardTitle}>TENSÃO SAÍDA</h4>
			<div className={styles.cardIconContainer}>
				<BiSolidCarBattery className={styles.cardIconFail} />
			</div>
			<h1 className={styles.cardValue}>3,2 V</h1>
		</div>
	);
	const OilCard = () => (
		<div className={styles.card}>
			<span className={styles.greenRectangle} />
			<h4 className={styles.cardTitle}>PRESSÃO ÓLEO</h4>
			<div className={styles.cardIconContainer}>
				<FaOilCan className={styles.cardIcon} />
			</div>
			<h1 className={styles.cardValue}>3,4 bar</h1>
		</div>
	);
	const RpmCard = () => (
		<div className={styles.card}>
			<span className={styles.redRectangle} />
			<h4 className={styles.cardTitle}>ROTAÇÃO MOTOR</h4>
			<div className={styles.cardIconContainer}>
				<ImSpinner9 className={styles.cardIconFail} />
			</div>
			<h1 className={styles.cardValue}>3200</h1>
		</div>
	);
	const SpeedCard = () => (
		<div className={styles.card}>
			<span className={styles.greenRectangle} />
			<h4 className={styles.cardTitle}>VELOCIDADE</h4>
			<div className={styles.cardIconContainer}>
				<IoSpeedometer className={styles.cardIcon} />
			</div>
			<h1 className={styles.cardValue}>85,4 km/h</h1>
		</div>
	);
	const FailCard = () => (
		<div className={styles.card}>
			<span className={styles.greenRectangle} />
			<h4 className={styles.cardTitle}>FALHAS</h4>
			<div className={styles.cardIconContainer}>
				<IoCloseCircle className={styles.cardIcon} />
			</div>
			<h1 className={styles.cardValue}>104</h1>
		</div>
	);
	const LastReadingCard = () => (
		<div className={styles.card}>
			<span className={styles.greenRectangle} />
			<h4 className={styles.cardTitle}>ÚLTIMA LEITURA</h4>
			<div className={styles.cardIconContainer}>
				<MdDateRange className={styles.cardIcon} />
			</div>
			<h1 className={styles.cardValue}>22/03/24</h1>
		</div>
	);

	const Monitor = () => {
		return (
			<div className={styles.monitorContainer}>
				<span className={styles.greenRectangle} />
				<h2 className={styles.monitorTitle}>
					Dados monitorados do seu veículo
				</h2>
				<div className={styles.cardsContainer}>
					<div className={styles.cardWrapper}>
						<KmCard />
					</div>
					<div className={styles.cardWrapper}>
						<TempCard />
					</div>
					<div className={styles.cardWrapper}>
						<TensionCard />
					</div>
					<div className={styles.cardWrapper}>
						<OilCard />
					</div>
					<div className={styles.cardWrapper}>
						<RpmCard />
					</div>
					<div className={styles.cardWrapper}>
						<SpeedCard />
					</div>
					<div className={styles.cardWrapper}>
						<FailCard />
					</div>
					<div className={styles.cardWrapper}>
						<LastReadingCard />
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className={styles.page}>
			<Navbar />
			<div className={styles.pageWrap}>
				<div className={styles.textContainer}>
					<div className={styles.titleContainer}>
						<div className={styles.rectangleContainer}>
							<Image
								src="/rectangle.png"
								alt="Retângulo título"
								fill
								style={{ objectFit: "cover" }}
							/>
						</div>
						<h1 className={styles.mainTitle}>Monitoramento</h1>
					</div>
					<p className={styles.subtext}>
						Para verificar as condições do veículo, selecione alguma das formas
						de verificação abaixo
					</p>
					<div className={styles.dropdownContainer}>
						<DropdownComponent
							options={verificationOptions}
							placeholder="Selecione forma de verificação"
							value={verification}
							onChange={(key) => {
								setVerification(key.toString());
							}}
						/>
					</div>
					<div className={styles.searchbarContainer}>
						{verification ? (
							<Input
								value={searchValue}
								onValueChange={(value) => setSearchValue(value)}
								type="string"
								placeholder=""
								variant="bordered"
								className={styles.input}
								size={"sm"}
								radius={"lg"}
								endContent={
									<button onClick={handleSearch}>
										<FaSearch style={{ fontSize: "1.8em" }} />
									</button>
								}
							/>
						) : (
							<></>
						)}
					</div>
					<div className={styles.monitorContainer}>
						{showMonitor ? <Monitor /> : <></>}
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default Monitor;
