# Contributors:
# Tae Kim: Seed data creation (3 hrs)
"""
Seed script to populate the database with sample data for development.
Run: uv run python seed_data.py
"""

from sqlmodel import Session, select

from app.db import engine
from app.models import (
    CourseReview,
    Place,
    PlaceReview,
    ProgramHousingReview,
    ProgramReview,
    StudyAbroadProgram,
    Trip,
    TripReview,
    User,
)


def seed_database():
    """Seed the database with sample data."""
    with Session(engine) as session:
        # Check if data already exists
        existing_programs = session.exec(select(StudyAbroadProgram)).first()
        if existing_programs:
            print("Database already has data. Skipping seed.")
            return

        print("Seeding database with sample data...")

        # Create sample users
        users = [
            User(email="alice@vanderbilt.edu"),
            User(email="bob@stanford.edu"),
            User(email="carol@duke.edu"),
        ]
        for user in users:
            session.add(user)
        session.commit()
        print(f"✓ Created {len(users)} users")

        # Create sample programs
        programs = [
            StudyAbroadProgram(
                program_name="Oxford Summer Program",
                institution="University of Oxford",
                city="Oxford",
                country="United Kingdom",
                cost=8500.00,
                housing_type="College dormitory",
                location="City center",
                duration="8 weeks",
                description=(
                    "Intensive summer program in various subjects at one of "
                    "the world's most prestigious universities. Experience "
                    "tutorial-style learning and explore historic Oxford."
                ),
            ),
            StudyAbroadProgram(
                program_name="Barcelona Business Semester",
                institution="ESADE Business School",
                city="Barcelona",
                country="Spain",
                cost=12000.00,
                housing_type="Apartment",
                location="Near Sagrada Familia",
                duration="1 semester",
                description=(
                    "Study international business in the heart of Barcelona. "
                    "Network with global companies and experience "
                    "Mediterranean culture."
                ),
            ),
            StudyAbroadProgram(
                program_name="Tokyo Tech Exchange",
                institution="Tokyo Institute of Technology",
                city="Tokyo",
                country="Japan",
                cost=15000.00,
                housing_type="Student residence",
                location="Ookayama campus",
                duration="1 year",
                description=(
                    "Year-long engineering exchange program. Study "
                    "cutting-edge technology while immersing yourself in "
                    "Japanese culture."
                ),
            ),
            StudyAbroadProgram(
                program_name="Paris Arts Semester",
                institution="Sorbonne University",
                city="Paris",
                country="France",
                cost=11000.00,
                housing_type="Host family",
                location="Latin Quarter",
                duration="1 semester",
                description=(
                    "Study art history, literature, and French language in "
                    "the cultural capital of the world."
                ),
            ),
            StudyAbroadProgram(
                program_name="Sydney Marine Biology",
                institution="University of Sydney",
                city="Sydney",
                country="Australia",
                cost=14000.00,
                housing_type="On-campus housing",
                location="Camperdown campus",
                duration="1 semester",
                description=(
                    "Explore marine ecosystems and conservation at "
                    "world-class facilities near the Great Barrier Reef."
                ),
            ),
        ]
        for program in programs:
            session.add(program)
        session.commit()
        print(f"✓ Created {len(programs)} programs")

        # Create program reviews
        program_reviews = [
            ProgramReview(
                user_id=users[0].id,
                program_id=programs[0].id,
                rating=5,
                review_text=(
                    "Amazing experience! The tutorial system at Oxford is "
                    "incredible. I learned more in 8 weeks than I thought "
                    "possible."
                ),
            ),
            ProgramReview(
                user_id=users[1].id,
                program_id=programs[0].id,
                rating=4,
                review_text=(
                    "Great program but quite expensive. The academic "
                    "experience was top-notch though."
                ),
            ),
            ProgramReview(
                user_id=users[0].id,
                program_id=programs[1].id,
                rating=5,
                review_text=(
                    "Barcelona was incredible! Perfect mix of academics and cultural experience."
                ),
            ),
            ProgramReview(
                user_id=users[2].id,
                program_id=programs[2].id,
                rating=4,
                review_text=("Challenging but rewarding. Tokyo is an amazing city to live in."),
            ),
        ]
        for review in program_reviews:
            session.add(review)
        session.commit()
        print(f"✓ Created {len(program_reviews)} program reviews")

        # Create course reviews
        course_reviews = [
            CourseReview(
                user_id=users[0].id,
                program_id=programs[0].id,
                course_name="British Literature",
                instructor_name="Dr. Smith",
                rating=5,
                review_text=(
                    "Dr. Smith's passion for literature is infectious. Small "
                    "class size allowed for great discussions."
                ),
            ),
            CourseReview(
                user_id=users[1].id,
                program_id=programs[1].id,
                course_name="International Marketing",
                instructor_name="Prof. Garcia",
                rating=4,
                review_text=(
                    "Very practical course with real case studies from European companies."
                ),
            ),
        ]
        for review in course_reviews:
            session.add(review)
        session.commit()
        print(f"✓ Created {len(course_reviews)} course reviews")

        # Create housing reviews
        housing_reviews = [
            ProgramHousingReview(
                user_id=users[0].id,
                program_id=programs[0].id,
                housing_description="College dormitory with shared bathrooms",
                rating=4,
                review_text=(
                    "Historic building with lots of character. Rooms are "
                    "small but adequate. Great location on campus."
                ),
            ),
            ProgramHousingReview(
                user_id=users[0].id,
                program_id=programs[1].id,
                housing_description="Shared apartment with other students",
                rating=5,
                review_text=(
                    "Perfect location near the beach and metro. Apartment was modern and clean."
                ),
            ),
        ]
        for review in housing_reviews:
            session.add(review)
        session.commit()
        print(f"✓ Created {len(housing_reviews)} housing reviews")

        # Create places
        places = [
            Place(
                name="The Eagle and Child",
                category="restaurant",
                city="Oxford",
                country="United Kingdom",
                latitude=51.7548,
                longitude=-1.2582,
                address="49 St Giles', Oxford OX1 3LU",
                description=(
                    "Historic pub where C.S. Lewis and J.R.R. Tolkien met. "
                    "Traditional British food and great atmosphere."
                ),
            ),
            Place(
                name="Bodleian Library",
                category="museum",
                city="Oxford",
                country="United Kingdom",
                latitude=51.7539,
                longitude=-1.2543,
                address="Broad St, Oxford OX1 3BG",
                description=(
                    "One of the oldest libraries in Europe. Stunning "
                    "architecture and a must-visit for any student."
                ),
            ),
            Place(
                name="Bar Marsella",
                category="nightlife",
                city="Barcelona",
                country="Spain",
                latitude=41.3785,
                longitude=2.1738,
                address="Carrer de Sant Pau, 65, Barcelona",
                description=(
                    "Iconic bar established in 1820. Famous for absenta and bohemian atmosphere."
                ),
            ),
            Place(
                name="Park Güell",
                category="activity",
                city="Barcelona",
                country="Spain",
                latitude=41.4145,
                longitude=2.1527,
                address="Carrer d'Olot, Barcelona",
                description=(
                    "Gaudí's magical park with amazing views of the city. "
                    "Get there early to avoid crowds."
                ),
            ),
            Place(
                name="Shibuya Crossing Cafe",
                category="cafe",
                city="Tokyo",
                country="Japan",
                latitude=35.6595,
                longitude=139.7004,
                address="2 Chome-1 Dogenzaka, Shibuya City",
                description=(
                    "Watch the world's busiest crossing while enjoying amazing matcha lattes."
                ),
            ),
            Place(
                name="teamLab Borderless",
                category="museum",
                city="Tokyo",
                country="Japan",
                latitude=35.6274,
                longitude=139.7756,
                address="Azabudai Hills, Minato City",
                description=(
                    "Mind-blowing digital art museum. A completely immersive "
                    "experience unlike anything else."
                ),
            ),
        ]
        for place in places:
            session.add(place)
        session.commit()
        print(f"✓ Created {len(places)} places")

        # Create place reviews
        place_reviews = [
            PlaceReview(
                user_id=users[0].id,
                place_id=places[0].id,
                rating=5,
                review_text=(
                    "Must visit! The fish and chips are excellent and the history is amazing."
                ),
            ),
            PlaceReview(
                user_id=users[1].id,
                place_id=places[0].id,
                rating=4,
                review_text=("Great atmosphere but can get crowded. Go during off-peak hours."),
            ),
            PlaceReview(
                user_id=users[0].id,
                place_id=places[2].id,
                rating=5,
                review_text=("So authentic! Loved the vibe and the drinks are strong."),
            ),
            PlaceReview(
                user_id=users[2].id,
                place_id=places[5].id,
                rating=5,
                review_text=(
                    "Absolutely incredible! Book tickets in advance. Plan to spend 2-3 hours."
                ),
            ),
        ]
        for review in place_reviews:
            session.add(review)
        session.commit()
        print(f"✓ Created {len(place_reviews)} place reviews")

        # Create trips
        trips = [
            Trip(
                destination="Amsterdam",
                country="Netherlands",
                description=(
                    "Perfect weekend getaway from London. Explore the canals, "
                    "visit world-class museums, and experience the vibrant nightlife."
                ),
                trip_type="weekend",
            ),
            Trip(
                destination="Prague",
                country="Czech Republic",
                description=(
                    "Beautiful historic city with stunning architecture. "
                    "Great for a 3-4 day trip with affordable prices."
                ),
                trip_type="spring break",
            ),
            Trip(
                destination="Santorini",
                country="Greece",
                description=(
                    "Breathtaking sunsets and crystal clear waters. "
                    "Perfect for a romantic getaway or solo adventure."
                ),
                trip_type="summer",
            ),
            Trip(
                destination="Interlaken",
                country="Switzerland",
                description=(
                    "Adventure capital of Switzerland. Perfect for hiking, "
                    "paragliding, and exploring the Swiss Alps."
                ),
                trip_type="weekend",
            ),
        ]
        for trip in trips:
            session.add(trip)
        session.commit()
        print(f"✓ Created {len(trips)} trips")

        # Create trip reviews
        trip_reviews = [
            TripReview(
                user_id=users[0].id,
                trip_id=trips[0].id,
                rating=5,
                review_text=(
                    "Amazing weekend! The Anne Frank House was incredibly moving, "
                    "and the canal tour was perfect for seeing the city."
                ),
            ),
            TripReview(
                user_id=users[1].id,
                trip_id=trips[1].id,
                rating=4,
                review_text=(
                    "Prague is absolutely beautiful. The Charles Bridge at sunset "
                    "is a must-see. Food and drinks are very affordable."
                ),
            ),
            TripReview(
                user_id=users[2].id,
                trip_id=trips[2].id,
                rating=5,
                review_text=(
                    "Santorini exceeded all expectations. The sunsets in Oia "
                    "are truly magical. Book accommodation early!"
                ),
            ),
        ]
        for review in trip_reviews:
            session.add(review)
        session.commit()
        print(f"✓ Created {len(trip_reviews)} trip reviews")

        print("\n✅ Database seeded successfully!")
        print("Created:")
        print(f"  - {len(users)} users")
        print(f"  - {len(programs)} programs")
        print(f"  - {len(program_reviews)} program reviews")
        print(f"  - {len(course_reviews)} course reviews")
        print(f"  - {len(housing_reviews)} housing reviews")
        print(f"  - {len(places)} places")
        print(f"  - {len(place_reviews)} place reviews")
        print(f"  - {len(trips)} trips")
        print(f"  - {len(trip_reviews)} trip reviews")


if __name__ == "__main__":
    seed_database()
