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
import { Driver } from "@/interfaces/driver.type";
import { AppUser } from "@/interfaces/appUser.type";
import { Vehicle } from "@/interfaces/vehicle.type";

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
  const { db, currentWorkshop } = useContext(AuthContext);

  const fetchSchedules = async () => {
    if (!currentWorkshop?.id) return;
    setLoading(true);

    const schedulesSnapshot = await getDocs(query(collection(db, "schedules"), where("workshop", "==", currentWorkshop.id)));

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

  const fetchMaintenances = async () => {
    if (!currentWorkshop?.id) return;

    const maintenancesSnapshot = await getDocs(query(collection(db, "maintenances"), where("workshop", "==", currentWorkshop.id)));

    const schedulesSnapshot = await getDocs(collection(db, "schedules"));

    const scheduledMaintenanceIds = schedulesSnapshot.docs.map((doc) => doc.data().maintenance);

    const fetchedMaintenances = await Promise.all(
      maintenancesSnapshot.docs.map(async (docSnapshot) => {
        const maintenance = docSnapshot.data() as Maintenance;
        const vehicleSnapshot = await getDoc(doc(db, "vehicles", maintenance.car_id));

        if (!vehicleSnapshot.exists()) return null;

        const vehicle = vehicleSnapshot.data() as Vehicle;

        let ownerName = "";
        const clientSnapshot = await getDoc(doc(db, "clients", vehicle.owner));
        if (clientSnapshot.exists()) {
          const client = clientSnapshot.data() as Driver;
          ownerName = client.name;
        } else {
          const appUserSnapshot = await getDoc(doc(db, "appUsers", vehicle.owner));
          if (appUserSnapshot.exists()) {
            const appUser = appUserSnapshot.data() as AppUser;
            ownerName = appUser.name;
          }
        }

        return {
          id: docSnapshot.id,
          ...maintenance,
          name: `${ownerName} - ${vehicle.license_plate}: ${maintenance.service} (${vehicle.manufacturer} ${vehicle.car_model} ${vehicle.year})`,
        };
      })
    );

    const unscheduledMaintenances = fetchedMaintenances.filter(
      (maintenance) => maintenance && !scheduledMaintenanceIds.includes(maintenance.id)
    );

    setMaintenances(unscheduledMaintenances as MaintenanceWithName[]);
  };

  useEffect(() => {
    fetchMaintenances();
    fetchSchedules();
  }, [currentWorkshop]);

  useEffect(() => {
    fetchMaintenances();
  }, [events]);

  const handleSelected = (event: any) => {
    setSelected(event);
    setEditOpen(true);
  };

  return (
    <div className="relative flex flex-col gap-10 mx-24 w-full">
      {!loading && (
        <>
          <div>
            <CreateEventModal events={events} setEvents={setEvents} maintenances={maintenances} />
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
