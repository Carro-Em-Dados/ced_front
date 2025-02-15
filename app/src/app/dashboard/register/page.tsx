"use client";
import React, { useContext, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import Image from "next/image";
import { Tabs, Tab } from "@nextui-org/react";
import DriverCard from "./components/Cards/DriverCard";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Workshop } from "../../../interfaces/workshop.type";
import { AuthContext } from "../../../contexts/auth.context";
import { User } from "../../../interfaces/user.type";
import UserModal from "./components/UserModal/UserModal";
import DriverModal from "./components/DriverModal/DriverModal";
import WorkshopModal from "./components/OrganizationModal/WorkshopModal";
import OrganizationCard from "./components/Cards/OrganizationCard";
import UserCard from "./components/Cards/UserCard";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { Driver } from "@/interfaces/driver.type";
import { Vehicle } from "@/interfaces/vehicle.type";
import { AppUser } from "@/interfaces/appUser.type";
import AppUserCard from "./components/Cards/AppUserCard";
import { Role } from "@/types/enums/role.enum";
import { WorkshopContext } from "@/contexts/workshop.context";

const Register = () => {
  const { db, currentUser } = useContext(AuthContext);
  const { workshopInView, WorkshopsByOrg } = useContext(WorkshopContext);
  const { currentWorkshop } = useContext(AuthContext);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [tab, setTab] = useState("");
  const [isPremium, setIsPremium] = useState<boolean>(false);

  const workshop =
    currentUser?.role === Role.ORGANIZATION ? workshopInView : currentWorkshop;

  const checkPremium = async (currWorkshopId: string) => {
    if (currentUser?.role === Role.MASTER) {
      console.log("is premium master");
      return true;
    }

    if (currWorkshopId) {
      const currWorkshop = await getDoc(doc(db, "workshops", currWorkshopId));

      if (currWorkshop.exists()) {
        const workshopData = currWorkshop.data() as Workshop;
        const contract = workshopData.contract;

        if (workshopData.contract) {
          if (contract !== "basic") {
            console.log("is premium");
            return true;
          } else {
            console.log("is not premium");
            return false;
          }
        }
      }
    }
    console.log("is not premium");
    return false;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        setIsPremium(await checkPremium(workshop?.id || ""));
      }
    };
    fetchData();
  }, [currentUser, workshop]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      try {
        if (!currentUser) return;

        const clientsSnapshotPromise = getDocs(collection(db, "clients"));
        const vehiclesSnapshotPromise = getDocs(collection(db, "vehicles"));
        const appUsersSnapshotPromise = getDocs(collection(db, "appUsers"));
        const usersSnapshotPromise = getDocs(collection(db, "users"));
        const [
          clientsSnapshot,
          vehiclesSnapshot,
          appUsersSnapshot,
          usersSnapshot,
        ] = await Promise.all([
          clientsSnapshotPromise,
          vehiclesSnapshotPromise,
          appUsersSnapshotPromise,
          usersSnapshotPromise,
        ]);
        let filteredClientsData = [];
        let filteredAppUsersData = [];

        if (currentUser?.role !== "master" && currentUser?.workshops) {
          filteredClientsData = clientsSnapshot.docs
            .map(
              (doc) =>
                ({
                  ...doc.data(),
                  id: doc.id,
                } as Driver)
            )
            .filter((client) => client.workshops === currentUser.workshops);

          filteredAppUsersData = appUsersSnapshot.docs
            .map(
              (doc) =>
                ({
                  ...doc.data(),
                  id: doc.id,
                } as AppUser)
            )
            .filter(
              (appUser) => appUser.preferred_workshop === currentUser.workshops
            );
        } else {
          filteredClientsData = clientsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Driver[];

          filteredAppUsersData = appUsersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as AppUser[];
        }

        const vehiclesData = vehiclesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Vehicle[];

        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];

        let workshopsData = (workshop ? [workshop] : []) as Workshop[];

        if (currentUser.role === Role.ORGANIZATION) {
          const workshopsSnapshot = await getDocs(
            query(
              collection(db, "workshops"),
              where("owner", "==", currentUser.id)
            )
          );
          workshopsData = workshopsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Workshop[];
        }
        if (currentUser.role === Role.MASTER) {
          const workshopsSnapshot = await getDocs(collection(db, "workshops"));
          workshopsData = workshopsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Workshop[];
        }

        setDrivers(filteredClientsData);
        setWorkshops(workshopsData);
        setUsers(usersData);
        setVehicles(vehiclesData);
        setAppUsers(filteredAppUsersData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [currentUser, workshop]);

  const getVehiclesByClient = (id: string) => {
    return vehicles.filter((vehicle) => vehicle.owner === id);
  };

  const getDriversByWorkshop = (id: string) => {
    const _workshop = workshops.find((w) => w.id === id);
    if (!_workshop) return [];

    return drivers.filter((driver) => driver.workshops === _workshop.id);
  };

  const getAppUsersByWorkshop = (id: string) => {
    return appUsers.filter((appUser) => appUser.preferred_workshop === id);
  };

  const getUsersFromWorkshops = () => {
    return users.filter(
      (user) =>
        user.role === Role.USER &&
        (user.workshops === workshopInView?.id)
    );
  };

  const getUsersByWorkshop = (id: string) => {
    return users.filter((user) => user.workshops === id);
  };

  return (
    <div className={styles.page}>
      <Navbar isPremium={isPremium} selectedWorkshop={workshop?.id || ""} />
      {tab === "drivers" ? (
        <DriverModal
          workshops={workshops}
          workshop={workshop}
          setDrivers={setDrivers}
          drivers={drivers}
        />
      ) : tab === "workshops" ? (
        [Role.MASTER, Role.ORGANIZATION].includes(
          currentUser?.role as Role
        ) && <WorkshopModal setWorkshops={setWorkshops} />
      ) : (
        currentUser?.role !== "user" && tab === "users" && <UserModal setUsers={setUsers} />
      )}

      <div className={styles.pageWrap}>
        <div className={styles.rectangleContainer}>
          <Image
            src="/rectangle.png"
            alt="Retângulo título"
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <h1 className={styles.mainTitle}>Configurações</h1>
        <p className={styles.subtext}>
          Adicione motoristas e associe carros a eles abaixo.
        </p>
        <div className="py-2">
          {currentUser?.role === Role.ORGANIZATION && tab !== "workshops" && <WorkshopsByOrg />}
        </div>
        <Tabs
          aria-label="config-tabs"
          className={styles.tabs}
          disabledKeys={
            [Role.MASTER, Role.ORGANIZATION].includes(currentUser?.role as Role)
              ? []
              : ["workshops"]
          }
          classNames={{
            tabContent:
              "group-data-[selected=true]:text-white group-data-[disabled=true]:hidden",
          }}
          onSelectionChange={(key) => {
            setTab(key as string);
          }}
        >
          <Tab key="drivers" title="Motoristas">
            {currentUser?.role === Role.MASTER ? (
              <div className={styles.driverTab}>
                {drivers.map((driver, key) => (
                  <DriverCard
                    key={key}
                    driver={driver}
                    setDrivers={setDrivers}
                    setVehicles={setVehicles}
                    vehicles={getVehiclesByClient(driver.id)}
                    workshops={workshops}
                    isPremium={isPremium}
                  />
                ))}
                {appUsers.map((appUser, key) => (
                  <AppUserCard
                    key={key}
                    appUser={appUser}
                    setAppUsers={setAppUsers}
                    vehicles={getVehiclesByClient(appUser.id)}
                    setVehicles={setVehicles}
                    isPremium={isPremium}
                    workshops={workshops}
                  />
                ))}
              </div>
            ) : workshop ? (
              <div className={styles.driverTab}>
                {getDriversByWorkshop(workshop.id).map((driver, key) => (
                  <DriverCard
                    key={key}
                    driver={driver}
                    setDrivers={setDrivers}
                    setVehicles={setVehicles}
                    vehicles={getVehiclesByClient(driver.id)}
                    workshops={workshops}
                    isPremium={isPremium}
                  />
                ))}
                {getAppUsersByWorkshop(workshop.id).map((appUser, key) => (
                  <AppUserCard
                    key={key}
                    appUser={appUser}
                    setAppUsers={setAppUsers}
                    vehicles={getVehiclesByClient(appUser.id)}
                    setVehicles={setVehicles}
                    workshops={workshops}
                    isPremium={isPremium}
                  />
                ))}
              </div>
            ) : (
              <p className="text-white text-sm">
                Você não tem nenhuma oficina cadastrada.
              </p>
            )}
          </Tab>
          <Tab key="workshops" title="Oficinas">
            <div className={styles.driverTab}>
              {workshops.map((workshop, key) => (
                <OrganizationCard
                  workshopUsers={getUsersByWorkshop(workshop.id)}
                  key={key}
                  workshop={workshop}
                  setWorkshops={setWorkshops}
                  setUsers={setUsers}
                  users={users}
                  isPremium={workshop.contract !== "basic"}
                  workshops={workshops}
                />
              ))}
            </div>
          </Tab>
          {currentUser?.role !== Role.USER && (
            <Tab className={styles.tabButton} key="users" title="Usuários">
              <div className={styles.driverTab}>
                {currentUser?.role === Role.MASTER
                  ? users.map((user, key) => (
                      <UserCard
                        key={key}
                        user={user}
                        setUsers={setUsers}
                        workshops={workshops}
                      />
                    ))
                  : getUsersFromWorkshops().map((user, key) => (
                      <UserCard
                        key={key}
                        user={user}
                        setUsers={setUsers}
                        workshops={workshops}
                      />
                    ))}
              </div>
            </Tab>
          )}
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
