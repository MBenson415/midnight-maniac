# Midnight Maniac SWA

This is an Azure Static Web App with a React frontend and a Node.js backend (Azure Functions).

## Project Structure

- `client`: React application (Vite)
- `api`: Azure Functions (Node.js)

## Prerequisites

- Node.js
- Azure CLI (optional, for deployment)
- Azure Static Web Apps CLI (optional, for local development)
  - Install: `npm install -g @azure/static-web-apps-cli`

## Setup

1.  Install dependencies for client:
    ```bash
    cd client
    npm install
    ```

2.  Install dependencies for api:
    ```bash
    cd api
    npm install
    ```

3.  Configure Stripe:
    - Rename `api/local.settings.json.example` to `api/local.settings.json` (if not already created)
    - Add your Stripe Secret Key to `STRIPE_SECRET_KEY` in `api/local.settings.json`.
    - Update `client/src/pages/Store.jsx` with your Stripe Publishable Key.

## Running Locally (with SWA CLI)

From the root directory:

```bash
swa start client --api-location api
```

## Running Locally (Manual)

1.  Start the API:
    ```bash
    cd api
    npm start
    ```

2.  Start the Client:
    ```bash
    cd client
    npm run dev
    ```
    Note: You will need to configure a proxy in `vite.config.js` to point `/api` requests to the Azure Functions port (usually 7071) if running manually.

## Deployment

Deploy to Azure Static Web Apps using the Azure Portal or Azure CLI.
- App Location: `client`
- Api Location: `api`
- Output Location: `dist`
