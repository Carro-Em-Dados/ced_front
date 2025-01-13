"use client";
import React, { useContext, useState } from "react";
import styles from "./table.module.scss";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Spinner,
} from "@nextui-org/react";
import { Maintenance } from "@/interfaces/maintenances.type";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { Driver } from "@/interfaces/driver.type";
import { AppUser } from "@/interfaces/appUser.type";
import { AuthContext } from "@/contexts/auth.context";
import { Reading } from "@/interfaces/readings.type";
import { toast, Zoom } from "react-toastify";
import { Vehicle } from "@/interfaces/vehicle.type";

interface CustomTableProps {
  data: any[];
  contractLimits: {
    kmLimitBefore: number;
    dateLimitBefore: number;
  };
}

function CustomTable(props: CustomTableProps) {
  const { db } = useContext(AuthContext);
  const [userOpen, setUserOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userVehicleInfo, setUserVehicleInfo] = useState({
    clientName: "",
    totalKm: 0,
    okCount: 0,
    closeCount: 0,
    expiredCount: 0,
    criticalCount: 0,
  });
  const [vehicleInfo, setVehicleInfo] = useState({
    manufacturer: "",
    vehicleKm: 0,
    okCount: 0,
    closeCount: 0,
    expiredCount: 0,
    criticalCount: 0,
  });

  const fetchWorkshopFromRow = async (
    row: any
  ): Promise<string | undefined> => {
    try {
      const maintenanceDocRef = doc(db, "maintenances", row.id);
      const maintenanceDoc = await getDoc(maintenanceDocRef);
      if (!maintenanceDoc.exists()) {
        toast.error("Erro ao buscar informações da manutenção",  {
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
        return;
      }

      const maintenanceData = maintenanceDoc.data() as Maintenance;
      const fetchedWorkshopId = maintenanceData.workshop;

      const url =
        `/dashboard/calendar?${
          row.vehicleId ? `v=${encodeURIComponent(row.vehicleId)}` : ""
        }` +
        `${row.clientId ? `&d=${encodeURIComponent(row.clientId)}` : ""}` +
        `${row.maintenance ? `&m=${encodeURIComponent(row.id)}` : ""}` +
        `&w=${encodeURIComponent(fetchedWorkshopId)}`;
      return url;
    } catch (error) {
      console.error("Erro ao buscar informações da manutenção:", error);
    }
  };

  const handleOpenUser = async (clientId: string) => {
    if (!clientId) {
      return;
    }

    setUserOpen(!userOpen);

    if (!userOpen) {
      setLoading(true);

      try {
        const driverDocRef = doc(db, "clients", clientId);
        const driverDoc = await getDoc(driverDocRef);

        if (!driverDoc.exists()) {
          setLoading(false);
          return;
        }

        let clientName = "";

        let userData: Driver | AppUser | null = null;
        if (driverDoc.exists()) {
          userData = driverDoc.data() as Driver;
          clientName = userData!.name;
        } else {
          const appUserDocRef = doc(db, "appUsers", clientId);
          const appUserDoc = await getDoc(appUserDocRef);
          if (appUserDoc.exists()) {
            userData = appUserDoc.data() as AppUser;
            clientName = userData!.name;
          }
        }

        if (userData) {
          const vehiclesQuery = query(
            collection(db, "vehicles"),
            where("owner", "==", clientId)
          );
          const vehiclesSnapshot = await getDocs(vehiclesQuery);

          let totalKm = 0;
          let okCount = 0;
          let closeCount = 0;
          let expiredCount = 0;
          let criticalCount = 0;

          for (const vehicleDoc of vehiclesSnapshot.docs) {
            const readingDocRef = await getDocs(
              query(
                collection(db, "readings"),
                where("car_id", "==", vehicleDoc.id),
                orderBy("createdAt", "desc"),
                limit(1)
              )
            );
            const readingData = readingDocRef?.docs[0]?.data() as Reading;
            let vehicleKm =
              (readingData?.obd2_distance > readingData?.gps_distance
                ? readingData?.obd2_distance
                : readingData?.gps_distance) || 0;
            if (vehicleKm === 0) vehicleKm = vehicleDoc.data()?.initial_km;
            totalKm += vehicleKm;

            let isCritical = false;

            if (readingData) {
              for (const dtc of readingData.dtc_readings) {
                if (dtc?.startsWith("P") || dtc?.startsWith("p")) {
                  isCritical = true;
                  break;
                }
              }
            }

            if (vehicleDoc.id) {
              const maintenancesQuery = query(
                collection(db, "maintenances"),
                where("car_id", "==", vehicleDoc.id)
              );
              const maintenancesSnapshot = await getDocs(maintenancesQuery);

              for (const maintenanceDoc of maintenancesSnapshot.docs) {
                const maintenanceData = maintenanceDoc.data() as Maintenance;
                const status = calculateStatus(
                  maintenanceData,
                  vehicleKm,
                  {
                    workshopKmLimitAlarm: props.contractLimits.kmLimitBefore,
                    workshopDateLimitAlarm:
                      props.contractLimits.dateLimitBefore,
                  },
                  isCritical
                );
                if (status === "Vencida") expiredCount++;
                else if (status === "Ok") okCount++;
                else if (status === "Crítica") criticalCount++;
                else closeCount++;
              }
            }
          }

          setUserVehicleInfo({
            clientName,
            totalKm,
            okCount,
            closeCount,
            expiredCount,
            criticalCount,
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenVehicle = async (vehicleId: string) => {
    setVehicleOpen(!vehicleOpen);

    if (!vehicleOpen) {
      setLoading(true);

      try {
        const readingDocRef = query(
          collection(db, "readings"),
          where("car_id", "==", vehicleId),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const readingDoc = await getDocs(readingDocRef);

        let manufacturer = "";
        const vehicleDocRef = doc(db, "vehicles", vehicleId);
        const vehicleDoc = await getDoc(vehicleDocRef);

        const readingData = readingDoc?.docs[0]?.data() as Reading;
        let vehicleKm =
          readingData?.obd2_distance > readingData?.gps_distance
            ? readingData?.obd2_distance
            : readingData?.gps_distance || 0;
        
        if (vehicleDoc.exists()) {
          const vehicleData = vehicleDoc.data() as Vehicle;
          manufacturer = vehicleData.manufacturer;
          if (vehicleKm === 0) vehicleKm = vehicleData.initial_km;
        }

        const maintenancesQuery = query(
          collection(db, "maintenances"),
          where("car_id", "==", vehicleId)
        );
        const maintenancesSnapshot = await getDocs(maintenancesQuery);
        let okCount = 0;
        let closeCount = 0;
        let expiredCount = 0;
        let criticalCount = 0;

        let isCritical = false;

        if (readingData) {
          for (const dtc of readingData.dtc_readings) {
            if (dtc?.startsWith("P") || dtc?.startsWith("p")) {
              isCritical = true;
              break;
            }
          }
        }

        for (const maintenanceDoc of maintenancesSnapshot.docs) {
          const maintenanceData = maintenanceDoc.data() as Maintenance;
          const status = calculateStatus(
            maintenanceData,
            vehicleKm,
            {
              workshopKmLimitAlarm: props.contractLimits.kmLimitBefore,
              workshopDateLimitAlarm: props.contractLimits.dateLimitBefore,
            },
            isCritical
          );
          if (status === "Vencida") expiredCount++;
          else if (status === "Ok") okCount++;
          else if (status === "Crítica") criticalCount++;
          else closeCount++;
        }

        setVehicleInfo({
          manufacturer,
          vehicleKm,
          okCount,
          closeCount,
          expiredCount,
          criticalCount,
        });
      } catch (error) {
        console.error("Erro ao buscar informações do veículo:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const calculateStatus = (
    maintenance: Maintenance,
    kmCurrent: number,
    limits: { workshopKmLimitAlarm: number; workshopDateLimitAlarm: number },
    isCritical: boolean
  ) => {
    const now = new Date();
    const dateLimit = maintenance.dateLimit
      ? maintenance.dateLimit.toDate()
      : null;
    const maintenanceKm = maintenance.kmLimit;

    const kmBeforeLimit = limits.workshopKmLimitAlarm;
    const dateBeforeLimit = limits.workshopDateLimitAlarm;

    let result = "Ok";

    if (isCritical) {
      result = "Crítica";
      return result;
    }

    if (dateLimit) {
      const MS_PER_DAY = 1000 * 60 * 60 * 24;
      const dateThreshold = dateLimit.getTime() - dateBeforeLimit * MS_PER_DAY;

      if (dateLimit.getTime() < now.getTime()) {
        result = "Vencida";
      } else if (dateThreshold <= now.getTime()) {
        result = "Próxima";
      }
    }

    if (maintenanceKm) {
      const kmThreshold = maintenanceKm - kmBeforeLimit;

      if (maintenanceKm <= kmCurrent) {
        result = "Vencida";
      } else if (kmThreshold <= kmCurrent) {
        result = result === "Vencida" ? "Vencida" : "Próxima";
      }
    }

    return result;
  };

  return (
    <Table aria-label="Maintenance info table" className={styles.table}>
      <TableHeader className={styles.header}>
        <TableColumn>Cliente</TableColumn>
        <TableColumn>Veículo</TableColumn>
        <TableColumn>Manutenção</TableColumn>
        <TableColumn>Km atual</TableColumn>
        <TableColumn>Km limite</TableColumn>
        <TableColumn>Data limite</TableColumn>
        <TableColumn>Status</TableColumn>
        <TableColumn>Agendamento</TableColumn>
      </TableHeader>
      <TableBody>
        {props.data.map((row, key) => (
          <TableRow key={key}>
            <TableCell className={styles.cell}>
              <Tooltip
                className="dark"
                content={
                  <div className="flex flex-col text-white p-2">
                    {loading ? (
                      <Spinner color="white" size="sm" />
                    ) : (
                      <>
                        <p className="font-bold mb-1">
                          Dados do usuário {userVehicleInfo.clientName}
                        </p>
                        <p>Total KM: {userVehicleInfo.totalKm}</p>
                        <p>Manutenções Okay: {userVehicleInfo.okCount}</p>
                        <p>
                          Manutenções Próximas: {userVehicleInfo.closeCount}
                        </p>
                        <p>
                          Manutenções Vencidas: {userVehicleInfo.expiredCount}
                        </p>
                        <p>
                          Manutenções Críticas: {userVehicleInfo.criticalCount}
                        </p>
                      </>
                    )}
                  </div>
                }
                onOpenChange={() => handleOpenUser(row.clientId)}
              >
                <p>{row.client}</p>
              </Tooltip>
            </TableCell>
            <TableCell className={styles.cell}>
              <Tooltip
                className="dark"
                content={
                  <div className="flex flex-col text-white p-2">
                    {loading ? (
                      <Spinner color="white" size="sm" />
                    ) : (
                      <>
                        <p className="font-bold mb-1">
                          Dados do veículo {vehicleInfo.manufacturer}
                        </p>
                        <p>KM Rodados: {vehicleInfo.vehicleKm}</p>
                        <p>Manutenções Okay: {vehicleInfo.okCount}</p>
                        <p>Manutenções Próximas: {vehicleInfo.closeCount}</p>
                        <p>Manutenções Vencidas: {vehicleInfo.expiredCount}</p>
                        <p>Manutenções Críticas: {vehicleInfo.criticalCount}</p>
                      </>
                    )}
                  </div>
                }
                onOpenChange={() => handleOpenVehicle(row.vehicleId)}
              >
                <p>{row.vehicle}</p>
              </Tooltip>
            </TableCell>
            <TableCell className={styles.cell}>{row.maintenance}</TableCell>
            <TableCell className={styles.cell}>{row.km_current}</TableCell>
            <TableCell className={styles.cell}>{row.km_threshold}</TableCell>
            <TableCell className={styles.cell}>{row.date_threshold}</TableCell>
            <TableCell className={`${styles.cell} flex flex-row justify-center`}>
              <span
                className={`rounded-lg px-2 py-1 text-center ${
                  row.status === "Próxima"
                    ? "!bg-[#D3C544] text-black font-semibold"
                    : row.status === "Vencida"
                    ? "!bg-[#B73F25] text-white font-semibold"
                    : row.status === "Crítica"
                    ? "!bg-[#2D2F2D] text-white font-semibold"
                    : "!bg-[#06b606] text-black font-semibold"
                }`}
              >
                {row.status}
              </span>
            </TableCell>
            <TableCell className={styles.cell}>
              <a
                className="text-sky-500 underline"
                href={`/dashboard/calendar?${
                  row.vehicleId ? `v=${row.vehicleId}` : ""
                }${row.clientId ? `&d=${row.clientId}` : ""}${
                  row.maintenance ? `&m=${row.id}` : ""
                }${
                  row.workshopId
                    ? `&w=${row.workshopId}`
                    : fetchWorkshopFromRow(row)
                }`}
              >
                Agendar
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default CustomTable;
