# Secret Santa 🎅🏼

A simple web application to randomly assign Secret Santa gift exchanges.

## Features

- Add participants by name
- Generate random Secret Santa assignments
- Simple and clean web interface
- Each person is assigned exactly one person to buy a gift for

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: Plain HTML/CSS/JavaScript
- **Algorithm**: Fisher-Yates shuffle with circular assignment

## Project Structure

```text
secret-santa/
├── src/
│   └── server.ts          # Express server with Secret Santa logic
├── public/
│   └── index.html         # Frontend interface
├── package.json
├── tsconfig.json
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

2. Edit `.env` and set your desired port:

```bash
PORT=8080
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
2. Enter participant names one by one and click "Add"
3. Add at least 2 participants
4. Click "Generate Secret Santa" to create the assignments
5. View who will buy presents for whom

## API Endpoint

### POST `/api/generate`

Generate Secret Santa assignments.

**Request Body:**

```json
{
  "participants": [
    { "name": "Alice" },
    { "name": "Bob" },
    { "name": "Charlie" }
  ]
}
```

**Response:**

```json
{
  "assignments": [
    { "giver": "Alice", "receiver": "Bob" },
    { "giver": "Bob", "receiver": "Charlie" },
    { "giver": "Charlie", "receiver": "Alice" }
  ]
}
```

## Algorithm

The application uses a circular assignment approach:

1. Shuffles the participant list randomly (Fisher-Yates algorithm)
2. Assigns each person to give a gift to the next person in the shuffled list
3. The last person gives to the first person, creating a complete cycle

This ensures everyone gives exactly one gift and receives exactly one gift.

## Release Notes

Release are accesible on separete branhes.

### v1.0.0 - Initial Release

- Basic functionality to add participants and generate Secret Santa assignments
- Simple web interface for user interaction
- Implemented circular assignment algorithm
- Logging to file for assignment generation events

### v1.1.0 - Docker Support and SMS Integration (Planned)

- Dockerfile added for containerized deployment (not implemented yet)
- Add phone number option in UI/Backend + logging
- Edit participant names and phone numbers
- Dockerization - logs visible in docker log command

### v1.2.0 - UI Improvements

- [ ] Phone number validation
- [ ] SMS gateway integration
- [ ] TAB functions improvement

### v1.3.0 - CICD Pipeline

- [ ] Setup CICD pipeline for automated testing and deployment (not implemented yet)
- [ ] Implement testing with Playwright (not implemented yet)
