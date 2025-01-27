"use client";

import moment from "moment";
import { Calendar, CalendarProps, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles.module.scss";
import { useContext, useEffect, useState } from "react";
import CreateEventModal from "./createEventModal";
import EditEventModal from "./editEventModal";
import { AuthContext } from "@/contexts/auth.context";
import { Maintenance } from "@/interfaces/maintenances.type";
import { collection, getDocs, query, where } from "firebase/firestore";
import type { Vehicle } from "@/interfaces/vehicle.type";
import type { AppUser } from "@/interfaces/appUser.type";
import type { Driver } from "@/interfaces/driver.type";
import { WorkshopContext } from "@/contexts/workshop.context";
import { Role } from "@/types/enums/role.enum";
import { Workshop } from "@/interfaces/workshop.type";
import { Contract } from "@/interfaces/contract.type";
import { useRouter } from "next/navigation";
import { Spinner } from "@nextui-org/react";

const localizer = momentLocalizer(moment);

export interface MaintenanceWithName extends Maintenance {
  name: string;
}

export default function CustomCalendar(props: Omit<CalendarProps, "localizer">) {
  const [events, setEvents] = useState<
    {
      id: string;
      title: string;
      start: Date;
      end: Date;
      note: string;
      allDay: boolean;
    }[]
  >([]);
  const [maintenances, setMaintenances] = useState<MaintenanceWithName[]>([]);
  const [selected, setSelected] = useState();
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState({
    schedules: true,
    maintenances: true,
    workshops: true,
  });
  const [services, setServices] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const { db, currentWorkshop: userWorkshop, loading: userLoading, currentUser } = useContext(AuthContext);
  const {
    WorkshopsByOrg,
    getAllWorkshops,
    setWorkshopInView,
    workshopOptions: organizationWorkshops,
    isLoading: organizationLoading,
  } = useContext(WorkshopContext);

  const [allWorkshops, setAllWorkshops] = useState<(Workshop & { contract: Contract })[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState<(Workshop & { contract: Contract }) | undefined>(undefined);

  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const workshopIdFromQueryParams = searchParams.get("w");

  const fetchSchedules = async () => {
    if (!selectedWorkshop?.id) return;
    setLoading((prevLoading) => ({ ...prevLoading, schedules: true }));

    const schedulesSnapshot = await getDocs(query(collection(db, "schedules"), where("workshop", "==", selectedWorkshop.id)));

    const fetchedSchedules = schedulesSnapshot.docs.map((doc) => ({
      id: doc.id,
      title: "Manutenção",
      start: doc.data().start.toDate(),
      end: doc.data().end.toDate(),
      note: doc.data().note,
      google_event_id: doc.data().google_event_id,
      allDay: false,
    }));

    setEvents(fetchedSchedules);
    setLoading((prevLoading) => ({ ...prevLoading, schedules: false }));
  };

  const getAllMaintenanceInfo = async () => {
    if (!selectedWorkshop?.id) return;
    setLoading((prevLoading) => ({ ...prevLoading, maintenances: true }));
    try {
      const servicesQuery = query(collection(db, "services"), where("workshop", "==", selectedWorkshop.id));
      const servicesSnapshot = await getDocs(servicesQuery);
      const services = servicesSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const driversQuery = query(collection(db, "clients"), where("workshops", "==", selectedWorkshop.id));
      const driversSnapshot = await getDocs(driversQuery);
      const drivers = driversSnapshot.docs.map((doc) => ({
        ...(doc.data() as Driver),
        id: doc.id,
      }));

      const appUsersQuery = query(collection(db, "appUsers"), where("preferred_workshop", "==", selectedWorkshop.id));
      const appUsersSnapshot = await getDocs(appUsersQuery);
      const appUsers = appUsersSnapshot.docs.map((doc) => ({
        ...(doc.data() as AppUser),
        id: doc.id,
      }));

      const vehiclesSnapshot = await getDocs(collection(db, "vehicles"));
      const vehicles = vehiclesSnapshot.docs.map((doc) => ({
        ...(doc.data() as Vehicle),
        id: doc.id,
      }));

      const usersWithVehicles = [...drivers, ...appUsers].map((user) => {
        const userVehicles = vehicles.filter((vehicle) => vehicle.owner === user.id);
        return {
          ...user,
          vehicles: userVehicles,
        };
      });

      setDrivers(usersWithVehicles);
      setServices(services);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading((prevLoading) => ({ ...prevLoading, maintenances: false }));
    }
  };

  const fetchAllWorkshops = async () => {
    const _workshops = await getAllWorkshops();
    if (!_workshops || !_workshops?.length) return;
    setAllWorkshops(_workshops);
    setLoading((prevLoading) => ({ ...prevLoading, workshops: false }));
  };

  const handleSelected = (event: any) => {
    setSelected(event);
    setEditOpen(true);
  };

  useEffect(
    function getWorkshopsByRole() {
      const userRole = currentUser?.role as Role;
      if (userRole === Role.MASTER) fetchAllWorkshops();
      if (userRole === Role.ORGANIZATION) return;
      if (userRole === Role.USER) return;
    },
    [currentUser]
  );

  useEffect(
    function setInitialWorkshop() {
      const userRole = currentUser?.role as Role;

      const willOpenCreateScheduleModal = !!workshopIdFromQueryParams;

      switch (userRole) {
        case Role.ORGANIZATION:
          if (!organizationWorkshops || !organizationWorkshops?.length) return;
          if (!willOpenCreateScheduleModal) {
            setSelectedWorkshop(organizationWorkshops[0]);
          }
          const _orgWorkshop = organizationWorkshops.find((workshop) => workshop.id === workshopIdFromQueryParams);
          if (!_orgWorkshop) return router.push("/dashboard/calendar");
          setSelectedWorkshop(_orgWorkshop);
          break;
        case Role.MASTER:
          if (!allWorkshops || !allWorkshops?.length) return;
          if (!willOpenCreateScheduleModal) return setSelectedWorkshop(allWorkshops[0]);
          const _masterWorkshop = allWorkshops.find((workshop) => workshop.id === workshopIdFromQueryParams);
          if (!_masterWorkshop) return router.push("/dashboard/calendar");
          setSelectedWorkshop(_masterWorkshop);
          break;
        case Role.USER:
          if (!userWorkshop) return;
          if (willOpenCreateScheduleModal && userWorkshop?.id !== workshopIdFromQueryParams) return router.push("/dashboard/calendar");
          setSelectedWorkshop(userWorkshop);
          break;
        default:
          break;
      }
    },
    [userWorkshop, workshopIdFromQueryParams, allWorkshops, organizationWorkshops, currentUser, router, userLoading]
  );

  useEffect(() => {
    fetchSchedules();
    getAllMaintenanceInfo();
  }, [selectedWorkshop]);

  useEffect(
    function handleLoading() {
      if (!userLoading) return setLoading((prevLoading) => ({ ...prevLoading, workshops: false }));
      if (!organizationLoading) return setLoading((prevLoading) => ({ ...prevLoading, workshops: false }));
    },
    [userLoading, organizationLoading, currentUser]
  );

  if (loading.schedules || loading.maintenances || loading.workshops)
    return (
      <div className="relative flex flex-col gap-10 mx-24 w-full">
        <Spinner color="white" />
      </div>
    );

  if (!selectedWorkshop)
    return (
      <div className="relative flex flex-col gap-10 mx-24 w-full">
        <p className="text-white">Oficina não encontrada</p>
      </div>
    );

  return (
    <div className="relative flex flex-col gap-10 mx-24 w-full">
      {currentUser?.role === Role.ORGANIZATION && (
        <WorkshopsByOrg
          selected={selectedWorkshop?.id}
          onSelectionChange={(key) => {
            setSelectedWorkshop(organizationWorkshops.find((w) => w.id === key?.value));
          }}
        />
      )}
      {currentUser?.role === Role.MASTER && (
        <WorkshopsByOrg
          options={allWorkshops}
          selected={selectedWorkshop?.id}
          onSelectionChange={(key) => {
            setSelectedWorkshop(allWorkshops.find((w) => w.id === key?.value));
          }}
        />
      )}
      <div>
        <CreateEventModal workshop={selectedWorkshop} events={events} setEvents={setEvents} services={services} drivers={drivers} />
        <EditEventModal selectedEvent={selected} events={events} setEvents={setEvents} open={editOpen} setOpen={setEditOpen} />
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        views={["week"]}
        defaultView="week"
        allDayAccessor="allDay"
        titleAccessor="title"
        startAccessor="start"
        endAccessor="end"
        selected={selected}
        onSelectEvent={handleSelected}
      />
    </div>
  );
}
