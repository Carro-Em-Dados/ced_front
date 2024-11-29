"use client";
import React, { useContext, useState } from "react";
import styles from "./table.module.scss";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, Spinner } from "@nextui-org/react";
import { Maintenance } from "@/interfaces/maintenances.type";
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from "firebase/firestore";
import { Driver } from "@/interfaces/driver.type";
import { AppUser } from "@/interfaces/appUser.type";
import { AuthContext } from "@/contexts/auth.context";
import { Vehicle } from "@/interfaces/vehicle.type";
import { Reading } from "@/interfaces/readings.type";
import { Timestamp } from "firebase-admin/firestore";

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
    totalKm: 0,
    okCount: 0,
    closeCount: 0,
    expiredCount: 0,
  });
  const [vehicleInfo, setVehicleInfo] = useState({
    vehicleKm: 0,
    okCount: 0,
    closeCount: 0,
    expiredCount: 0,
  });

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

        let userData: Driver | AppUser | null = null;
        if (driverDoc.exists()) {
          userData = driverDoc.data() as Driver;
        } else {
          const appUserDocRef = doc(db, "appUsers", clientId);
          const appUserDoc = await getDoc(appUserDocRef);
          if (appUserDoc.exists()) {
            userData = appUserDoc.data() as AppUser;
          }
        }

        if (userData) {
          const vehiclesQuery = query(collection(db, "vehicles"), where("owner", "==", clientId));
          const vehiclesSnapshot = await getDocs(vehiclesQuery);

          let totalKm = 0;
          let okCount = 0;
          let closeCount = 0;
          let expiredCount = 0;

          for (const vehicleDoc of vehiclesSnapshot.docs) {
            const readingDocRef = await getDocs(
              query(collection(db, "readings"), where("car_id", "==", vehicleDoc.id), orderBy("createdAt", "desc"), limit(1))
            );
            const readingData = readingDocRef?.docs[0]?.data() as Reading;
            const vehicleKm =
              (readingData?.obd2_distance > readingData?.gps_distance ? readingData?.obd2_distance : readingData?.gps_distance) || 0;
            totalKm += vehicleKm;

            if (vehicleDoc.id) {
              const maintenancesQuery = query(collection(db, "maintenances"), where("car_id", "==", vehicleDoc.id));
              const maintenancesSnapshot = await getDocs(maintenancesQuery);

              for (const maintenanceDoc of maintenancesSnapshot.docs) {
                const maintenanceData = maintenanceDoc.data() as Maintenance;
                const status = calculateStatus(maintenanceData, vehicleKm, {
                  workshopKmLimitAlarm: props.contractLimits.kmLimitBefore,
                  workshopDateLimitAlarm: props.contractLimits.dateLimitBefore,
                });
                if (status === "Vencida") expiredCount++;
                else if (status === "Ok") okCount++;
                else closeCount++;
              }
            }
          }

          setUserVehicleInfo({
            totalKm,
            okCount,
            closeCount,
            expiredCount,
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
        const readingDocRef = query(collection(db, "readings"), where("car_id", "==", vehicleId), orderBy("createdAt", "desc"), limit(1));
        const readingDoc = await getDocs(readingDocRef);

        const readingData = readingDoc?.docs[0]?.data() as Reading;
        const vehicleKm =
          readingData?.obd2_distance > readingData?.gps_distance ? readingData?.obd2_distance : readingData?.gps_distance || 0;

        const maintenancesQuery = query(collection(db, "maintenances"), where("car_id", "==", vehicleId));
        const maintenancesSnapshot = await getDocs(maintenancesQuery);
        let okCount = 0;
        let closeCount = 0;
        let expiredCount = 0;

        for (const maintenanceDoc of maintenancesSnapshot.docs) {
          const maintenanceData = maintenanceDoc.data() as Maintenance;
          const status = calculateStatus(maintenanceData, vehicleKm, {
            workshopKmLimitAlarm: props.contractLimits.kmLimitBefore,
            workshopDateLimitAlarm: props.contractLimits.dateLimitBefore,
          });
          if (status === "Vencida") expiredCount++;
          else if (status === "Ok") okCount++;
          else closeCount++;
        }

        setVehicleInfo({
          vehicleKm,
          okCount,
          closeCount,
          expiredCount,
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
    limits: { workshopKmLimitAlarm: number; workshopDateLimitAlarm: number }
  ) => {
    const now = new Date();
    const dateLimit = maintenance.dateLimit ? maintenance.dateLimit.toDate() : null;
    const maintenanceKm = maintenance.kmLimit;

    const kmBeforeLimit = limits.workshopKmLimitAlarm;
    const dateBeforeLimit = limits.workshopDateLimitAlarm;

    if (dateLimit && dateLimit.getTime() - dateBeforeLimit * 24 * 60 * 60 * 1000 >= now.getTime()) {
      return "Próxima";
    } else if (dateLimit && dateLimit.getTime() <= now.getTime()) {
      return "Vencida";
    } else if (maintenanceKm && maintenanceKm - kmBeforeLimit <= kmCurrent) {
      return "Próxima";
    } else if (maintenanceKm && maintenanceKm <= kmCurrent) {
      return "Vencida";
    }
    return "Ok";
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
                        <p className="font-bold mb-1">Dados do usuário</p>
                        <p>Total KM: {userVehicleInfo.totalKm}</p>
                        <p>Manutenções Críticas: {userVehicleInfo.okCount}</p>
                        <p>Manutenções Próximas: {userVehicleInfo.closeCount}</p>
                        <p>Manutenções Vencidas: {userVehicleInfo.expiredCount}</p>
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
                        <p className="font-bold mb-1">Dados do veículo</p>
                        <p>KM Rodados: {vehicleInfo.vehicleKm}</p>
                        <p>Manutenções Críticas: {vehicleInfo.okCount}</p>
                        <p>Manutenções Próximas: {vehicleInfo.closeCount}</p>
                        <p>Manutenções Vencidas: {vehicleInfo.expiredCount}</p>
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
            <TableCell className={styles.cell}>
              <span
                className={`rounded-lg px-2 py-1 ${
                  row.status === "Próxima" ? "!bg-[#D3C544]" : row.status === "Crítica" ? "!bg-[#2D2F2D]" : "!bg-[#B73F25]"
                }`}
              >
                {row.status}
              </span>
            </TableCell>
            <TableCell className={styles.cell}>
              <a
                className="text-sky-500 underline"
                href={`/dashboard/calendar?${row.vehicleId ? `v=${row.vehicleId}` : ""}${row.clientId ? `&d=${row.clientId}` : ""}${
                  row.maintenance ? `&m=${row.id}` : ""
                }${row.workshopId ? `&w=${row.workshopId}` : ""}`}
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
