"use client";
import React, { ReactNode, useContext, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import Navbar from "@/components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import Image from "next/image";
import DropdownComponent from "@/custom/dropdown/Dropdown";
import { Input } from "@nextui-org/react";
import { FaOilCan, FaSearch } from "react-icons/fa";
import { AuthContext } from "@/contexts/auth.context";
import { collection, getDocs, query, where, or, orderBy, limit } from "firebase/firestore";
import { Reading } from "@/interfaces/readings.type";
import { MdDateRange } from "react-icons/md";
import { IoCloseCircle, IoSpeedometer } from "react-icons/io5";
import { ImSpinner9 } from "react-icons/im";
import { BiSolidCarBattery } from "react-icons/bi";
import { BsThermometerHalf } from "react-icons/bs";
import { RiPinDistanceFill } from "react-icons/ri";
import clsx from "clsx";
import { Vehicle } from "@/interfaces/vehicle.type";
import { toast, Zoom } from "react-toastify";
import InputMask from "react-input-mask";
import { useRouter } from "next/navigation";

const verificationOptions = [
  { label: "Email", key: "email" },
  { label: "Nome do cliente", key: "name" },
  { label: "Placa do veículo", key: "license_plate" },
  { label: "Chassi do veículo", key: "vin" },
  { label: "Telefone", key: "phone_commercial" },
];

export default function Monitor() {
  const { db, isPremium } = useContext(AuthContext);
  const [verification, setVerification] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [showMonitor, setShowMonitor] = useState(false);
  const [vehicleIds, setVehicleIds] = useState<string[]>([]);
  const [vehicleData, setVehicleData] = useState<Vehicle[]>([]);
  const [vehicleStats, setVehicleStats] = useState<Reading[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const router = useRouter();

  useEffect(() => {
    isPremium !== null && !isPremium && router.push("/");
  }, []);

  const handleSearch = async () => {
    try {
      let fetchedVehicleIds: string[] = [];
      let fetchedVehicleDetails: Vehicle[] = [];

      if (verification === "email" || verification === "name" || verification === "phone_commercial") {
        const userSnapshot = await getDocs(query(collection(db, "appUsers"), where(verification, "==", searchValue)));
        for (const doc of userSnapshot.docs) {
          const vehicleSnapshot = await getDocs(query(collection(db, "vehicles"), where("owner", "==", doc.id)));
          vehicleSnapshot.forEach((vehicleDoc) => {
            fetchedVehicleIds.push(vehicleDoc.id);
            fetchedVehicleDetails.push({
              id: vehicleDoc.id,
              ...vehicleDoc.data(),
            } as Vehicle);
          });
        }
        const driverSnapshot = await getDocs(query(collection(db, "clients"), where(verification, "==", searchValue)));
        for (const doc of driverSnapshot.docs) {
          const vehicleSnapshot = await getDocs(query(collection(db, "vehicles"), where("owner", "==", doc.id)));
          vehicleSnapshot.forEach((vehicleDoc) => {
            fetchedVehicleIds.push(vehicleDoc.id);
            fetchedVehicleDetails.push({
              id: vehicleDoc.id,
              ...vehicleDoc.data(),
            } as Vehicle);
          });
        }
      }

      if (verification === "license_plate" || verification === "vin") {
        const vehicleSnapshot = await getDocs(query(collection(db, "vehicles"), where(verification, "==", searchValue)));

        if (!vehicleSnapshot.empty) {
          setSelectedVehicle(vehicleSnapshot.docs[0].data() as Vehicle);
          await fetchVehicleStats(vehicleSnapshot.docs[0].id, vehicleSnapshot.docs[0].data() as Vehicle);
        }
        return;
      }

      setVehicleIds(fetchedVehicleIds);
      setVehicleData(fetchedVehicleDetails);
      if (fetchedVehicleIds.length <= 1 && fetchedVehicleDetails.length <= 1) {
        setSelectedVehicle(fetchedVehicleDetails[0]);
        await fetchVehicleStats(fetchedVehicleIds[0], fetchedVehicleDetails[0]);
      } else {
        setShowMonitor(false);
      }
    } catch (error) {
      toast.error("Erro ao buscar dados", {
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

  const fetchVehicleStats = async (vehicleId: string, vehicle: Vehicle) => {
    try {
      const readings: Reading[] = [];
      const readingsSnapshot = await getDocs(
        query(collection(db, "readings"), where("car_id", "==", vehicleId), orderBy("createdAt", "desc"), limit(1))
      );
      readingsSnapshot.forEach((doc) => {
        readings.push({ id: doc.id, ...doc.data() } as Reading);
      });

      setVehicleStats(readings);
      setShowMonitor(true);
    } catch (error) {
      toast.error("Erro ao buscar leituras", {
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

  const handleVehicleSelect = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    await fetchVehicleStats(vehicle.id, vehicle);
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.pageWrap}>
        <div className={styles.textContainer}>
          <div className={styles.titleContainer}>
            <div className={styles.rectangleContainer}>
              <Image src="/rectangle.png" alt="Retângulo título" fill style={{ objectFit: "cover" }} />
            </div>
            <h1 className={styles.mainTitle}>Monitoramento</h1>
          </div>
          <div className="flex flex-col gap-5 w-full">
            <p className={styles.subtext}>Para verificar as condições do veículo, selecione alguma das formas de verificação abaixo</p>
            <div>
              <DropdownComponent
                options={verificationOptions}
                placeholder="Selecione forma de verificação"
                value={verification}
                onChange={(key) => setVerification(key.toString())}
              />
            </div>
            <div className={styles.searchbarContainer}>
              {verification &&
                (verification === "phone_commercial" ? (
                  <InputMask
                    mask={verification === "phone_commercial" ? "(99) 99999-9999" : ""}
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                    }}
                    maskChar={null}
                  >
                    {
                      ((inputProps: any) => (
                        <Input
                          {...inputProps}
                          type="text"
                          label={`Pesquise por ${verificationOptions.find((option) => option.key === verification)?.label}`}
                          variant="bordered"
                          className="dark"
                          classNames={{
                            input: ["bg-transparent text-white"],
                            inputWrapper: ["border border-2 !border-white focus:border-white"],
                          }}
                          endContent={
                            <button onClick={handleSearch} className="self-center">
                              <FaSearch className="text-white text-lg" />
                            </button>
                          }
                        />
                      )) as unknown as ReactNode
                    }
                  </InputMask>
                ) : (
                  <Input
                    type="text"
                    label={`Pesquise por ${verificationOptions.find((option) => option.key === verification)?.label}`}
                    variant="bordered"
                    className="dark"
                    classNames={{
                      input: ["bg-transparent text-white"],
                      inputWrapper: ["border border-2 !border-white focus:border-white"],
                    }}
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                    }}
                    value={searchValue}
                    endContent={
                      <button onClick={handleSearch} className="self-center">
                        <FaSearch className="text-white text-lg" />
                      </button>
                    }
                  />
                ))}
            </div>
          </div>

          {vehicleData.length > 1 && !showMonitor && (
            <div className="text-white flex flex-col gap-5 my-5">
              <h2 className="text-xl font-medium">Selecione um veículo</h2>
              <ul className="text-sm flex flex-col gap-2">
                {vehicleData.map((vehicle) => (
                  <li
                    key={vehicle.id}
                    onClick={() => handleVehicleSelect(vehicle)}
                    className="cursor-pointer bg-[#1E1E1E] hover:bg-[#209730] p-2 rounded-md"
                  >
                    {vehicle.manufacturer} {vehicle.car_model} - {vehicle.license_plate}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {showMonitor && selectedVehicle && <VehicleStats readings={vehicleStats} vehicle={selectedVehicle} />}
        </div>
      </div>
      <Footer />
    </div>
  );
}

const isExceedingLimit = (reading: number, limit: number) => reading >= limit;

const VehicleStats = ({ readings, vehicle }: { readings: Reading[]; vehicle: Vehicle }) => {
  return (
    <div className={styles.monitorContainer}>
      <span className={styles.greenRectangle} />
      <h2 className={styles.monitorTitle}>Dados monitorados do veículo</h2>
      <div className={styles.cardsContainer}>
        {readings && readings.length ? (
          readings.map((reading) => (
            <div
              key={reading.id}
              className={clsx(styles.cardWrapper, "grid grid-cols-4 items-center justify-center justify-items-center gap-4 w-full")}
            >
              <KmCard km={reading.obd2_distance} limit={vehicle.obd2_distance} />
              <TempCard temperature={reading.engine_temp} limit={vehicle.engine_temp} />
              <TensionCard tension={reading.battery_tension} limit={vehicle.battery_tension} />
              <OilCard oilLevel={reading.oil_pressure} limit={vehicle.oil_pressure} />
              <RpmCard rpm={reading.rpm} limit={vehicle.rpm} />
              <SpeedCard speed={reading.speed} limit={vehicle.speed} />
              <FailCard fails={0} />
              <LastReadingCard
                lastRead={new Date(reading.createdAt).toLocaleString("pt-BR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            </div>
          ))
        ) : (
          <p className="text-sm text-white">Não foi encontrado nenhuma leitura.</p>
        )}
      </div>
    </div>
  );
};

const KmCard = ({ km, limit }: { km: number; limit: number }) => (
  <div
    className={clsx(styles.card, {
      [styles.cardExceeded]: isExceedingLimit(km, limit),
    })}
  >
    <span className={styles.rectangle} />
    <h4 className={styles.cardTitle}>KM ATUAL</h4>
    <div className={styles.cardIconContainer}>
      <RiPinDistanceFill className={styles.cardIcon} />
    </div>
    <h1 className={styles.cardValue}>{km}</h1>
  </div>
);

const TempCard = ({ temperature, limit }: { temperature: number; limit: number }) => (
  <div
    className={clsx(styles.card, {
      [styles.cardExceeded]: isExceedingLimit(temperature, limit),
    })}
  >
    <span className={styles.rectangle} />
    <h4 className={styles.cardTitle}>TEMPERATURA MOTOR</h4>
    <div className={styles.cardIconContainer}>
      <BsThermometerHalf className={styles.cardIcon} style={{ fontSize: "3.6em" }} />
    </div>
    <h1 className={styles.cardValue}>{temperature}°</h1>
  </div>
);

const TensionCard = ({ tension, limit }: { tension: number; limit: number }) => (
  <div
    className={clsx(styles.card, {
      [styles.cardExceeded]: isExceedingLimit(tension, limit),
    })}
  >
    <span className={styles.rectangle} />
    <h4 className={styles.cardTitle}>TENSÃO SAÍDA</h4>
    <div className={styles.cardIconContainer}>
      <BiSolidCarBattery className={styles.cardIcon} />
    </div>
    <h1 className={styles.cardValue}>{tension} V</h1>
  </div>
);

const OilCard = ({ oilLevel, limit }: { oilLevel: number; limit: number }) => (
  <div
    className={clsx(styles.card, {
      [styles.cardExceeded]: isExceedingLimit(oilLevel, limit),
    })}
  >
    <span className={styles.rectangle} />
    <h4 className={styles.cardTitle}>PRESSÃO ÓLEO</h4>
    <div className={styles.cardIconContainer}>
      <FaOilCan className={styles.cardIcon} />
    </div>
    <h1 className={styles.cardValue}>{oilLevel} bar</h1>
  </div>
);

const RpmCard = ({ rpm, limit }: { rpm: number; limit: number }) => (
  <div
    className={clsx(styles.card, {
      [styles.cardExceeded]: isExceedingLimit(rpm, limit),
    })}
  >
    <span className={styles.rectangle} />
    <h4 className={styles.cardTitle}>ROTAÇÃO MOTOR</h4>
    <div className={styles.cardIconContainer}>
      <ImSpinner9 className={styles.cardIcon} />
    </div>
    <h1 className={styles.cardValue}>{rpm}</h1>
  </div>
);

const SpeedCard = ({ speed, limit }: { speed: number; limit: number }) => (
  <div
    className={clsx(styles.card, {
      [styles.cardExceeded]: isExceedingLimit(speed, limit),
    })}
  >
    <span className={styles.rectangle} />
    <h4 className={styles.cardTitle}>VELOCIDADE</h4>
    <div className={styles.cardIconContainer}>
      <IoSpeedometer className={styles.cardIcon} />
    </div>
    <h1 className={styles.cardValue}>{speed} km/h</h1>
  </div>
);

const FailCard = ({ fails = 0 }: { fails?: number }) => (
  <div
    className={clsx(styles.card, {
      [styles.cardExceeded]: isExceedingLimit(fails, 1),
    })}
  >
    <span className={styles.rectangle} />
    <h4 className={styles.cardTitle}>FALHAS</h4>
    <div className={styles.cardIconContainer}>
      <IoCloseCircle className={styles.cardIconFail} />
    </div>
    <h1 className={styles.cardValue}>{fails}</h1>
  </div>
);

const LastReadingCard = ({ lastRead }: { lastRead?: string }) => (
  <div className={styles.card}>
    <span className={styles.greenRectangle} />
    <h4 className={styles.cardTitle}>ÚLTIMA LEITURA</h4>
    <div className={styles.cardIconContainer}>
      <MdDateRange className={styles.cardIcon} />
    </div>
    <h1 className={styles.cardValue}>{lastRead}</h1>
  </div>
);
