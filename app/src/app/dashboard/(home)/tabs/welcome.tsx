import React, { useContext, useEffect, useState } from "react";
import styles from "./welcome.module.scss";
import Image from "next/image";
import Dashboard from "../components/dashboard/dashboard";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  documentId,
} from "firebase/firestore";
import { Workshop } from "@/interfaces/workshop.type";
import { AuthContext } from "@/contexts/auth.context";
import { toast, Zoom } from "react-toastify";
import { Role } from "@/types/enums/role.enum";
import GeneralAutocomplete from "@/components/GeneralObjectOptionAutocomplete";

interface WelcomeProps {
  selectedWorkshop: string | null;
  setSelectedWorkshop: (workshop: string) => void;
  isPremium: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Welcome({
  selectedWorkshop,
  setSelectedWorkshop,
  isPremium,
  isOpen,
  setIsOpen,
}: WelcomeProps) {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  console.log("selectedWorkshop:", selectedWorkshop);
  const [workshopName, setWorkshopName] = useState("");
  const { currentUser, currentWorkshop, db } = useContext(AuthContext);
  const [workshopSearchValue, setWorkshopSearchValue] = useState("");

  useEffect(() => {
    getWorkshops();
  }, [currentUser, currentWorkshop]);

  const getWorkshops = async () => {
    if (
      !currentUser ||
      (!currentWorkshop &&
        ![Role.MASTER, Role.ORGANIZATION].includes(currentUser.role as Role))
    )
      return;
    try {
      const queryParams = [];

      if (currentUser.role === Role.ORGANIZATION)
        queryParams.push(where("owner", "==", currentUser.id));
      if (currentUser.role === Role.USER)
        queryParams.push(where(documentId(), "==", currentWorkshop?.id));

      const querySnapshot = await getDocs(
        query(collection(db, "workshops"), ...queryParams)
      );
      if (!!querySnapshot.empty) return;
      const data = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as Workshop),
        id: doc.id,
      }));

      setWorkshops(data);
    } catch (error) {
      toast.error("Algo deu errado!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Zoom,
      });
    }
  };

  return (
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
          {currentUser?.name ? (
            <h1 className={styles.mainTitle}>{`Olá, ${currentUser?.name}!`}</h1>
          ) : (
            <h1 className={styles.mainTitle}>Olá!</h1>
          )}
        </div>
        <p className={styles.subtext}>
          Gostaria de conferir o status da(s) sua(s) oficina(s)?
        </p>
        <p className={styles.subtext}>Selecione alguma opção abaixo:</p>
        <div className="w-[26em] my-[2em]">
          <GeneralAutocomplete
            placeholder="Selecione sua oficina"
            options={[
              ...(currentUser?.role === "master"
                ? [{ value: "all", label: "Geral" }]
                : []),
              ...workshops
                ?.filter((workshop) => workshop.fantasy_name && workshop.id)
                .map((workshop) => ({
                  value: workshop.id,
                  label: workshop.fantasy_name,
                })),
            ]}
            initialValue={selectedWorkshop || ""}
            onSelectionChange={(key) => {
              setSelectedWorkshop(key?.value || "");
              setWorkshopName(
                key?.label === "all"
                  ? "Geral"
                  : workshops.find((w) => w.id === key?.value)?.fantasy_name ||
                      ""
              );
            }}
          />
        </div>
      </div>
      {selectedWorkshop ? (
        <Dashboard
          contractId={
            (workshops.find((w) => w.id === selectedWorkshop)
              ?.contract as string) || ""
          }
          selectedWorkshop={selectedWorkshop}
          workshopName={workshopName}
          isPremium={isPremium}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      ) : (
        <WelcomeImage />
      )}
    </div>
  );
}

const WelcomeImage = () => {
  return (
    <div className={styles.imageContainer}>
      <Image
        src="/car_home1.png"
        alt="Carro na Home Principal"
        fill
        style={{ objectFit: "cover", objectPosition: "right 20% bottom 0" }}
      />
    </div>
  );
};
