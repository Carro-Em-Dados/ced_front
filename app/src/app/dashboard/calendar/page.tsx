"use client";
import React, { Suspense } from "react";
import styles from "./styles.module.scss";
import Navbar from "../../../components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import Image from "next/image";
import CustomCalendar from "./components/customCalendar/customCalendar";
import clsx from "clsx";

function Calendar() {
  return (
    <div className={styles.page}>
      <Navbar />
      <div className={clsx(styles.pageWrap, "mb-10")}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <div className={styles.rectangleContainer}>
              <Image src="/rectangle.png" alt="Retângulo título" fill style={{ objectFit: "cover" }} />
            </div>
            <h1 className={styles.mainTitle}>Agendamento</h1>
          </div>
          <p className={styles.subtext}>Visualize as manutenções agendadas</p>
        </div>
        <div>
          <CustomCalendar />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Calendar;
