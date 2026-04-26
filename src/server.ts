import "dotenv/config";
import app from "./app";
import sequelize from "./config/database";
import { calendar } from "./services1/google.service";
import { createMeeting } from "./services1/google.service";


const PORT = 5000;

async function listEvents() {
  try {
    const result = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = result.data.items;

    if (!events?.length) {
      console.log("No upcoming events found.");
      return;
    }

    console.log("📅 Upcoming 10 events:");

    events.forEach((event: any) => {
      const start = event.start?.dateTime ?? event.start?.date;
      console.log(`${start} - ${event.summary}`);
    });

  } catch (error: any) {
    console.error("❌ Google API Error:", error.message);
  }
}

async function initialize() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
    }

    if (process.env.GOOGLE_REFRESH_TOKEN) {
      await listEvents();
    } else {
      console.log("⚠️ Generate refresh token first:");
      console.log("👉 http://localhost:5000/generate-token");
    }

    const today = new Date();

    // Set IST manually
    today.setHours(14, 0, 0); // 2 PM

    const startTime = new Date(today).toISOString();

    const end = new Date(today);
    end.setHours(15, 0, 0); // 3 PM

    const endTime = end.toISOString();

    // const link = await createMeeting(startTime, endTime);
    // console.log("✅ Meet Link:", link);


    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Server failed:", error);
    process.exit(1);
  }
}

initialize();
