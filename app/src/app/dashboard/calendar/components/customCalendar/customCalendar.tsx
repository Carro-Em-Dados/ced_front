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
import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	where,
} from "firebase/firestore";
import { toast, Zoom } from "react-toastify";
import type { Vehicle } from "@/interfaces/vehicle.type";
import type { AppUser } from "@/interfaces/appUser.type";
import type { Driver } from "@/interfaces/driver.type";

const localizer = momentLocalizer(moment);

export interface MaintenanceWithName extends Maintenance {
	name: string;
}

export default function CustomCalendar(
	props: Omit<CalendarProps, "localizer">
) {
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
	const { db, currentWorkshop } = useContext(AuthContext);

	const fetchSchedules = async () => {
		if (!currentWorkshop?.id) return;
		setLoading(true);

		const schedulesSnapshot = await getDocs(
			query(
				collection(db, "schedules"),
				where("workshop", "==", currentWorkshop.id)
			)
		);

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
		try {
			const servicesQuery = query(
				collection(db, "services"),
				where("workshop", "==", currentWorkshop!.id)
			);
			const servicesSnapshot = await getDocs(servicesQuery);
			const services = servicesSnapshot.docs.map((doc) => ({
				...doc.data(),
				id: doc.id,
			}));

			const driversQuery = query(
				collection(db, "clients"),
				where("workshops", "==", currentWorkshop!.id)
			);
			const driversSnapshot = await getDocs(driversQuery);
			const drivers = driversSnapshot.docs.map((doc) => ({
				...(doc.data() as Driver),
				id: doc.id,
			}));

			const appUsersQuery = query(
				collection(db, "appUsers"),
				where("preferred_workshop", "==", currentWorkshop!.id)
			);
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
				const userVehicles = vehicles.filter(
					(vehicle) => vehicle.owner === user.id
				);
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

	console.log(services, drivers);

	useEffect(() => {
		fetchSchedules();
		getAllMaintenanceInfo();
	}, [currentWorkshop]);

	const handleSelected = (event: any) => {
		setSelected(event);
		setEditOpen(true);
	};

	return (
		<div className="relative flex flex-col gap-10 mx-24 w-full">
			{!loading && (
				<>
					<div>
						<CreateEventModal
							events={events}
							setEvents={setEvents}
							services={services}
							drivers={drivers}
						/>
						<EditEventModal
							selectedEvent={selected}
							events={events}
							setEvents={setEvents}
							open={editOpen}
							setOpen={setEditOpen}
						/>
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
