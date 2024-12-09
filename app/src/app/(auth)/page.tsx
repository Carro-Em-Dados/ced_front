"use client";
import React, { useContext, useState } from "react";
import styles from "./styles.module.scss";
import Image from "next/image";
import { Input } from "@nextui-org/react";
import { MdOutlineMailOutline, MdLockOutline } from "react-icons/md";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/contexts/auth.context";
import { BsGoogle } from "react-icons/bs";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { sendPasswordResetEmail } from "firebase/auth";
import ForgotPasswordModal from "./components/ForgotPasswordModal";

const Login = () => {
	const { login, loginWithFacebook, loginWithGoogle } = useContext(AuthContext);
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [emailValid, setEmailValid] = useState<boolean>(true);
	const [passwordValid, setPasswordValid] = useState<boolean>(true);
	const [loginError, setLoginError] = useState<string | null>(null);
	const [isButtonPressed, setIsButtonPressed] = useState<boolean>(false);
	const [isLoginHappening, setIsLoginHappening] = useState<boolean>(false);
	const router = useRouter();

	const HR = () => {
		return (
			<svg
				className={styles.hr}
				width="242"
				height="6"
				viewBox="0 0 242 6"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<rect
					x="242"
					y="5.47058"
					width="242"
					height="5.47059"
					transform="rotate(180 242 5.47058)"
					fill="url(#paint0_linear_126_156)"
				/>
				<defs>
					<linearGradient
						id="paint0_linear_126_156"
						x1="481.092"
						y1="7.83253"
						x2="249.684"
						y2="-23.5844"
						gradientUnits="userSpaceOnUse"
					>
						<stop stopColor="#50CB61" />
						<stop
							offset="1"
							stopColor="#004509"
						/>
					</linearGradient>
				</defs>
			</svg>
		);
	};

	async function handleLogin() {
		if (validateFields()) {
			try {
				setIsLoginHappening(true);
				await login(email, password);
				router.replace("/dashboard");
			} catch (err) {
				setIsLoginHappening(false);
				setEmailValid(false);
				setPasswordValid(false);
				setLoginError("Email ou senha inválidos");
			}
		}
	}

	function validateFields() {
		let valid = true;
		if (!email) {
			setEmailValid(false);
			valid = false;
		} else {
			setEmailValid(true);
		}
		if (!password) {
			setPasswordValid(false);
			valid = false;
		} else {
			setPasswordValid(true);
		}
		return valid;
	}

	function handleKeyDown(event: React.KeyboardEvent) {
		if (event.key === "Enter") {
			triggerButtonAnimation();
			handleLogin();
		}
	}

	function triggerButtonAnimation() {
		setIsButtonPressed(true);
		setTimeout(() => setIsButtonPressed(false), 100);
	}

	return (
		<>
		<div className={styles.page} onKeyDown={handleKeyDown}>
			<div className={styles.imageContainer}>
				<Image
					src="/car_background1.png"
					alt="Carro na Página de Login"
					fill
					style={{ objectFit: "cover" }}
				/>
			</div>
			<div className={styles.contentContainer}>
				<div className={styles.logoContainer}>
					<Image
						src="/logo1.png"
						alt="Logotipo Carro em Dados"
						fill
						style={{ objectFit: "contain" }}
					/>
				</div>
				<div className={styles.titleContainer}>
					<h1 className={styles.title}>Bem-vindo!</h1>
					<HR />
				</div>
				<div className="flex flex-col mb-5">
					<h2 className={styles.infoLabel}>Email</h2>
					<Input
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						type="email"
						placeholder="Digite seu email"
						variant="bordered"
						isInvalid={!emailValid}
						className={styles.input}
						endContent={<MdOutlineMailOutline style={{ fontSize: "1.8em" }} />}
					/>
					<h2 className={styles.infoLabel}>Senha</h2>
					<Input
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						type="password"
						placeholder="Digite sua senha"
						variant="bordered"
						isInvalid={!passwordValid}
						className={styles.input}
						endContent={<MdLockOutline style={{ fontSize: "1.8em" }} />}
					/>
					{loginError && <p className={styles.error}>{loginError}</p>}
					<Button
						color="success"
						className={`${styles.button} ${
							isButtonPressed ? styles.pressed : ""
						}`}
						onClick={handleLogin}
					>
						{isLoginHappening ? "ENTRANDO..." : "ENTRAR"}
					</Button>
					<p className="text-white text-sm mt-5">
						Esqueceu sua senha? <ForgotPasswordModal />
					</p>
				</div>
				<div className="flex flex-row justify-center text-white gap-2">
					<div
						className="cursor-pointer p-2 bg-[#27A338] rounded-full"
						onClick={loginWithGoogle}
					>
						<FaGoogle />
					</div>
					<div
						className="cursor-pointer p-2 bg-[#27A338] rounded-full"
						onClick={loginWithFacebook}
					>
						<FaFacebook />
					</div>
				</div>
			</div>
		</div>
		</>
	);
};

export default Login;
