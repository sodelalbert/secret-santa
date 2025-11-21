# Secret Santa 🎅

A web application to randomly assign Secret Santa gift exchanges with SMS notifications and multi-language support.

## Features

- ✨ Add participants by name and phone number (optional)
- 🎁 Generate random Secret Santa assignments
- 📱 Send SMS notifications to participants via TextBee
- 🌍 Multi-language support (Polish & English)
- ✅ Phone number validation (9 digits with optional + prefix)
- 📝 Edit and remove participants before generating assignments
- 🎨 Christmas-themed UI with custom background
- 📊 Comprehensive logging to files and Docker logs
- 🔒 Prevents modifications after assignments are generated

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: HTML/CSS/JavaScript with translation system
- **SMS Service**: TextBee API for notifications
- **Testing**: Playwright for E2E tests
- **Containerization**: Docker with Docker Compose
- **Algorithm**: Fisher-Yates shuffle with circular assignment

## Project Structure

```text
secret-santa/
├── src/
│   └── server.ts              # Express server with Secret Santa logic
├── public/
│   ├── index.html             # Frontend interface
│   ├── styles.css             # Christmas-themed styling
│   ├── translations.js        # Multi-language support (PL/EN)
│   └── background.png         # Custom background image
├── tests/
│   └── secret-santa.spec.ts   # Playwright E2E tests
├── logs/
│   └── assignments.log        # Assignment and SMS activity logs
├── package.json
├── tsconfig.json
├── playwright.config.ts
├── Dockerfile
├── compose.yml
└── README.md
```

## Installation

1. Install dependencies:

```bash
npm install
```

## Running the Application

### Development Mode (with hot reload)

```bash
# Default port (3000)
npm run dev

# Custom port
PORT=8080 npm run dev:port
```

### Production Mode

```bash
npm run build
npm start

# Custom port
PORT=5000 npm run start:port
```

The application will run on `http://localhost:3000` (or your specified port)

## Docker Deployment

### Prerequisites

- Docker and Docker Compose installed
- `.env` file configured (required)

### Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

1. Edit `.env` and set your configuration:

```bash
PORT=8080
TEXTBEE_API_KEY=your_api_key_here
TEXTBEE_DEVICE_ID=your_device_id_here
```

### Running with Docker

```bash
# Build and start the container
docker compose up -d

# View logs
docker compose logs -f

# Stop the container
docker compose down
```

The application will be available at `http://localhost:PORT` (where PORT is defined in your `.env` file).

### Docker Features

- Multi-stage build for optimized image size
- Persistent logs stored in `./logs` directory
- Automatic restart on failure
- Health checks for container monitoring
- Alpine Linux base for minimal footprint

## How to Use

1. Open your browser and navigate to `http://localhost:3000`
2. Select your preferred language (PL/EN) using the language switcher
3. Enter participant names one by one with optional phone numbers (9 digits)
4. Click "Add" (or "Dodaj" in Polish) to add each participant
5. Edit or remove participants as needed before generating
6. Add at least 2 participants
7. Click "Generate Gift Assignments" to create the assignments
8. View who will buy presents for whom
9. (Optional) If phone numbers were added, click "📱 Send SMS to All Participants" to notify them

**Note**: After generating assignments, you cannot edit participants. Use the reset button to start over.

## SMS Integration (TextBee)

To enable SMS notifications:

1. Sign up for a TextBee account at [https://textbee.dev](https://textbee.dev)
2. Get your API key and Device ID from the TextBee dashboard
3. Add them to your `.env` file:

   ```bash
   TEXTBEE_API_KEY=your_api_key_here
   TEXTBEE_DEVICE_ID=your_device_id_here
   ```

4. Participants with valid phone numbers will receive SMS notifications
5. SMS messages are automatically translated based on the selected language

**SMS Message Format:**

- **Polish**: "Cześć [Name]! 🎅 Jesteś Sekretnym Mikołajem dla [Receiver]. Wesołych Świąt!"
- **English**: "Hi [Name]! 🎅 You are the Secret Santa for [Receiver]. Happy gifting!"

## Multi-Language Support

The application supports Polish (PL) and English (EN) with:

- **Language switcher** in the top-right corner
- **Persistent selection** saved to browser localStorage
- **Translated SMS messages** sent in the selected language
- **Full UI translation** including buttons, messages, and errors
- **Default language**: Polish (PL)

## API Endpoint

### POST `/api/generate`

Generate Secret Santa assignments.

**Request Body:**

```json
{
  "participants": [
    { "name": "Alice", "phone": "+48123456789" },
    { "name": "Bob", "phone": "+48987654321" },
    { "name": "Charlie" }
  ]
}
```

**Response:**

```json
{
  "assignments": [
    { "giver": "Alice", "receiver": "Bob", "giverPhone": "+48123456789" },
    { "giver": "Bob", "receiver": "Charlie", "giverPhone": "+48987654321" },
    { "giver": "Charlie", "receiver": "Alice" }
  ]
}
```

### POST `/api/send-sms`

Send SMS notifications to all participants with phone numbers.

**Request Body:**

```json
{
  "language": "pl" // or "en" for English
}
```

**Response:**

```json
{
  "success": true,
  "summary": {
    "total": 3,
    "sent": 2,
    "failed": 0,
    "skipped": 1
  },
  "results": [
    {
      "recipient": "Alice",
      "phone": "+48123456789",
      "status": "sent"
    },
    {
      "recipient": "Bob",
      "phone": "+48987654321",
      "status": "sent"
    },
    {
      "recipient": "Charlie",
      "status": "skipped",
      "reason": "No phone number"
    }
  ]
}
```

## Algorithm

The application uses a circular assignment approach:

1. Shuffles the participant list randomly (Fisher-Yates algorithm)
2. Assigns each person to give a gift to the next person in the shuffled list
3. The last person gives to the first person, creating a complete cycle

This ensures everyone gives exactly one gift and receives exactly one gift.

## Testing

The project includes Playwright E2E tests:

```bash
# Run tests
npx playwright test

# Run tests with UI
npx playwright test --ui

# Run tests in headed mode
npx playwright test --headed
```
