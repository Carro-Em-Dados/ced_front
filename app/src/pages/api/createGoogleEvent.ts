import type { NextApiRequest, NextApiResponse } from "next";
import { createGoogleEvent } from "../../services/google-calendar";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { calendarId, event } = req.body;
    const result = await createGoogleEvent(calendarId, event);
    console.log("result:", result);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create Google event" });
  }
}
