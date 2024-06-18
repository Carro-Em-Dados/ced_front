import React from 'react'
import styles from './Footer.module.scss'
import Image from 'next/image';
import { FaSquareFacebook } from "react-icons/fa6";
import { FaSquareInstagram } from "react-icons/fa6";

function Footer() {
  return (
    <div className={styles.footer}>
      <div className={styles.first}>
        <div className={styles.logoContainer}>
          <Image
            src='/logo1.png'
            alt='Logotipo Carro em Dados'
            fill
            style={{objectFit:'contain' }}/>
        </div>
        <p className={styles.footerText}>Carro em dados @ 2024. Todos os direitos reservados.</p>
      </div>
      <div className={styles.second}>
        <h2 className={styles.footerTitle}>CONTATO</h2>
        <p className={styles.footerText}>(99) 99999-9999</p>
        <p className={styles.footerText}>contato@carroemdados.com.br</p>
        <span className={styles.hr} />
        <div style={{ flexDirection: "row" }}>
          <FaSquareFacebook className={styles.icon} />
          <FaSquareInstagram className={styles.icon} />
        </div>
      </div>
      <div className={styles.third}>
        <h2 className={styles.footerTitle}>INFORMAÇÕES</h2>
        <p className={styles.footerText}>Página Inicial</p>
        <p className={styles.footerText}>Calendário</p>
        <p className={styles.footerText}>Monitoramento</p>
        <p className={styles.footerText}>Perfil</p>
      </div>
    </div>
  )
}

export default Footer