"use client";
import React, { useContext, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import Navbar from "@/components/navbar/Navbar";
import Welcome from "./tabs/welcome";
import Footer from "../../../components/footer/Footer";
import { Workshop } from "@/interfaces/workshop.type";
import { doc, getDoc } from "firebase/firestore";
import { Role } from "@/types/enums/role.enum";
import { AuthContext } from "@/contexts/auth.context";

const Home = () => {
  const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { db, currentUser } = useContext(AuthContext);

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
    checkPremium(selectedWorkshop as string);
  }, [currentUser, selectedWorkshop]);

  return (
    <div className={styles.page}>
      <Navbar isPremium={isPremium} setIsOpen={setIsOpen} />
      <Welcome
        selectedWorkshop={selectedWorkshop}
        setSelectedWorkshop={setSelectedWorkshop}
        isPremium={isPremium}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      <Footer />
    </div>
  );
};

export default Home;
