# Abroadly - API Documentation

Base URL: `http://localhost:8000` (development)

## Table of Contents
- [Authentication](#authentication)
- [Programs API](#programs-api)
- [Places API](#places-api)
- [Data Models](#data-models)
- [Error Responses](#error-responses)

---

## Authentication

All **write operations** (POST, PUT, DELETE) require authentication. Read operations (GET) are public.

### Auth Endpoints

#### Request Magic Link
```http
POST /auth/request-link
Content-Type: application/json

{
  "email": "student@vanderbilt.edu"
}
```

**Response:**
```json
{
  "magic_link": "http://localhost:8000/auth/callback?token=..."
}
```

#### Verify Magic Link (Callback)
```http
GET /auth/callback?token={token}
```

Sets an HttpOnly cookie for authentication.

#### Get Current User
```http
GET /auth/me
Cookie: abroad_session={token}
```

**Response:**
```json
{
  "id": 1,
  "email": "student@vanderbilt.edu"
}
```

#### Logout
```http
POST /auth/logout
```

Clears the authentication cookie.

---

## Programs API

### Study Abroad Programs

#### Create Program
```http
POST /api/programs/
Authorization: Required (Cookie or Bearer token)
Content-Type: application/json

{
  "program_name": "Oxford Summer Program",
  "institution": "University of Oxford",
  "city": "Oxford",
  "country": "United Kingdom",
  "cost": 8500.00,
  "housing_type": "College dormitory",
  "location": "City center",
  "duration": "8 weeks",
  "description": "Intensive summer program in various subjects..."
}
```

**Response (201):**
```json
{
  "id": 1,
  "program_name": "Oxford Summer Program",
  "institution": "University of Oxford",
  "city": "Oxford",
  "country": "United Kingdom",
  "cost": 8500.00,
  "housing_type": "College dormitory",
  "location": "City center",
  "duration": "8 weeks",
  "description": "Intensive summer program in various subjects...",
  "created_at": "2025-10-07T12:00:00Z"
}
```

#### List Programs
```http
GET /api/programs/
Query Parameters:
  - city: string (optional) - Filter by city
  - country: string (optional) - Filter by country
  - skip: integer (optional, default: 0) - Pagination offset
  - limit: integer (optional, default: 100) - Pagination limit
```

**Example:**
```http
GET /api/programs/?city=Oxford&limit=10
```

**Response (200):**
```json
[
  {
    "id": 1,
    "program_name": "Oxford Summer Program",
    "institution": "University of Oxford",
    "city": "Oxford",
    "country": "United Kingdom",
    "cost": 8500.00,
    ...
  }
]
```

#### Get Program
```http
GET /api/programs/{program_id}
```

**Response (200):**
```json
{
  "id": 1,
  "program_name": "Oxford Summer Program",
  ...
}
```

#### Update Program
```http
PUT /api/programs/{program_id}
Authorization: Required
Content-Type: application/json

{
  "cost": 9000.00,
  "description": "Updated description..."
}
```

All fields are optional in the update request.

#### Delete Program
```http
DELETE /api/programs/{program_id}
Authorization: Required
```

**Response (204):** No content

---

### Program Reviews

#### Create Program Review
```http
POST /api/programs/{program_id}/reviews
Authorization: Required
Content-Type: application/json

{
  "rating": 5,
  "review_text": "Amazing program! The courses were excellent and the city was beautiful."
}
```

**Response (201):**
```json
{
  "id": 1,
  "user_id": 1,
  "program_id": 1,
  "rating": 5,
  "review_text": "Amazing program! The courses were excellent...",
  "date": "2025-10-07T12:00:00Z"
}
```

#### List Program Reviews
```http
GET /api/programs/{program_id}/reviews
Query Parameters:
  - skip: integer (optional, default: 0)
  - limit: integer (optional, default: 100)
```

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "program_id": 1,
    "rating": 5,
    "review_text": "Amazing program!...",
    "date": "2025-10-07T12:00:00Z"
  }
]
```

---

### Course Reviews

#### Create Course Review
```http
POST /api/programs/{program_id}/courses/reviews
Authorization: Required
Content-Type: application/json

{
  "course_name": "British Literature",
  "instructor_name": "Dr. Smith",
  "rating": 4,
  "review_text": "Great course, very informative lectures."
}
```

**Response (201):**
```json
{
  "id": 1,
  "user_id": 1,
  "program_id": 1,
  "course_name": "British Literature",
  "instructor_name": "Dr. Smith",
  "rating": 4,
  "review_text": "Great course, very informative lectures.",
  "date": "2025-10-07T12:00:00Z"
}
```

#### List Course Reviews
```http
GET /api/programs/{program_id}/courses/reviews
Query Parameters:
  - skip: integer (optional, default: 0)
  - limit: integer (optional, default: 100)
```

---

### Program Housing Reviews

#### Create Housing Review
```http
POST /api/programs/{program_id}/housing/reviews
Authorization: Required
Content-Type: application/json

{
  "housing_description": "College dormitory with shared bathrooms",
  "rating": 4,
  "review_text": "Rooms were clean and well-maintained. Great location on campus."
}
```

**Response (201):**
```json
{
  "id": 1,
  "user_id": 1,
  "program_id": 1,
  "housing_description": "College dormitory with shared bathrooms",
  "rating": 4,
  "review_text": "Rooms were clean and well-maintained...",
  "date": "2025-10-07T12:00:00Z"
}
```

#### List Housing Reviews
```http
GET /api/programs/{program_id}/housing/reviews
Query Parameters:
  - skip: integer (optional, default: 0)
  - limit: integer (optional, default: 100)
```

---

## Places API

### Places (Restaurants, Activities, Housing, etc.)

#### Create Place
```http
POST /api/places/
Authorization: Required
Content-Type: application/json

{
  "name": "The Eagle and Child",
  "category": "restaurant",
  "city": "Oxford",
  "country": "United Kingdom",
  "latitude": 51.7548,
  "longitude": -1.2582,
  "address": "49 St Giles', Oxford OX1 3LU",
  "description": "Historic pub where C.S. Lewis and J.R.R. Tolkien met."
}
```

**Categories:** `restaurant`, `activity`, `museum`, `housing`, `nightlife`, `cafe`, etc.

**Response (201):**
```json
{
  "id": 1,
  "name": "The Eagle and Child",
  "category": "restaurant",
  "city": "Oxford",
  "country": "United Kingdom",
  "latitude": 51.7548,
  "longitude": -1.2582,
  "address": "49 St Giles', Oxford OX1 3LU",
  "description": "Historic pub where C.S. Lewis and J.R.R. Tolkien met.",
  "created_at": "2025-10-07T12:00:00Z"
}
```

#### List Places
```http
GET /api/places/
Query Parameters:
  - city: string (optional) - Filter by city
  - country: string (optional) - Filter by country
  - category: string (optional) - Filter by category
  - skip: integer (optional, default: 0)
  - limit: integer (optional, default: 100)
```

**Example:**
```http
GET /api/places/?city=Oxford&category=restaurant
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "The Eagle and Child",
    "category": "restaurant",
    "city": "Oxford",
    ...
  }
]
```

#### Get Place
```http
GET /api/places/{place_id}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "The Eagle and Child",
  ...
}
```

#### Update Place
```http
PUT /api/places/{place_id}
Authorization: Required
Content-Type: application/json

