"use client";
import React, { useContext } from "react";
import styles from "./DriverCard.module.scss";
import { IoPersonCircle } from "react-icons/io5";
import { Accordion, AccordionItem } from "@nextui-org/react";
import clsx from "clsx";
import EraseModal, { DeleteModalTypes } from "../EraseModal/EraseModal";
import VehicleModal from "../VehicleModal/VehicleModal";
import SeeVehicleModal from "../VehicleModal/SeeVehicleModal";
import { Driver } from "@/interfaces/driver.type";
import { Vehicle } from "@/interfaces/vehicle.type";
import SeeDriverModal from "../DriverModal/SeeDriverModal";
import { Workshop } from "@/interfaces/workshop.type";
import AssociateDriver from "../DriverModal/AssociateDriver";
import { AuthContext } from "@/contexts/auth.context";
import { Role } from "@/types/enums/role.enum";

interface Props {
  driver: Driver;
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  setVehicles: React.Dispatch<React.SetStateAction<any[]>>;
  vehicles: Vehicle[];
  workshops: Workshop[];
  isPremium: boolean;
}

export default function DriverCard({
  driver,
  setDrivers,
  setVehicles,
  vehicles,
  workshops,
  isPremium
}: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { currentUser } = useContext(AuthContext);

  const Drivers = () => {
    return (
      <div className={styles.contentContainer}>
        <div className={styles.cardsContainer}>
          <div className={clsx(styles.card, styles.infoCard)}>
            <div className="flex flex-row justify-between w-full">
              <h4 className={styles.cardTitle}>Dados</h4>
              <SeeDriverModal
                id={driver.id}
                setDrivers={setDrivers}
                workshops={workshops}
              />
            </div>
            <div className={styles.row}>
              <p className={styles.cardText}>Nome: {driver.name}</p>
            </div>
            <div className={styles.row}>
              <p className={styles.cardText}>Email: {driver.email}</p>
            </div>
            <div className="flex flex-row gap-5">
              <p className={styles.cardText}>
                Gênero: {driver.gender === "m" ? "Masculino" : "Feminino"}
              </p>
              <p className={styles.cardText}>Idade: {driver.age}</p>
            </div>
            <div className={styles.row}>
              <p className={styles.cardText}>
                Endereço residencial: {driver.address_residential}
              </p>
              {driver.address_commercial && (
                <p className={styles.cardText}>
                  Endereço comercial: {driver.address_commercial}
                </p>
              )}
            </div>
            <div className={styles.row}>
              <p className={styles.cardText}>
                Telefone: {driver.phone_commercial}
              </p>
            </div>
            <div className={styles.row}>
              <p className={styles.cardText}>CNH: {driver.cnh}</p>
              <p className={styles.cardText}>Registro: {driver.register}</p>
            </div>
          </div>
          <div className={`${clsx(styles.card, styles.vehiclesCard)} gap-2`}>
            <h4 className={styles.cardTitle}>Carros</h4>
            <div className="flex flex-col gap-2 w-full">
              <div className="grid grid-cols-3">
                <p className="font-bold">Modelo</p>
                <p className="font-bold">Placa</p>
              </div>
              <div className="w-full flex flex-col gap-2">
                {vehicles?.map((vehicle, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 items-center gap-2 w-full bg-[#2D2F2D] px-6 py-3 rounded-full"
                  >
                    <p>
                      {vehicle?.manufacturer} {vehicle?.car_model}
                    </p>
                    <p>{vehicle?.license_plate}</p>
                    <div className="justify-self-end text-xl">
                      <SeeVehicleModal
                        vehicle={vehicle}
                        setVehicles={setVehicles}
                        onClose={() => setIsOpen(false)}
                        setIsOpen={setIsOpen}
                        isOpen={isOpen}
                        isPremium={isPremium}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.contentFooter}>
          <div className={styles.deleteBtnWrap}>
            {currentUser?.role === Role.MASTER ? (
              <AssociateDriver
                driver={driver}
                setDrivers={setDrivers}
                workshops={workshops}
              />
            ) : (
              <EraseModal
                type={DeleteModalTypes.driver}
                name={driver.name}
                id={driver.id}
                state={setDrivers}
              />
            )}
          </div>
          <div className={styles.addVehicleBtnWrap}>
            <VehicleModal ownerId={driver.id} setVehicles={setVehicles} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ margin: "0.5em 0" }}>
      <Accordion className={styles.accordion}>
        <AccordionItem
          title={`${driver.name}`}
          className={styles.item}
          startContent={<IoPersonCircle className={styles.personIcon} />}
        >
          <Drivers />
        </AccordionItem>
      </Accordion>
    </div>
  );
}
