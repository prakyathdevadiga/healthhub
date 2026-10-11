# HealthHub — Smart Healthcare Web Application

HealthHub is a web-based healthcare application designed to help users manage their prescriptions, keep track of medication schedules, find medicine information, and discover nearby hospitals and blood donors.

## Features

- **User Authentication:** Sign-in and account management using Firebase Authentication.
- **Personalized Dashboard:** Access healthcare features from a central dashboard.
- **Prescription Management:** Add and manage medicine names, dosages, schedules, and prescription dates.
- **Medication Reminders:** View scheduled medicines and track doses marked as taken.
- **Medicine Information:** Retrieve medicine information using the OpenFDA Drug Label API.
- **Nearby Hospital Search:** Discover hospitals within a 10 km radius using the Geoapify Places API.
- **Distance Calculation:** Calculate approximate straight-line distances to nearby hospitals.
- **Blood Donor Directory:** Store and retrieve donor information using MongoDB.
- **Responsive Interface:** Access the application through desktop and mobile browsers.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack web application framework |
| React | User interface development |
| TypeScript | Type-safe application development |
| CSS Modules | Component-specific styling |
| Firebase Authentication | User authentication |
| MongoDB Atlas | Database management |
| OpenFDA API | Medicine information |
| Gemini API | Safety Precautions|
| Geoapify Places API | Nearby hospital search |
| Lucide React | Icons |
| Git and GitHub | Version control and source code management |
| Vercel | Deployment platform |

## APIs and Services

### 1. Firebase Authentication
Handles user authentication and account-related functionality.

### 2. OpenFDA Drug Label API
Provides medicine label information from the US Food and Drug Administration's open data service.

API endpoint: `https://api.fda.gov/drug/label.json`

### 3. Geoapify Places API
Finds nearby hospitals using the user's latitude and longitude. The application searches within a 10 km radius and returns up to 20 results, including available hospital names, addresses, coordinates, contact details, and emergency information.

API endpoint: `https://api.geoapify.com/v2/places`

Hospital location data includes attribution to Geoapify and OpenStreetMap contributors.

### 4. MongoDB Atlas
Stores application data, including blood donor records and prescription information.

Database name: `healthhub`

Collections used:
- `donors`
- `prescriptions`
### 5. Gemini API
Disease-related safety precautions and health guidance.

## Project Structure

```text
health-hub/
├── app/
│   ├── api/
│   │   ├── donors/
│   │   │   └── route.ts
│   │   ├── medicines/
│   │   │   └── route.ts
│   │   └── prescriptions/
│   │       └── route.ts
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── prescriptions/
│   │       └── page.tsx
│   └── lib/
│       └── mongodb.ts
├── lib/
│   └── firebase.ts
├── public/
├── .env.local
├── .gitignore
├── package.json
├── package-lock.json
├── next.config.ts
└── README.md
```

*Note: This is a representative structure. Update it to match the actual files in your repository.*

## Prerequisites

Before running the project, install or configure:

- Node.js (LTS version recommended)
- npm
- A Firebase project with Authentication configured
- A MongoDB Atlas database
- A Geoapify API key
- Access to the OpenFDA API

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/prakyathdevadiga/healthhub.git
```

### 2. Open the project directory

```bash
cd healthhub
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file in the project's root directory and add the environment variable names used by your application.

```env
MONGODB_URI=

GEOAPIFY_API_KEY=
GEMINI_API_KEY=
OPENFDA_API_KEY=

NEXT_PUBLIC_FB_API_KEY=
NEXT_PUBLIC_FB_AUTH_DOMAIN=
NEXT_PUBLIC_FB_PROJECT_ID=
NEXT_PUBLIC_FB_STORAGE_BUCKET=
NEXT_PUBLIC_FB_SENDER_ID=
NEXT_PUBLIC_FB_APP_ID=
NEXT_PUBLIC_FB_MEASUREMENT_ID=
```

Fill in the values from your own MongoDB Atlas, Geoapify, and Firebase configurations. The Firebase variable names above must match those referenced in `lib/firebase.ts`. Include only variables that your code actually uses.

**Security:** Never commit `.env.local` or publish private credentials. Keep `MONGODB_URI` server-side and do not expose it through a `NEXT_PUBLIC_` variable.

### 5. Run the development server

```bash
npm run dev
```

Open the following URL in your browser:

`http://localhost:3000`

## Deployment

The application can be deployed using Vercel.

1. Import the GitHub repository into Vercel.
2. Add the required environment variables in the project settings.
3. Configure Firebase Authentication's authorized domains for the deployed domain.
4. Verify MongoDB Atlas network access and database credentials.
5. Deploy the application and test its features.

**Deployment status:** Update this section once the live deployment has been completed and verified.

## Future Enhancements

- Browser and push notifications for medication reminders.
- Improved hospital search and route navigation.
- Enhanced prescription tracking.
- Additional healthcare features and accessibility improvements.

## Disclaimer

HealthHub is an educational software project. Medicine information and hospital listings should be independently verified. The application is not a substitute for professional medical advice or emergency services.

## Repository

GitHub: https://github.com/prakyathdevadiga/healthhub

---

**HealthHub — Making healthcare information easier to access.**
