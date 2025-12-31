# Test Suite Documentation
**Abroadly Backend REST API**

---

## Test Coverage Overview

This document describes the test suite for the Backend REST API subsystem. The tests cover:
- CRUD operations for Programs, Places, and Trips
- Review creation and retrieval
- Filtering and pagination
- Error handling (404s, validation errors)
- Authentication requirements

---

## Running the Tests

### Prerequisites
1. Backend server must be running:
   ```bash
   cd /path/to/Group14
   uv run uvicorn app.main:app --reload --port 8000
   ```

2. Database should be empty or seeded with known data

### Automated Tests
```bash
uv run python test_api.py
```

### Interactive Testing (Swagger UI)
Navigate to: http://localhost:8000/docs

---

## Test Suite 1: Programs API

### Test 1.1: List Programs (GET /api/programs/)
**Objective:** Verify programs can be retrieved  
**Steps:**
1. GET http://localhost:8000/api/programs/
2. Verify response status is 200
3. Verify response is JSON array

**Expected Result:** Status 200, array of programs (may be empty)

**Automated Test:**
```python
import requests
response = requests.get("http://localhost:8000/api/programs/")
assert response.status_code == 200
assert isinstance(response.json(), list)
```

### Test 1.2: Create Program (POST /api/programs/)
**Objective:** Verify program creation  
**Authentication Required:** Yes  
**Steps:**
1. Authenticate (get auth cookie)
2. POST http://localhost:8000/api/programs/ with:
   ```json
   {
     "program_name": "Test Program",
     "institution": "Test University",
     "city": "Paris",
     "country": "France",
     "cost": 10000,
     "duration": "Semester"
   }
   ```
3. Verify response status is 201
4. Verify returned object has `id` field

**Expected Result:** Status 201, program object with ID

### Test 1.3: Get Specific Program (GET /api/programs/{id})
**Objective:** Verify single program retrieval  
**Steps:**
1. Create a program (or use existing ID)
2. GET http://localhost:8000/api/programs/{id}
3. Verify status 200
4. Verify program data matches

**Expected Result:** Status 200, program object

### Test 1.4: Filter Programs by City
**Objective:** Verify filtering works  
**Steps:**
1. Create programs in Paris and London
2. GET http://localhost:8000/api/programs/?city=Paris
3. Verify only Paris programs returned

**Expected Result:** Only programs with city="Paris"

### Test 1.5: Filter Programs by Country
**Objective:** Verify country filtering  
**Steps:**
1. Create programs in France and UK
2. GET http://localhost:8000/api/programs/?country=France
3. Verify only France programs returned

**Expected Result:** Only programs with country="France"

### Test 1.6: Pagination
**Objective:** Verify skip/limit work  
**Steps:**
1. Create 5 programs
2. GET /api/programs/?limit=2 - should return 2 programs
3. GET /api/programs/?skip=2&limit=2 - should return next 2

**Expected Result:** Correct subset of programs

### Test 1.7: Update Program (PUT /api/programs/{id})
**Objective:** Verify program updates  
**Authentication Required:** Yes  
**Steps:**
1. Create a program
2. PUT /api/programs/{id} with updated description
3. GET /api/programs/{id}
4. Verify description updated, other fields unchanged

**Expected Result:** Status 200, updated program

### Test 1.8: Delete Program (DELETE /api/programs/{id})
**Objective:** Verify program deletion  
**Authentication Required:** Yes  
**Steps:**
1. Create a program
2. DELETE /api/programs/{id}
3. Verify status 204
4. GET /api/programs/{id} - should return 404

**Expected Result:** Status 204, then 404 on retrieval

### Test 1.9: Get Non-Existent Program
**Objective:** Verify 404 handling  
**Steps:**
1. GET /api/programs/99999 (non-existent ID)
2. Verify status 404

**Expected Result:** Status 404

### Test 1.10: Create Program Review
**Objective:** Verify review creation  
**Authentication Required:** Yes  
**Steps:**
1. Create a program
2. POST /api/programs/{id}/reviews with:
   ```json
   {
     "rating": 5,
     "review_text": "Great program!"
   }
   ```
3. Verify status 201

**Expected Result:** Status 201, review object

### Test 1.11: Invalid Rating Validation
**Objective:** Verify rating validation  
**Authentication Required:** Yes  
**Steps:**
1. Create a program
2. POST /api/programs/{id}/reviews with rating=6
3. Verify status 422 (validation error)

**Expected Result:** Status 422, validation error message

### Test 1.12: List Program Reviews
**Objective:** Verify reviews retrieval  
**Steps:**
1. Create program with reviews
2. GET /api/programs/{id}/reviews
3. Verify reviews returned

**Expected Result:** Status 200, array of reviews

### Test 1.13: Course Review Creation
**Objective:** Verify course reviews work  
**Authentication Required:** Yes  
**Steps:**
1. Create a program
2. POST /api/programs/{id}/courses/reviews with:
   ```json
   {
     "course_name": "Spanish 101",
     "instructor_name": "Prof. Garcia",
     "rating": 4,
     "review_text": "Excellent class"
   }
   ```

