"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  startAfter,
  getCountFromServer,
  orderBy,
} from "firebase/firestore";
import { useState, useEffect, useContext } from "react";
import { Maintenance } from "@/interfaces/maintenances.type";
import { AppUser } from "@/interfaces/appUser.type";
import { Driver } from "@/interfaces/driver.type";
import { Vehicle } from "@/interfaces/vehicle.type";
import { AuthContext } from "@/contexts/auth.context";
import CustomTable from "../table/table";
import CustomChart from "../chart/chart";
import styles from "../../tabs/welcome.module.scss";
import clsx from "clsx";
import { TbClockExclamation } from "react-icons/tb";
import { MdDirectionsCar, MdOutlineSpeed } from "react-icons/md";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Spinner,
} from "@nextui-org/react";
import { Contract } from "@/interfaces/contract.type";
import { Reading } from "@/interfaces/readings.type";
import { Timestamp } from "firebase-admin/firestore";
import ButtonExport from "@/components/ButtonExport";
import ButtonSend from "@/components/ButtonSend";

interface DashboardProps {
  selectedWorkshop: string;
  workshopName: string;
  contractId?: string;
}

interface MaintenanceData {
  client: string;
  clientId: string;
  vehicle: string;
  vehicleId: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  maintenance: string;
  km_current: number;
  km_threshold: number;
  date_threshold: string;
  status: string;
  obd2Distance: number;
  gpsDistance: number;
  id?: string;
}

