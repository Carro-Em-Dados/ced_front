"use client";
import React, { useContext, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import Navbar from "../../../components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import Image from "next/image";
import CustomCalendar from "./components/customCalendar/customCalendar";
import clsx from "clsx";
import { AuthContext } from "@/contexts/auth.context";
import { Role } from "@/types/enums/role.enum";
import { Workshop } from "@/interfaces/workshop.type";
import { doc, getDoc } from "firebase/firestore";

function Calendar() {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const { currentUser, db } = useContext(AuthContext);

  const checkPremium = async (currWorkshopId: string) => {
      if (currentUser?.role === Role.MASTER) {
        console.log("is premium master");
        return setIsPremium(true);
      }
  
      if (currWorkshopId) {
        const currWorkshop = await getDoc(doc(db, "workshops", currWorkshopId));
  
        if (currWorkshop.exists()) {
          const workshopData = currWorkshop.data() as Workshop;
          const contract = workshopData.contract;
  
          if (workshopData.contract) {
            if (contract !== "basic") {
              console.log("is premium");
              return setIsPremium(true);
            } else {
              console.log("is not premium");
              return setIsPremium(false);
            }
          }
        }
      } else {
        console.log("is not premium");
        return setIsPremium(false);
      }
    };
  
  useEffect(() => {
    if (currentUser) {
      checkPremium("");
    }
  }, [currentUser]);
  
  return (
    <div className={styles.page}>
      <Navbar isPremium={isPremium} />
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