{
  "description": "Updated description...",
  "latitude": 51.7549,
  "longitude": -1.2583
}
```

All fields are optional in the update request.

#### Delete Place
```http
DELETE /api/places/{place_id}
Authorization: Required
```

**Response (204):** No content

---

### Place Reviews

#### Create Place Review
```http
POST /api/places/{place_id}/reviews
Authorization: Required
Content-Type: application/json

{
  "rating": 5,
  "review_text": "Amazing food and great atmosphere! Must visit if you're in Oxford."
}
```

**Response (201):**
```json
{
  "id": 1,
  "user_id": 1,
  "place_id": 1,
  "rating": 5,
  "review_text": "Amazing food and great atmosphere!...",
  "date": "2025-10-07T12:00:00Z"
}
```

#### List Place Reviews
```http
GET /api/places/{place_id}/reviews
Query Parameters:
  - skip: integer (optional, default: 0)
  - limit: integer (optional, default: 100)
```

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "place_id": 1,
    "rating": 5,
    "review_text": "Amazing food and great atmosphere!...",
    "date": "2025-10-07T12:00:00Z"
  }
]
```

---

## Data Models

### StudyAbroadProgram
```typescript
{
  id: number;
  program_name: string;
  institution: string;
  city: string;
  country: string;
  cost?: number;
  housing_type?: string;
  location?: string;
  duration?: string;
  description?: string;
  created_at: datetime;
}
```

### ProgramReview
```typescript
{
  id: number;
  user_id: number;
  program_id: number;
  rating: number;  // 1-5
  review_text: string;
  date: datetime;
}
```

### CourseReview
```typescript
{
  id: number;
  user_id: number;
  program_id: number;
  course_name: string;
  instructor_name?: string;
  rating: number;  // 1-5
  review_text: string;
  date: datetime;
}
```

### ProgramHousingReview
```typescript
{
  id: number;
  user_id: number;
  program_id: number;
  housing_description: string;
  rating: number;  // 1-5
  review_text: string;
  date: datetime;
}
```

### Place
```typescript
{
  id: number;
  name: string;
  category: string;  // restaurant, activity, museum, housing, etc.
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  description?: string;
  created_at: datetime;
}
```

### PlaceReview
```typescript
{
  id: number;
  user_id: number;
  place_id: number;
  rating: number;  // 1-5
  review_text: string;
  date: datetime;
}
```

### User
```typescript
{
  id: number;
  email: string;
  created_at: datetime;
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Email domain not allowed"
}
```

### 401 Unauthorized
```json
{
  "detail": "Missing token"
}
```

### 404 Not Found
```json
{
  "detail": "Program not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "rating"],
      "msg": "ensure this value is greater than or equal to 1",
      "type": "value_error.number.not_ge"
    }
  ]
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. This will be added in production.

---

## Interactive API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation with a built-in API tester (Swagger UI).

Alternative docs: `http://localhost:8000/redoc` (ReDoc format)

---

## Example Frontend Integration

### Fetch Programs
```javascript
const response = await fetch('http://localhost:8000/api/programs/?city=Oxford');
const programs = await response.json();
console.log(programs);
```

### Create Review (with auth)
```javascript
const response = await fetch('http://localhost:8000/api/programs/1/reviews', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',  // Include cookies
  body: JSON.stringify({
    rating: 5,
    review_text: 'Great program!'
  })
});

const review = await response.json();
```

### Search Places by Category
```javascript
const response = await fetch(
  'http://localhost:8000/api/places/?city=Barcelona&category=restaurant'
);
const restaurants = await response.json();
```

---

## Future Enhancements

- [ ] Pagination metadata (total count, pages)
- [ ] Search endpoints with text search
- [ ] Aggregate ratings (average rating per program/place)
- [ ] User profiles and favorite programs
- [ ] Photo uploads for programs and places
- [ ] Distance-based queries for places (find nearby)
- [ ] Trip planning endpoints
- [ ] Email notifications
- [ ] Rate limiting
- [ ] CORS configuration for production
