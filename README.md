# SignSpeak POC

A browser-based application for SignSpeak, demonstrating sign language recognition and speech conversion capabilities running entirely client-side.

## Project Structure

```
signspeak-poc/
├── public/
│   └── index.html          # Main HTML page
├── src/
│   └── app.js             # Application JavaScript
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml  # Azure Static Web Apps deployment workflow
└── README.md              # This file
```

## Getting Started

1. Open `public/index.html` in your browser to view the application
2. The application logic is contained in `src/app.js`


## How to Run Locally
1. `git clone https://github.com/yourorg/signspeak-poc.git`
2. `npm install` (if using a local server) or serve `public/` by any static host
3. Open `public/index.html` in Chrome/Edge

## Deployment

This project is configured for deployment to Azure Static Web Apps using GitHub Actions. The workflow is defined in `.github/workflows/azure-static-web-apps.yml`.

To deploy:
1. Push changes to the `main` branch
2. The GitHub Action will automatically build and deploy to Azure Static Web Apps
3. Configure the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret in your GitHub repository settings

## Development

- Main application entry point: `public/index.html`
- JavaScript code: `src/app.js`
- Static assets: Place in the `public/` directory

## License

This is a proof of concept project.
