import moment from "moment";
import { useState } from "react";
import { Calendar, CalendarProps, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function CustomCalendar(
	props: Omit<CalendarProps, "localizer">
) {
	return <Calendar localizer={localizer} />;
}
