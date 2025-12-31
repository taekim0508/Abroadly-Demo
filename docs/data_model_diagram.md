# Abroadly - Data Model UML

```mermaid
classDiagram
    %% User
    class User {
        +int id
        +string email
        +datetime created_at
    }

    %% ===== PROGRAM ECOSYSTEM (For Prospective Students) =====
    
    class StudyAbroadProgram {
        +int id
        +string program_name
        +string institution
        +string city
        +string country
        +number cost
        +string housing_type
        +string location
        +string duration
        +string description
        +datetime created_at
    }

    class ProgramReview {
        +int id
        +int user_id
        +int program_id
        +number rating
        +string review_text
        +datetime date
    }

    class CourseReview {
        +int id
        +int user_id
        +int program_id
        +string course_name
        +string instructor_name
        +number rating
        +string review_text
        +datetime date
    }

    class ProgramHousingReview {
        +int id
        +int user_id
        +int program_id
        +string housing_description
        +number rating
        +string review_text
        +datetime date
    }

    %% ===== PLACE ECOSYSTEM (For Current Students) =====

    class Place {
        +int id
        +string name
        +string category
        +string city
        +string country
        +float latitude
        +float longitude
        +string address
        +string description
        +datetime created_at
    }

    class PlaceReview {
        +int id
        +int user_id
        +int place_id
        +number rating
        +string review_text
        +datetime date
    }

    %% ===== TRIP ECOSYSTEM (For Trip Planning) =====

    class Trip {
        +int id
        +string destination
        +string country
        +string description
        +string trip_type
        +datetime created_at
    }

    class TripReview {
        +int id
        +int user_id
        +int trip_id
        +number rating
        +string review_text
        +datetime date
    }

    %% Relationships - Program Ecosystem
    User "1" -- "*" ProgramReview : writes
    User "1" -- "*" CourseReview : writes
    User "1" -- "*" ProgramHousingReview : writes
    
    StudyAbroadProgram "1" -- "*" ProgramReview : has
    StudyAbroadProgram "1" -- "*" CourseReview : offers
    StudyAbroadProgram "1" -- "*" ProgramHousingReview : provides

    %% Relationships - Place Ecosystem
    User "1" -- "*" PlaceReview : writes
    
    Place "1" -- "*" PlaceReview : has

    %% Relationships - Trip Ecosystem
    User "1" -- "*" TripReview : writes
    
    Trip "1" -- "*" TripReview : has

    %% Notes
    note for Place "Categories: restaurant, activity, museum, housing, etc."
    note for Trip "Trip types: weekend, spring break, summer, etc."
    note for ProgramReview "For prospective students researching programs"
    note for PlaceReview "For current students finding local spots"
    note for TripReview "For students planning trips during study abroad"
```

## Model Separation Strategy

### 📚 Program Ecosystem (Prospective Students)
Used when researching which program to choose:
- **StudyAbroadProgram**: Core program info
- **ProgramReview**: Overall program experience
- **CourseReview**: Academic quality feedback
- **ProgramHousingReview**: Dorm/program-provided housing

### 🗺️ Place Ecosystem (Current Students)
Used when abroad and exploring the city:
- **Place**: Restaurants, activities, museums, independent housing (category-based)
- **PlaceReview**: Reviews of any place (including independent housing)

### ✈️ Trip Ecosystem (Trip Planning)
Used for planning weekend trips, spring break, etc. (independent of program/location):
- **Trip**: Suggested destinations/trips for college students
- **TripReview**: Reviews of trips/destinations

## Key Design Decisions

1. ✅ **Three separate ecosystems** 
   - Program reviews (prospective students researching programs)
   - Place reviews (current students exploring their city)
   - Trip reviews (students planning getaways/trips)
2. ✅ **Housing split** - Program housing (ProgramHousingReview tied to program) vs Independent housing (Place with category="housing")
3. ✅ **Course reviews** - Tied to programs for academic evaluation
4. ✅ **All reviews** - Linked to users for accountability
5. ✅ **Geolocation** - Latitude/longitude for map integration on Places
6. ✅ **Category-based places** - Single Place model with category field (restaurant, activity, housing, etc.) - flexible and simple
7. ✅ **Minimal trip model** - Start simple with destination and reviews, expand later as needed

## To View This Diagram

1. **GitHub/GitLab**: Automatically renders Mermaid
2. **VS Code**: Install "Markdown Preview Mermaid Support" extension
3. **Online**: Copy to [mermaid.live](https://mermaid.live)
4. **Notion/Obsidian**: Native Mermaid support
