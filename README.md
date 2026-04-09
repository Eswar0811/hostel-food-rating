# 🍽️ Smart Hostel Food Rating & Feedback System

Full-stack MERN app where hostel students rate daily meals, with automated SMS alerts to the warden/food committee via **Fast2SMS** when ratings drop below a configurable threshold.

## ✨ Features

- **Daily menu management** — admin adds breakfast / lunch / dinner / snacks menus
- **Student rating** — 1–5 star ratings with optional comments (one rating per student per meal, enforced at the DB level)
- **Live analytics** — average rating, total ratings, rating distribution (pre-computed & cached per meal)
- **Smart SMS alerts** — fires automatically when `average < RATING_THRESHOLD` AND `totalRatings >= MIN_STUDENTS_THRESHOLD`
- **Anti-spam** — each meal only alerts once (with automatic rollback if the Fast2SMS call fails)
- **Dashboard charts** — rating distribution (bar) + trend across recent meals (line), powered by Chart.js
- **Validation** — express-validator on every write endpoint
- **Unit tests** — Jest tests for the rating math and alert trigger logic

## 🏗️ Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18 + Vite + React Router + Chart.js |
| Backend | Node.js + Express + Mongoose |
| Database | MongoDB (local or Atlas) |
| SMS | Fast2SMS REST API |
| Testing | Jest |

## 📁 Project Structure

```
hostel-food-rating/
├── backend/
│   ├── config/db.js
│   ├── controllers/       # food, rating, analytics
│   ├── models/            # FoodMenu, Rating, Analytics
│   ├── routes/            # REST endpoints
│   ├── services/          # smsService, analyticsService (alert logic)
│   ├── utils/             # validate, errorHandler
│   ├── __tests__/         # Jest unit tests
│   ├── .env.example
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/    # StarRating, MealCard, AnalyticsChart
    │   ├── pages/         # HomePage, RatePage, AdminPage
    │   ├── services/api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── styles.css
    ├── index.html
    ├── vite.config.js
    ├── .env.example
    └── package.json
```

## 🚀 Setup

### 1. Prerequisites

- Node.js 18+
- MongoDB (local, or a free MongoDB Atlas cluster)
- A Fast2SMS account + API key (for real SMS delivery)

### 2. Backend

```bash
cd backend
cp .env.example .env      # then edit .env with your real values
npm install
npm run dev               # starts on http://localhost:5000
```

Your `.env` should look like:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hostel_food
FAST2SMS_API_KEY=your_real_key_here
ALERT_RECIPIENTS=9999999999,8888888888   # 10-digit numbers, no +91
RATING_THRESHOLD=3.0
MIN_STUDENTS_THRESHOLD=30
CLIENT_ORIGIN=http://localhost:5173
```

> ⚠️ **Never commit your real API key.** If you pasted it anywhere public, regenerate it from the Fast2SMS dashboard immediately.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # starts on http://localhost:5173
```

Vite is configured to proxy `/api` → `http://localhost:5000`, so both dev servers play nicely.

### 4. Running tests

```bash
cd backend
npm test
```

## 🔌 API Reference

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/food` | Add a menu (`date`, `mealType`, `items[]`) |
| GET | `/api/food` | List menus (optional `?date=YYYY-MM-DD`) |
| GET | `/api/food/:id` | Single menu |
| DELETE | `/api/food/:id` | Remove menu + its analytics |
| POST | `/api/rating` | Submit rating (`foodId`, `studentId`, `rating`, `comment?`) |
| GET | `/api/rating/:foodId` | All ratings for a meal |
| GET | `/api/analytics` | Recent meals + analytics (`?limit=10`) |
| GET | `/api/analytics/:foodId` | Analytics for one meal |
| GET | `/api/health` | Health check |

## 🧠 How the Alert Logic Works

`services/analyticsService.js`:

1. Every new rating triggers `recalculateAnalytics(foodId)`.
2. The service recomputes average + count + distribution from all ratings for that meal and upserts the `Analytics` doc.
3. `shouldTriggerAlert()` checks:
   - `averageRating < RATING_THRESHOLD`
   - `totalRatings >= MIN_STUDENTS_THRESHOLD`
   - `alertSent === false` (so we don't spam)
4. If all three are true, `sendLowRatingAlert()` calls Fast2SMS and marks `alertSent: true`.
5. If the SMS call fails, the `alertSent` flag is rolled back so the next rating retries.

Both `computeStats` and `shouldTriggerAlert` are **pure functions** and have Jest tests in `__tests__/analyticsService.test.js`.

## 📲 Fast2SMS Notes

- This project uses the **`q` (Quick Transactional)** route — no DLT template required, but it won't deliver to DND-registered numbers.
- For DND numbers you need to switch to `route: "dlt"` with an approved DLT template ID. Update `services/smsService.js` accordingly.
- Don't prefix numbers with `+91` or `91` — just the 10 digits.

## 🚀 Deployment

| Service | Platform |
|---|---|
| Backend | Render, Railway, Fly.io |
| Frontend | Vercel, Netlify |
| Database | MongoDB Atlas |

On the frontend, set `VITE_API_BASE` to your deployed backend URL before building.

## 📝 License

MIT
