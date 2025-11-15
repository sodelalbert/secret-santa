import express, { Request, Response } from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

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
