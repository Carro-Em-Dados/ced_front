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
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { toast, Zoom } from "react-toastify";
import type { Vehicle } from "@/interfaces/vehicle.type";
import type { AppUser } from "@/interfaces/appUser.type";
import type { Driver } from "@/interfaces/driver.type";
import { WorkshopContext } from "@/contexts/workshop.context";
import { Role } from "@/types/enums/role.enum";
import { Workshop } from "@/interfaces/workshop.type";
import { Contract } from "@/interfaces/contract.type";

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
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const { db, currentWorkshop, currentUser } = useContext(AuthContext);
  const { workshopInView, WorkshopsByOrg, getAllWorkshops } = useContext(WorkshopContext);
  const [workshop, setWorkshop] = useState<(Workshop & { contract: Contract }) | undefined>(
    currentUser?.role === Role.ORGANIZATION ? workshopInView : currentWorkshop
  );
  const [workshops, setWorkshops] = useState<(Workshop & { contract: Contract })[]>([]);

  const fetchSchedules = async () => {
    if (!workshop?.id) return;
    setLoading(true);

    const schedulesSnapshot = await getDocs(query(collection(db, "schedules"), where("workshop", "==", workshop.id)));

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
    setLoading(false);
  };

  const getAllMaintenanceInfo = async () => {
    if (!workshop?.id) return;
    try {
      const servicesQuery = query(collection(db, "services"), where("workshop", "==", workshop.id));
      const servicesSnapshot = await getDocs(servicesQuery);
      const services = servicesSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const driversQuery = query(collection(db, "clients"), where("workshops", "==", workshop.id));
      const driversSnapshot = await getDocs(driversQuery);
      const drivers = driversSnapshot.docs.map((doc) => ({
        ...(doc.data() as Driver),
        id: doc.id,
      }));

      const appUsersQuery = query(collection(db, "appUsers"), where("preferred_workshop", "==", workshop.id));
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
    }
  };

  useEffect(() => {
    fetchSchedules();
    getAllMaintenanceInfo();
  }, [workshop]);

  const fetchAllWorkshops = async () => {
    const _worshops = await getAllWorkshops();
    if (!_worshops || !_worshops?.length) return;
    setWorkshop(_worshops[0]);
    setWorkshops(_worshops);
  };

  useEffect(() => {
    if (currentUser?.role === Role.MASTER) fetchAllWorkshops();
  }, [currentUser]);

  useEffect(() => {
    setWorkshop(workshopInView);
  }, [workshopInView]);

  const handleSelected = (event: any) => {
    setSelected(event);
    setEditOpen(true);
  };

  if (!workshop)
    return (
      <div className="relative flex flex-col gap-10 mx-24 w-full">
        <p className="text-white">Oficina não encontrada</p>
      </div>
    );

  return (
    <div className="relative flex flex-col gap-10 mx-24 w-full">
      {!loading && (
        <>
          {currentUser?.role === Role.ORGANIZATION && <WorkshopsByOrg />}
          {currentUser?.role === Role.MASTER && (
            <WorkshopsByOrg
              options={workshops}
              selected={workshop?.id}
              onSelectionChange={(key) => setWorkshop(workshops.find((w) => w.id === key))}
            />
          )}
          <div>
            <CreateEventModal workshop={workshop} events={events} setEvents={setEvents} services={services} drivers={drivers} />
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
        </>
      )}
    </div>
  );
}
