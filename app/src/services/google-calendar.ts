"use server";

import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  // keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  credentials: {
    type: "service_account",
    project_id: "dev-carro-em-dados",
    private_key_id: "b1b2fa3d549ce4ca465ab9a6a255c3b6ae92b8e7",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDheaB2l9ydytV8\nOpvTH5nO4vystcrFBrymEguYCA0/vntHURJ3cUlDD2tsULUe9H+BVx5MuS/cAbij\nwXdvLRmF2pyBzU+N1mrCjF0UvFj28aPTrf1MsJuZ/NjFtpaugCXRYUTM+aSfpHUC\nLms8x/bWu7lOFkBR4sFseQsdOB6q9yz0q59QUAYXotEUFp5CRRAA0iRfLow357ND\nnRk0zGfHVwoiOW2QERtCpiaEje187CATzay16ja8/xJ/MdWtvF5R3xc7SzbLiR8W\npvlv/Jcb4PTH1x3i0TzlHpyxAl3M2Gjbm2zSZQCFwjzuWpJLY1RLBvU9LjE7BzVa\ns92mI0GlAgMBAAECggEAEE3eN5Ulo9dd9py6VdrsIVSylr6SigrBq3SUmArFAn4A\nphiLsE1l0c6UowF3B2UAr1agX0Xo2wzY0CaWP1jQhqhXNt+kyAngMG8779rqx/iT\nMyRas6f1qH3rIujgHoAvu+M/uV63879Norm+kWeYRtDORoI/ZmxyNijOj+9V8GDK\nejgpAAAgptzIWd6hAE2mugJ7ewJOYfAhwgMTJIcyzkTFd1QztWzEU0c5UMfYQLj6\njPXwSBZsgcKiWiARvwRi79+kngoI/CMnHmgpiL/Ay3LEEsFAcNCh/HCw1TCbshlc\npJpokA1QX1hrJhj+h95hO53cqz4rASDxw0IAhNlkIQKBgQD8nS6PJ9nwWpIGmOZV\nSioYHGH+zk1xM5bQt7cFUMgAHqFGQxXdLACwuDjp5B4XJQD9THitQm5lvYI7JHy8\nseXfAEA0ob7CQRhqvc1IZlNp/On2x2xSukQ0ouEFhkm14nKEkT5n7YYR3SPzNc/8\naC5j1LqUuBzbYOuq+I3Jxk0YaQKBgQDkf1IbAeJcBNWgsEqLr/QgXxsX0X+h8fm2\nnt5mBbUIIHDZot7nHOTxln9a/FDh0aqs6R88KwFEba41k/IXymcOkL0OQ9aD34OY\n+5jRIVwrKlUss14IyptADqtKP8Pl8jpPyrYyaGpxTAojjhLzno1rFlqfcn5jV0Y4\n20Yfms3X3QKBgQCf/GRaYeDTKmlFKFzoM1pJfuBJYhsF0Kh5c4DEKw8flEaLmz0j\noBSn12SkLMcp3VOtGFttT59fbBAoqMkfMIPnId+H9dA8csGmCKMUcUnu3DDJDC/8\njN9ZfraIqy3PtaTVdK9TXskEU0vLYo9gyhJnQ3kPazNLdSyMUXJrEd4N0QKBgQDc\nPqUjhyNq0vYfVw3jqwxDD6kLwlGmBZlPH77609F1Ld/Yx5bXahB7lTbYupAzumcr\nF+GVm1YzYQ0kc6BMsjm33md8koL4xb8Q/KKGIgO3T6yd0552FuSiUAFnJiNrR5pR\nQvFvkRnYbxTuxIkb7d4eNIPRYQjWNE9pimIDILH8uQKBgFkjkMkFJQmxoXbYn9lE\nYerkZ+or/+GQZp71ylqhFwTtYxa4rtH6kIAABKCBqFfLk7oU7dyYYnC5H2Z1wLgV\ns24JYcD+IHeqr0GCwZJS6Z8gWjSwN7W0ubWOJpQCuV4gAieQEARboot3/T/38NYn\nKTM9Mkg4T3mQb0wQKolxJDhp\n-----END PRIVATE KEY-----\n",
    client_email: "app-carro-em-dados@dev-carro-em-dados.iam.gserviceaccount.com",
    client_id: "106473655572416564277",
    // auth_uri: "https://accounts.google.com/o/oauth2/auth",
    // token_uri: "https://oauth2.googleapis.com/token",
    // auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    // client_x509_cert_url:
    //   "https://www.googleapis.com/robot/v1/metadata/x509/app-carro-em-dados%40dev-carro-em-dados.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  },
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

export async function createGoogleCalendar(name: string, owners: string[]) {
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
  event: { summary: string; location?: string; start: string; end: string; description?: string; attendees?: { email: string }[] }
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
        // attendees: event.attendees,
        reminders: {
          useDefault: true,
        },
      },
    });
    return data;
  } catch (error) {
    console.log("error:", error);
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