**Expected Result:** Status 201, course review object

### Test 1.14: Housing Review Creation
**Objective:** Verify housing reviews work  
**Authentication Required:** Yes  
**Steps:**
1. Create a program
2. POST /api/programs/{id}/housing/reviews with:
   ```json
   {
     "housing_description": "Apartment near campus",
     "rating": 5,
     "review_text": "Great location"
   }
   ```

**Expected Result:** Status 201, housing review object

---

## Test Suite 2: Places API

### Test 2.1: List Places (GET /api/places/)
**Objective:** Verify places listing  
**Steps:**
1. GET http://localhost:8000/api/places/
2. Verify status 200
3. Verify array response

**Expected Result:** Status 200, array of places

### Test 2.2: Create Place (POST /api/places/)
**Objective:** Verify place creation  
**Authentication Required:** Yes  
**Steps:**
1. POST /api/places/ with:
   ```json
   {
     "name": "Le Bistro",
     "category": "restaurant",
     "city": "Paris",
     "country": "France",
     "latitude": 48.8566,
     "longitude": 2.3522,
     "description": "Cozy French restaurant"
   }
   ```

**Expected Result:** Status 201, place object

### Test 2.3: Filter by Category
**Objective:** Verify category filtering  
**Steps:**
1. Create places with different categories
2. GET /api/places/?category=restaurant
3. Verify only restaurants returned

**Expected Result:** Only places with category="restaurant"

### Test 2.4: Filter by City and Category
**Objective:** Verify multiple filters  
**Steps:**
1. Create places in different cities/categories
2. GET /api/places/?city=Paris&category=restaurant
3. Verify only Paris restaurants returned

**Expected Result:** Only places matching both filters

### Test 2.5: Update Place
**Objective:** Verify place updates  
**Authentication Required:** Yes  
**Steps:**
1. Create a place
2. PUT /api/places/{id} with updated address
3. Verify address updated

**Expected Result:** Status 200, updated place

### Test 2.6: Delete Place
**Objective:** Verify place deletion  
**Authentication Required:** Yes  
**Steps:**
1. Create a place
2. DELETE /api/places/{id}
3. Verify status 204

**Expected Result:** Status 204, place no longer exists

### Test 2.7: Create Place Review
**Objective:** Verify place reviews  
**Authentication Required:** Yes  
**Steps:**
1. Create a place
2. POST /api/places/{id}/reviews with rating and text
3. Verify status 201

**Expected Result:** Status 201, review object

### Test 2.8: List Place Reviews
**Objective:** Verify review retrieval  
**Steps:**
1. Create place with reviews
2. GET /api/places/{id}/reviews
3. Verify reviews returned

**Expected Result:** Status 200, array of reviews

---

## Test Suite 3: Trips API

### Test 3.1: List Trips (GET /api/trips/)
**Objective:** Verify trips listing  
**Steps:**
1. GET http://localhost:8000/api/trips/
2. Verify status 200

**Expected Result:** Status 200, array of trips

### Test 3.2: Create Trip (POST /api/trips/)
**Objective:** Verify trip creation  
**Authentication Required:** Yes  
**Steps:**
1. POST /api/trips/ with:
   ```json
   {
     "destination": "Amsterdam",
     "country": "Netherlands",
     "trip_type": "weekend",
     "description": "Weekend trip to Amsterdam"
   }
   ```

**Expected Result:** Status 201, trip object

### Test 3.3: Filter by Trip Type
**Objective:** Verify trip_type filtering  
**Steps:**
1. Create trips with different types
2. GET /api/trips/?trip_type=weekend
3. Verify only weekend trips returned

**Expected Result:** Only trips with trip_type="weekend"

### Test 3.4: Filter by Country
**Objective:** Verify country filtering  
**Steps:**
1. Create trips in different countries
2. GET /api/trips/?country=Italy
3. Verify only Italy trips returned

**Expected Result:** Only trips in Italy

### Test 3.5: Update Trip
**Objective:** Verify trip updates  
**Authentication Required:** Yes  
**Steps:**
1. Create a trip
2. PUT /api/trips/{id} with updated description
3. Verify update successful

**Expected Result:** Status 200, updated trip

### Test 3.6: Delete Trip
**Objective:** Verify trip deletion  
**Authentication Required:** Yes  
**Steps:**
1. Create a trip
2. DELETE /api/trips/{id}
3. Verify status 204

**Expected Result:** Status 204, trip deleted

### Test 3.7: Create Trip Review
**Objective:** Verify trip reviews  
**Authentication Required:** Yes  
**Steps:**
1. Create a trip
2. POST /api/trips/{id}/reviews with rating and text
3. Verify status 201

**Expected Result:** Status 201, review object

### Test 3.8: List Trip Reviews
**Objective:** Verify review listing  
**Steps:**
1. Create trip with reviews
2. GET /api/trips/{id}/reviews
3. Verify reviews returned

**Expected Result:** Status 200, array of reviews

---

