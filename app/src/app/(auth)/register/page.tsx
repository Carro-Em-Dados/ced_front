"use client";
import React, { useContext, useState } from "react";
// import styles from "@/app/dashboard/login/styles.module.scss";
import styles from "../styles.module.scss";
import Image from "next/image";
import { Input } from "@nextui-org/react";
import { MdOutlineMailOutline, MdLockOutline } from "react-icons/md";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/contexts/auth.context";

const Register = () => {
  const { signUp } = useContext(AuthContext);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [emailValid, setEmailValid] = useState<boolean>(true);
  const [passwordValid, setPasswordValid] = useState<boolean>(true);
  const [nameValid, setNameValid] = useState<boolean>(true);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const router = useRouter();

  const HR = () => {
    return (
      <svg className={styles.hr} width="242" height="6" viewBox="0 0 242 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="242" y="5.47058" width="242" height="5.47059" transform="rotate(180 242 5.47058)" fill="url(#paint0_linear_126_156)" />
        <defs>
          <linearGradient id="paint0_linear_126_156" x1="481.092" y1="7.83253" x2="249.684" y2="-23.5844" gradientUnits="userSpaceOnUse">
            <stop stopColor="#50CB61" />
            <stop offset="1" stopColor="#004509" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  async function handleSignUp() {
    if (validateFields()) {
      try {
        await signUp(email, name, password);
        router.replace("/dashboard");
      } catch (err) {
        setRegisterError("Erro ao registrar usuário. Por favor, tente novamente.");
      }
    }
  }

  function validateFields() {
    let valid = true;
    if (!name) {
      setNameValid(false);
      valid = false;
    } else {
      setNameValid(true);
    }
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

  return (
    <div className={styles.page}>
      <div className={styles.imageContainer}>
        <Image src="/car_background1.png" alt="Carro na Página de Registro" fill style={{ objectFit: "cover" }} />
      </div>
      <div className={`${styles.contentContainer} h-full`}>
        <div className={styles.logoContainer}>
          <Image src="/logo1.png" alt="Logotipo Carro em Dados" fill style={{ objectFit: "contain" }} />
        </div>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>Cadastre-se!</h1>
          <HR />
        </div>
        <h2 className={styles.infoLabel}>Nome</h2>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite seu nome"
          variant="bordered"
          isInvalid={!nameValid}
          className={styles.input}
        />
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
        {registerError && <p className={styles.error}>{registerError}</p>}
        <Button color="success" className={styles.button} onClick={handleSignUp}>
          REGISTRAR
        </Button>
      </div>
    </div>
  );
};

export default Register;
