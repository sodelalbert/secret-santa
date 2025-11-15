import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const LOG_FILE = path.join(__dirname, "../logs/assignments.log");

app.use(express.json());
app.use(express.static("public"));

interface Participant {
  name: string;
}

interface Assignment {
  giver: string;
  receiver: string;
}

// Secret Santa matching algorithm
function assignSecretSanta(participants: Participant[]): Assignment[] {
  if (participants.length < 2) {
    throw new Error("Need at least 2 participants");
  }

  const names = participants.map((p) => p.name);
  const shuffled = [...names];

  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Create circular assignments (each person gives to the next)
  const assignments: Assignment[] = [];
  for (let i = 0; i < names.length; i++) {
    assignments.push({
      giver: shuffled[i],
      receiver: shuffled[(i + 1) % shuffled.length],
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
    participants.map((p, index) => `  ${index + 1}. ${p.name}`).join("\n");

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

    // Log the assignments to file
    logAssignments(participants, assignments);

    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Serve the main page
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Secret Santa app running on http://localhost:${PORT}`);
});
