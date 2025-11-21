# SMS Gateway Integration

This document outlines the planned integration of an SMS gateway into the Secret Santa application to notify participants of their assignments via SMS.

## Configuraiton of TextBee SMS Gateway

1. Go to [textbee.dev](https://textbee.dev) and register or login with your account
2. Install the app on your android phone from [textbee.dev/download](https://textbee.dev/download)
3. Open the app and grant the permissions for SMS
4. Go to [textbee.dev/dashboard](https://textbee.dev/dashboard) and click register device/ generate API Key
5. Scan the QR code with the app or enter the API key manually
6. You are ready to send SMS messages from the dashboard or from your application via the REST API

**Code Snippet**: Few lines of code showing how to send an SMS message via the REST API

```javascript
const API_KEY = "YOUR_API_KEY";
const DEVICE_ID = "YOUR_DEVICE_ID";

await axios.post(
  `https://api.textbee.dev/api/v1/gateway/devices/${DEVICE_ID}/send-sms`,
  {
    recipients: ["+251912345678"],
    message: "Hello World!",
  },
  {
    headers: {
      "x-api-key": API_KEY,
    },
  }
);
```

**Code Snippet**: Curl command to send an SMS message via the REST API

```bash
curl -X POST "https://api.textbee.dev/api/v1/gateway/devices/YOUR_DEVICE_ID/send-sms" \
  -H 'x-api-key: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "recipients": [ "+251912345678" ],
    "message": "Hello World!"
  }'
```

## TextBee Private Hosted API
