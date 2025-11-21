import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const LOG_FILE = path.join(__dirname, "../logs/assignments.log");
const TEXTBEE_API_KEY = process.env.TEXTBEE_API_KEY || "";
const TEXTBEE_DEVICE_ID = process.env.TEXTBEE_DEVICE_ID || "";

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

interface Participant {
  name: string;
  phone?: string;
}

interface Assignment {
  giver: string;
  receiver: string;
  giverPhone?: string;
}

let lastAssignments: {
  participants: Participant[];
  assignments: Assignment[];
} | null = null;

// Secret Santa matching algorithm
function assignSecretSanta(participants: Participant[]): Assignment[] {
  if (participants.length < 2) {
    throw new Error("Need at least 2 participants");
  }

  const shuffled = [...participants];

  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Create circular assignments (each person gives to the next)
  const assignments: Assignment[] = [];
  for (let i = 0; i < shuffled.length; i++) {
    assignments.push({
      giver: shuffled[i].name,
      receiver: shuffled[(i + 1) % shuffled.length].name,
      giverPhone: shuffled[i].phone,
    });
  }

  return assignments;
}

// Log assignments to file
function logAssignments(
  participants: Participant[],
  assignments: Assignment[]
): void {
  const timestamp = new Date().toISOString();
  const logHeader = `\n${"=".repeat(60)}\n${timestamp}\n${"-".repeat(60)}\n`;

  // List all participants
  const participantsList =
    "Participants:\n" +
    participants
      .map(
        (p, index) =>
          `  ${index + 1}. ${p.name}${p.phone ? ` (${p.phone})` : ""}`
      )
      .join("\n");

  // List assignments
  const assignmentsList =
    "\n\nAssignments:\n" +
    assignments.map((a) => `  ${a.giver} → ${a.receiver}`).join("\n");

  const fullLog = logHeader + participantsList + assignmentsList + "\n";

  // Ensure logs directory exists
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Append to log file
  fs.appendFileSync(LOG_FILE, fullLog, "utf-8");

  // Also log to console so it appears in docker logs
  console.log(fullLog);
}

// Log SMS sending activity
function logSMS(results: any[], summary: any): void {
  const timestamp = new Date().toISOString();
  const logHeader = `\n${"=".repeat(
    60
  )}\nSMS SENDING - ${timestamp}\n${"-".repeat(60)}\n`;

  // Summary
  const summaryText = `Summary:\n  Total: ${summary.total}\n  Sent: ${summary.sent}\n  Failed: ${summary.failed}\n  Skipped: ${summary.skipped}\n`;

  // Detailed results
  const resultsText =
    "\nDetailed Results:\n" +
    results
      .map((r) => {
        if (r.status === "sent") {
          return `  ✓ ${r.recipient} (${r.phone}) - SMS sent successfully`;
        } else if (r.status === "failed") {
          return `  ✗ ${r.recipient} (${r.phone}) - Failed: ${r.error}`;
        } else {
          return `  ⊘ ${r.recipient} - Skipped: ${r.reason}`;
        }
      })
      .join("\n");

  const fullLog = logHeader + summaryText + resultsText + "\n";

  // Ensure logs directory exists
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Append to log file
  fs.appendFileSync(LOG_FILE, fullLog, "utf-8");

  // Also log to console so it appears in docker logs
  console.log(fullLog);
}

// API endpoint to generate Secret Santa assignments
app.post("/api/generate", (req: Request, res: Response) => {
  try {
    const { participants } = req.body;

    if (!participants || !Array.isArray(participants)) {
      return res.status(400).json({ error: "Invalid participants array" });
    }

    if (participants.length < 2) {
      return res.status(400).json({ error: "Need at least 2 participants" });
    }

    const assignments = assignSecretSanta(participants);

    // Store assignments for SMS sending
    lastAssignments = { participants, assignments };

    // Log the assignments to file
    logAssignments(participants, assignments);

    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// API endpoint to send SMS notifications
app.post("/api/send-sms", async (req: Request, res: Response) => {
  try {
    if (!TEXTBEE_API_KEY || !TEXTBEE_DEVICE_ID) {
      return res.status(400).json({
        error:
          "TextBee API credentials not configured. Please set TEXTBEE_API_KEY and TEXTBEE_DEVICE_ID environment variables.",
      });
    }

    if (!lastAssignments) {
      return res.status(400).json({ error: "No assignments generated yet" });
    }

    const { assignments } = lastAssignments;
    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const assignment of assignments) {
      if (!assignment.giverPhone) {
        results.push({
          recipient: assignment.giver,
          status: "skipped",
          reason: "No phone number",
        });
        continue;
      }

      // Type guard ensures giverPhone is defined
      const phoneNumber = assignment.giverPhone;

      try {
        const message = `Hi ${assignment.giver}! 🎅 You are the Secret Santa for ${assignment.receiver}. Happy gifting!`;

        await axios.post(
          `https://api.textbee.dev/api/v1/gateway/devices/${TEXTBEE_DEVICE_ID}/sendSMS`,
          {
            recipients: [phoneNumber],
            message: message,
          },
          {
            headers: {
              "x-api-key": TEXTBEE_API_KEY,
              "Content-Type": "application/json",
            },
          }
        );

        results.push({
          recipient: assignment.giver,
          phone: assignment.giverPhone,
          status: "sent",
        });
        successCount++;
      } catch (error) {
        results.push({
          recipient: assignment.giver,
          phone: assignment.giverPhone,
          status: "failed",
          error: axios.isAxiosError(error) ? error.message : "Unknown error",
        });
        failCount++;
      }
    }

    const summary = {
      total: assignments.length,
      sent: successCount,
      failed: failCount,
      skipped: assignments.length - successCount - failCount,
    };

    // Log SMS activity
    logSMS(results, summary);

    res.json({
      success: true,
      summary,
      results,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(`SMS sending error: ${errorMessage}`);
    fs.appendFileSync(
      LOG_FILE,
      `\n[ERROR] SMS sending failed: ${errorMessage} - ${new Date().toISOString()}\n`,
      "utf-8"
    );
    res.status(500).json({ error: errorMessage });
  }
});

// Serve the main page
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Secret Santa app running on http://localhost:${PORT}`);
});
