"use server";

import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

export async function createGoogleCalendar(name: string, owners: string[]) {
  console.log("owners:", owners);
  console.log("name:", name);
  const calendar = google.calendar({ version: "v3", auth });

  const newCalendar = await calendar.calendars.insert({
    requestBody: {
      summary: name,
      timeZone: "America/Sao_Paulo",
    },
  });

  const calendarId = newCalendar.data.id;
  if (!calendarId) throw new Error("Calendar not created");

  try {
    await Promise.all(
      owners.map((owner) =>
        calendar.acl.insert({
          calendarId: calendarId!,
          requestBody: {
            role: "owner",
            scope: {
              type: "user",
              value: owner,
            },
          },
        })
      )
    );
  } catch (error) {
    await calendar.calendars.delete({ calendarId: calendarId! });
    throw new Error("Calendar not created");
  }

  return calendarId;
}
export async function createGoogleEvent(
  calendarId: string,
  event: { summary: string; location?: string; start: string; end: string; description?: string }
) {
  const calendar = google.calendar({ version: "v3", auth });

  try {
    await calendar.calendars.get({ calendarId });
  } catch (error) {
    throw new Error("Calendar not found");
  }

  try {
    const data = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: event.summary,
        location: event.location,
        description: event.description,
        start: {
          dateTime: event.start,
          timeZone: "America/Sao_Paulo",
        },
        end: {
          dateTime: event.end,
          timeZone: "America/Sao_Paulo",
        },

        // attendees: [{ email: "lpage@example.com" }, { email: "sbrin@example.com" }],
      },
    });

    return data.data.id;
  } catch (error) {
    throw new Error("Event not created");
  }
}

export async function deleteGoogleEvent(calendarId: string, eventId: string) {
  const calendar = google.calendar({ version: "v3", auth });

  await calendar.events.delete({
    calendarId,
    eventId,
  });
}

export async function updateGoogleEvent(calendarId: string, eventId: string, event: { start: string; end: string }) {
  const calendar = google.calendar({ version: "v3", auth });

  let currentEvent;
  try {
    const data = await calendar.events.get({
      calendarId,
      eventId,
    });
    currentEvent = data.data;
  } catch (error) {
    throw new Error("Event not found");
  }

  try {
    const data = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: {
        ...currentEvent,
        start: {
          dateTime: event.start,
        },
        end: {
          dateTime: event.end,
        },
      },
    });
    return data.data.id;
  } catch (error) {
    throw new Error("Event not updated");
  }
}