export default function Dashboard({
  selectedWorkshop,
  contractId,
  workshopName,
}: DashboardProps) {
  const { db } = useContext(AuthContext);
  const [maintenances, setMaintenances] = useState<MaintenanceData[]>([]);
  const [maintenancesChart, setMaintenancesChart] = useState<MaintenanceData[]>(
    []
  );
  const [contractInfo, setContractInfo] = useState<Contract>();
  const [currentPage, setCurrentPage] = useState(0);
  const [lastVisibleDocs, setLastVisibleDocs] = useState<Map<number, any>>(
    new Map()
  );
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [totalKM, setTotalKM] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [counterType, setCounterType] = useState("total");
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<any>();
  const [selectedFilterOption, setSelectedFilterOption] = useState({
    selected: "",
    type: "",
  });
  const [filterType, setFilterType] = useState("");
  const [counter, setCounter] = useState("");
  const [filterSum, setFilterSum] = useState(0);

  const itemsPerPage = 10;

  const fetchContract = async () => {
    if (!db) return;
    if (!contractId)
      return setContractInfo({
        maxAlarmsPerVehicle: 0,
        maxDrivers: 0,
        maxVehiclesPerDriver: 0,
        maxMaintenanceAlarmsPerUser: 0,
        freemiumPeriod: 0,
        userDateLimitAlarm: 99999,
        userKmLimitAlarm: 99999,
        workshopDateLimitAlarm: 99999,
        workshopKmLimitAlarm: 99999,
        workshopScheduleLimit: 99999,
        id: "",
      });
    try {
      const contractDocRef = doc(db, "contracts", contractId);
      const contractDoc = await getDoc(contractDocRef);
      if (!contractDoc.exists()) return;

      const contractData = contractDoc.data() as Contract;
      setContractInfo(contractData);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMaintenances = async (_currentPage: number = 0) => {
    if (!db) return;

    try {
      setLoading(true);
      let baseQuery;
      const queryParams = [];

      if (selectedWorkshop !== "all")
        queryParams.push(where("workshop", "==", selectedWorkshop));

      baseQuery = query(collection(db, "maintenances"), ...queryParams);

      const countSnapshot = await getCountFromServer(baseQuery);
      const totalItems = countSnapshot.data().count;
      setTotalPages(Math.ceil(totalItems / itemsPerPage));

      if (selectedWorkshop === "all") {
        const querySnapshot = await getDocs(baseQuery);
        const maintenanceList: MaintenanceData[] = [];

        for (const docSnap of querySnapshot.docs) {
          const maintenanceData = docSnap.data() as Maintenance;
          maintenanceData.id = docSnap.id;

          if (!maintenanceData.car_id) {
            continue;
          }

          let clientName = "";
          let clientId = "";
          let vehicleInfo = "";
          let vehicleId = "";
          let kmCurrent = 0;
          let vehicleBrand = "";
          let vehicleModel = "";
          let vehicleYear = "";
          let obd2Distance = 0;
          let gpsDistance = 0;

          const vehicleDocRef = doc(db, "vehicles", maintenanceData.car_id);
          const readingDocRef = query(
            collection(db, "readings"),
            where("car_id", "==", maintenanceData.car_id),
            orderBy("createdAt", "desc"),
            limit(1)
          );
          const [vehicleDoc, readingDoc] = await Promise.all([
            getDoc(vehicleDocRef),
            getDocs(readingDocRef),
          ]);


          if (vehicleDoc.exists()) {
            const vehicleData = vehicleDoc.data() as Vehicle;
            const readingData = readingDoc?.docs[0]?.data() as Reading;
            vehicleInfo = `${vehicleData.car_model} - ${vehicleData.license_plate}`;
            vehicleId = vehicleDoc.id;
            vehicleBrand = vehicleData.manufacturer || "";
            vehicleModel = vehicleData.car_model || "";
            vehicleYear = vehicleData.year || "";
            obd2Distance = readingData?.obd2_distance || vehicleData.initial_km;
            gpsDistance = readingData?.gps_distance || vehicleData.initial_km;
            kmCurrent = obd2Distance > gpsDistance ? obd2Distance : gpsDistance;

            if (vehicleData.owner) {
              const appUserDocRef = doc(db, "appUsers", vehicleData.owner);
              const appUserDoc = await getDoc(appUserDocRef);
              if (appUserDoc.exists()) {
                const clientData = appUserDoc.data() as AppUser;
                clientName = clientData.name || "";
                clientId = appUserDoc.id;
              } else {
                const driverDocRef = doc(db, "clients", vehicleData.owner);
                const driverDoc = await getDoc(driverDocRef);
                if (driverDoc.exists()) {
                  const driverData = driverDoc.data() as Driver;
                  clientName = driverData.name || "";
                  clientId = driverDoc.id;
                }
              }
            } else if (selectedWorkshop !== "all") {
              continue;
            }
          }

          const status = calculateStatus(maintenanceData, kmCurrent, {
            workshopKmLimitAlarm: contractInfo?.workshopKmLimitAlarm ?? 0,
            workshopDateLimitAlarm: contractInfo?.workshopDateLimitAlarm ?? 0,
          });

          const maintenance = {
            obd2Distance,
            gpsDistance,
            client: clientName,
            clientId: clientId,
            vehicle: vehicleInfo,
            vehicleId: vehicleId,
            vehicleBrand: vehicleBrand,
            vehicleModel: vehicleModel,
            vehicleYear: vehicleYear,
            maintenance: maintenanceData.service,
            km_current: kmCurrent,
            km_threshold: maintenanceData.kmLimit || 0,
            date_threshold: maintenanceData?.dateLimit?.seconds
              ? (maintenanceData.dateLimit as Timestamp)
                  .toDate()
                  .toLocaleDateString("pt-BR")
              : "",
            status: status,
            id: maintenanceData.id,
          };

          // const isWithinKmAlarmThreshold = maintenance.km_threshold - (contractInfo?.workshopKmLimitAlarm ?? 0) <= maintenance.km_current;
          // const isWithinDateAlarmThreshold = maintenance.date_threshold
          //   ? moment().isSameOrAfter(
          //       moment(maintenance.date_threshold, "DD/MM/YYYY").subtract(contractInfo?.workshopDateLimitAlarm ?? 0, "days")
          //     )
          //   : false;

          // if (isWithinKmAlarmThreshold || isWithinDateAlarmThreshold) maintenanceList.push(maintenance);

          maintenanceList.push(maintenance);
        }

        setMaintenances(maintenanceList);
        const lastVisibleDoc =
          querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisibleDocs((prevMap) =>
          prevMap.set(_currentPage, lastVisibleDoc)
        );
      } else {
        let q = query(baseQuery, orderBy("date"));
        if (!_currentPage) {
          q = query(baseQuery, orderBy("date"), limit(itemsPerPage));
        } else {
          const lastVisible = lastVisibleDocs.get(_currentPage - 1);
          console.log("lastVisible:", lastVisible);
          if (lastVisible)
            q = query(
              baseQuery,
              orderBy("date"),
              limit(itemsPerPage),
              startAfter(lastVisible)
            );
        }

        const querySnapshot = await getDocs(q!);
        const maintenanceList: MaintenanceData[] = [];
        const maintenanceChartList: MaintenanceData[] = [];

        // For the Chart
        const allMaintenancesOfCurrentWorkshop = await getDocs(baseQuery);
        for (const maint of allMaintenancesOfCurrentWorkshop.docs) {
          const maintenanceData = maint.data() as Maintenance;
          maintenanceData.id = maint.id;

          if (!maintenanceData.car_id) {
            continue;
          }

          let clientName = "";
          let clientId = "";
          let vehicleInfo = "";
          let vehicleId = "";
          let vehicleBrand = "";
          let vehicleModel = "";
          let vehicleYear = "";
          let obd2Distance = 0;
          let gpsDistance = 0;
          let kmCurrent = 0;

          const vehicleDocRef = doc(db, "vehicles", maintenanceData.car_id);
          const readingDocRef = query(
            collection(db, "readings"),
            where("car_id", "==", maintenanceData.car_id),
            orderBy("createdAt", "desc"),
            limit(1)
          );
          const [vehicleDoc, readingDoc] = await Promise.all([
            getDoc(vehicleDocRef),
            getDocs(readingDocRef),
          ]);
          if (vehicleDoc.exists()) {
            const vehicleData = vehicleDoc.data() as Vehicle;
            const readingData = readingDoc?.docs[0]?.data() as Reading;

            if (vehicleDoc.id == "UyZgKPSSM9rMT1MWtHDL") {
              console.log(readingData?.gps_distance, readingData?.obd2_distance);
            }

            vehicleInfo = `${vehicleData.car_model} - ${vehicleData.license_plate}`;
            vehicleId = vehicleDoc.id;
            vehicleBrand = vehicleData.manufacturer || "";
            vehicleModel = vehicleData.car_model || "";
            vehicleYear = vehicleData.year || "";
            obd2Distance = readingData?.obd2_distance || vehicleData.initial_km;
            gpsDistance = readingData?.gps_distance || vehicleData.initial_km;
            kmCurrent = obd2Distance > gpsDistance ? obd2Distance : gpsDistance;

            if (vehicleData.owner) {
              const appUserDocRef = doc(db, "appUsers", vehicleData.owner);
              const appUserDoc = await getDoc(appUserDocRef);
              if (appUserDoc.exists()) {
                const clientData = appUserDoc.data() as AppUser;
                clientName = clientData.name || "";
                clientId = appUserDoc.id;
              } else {
                const driverDocRef = doc(db, "clients", vehicleData.owner);
                const driverDoc = await getDoc(driverDocRef);
                if (driverDoc.exists()) {
                  const driverData = driverDoc.data() as Driver;
                  clientName = driverData.name || "";
                  clientId = driverDoc.id;
                }
              }
            } else if (selectedWorkshop !== "all") {
              continue;
            }
          }

          const status = calculateStatus(maintenanceData, kmCurrent, {
            workshopKmLimitAlarm: contractInfo?.workshopKmLimitAlarm ?? 0,
            workshopDateLimitAlarm: contractInfo?.workshopDateLimitAlarm ?? 0,
          });

          const maintenance = {
            obd2Distance,
            gpsDistance,
            client: clientName,
            clientId: clientId,
            vehicle: vehicleInfo,
            vehicleId: vehicleId,
            vehicleBrand: vehicleBrand,
            vehicleModel: vehicleModel,
            vehicleYear: vehicleYear,
            maintenance: maintenanceData.service,
            km_current: kmCurrent,
            km_threshold: maintenanceData.kmLimit || 0,
            date_threshold: maintenanceData.dateLimit
              ? new Date(
                  maintenanceData.dateLimit.seconds * 1000 +
                    maintenanceData.dateLimit.nanoseconds / 1000000
                ).toLocaleDateString("pt-BR")
              : "",
            status: status,
            id: maintenanceData.id,
          };

          maintenanceChartList.push(maintenance);
        }
        setMaintenancesChart(maintenanceChartList);

        // For the Table and other stuff
        for (const docSnap of querySnapshot.docs) {
          const maintenanceData = docSnap.data() as Maintenance;
          maintenanceData.id = docSnap.id;

          if (!maintenanceData.car_id) {
            continue;
          }

          let clientName = "";
          let clientId = "";
          let vehicleInfo = "";
          let vehicleId = "";
          let kmCurrent = 0;
          let vehicleBrand = "";
          let vehicleModel = "";
          let vehicleYear = "";
          let obd2Distance = 0;
          let gpsDistance = 0;

          const vehicleDocRef = doc(db, "vehicles", maintenanceData.car_id);
          const readingDocRef = query(
            collection(db, "readings"),
            where("car_id", "==", maintenanceData.car_id),
            orderBy("createdAt", "desc"),
            limit(1)
          );
          const [vehicleDoc, readingDoc] = await Promise.all([
            getDoc(vehicleDocRef),
            getDocs(readingDocRef),
          ]);
          if (vehicleDoc.exists()) {
            const vehicleData = vehicleDoc.data() as Vehicle;
            const readingData = readingDoc?.docs[0]?.data() as Reading;
            vehicleInfo = `${vehicleData.car_model} - ${vehicleData.license_plate}`;
            vehicleId = vehicleDoc.id;
            vehicleBrand = vehicleData.manufacturer || "";
            vehicleModel = vehicleData.car_model || "";
            vehicleYear = vehicleData.year || "";
            obd2Distance = readingData?.obd2_distance || vehicleData.initial_km;
            gpsDistance = readingData?.gps_distance || vehicleData.initial_km;
            kmCurrent = obd2Distance > gpsDistance ? obd2Distance : gpsDistance;

            if (vehicleData.owner) {
              const appUserDocRef = doc(db, "appUsers", vehicleData.owner);
              const appUserDoc = await getDoc(appUserDocRef);
              if (appUserDoc.exists()) {
                const clientData = appUserDoc.data() as AppUser;
                clientName = clientData.name || "";
                clientId = appUserDoc.id;
              } else {
                const driverDocRef = doc(db, "clients", vehicleData.owner);
                const driverDoc = await getDoc(driverDocRef);
                if (driverDoc.exists()) {
                  const driverData = driverDoc.data() as Driver;
                  clientName = driverData.name || "";
                  clientId = driverDoc.id;
                }
              }
            } else if (selectedWorkshop !== "all") {
              continue;
            }
          }

          const status = calculateStatus(maintenanceData, kmCurrent, {
            workshopKmLimitAlarm: contractInfo?.workshopKmLimitAlarm ?? 0,
            workshopDateLimitAlarm: contractInfo?.workshopDateLimitAlarm ?? 0,
          });

          const maintenance = {
            client: clientName,
            clientId: clientId,
            vehicle: vehicleInfo,
            vehicleId: vehicleId,
            vehicleBrand: vehicleBrand,
            vehicleModel: vehicleModel,
            vehicleYear: vehicleYear,
            maintenance: maintenanceData.service,
            km_current: kmCurrent,
            km_threshold: maintenanceData.kmLimit || 0,
            date_threshold: maintenanceData.dateLimit
              ? new Date(
                  maintenanceData.dateLimit.seconds * 1000 +
                    maintenanceData.dateLimit.nanoseconds / 1000000
                ).toLocaleDateString("pt-BR")
              : "",
            status: status,
            obd2Distance,
            gpsDistance,
            id: maintenanceData.id,
          };

          // const isWithinKmAlarmThreshold = maintenance.km_threshold - (contractInfo?.workshopKmLimitAlarm ?? 0) <= maintenance.km_current;
          // const isWithinDateAlarmThreshold = maintenance.date_threshold
          //   ? moment().isSameOrAfter(
          //       moment(maintenance.date_threshold, "DD/MM/YYYY").subtract(contractInfo?.workshopDateLimitAlarm ?? 0, "days")
          //     )
          //   : false;

          // if (isWithinKmAlarmThreshold || isWithinDateAlarmThreshold) maintenanceList.push(maintenance);

          maintenanceList.push(maintenance);
        }

        setMaintenances(maintenanceList);
        const lastVisibleDoc =
          querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisibleDocs((prevMap) =>
          prevMap.set(_currentPage, lastVisibleDoc)
        );
      }
    } catch (error) {
      console.error("Error fetching maintenances: ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonitoredVehicles = async () => {
    if (!db) {
      return;
    }

    try {
      let vehiclesSnapshot;

      if (selectedWorkshop === "all") {
        vehiclesSnapshot = await getDocs(collection(db, "vehicles"));
      } else {
        vehiclesSnapshot = await getDocs(
          query(collection(db, "vehicles"), where("owner", "!=", null))
        );
      }

      let monitoredVehicles = 0;
      let totalKM = 0;

      for (const vehicleDoc of vehiclesSnapshot.docs) {
        const vehicleData = vehicleDoc.data() as Vehicle;
        const readingDocRef = query(
          collection(db, "readings"),
          where("car_id", "==", vehicleDoc.id),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const readingDoc = await getDocs(readingDocRef);
        const readingData = readingDoc?.docs[0]?.data() as Reading;
        const ownerId = vehicleData.owner;

        if (!ownerId && selectedWorkshop !== "all") {
          continue;
        }

        let isDriverOfWorkshop = false;

        if (ownerId) {
          const appUserDocRef = doc(db, "appUsers", ownerId);
          const appUserDoc = await getDoc(appUserDocRef);
          if (appUserDoc.exists()) {
            const appUserData = appUserDoc.data() as AppUser;
            if (appUserData.preferred_workshop === selectedWorkshop) {
              isDriverOfWorkshop = true;
            }
          }

          const driverDocRef = doc(db, "clients", ownerId);
          const driverDoc = await getDoc(driverDocRef);
          if (driverDoc.exists()) {
            const driverData = driverDoc.data() as Driver;
            if (driverData.workshops === selectedWorkshop) {
              isDriverOfWorkshop = true;
            }
          }
        } else {
          isDriverOfWorkshop = selectedWorkshop === "all";
        }

        if (selectedWorkshop === "all" || isDriverOfWorkshop) {
          monitoredVehicles++;
          const obd2Distance = readingData?.obd2_distance || 0;
          const gpsDistance = readingData?.gps_distance || 0;
          totalKM += obd2Distance > gpsDistance ? obd2Distance : gpsDistance;
        }
      }

      setTotalVehicles(monitoredVehicles);
      setTotalKM(totalKM);
    } catch (error) {
      console.error("Error fetching monitored vehicles: ", error);
    }
  };

  const calculateStatus = (
    maintenance: Maintenance,
    kmCurrent: number,
    limits: { workshopKmLimitAlarm: number; workshopDateLimitAlarm: number }
  ) => {
    const now = new Date();
    const dateLimit = maintenance.dateLimit
      ? maintenance.dateLimit.toDate()
      : null;
    const maintenanceKm = maintenance.kmLimit;

    const kmBeforeLimit = limits.workshopKmLimitAlarm;
    const dateBeforeLimit = limits.workshopDateLimitAlarm;

    // console.log("maintenance", maintenance.id, maintenance.car_id, maintenance.service);
    // if (maintenance.id == "4Zu079LL5B5YNKCGrB8p") {
    //   console.log("kmCurrent", kmCurrent);
    //   console.log("maintenanceKm", maintenanceKm);
    //   console.log("kmBeforeLimit", kmBeforeLimit);
    //   console.log("dateLimit", dateLimit);
    //   console.log("dateBeforeLimit", dateBeforeLimit);
    //   console.log("now", now);
    // }

    if (
      dateLimit &&
      dateLimit.getTime() - dateBeforeLimit * 24 * 60 * 60 * 1000 >=
        now.getTime()
    ) {
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

  const handlePageChange = (page: number) => {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);
    fetchMaintenances(page);
  };

  const countMaintenanceStatuses = (maintenances: MaintenanceData[]) => {
    let okCount = 0;
    let upcomingCount = 0;
    let overdueCount = 0;

    maintenances.forEach((maintenance) => {
      switch (maintenance.status) {
        case "Ok":
          okCount++;
          break;
        case "Próxima":
          upcomingCount++;
          break;
        case "Vencida":
          overdueCount++;
          break;
        default:
          break;
      }
    });

    return {
      ok: okCount,
      upcoming: upcomingCount,
      overdue: overdueCount,
    };
  };

  useEffect(() => {
    setMaintenances([]);
    setCurrentPage(0);
    setLastVisibleDocs(new Map());
    fetchContract();
    setCounterType("total");
  }, [selectedWorkshop]);

  useEffect(() => {
    fetchMaintenances();
    fetchMonitoredVehicles();
  }, [contractInfo]);

  useEffect(() => {
    getAllVehicleFilters();
  }, [maintenances, maintenancesChart]);

  const getAllVehicleFilters = async () => {
    type FilterOption = {
      [key: string]: {
        maintenances: MaintenanceData[];
        totalKm: number;
        vehiclesCount: number;
      };
    };

    const filters = {
      brand: {
        options: {} as FilterOption,
      },
      model: {
        options: {} as FilterOption,
      },
      year: {
        options: {} as FilterOption,
      },
    };

    const vehiclesSnapshot = await getDocs(collection(db, "vehicles"));
    const vehicles = vehiclesSnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as Vehicle)
    );

    const uniqueVehicles = new Map<
      string,
      { brand: string; model: string; year: string; km_current: number }
    >();

    // Processar cada veículo da DB
    for (const vehicle of vehicles) {
      const readingDocRef = query(
        collection(db, "readings"),
        where("car_id", "==", vehicle.id),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const readingData = (
        await getDocs(readingDocRef)
      )?.docs[0]?.data() as Reading;
      const { manufacturer, car_model, year, id } = vehicle;
      const km_current =
        (readingData?.obd2_distance || 0) + (readingData?.gps_distance || 0);

      if (!filters.brand.options[manufacturer]) {
        filters.brand.options[manufacturer] = {
          maintenances: [],
          totalKm: 0,
          vehiclesCount: 0,
        };
      }
      if (!filters.model.options[car_model]) {
        filters.model.options[car_model] = {
          maintenances: [],
          totalKm: 0,
          vehiclesCount: 0,
        };
      }
      if (!filters.year.options[year]) {
        filters.year.options[year] = {
          maintenances: [],
          totalKm: 0,
          vehiclesCount: 0,
        };
      }

      if (!uniqueVehicles.has(id)) {
        uniqueVehicles.set(id, {
          brand: manufacturer,
          model: car_model,
          year,
          km_current,
        });

        filters.brand.options[manufacturer].totalKm += km_current || 0;
        filters.model.options[car_model].totalKm += km_current || 0;
        filters.year.options[year].totalKm += km_current || 0;

        filters.brand.options[manufacturer].vehiclesCount += 1;
        filters.model.options[car_model].vehiclesCount += 1;
        filters.year.options[year].vehiclesCount += 1;
      }
    }

    maintenancesChart.forEach((maintenance) => {
      const { vehicleId } = maintenance;
      const vehicle = uniqueVehicles.get(vehicleId);

      if (vehicle) {
        filters.brand.options[vehicle.brand].maintenances.push(maintenance);
        filters.model.options[vehicle.model].maintenances.push(maintenance);
        filters.year.options[vehicle.year].maintenances.push(maintenance);
      }
    });

    setFilterOptions({
      brand: {
        options: filters.brand.options,
      },
      model: {
        options: filters.model.options,
      },
      year: {
        options: filters.year.options,
      },
    });
  };

  useEffect(() => {
    setSelectedFilterOption({
      selected: "",
      type: "",
    });
    setCounter("");
  }, [counterType]);

  useEffect(() => {
    setCounter("");
  }, [filterType]);

  useEffect(() => {
    sumSelectedKmCounter();
  }, [counter]);

  const sumSelectedKmCounter = async () => {
    let sum = 0;
    const vehiclesSnapshot = await getDocs(collection(db, "vehicles"));
    vehiclesSnapshot.docs.forEach((vehicle: any) => {
      counter === "gps"
        ? (sum += vehicle.data().gps_distance || 0)
        : (sum += vehicle.data().obd2_distance || 0);
    });
    setFilterSum(sum);
  };

  return (
    <div className={clsx(styles.dashboardContainer, "mb-10")}>
      {loading ? (
        <Spinner color="white" />
      ) : (
        <>
          <div
            className={clsx(
              styles.dashboardTitleContainer,
              "text-white flex flex-col gap-2"
            )}
          >
            <div className="w-6 h-2 bg-[#27A338]" />
            <div className="flex flex-col">
              {selectedWorkshop === "all" ? (
                <>
                  <h1 className="text-3xl">Geral</h1>
                  <RadioGroup
                    className="text-sm"
                    label="Selecione abaixo sua opção de visualização."
                    orientation="horizontal"
                    color="success"
                    value={counterType}
                    onChange={(e) => {
                      setCounterType(e.target.value);
                    }}
                  >
                    <Radio value="total">
                      <p className="text-white">Contadores totais</p>
                    </Radio>
                    <Radio value="partial">
                      <p className="text-white">Contadores parciais</p>
                    </Radio>
                  </RadioGroup>
                </>
              ) : (
                <>
                  <h2 className="text-xl">{workshopName}</h2>
                  <p className="text-sm text-[#C7C7C7]">
                    Confira as informações referentes à sua oficina nas seções a
                    seguir.
                  </p>
                </>
              )}
              {counterType === "partial" && (
                <>
                  <Select
                    variant="bordered"
                    className="dark text-white mt-5 w-[26em]"
                    classNames={{
                      trigger: "!border-white rounded-medium",
                      value: "text-white",
                    }}
                    label="Tipo de filtro"
                    selectedKeys={[filterType]}
                    defaultSelectedKeys={["data"]}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <SelectItem key="data" value={"data"}>
                      Origem dos dados
                    </SelectItem>
                    <SelectItem key="vehicles" value={"vehicles"}>
                      Características dos carros (fabricante, modelo, ano)
                    </SelectItem>
                  </Select>
                  {filterType === "vehicles" ? (
                    <div className="flex flex-row gap-5 mt-5">
                      <Autocomplete
                        label="Marca"
                        variant="bordered"
                        className="dark"
                        defaultItems={[
                          { value: "none", label: "Nenhum" },
                          ...Object.keys(filterOptions.brand.options).map(
                            (brand) => ({
                              value: brand.toString(),
                              label: brand,
                            })
                          ),
                        ]}
                        onKeyDown={(e: any) => e.continuePropagation()}
                        onSelectionChange={(key) => {
                          const keyString = key ? key.toString() : "none";
                          setSelectedFilterOption({
                            selected:
                              keyString === "none" ? "" : keyString || "",
                            type: keyString === "none" ? "" : "brand",
                          });
                        }}
                        selectedKey={
                          selectedFilterOption.type === "brand"
                            ? selectedFilterOption.selected
                            : "none"
                        }
                      >
                        {(item) => (
                          <AutocompleteItem key={item.value} value={item.value}>
                            {item.label}
                          </AutocompleteItem>
                        )}
                      </Autocomplete>
                      <Autocomplete
                        label="Modelo"
                        variant="bordered"
                        className="dark"
                        defaultItems={[
                          { value: "none", label: "Nenhum" },
                          ...Object.keys(filterOptions.model.options).map(
                            (model) => ({
                              value: model.toString(),
                              label: model,
                            })
                          ),
                        ]}
                        onKeyDown={(e: any) => e.continuePropagation()}
                        onSelectionChange={(key) => {
                          const keyString = key ? key.toString() : "none";
                          setSelectedFilterOption({
                            selected:
                              keyString === "none" ? "" : keyString || "",
                            type: keyString === "none" ? "" : "model",
                          });
                        }}
                        selectedKey={
                          selectedFilterOption.type === "model"
                            ? selectedFilterOption.selected
                            : "none"
                        }
                      >
                        {(item) => (
                          <AutocompleteItem key={item.value} value={item.value}>
                            {item.label}
                          </AutocompleteItem>
                        )}
                      </Autocomplete>
                      <Autocomplete
                        label="Ano"
                        variant="bordered"
                        className="dark"
                        defaultItems={[
                          { value: "none", label: "Nenhum" },
                          ...Object.keys(filterOptions.year.options).map(
                            (year) => ({
                              value: year.toString(),
                              label: year,
                            })
                          ),
                        ]}
                        onKeyDown={(e: any) => e.continuePropagation()}
                        onSelectionChange={(key) => {
                          const keyString = key ? key.toString() : "none";
                          setSelectedFilterOption({
                            selected:
                              keyString === "none" ? "" : keyString || "",
                            type: keyString === "none" ? "" : "year",
                          });
                        }}
                        selectedKey={
                          selectedFilterOption.type === "year"
                            ? selectedFilterOption.selected
                            : "none"
                        }
                      >
                        {(item) => (
                          <AutocompleteItem key={item.value} value={item.value}>
                            {item.label}
                          </AutocompleteItem>
                        )}
                      </Autocomplete>
                    </div>
                  ) : filterType === "data" ? (
                    <>
                      <RadioGroup
                        className="text-sm mt-5"
                        orientation="horizontal"
                        color="success"
                        value={counter}
                        onChange={(e) => {
                          setCounter(e.target.value);
                        }}
                      >
                        <Radio value="gps">
                          <p className="text-white">GPS</p>
                        </Radio>
                        <Radio value="obd2">
                          <p className="text-white">OBD2</p>
                        </Radio>
                      </RadioGroup>
                    </>
                  ) : (
                    <></>
                  )}
                </>
              )}
            </div>
          </div>
          <div className={styles.graphicsContainer}>
            <div className={styles.chartBox}>
              <h4 className={styles.boxText}>Porcentagem de manutenções</h4>
              <CustomChart
                chartData={
                  selectedFilterOption.selected !== "" &&
                  filterOptions !== undefined
                    ? countMaintenanceStatuses(
                        filterOptions[selectedFilterOption.type]?.options[
                          selectedFilterOption.selected
                        ].maintenances || {}
                      )
                    : countMaintenanceStatuses(maintenancesChart)
                }
              />
            </div>
            <span style={{ width: "3em" }} />
            <div className={styles.statisticsBox}>
              <h4 className={styles.boxText}>Outros dados</h4>
              {counterType === "total" && (
                <div
                  className={clsx(
                    styles.statisticsCard,
                    styles.maintenanceCard
                  )}
                >
                  <div className={styles.statWrap}>
                    <TbClockExclamation className={styles.statisticsIcon} />
                    <h4 className={styles.statisticsText}>
                      {selectedFilterOption.selected !== "" &&
                      filterOptions !== undefined
                        ? filterOptions[selectedFilterOption.type]?.options[
                            selectedFilterOption.selected
                          ].maintenances?.length
                        : maintenancesChart.length}
                    </h4>
                  </div>
                  <p className={styles.statisticsSubtext}>
                    manutenções pendentes
                  </p>
                </div>
              )}
              <div className={clsx(styles.statisticsCard, styles.vehiclesCard)}>
                <div className={styles.statWrap}>
                  <MdDirectionsCar className={styles.statisticsIcon} />
                  <h4 className={styles.statisticsText}>
                    {selectedFilterOption.selected !== "" &&
                    filterOptions !== undefined
                      ? filterOptions[selectedFilterOption.type]?.options[
                          selectedFilterOption.selected
                        ].vehiclesCount
                      : totalVehicles}
                  </h4>
                </div>
                <p className={styles.statisticsSubtext}>veículos monitorados</p>
              </div>
              <div className={clsx(styles.statisticsCard, styles.kmCard)}>
                <div className={styles.statWrap}>
                  <MdOutlineSpeed className={styles.statisticsIcon} />
                  <h4 className={styles.statisticsText}>
                    {selectedFilterOption.selected !== "" &&
                    filterOptions !== undefined
                      ? filterOptions[selectedFilterOption.type]?.options[
                          selectedFilterOption.selected
                        ].totalKm
                      : counter !== ""
                      ? filterSum
                      : totalKM}
                  </h4>
                </div>
                <p className={styles.statisticsSubtext}>km monitorados</p>
              </div>
            </div>
          </div>
          {selectedWorkshop !== "all" && (
            <>
              <div className={styles.tableContainer}>
                <CustomTable
                  contractLimits={{
                    dateLimitBefore: contractInfo?.workshopDateLimitAlarm || 0,
                    kmLimitBefore: contractInfo?.workshopKmLimitAlarm || 0,
                  }}
                  data={maintenances.map((row) => ({
                    ...row,
                    workshopId: selectedWorkshop,
                  }))}
                />
              </div>
              <div className="flex flex-row justify-between lg:mx-10 xl:mx-10">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="bg-gradient-to-b from-[#209730] to-[#056011] text-white"
                >
                  Anterior
                </Button>

                <div className="flex flex-row flex-gap-2">
                  <ButtonExport
                    workshopName={workshopName}
                    maintenances={maintenancesChart}
                  />
                  <ButtonSend
                    workshopName={workshopName}
                    maintenances={maintenancesChart}
                  />
                </div>

                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="bg-gradient-to-b from-[#209730] to-[#056011] text-white"
                >
                  Próxima
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
