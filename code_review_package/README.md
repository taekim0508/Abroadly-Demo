# Abroadly - Backend REST API Code Review

**Team:** Lucas Slater, Gordon Song, Tae Kim, Trey Fisher
**Project:** Abroadly - Peer-Verified Study Abroad Platform  
**Subsystem:** Backend REST API (Programs, Places, Trips)

---

## Package Contents

```
code_review_package/
├── README.md (this file)
├── code_review_documentation.md (convert to PDF for submission)
├── test_suite_documentation.md (convert to PDF for submission)
├── test_api.py (automated test script)
└── source_code/
    └── app/
        ├── models.py (118 lines - Database models)
        ├── programs/routes.py (258 lines - Programs API)
        ├── places/routes.py (162 lines - Places API)
        └── trips/routes.py (154 lines - Trips API)
```

**Total Lines of Code:** 692 lines

---

## Getting Started

### 1. Read the Documentation
- **code_review_documentation.md** - Complete system overview, architecture, API specification, user stories, and design patterns
- **test_suite_documentation.md** - Test procedures, expected behaviors, and test cases

### 2. Review the Source Code
The code is organized by feature in `source_code/app/`:
- `models.py` - All database models (StudyAbroadProgram, Place, Trip, reviews)
- `programs/routes.py` - Complete CRUD API for study abroad programs + reviews
- `places/routes.py` - Complete CRUD API for places + reviews
- `trips/routes.py` - Complete CRUD API for trips + reviews

### 3. Run the Tests
```bash
# Prerequisites: Backend server running on http://localhost:8000
python test_api.py
```

Or use interactive testing via Swagger UI at http://localhost:8000/docs

---

## Tech Stack

- **Framework:** FastAPI (Python 3.11)
- **ORM:** SQLModel (SQLAlchemy + Pydantic)
- **Database:** SQLite (development)
- **Authentication:** JWT cookies (handled externally)

---

## Review Focus Areas

We specifically request feedback on:

1. **Error Handling** - Are all edge cases covered?
2. **Security** - Any vulnerabilities in CRUD operations?
3. **Code Duplication** - The three API files have similar patterns - should we refactor?
4. **Performance** - Are database queries efficient?
5. **API Design** - Are the endpoints intuitive and RESTful?
6. **Testing** - What additional tests would you recommend?

---

## Before Submission

**Convert to PDF:**
1. Open `code_review_documentation.md` in VS Code or any markdown editor
2. Export/convert to `Code_Review_Documentation.pdf`
3. Repeat for `test_suite_documentation.md` → `Test_Suite_Documentation.pdf`

**Or use online tool:** https://www.markdowntopdf.com/

---

## Questions?

Full project repository: https://github.com/slaterlucas/Group14

Thank you for reviewing our code!