## Test Suite 4: Authentication & Security

### Test 4.1: Create Without Auth (Should Fail)
**Objective:** Verify auth is required for POST  
**Steps:**
1. POST /api/programs/ without authentication cookie
2. Verify status 401

**Expected Result:** Status 401 Unauthorized

### Test 4.2: Update Without Auth (Should Fail)
**Objective:** Verify auth required for PUT  
**Steps:**
1. PUT /api/places/{id} without authentication
2. Verify status 401

**Expected Result:** Status 401 Unauthorized

### Test 4.3: Delete Without Auth (Should Fail)
**Objective:** Verify auth required for DELETE  
**Steps:**
1. DELETE /api/trips/{id} without authentication
2. Verify status 401

**Expected Result:** Status 401 Unauthorized

### Test 4.4: Public Read Access
**Objective:** Verify GET works without auth  
**Steps:**
1. GET /api/programs/ without authentication
2. Verify status 200

**Expected Result:** Status 200, public access works

---

## Test Suite 5: Edge Cases

### Test 5.1: Empty Database
**Objective:** Verify empty list handling  
**Steps:**
1. Clear all data
2. GET /api/programs/
3. Verify returns empty array

**Expected Result:** Status 200, empty array []

### Test 5.2: Review Non-Existent Entity
**Objective:** Verify foreign key validation  
**Authentication Required:** Yes  
**Steps:**
1. POST /api/programs/99999/reviews
2. Verify status 404

**Expected Result:** Status 404, "Program not found"

### Test 5.3: Large Pagination
**Objective:** Verify pagination limits  
**Steps:**
1. GET /api/programs/?limit=1000
2. Verify returns max 100 (or configured limit)

**Expected Result:** Respects maximum limit

### Test 5.4: Negative Ratings
**Objective:** Verify validation  
**Authentication Required:** Yes  
**Steps:**
1. POST review with rating=0 or rating=-1
2. Verify status 422

**Expected Result:** Status 422, validation error

### Test 5.5: Missing Required Fields
**Objective:** Verify required field validation  
**Authentication Required:** Yes  
**Steps:**
1. POST /api/programs/ without program_name
2. Verify status 422

**Expected Result:** Status 422, validation error

### Test 5.6: Partial Update
**Objective:** Verify exclude_unset works  
**Authentication Required:** Yes  
**Steps:**
1. Create program with all fields
2. PUT with only {"description": "new"}
3. Verify only description changed

**Expected Result:** Only specified field updated

### Test 5.7: SQL Injection Attempt
**Objective:** Verify SQLModel protects against injection  
**Steps:**
1. GET /api/programs/?city=Paris' OR '1'='1
2. Verify returns empty or only Paris (no injection)

**Expected Result:** No SQL injection, safe query

---

## Automated Test Script

The `test_api.py` file in the repository contains automated versions of many of these tests. Key tests included:

1. All list endpoints return 200
2. Filtering works correctly
3. GET non-existent returns 404
4. Authentication required for writes
5. Review creation works
6. Rating validation works

**Run with:**
```bash
uv run python test_api.py
```

---

## Manual Test Checklist

Use this checklist when manually testing:

### Programs
- [ ] List programs
- [ ] Create program (with auth)
- [ ] Get program by ID
- [ ] Filter by city
- [ ] Filter by country
- [ ] Update program
- [ ] Delete program
- [ ] Add program review
- [ ] Add course review
- [ ] Add housing review
- [ ] List all review types

### Places
- [ ] List places
- [ ] Create place (with auth)
- [ ] Get place by ID
- [ ] Filter by city
- [ ] Filter by country
- [ ] Filter by category
- [ ] Update place
- [ ] Delete place
- [ ] Add place review
- [ ] List place reviews

### Trips
- [ ] List trips
- [ ] Create trip (with auth)
- [ ] Get trip by ID
- [ ] Filter by destination
- [ ] Filter by country
- [ ] Filter by trip_type
- [ ] Update trip
- [ ] Delete trip
- [ ] Add trip review
- [ ] List trip reviews

### Security
- [ ] POST without auth returns 401
- [ ] PUT without auth returns 401
- [ ] DELETE without auth returns 401
- [ ] GET works without auth

### Validation
- [ ] Invalid rating (0, 6) returns 422
- [ ] Missing required fields returns 422
- [ ] Review non-existent entity returns 404

---

## Known Issues / Limitations

1. **No cascade delete testing:** When deleting a program/place/trip with reviews, we rely on database cascade. Should add explicit tests.

2. **No performance tests:** Current tests don't verify query performance with large datasets.

3. **No concurrent access tests:** Multiple users creating/updating same entity not tested.

4. **Limited negative testing:** More edge cases could be tested (very long strings, special characters, etc.).

---

## Test Data Setup

For manual testing, you can seed the database with sample data:

```bash
uv run python seed_data.py
```

This creates:
- 10+ study abroad programs
- 15+ places (restaurants, activities, etc.)
- 8+ trip destinations
- Multiple reviews for each

---

**End of Test Suite Documentation**

