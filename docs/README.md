# Documentation

This directory contains all project documentation.

## Contents

- **[API.md](API.md)** - Complete API reference
  - All endpoints with request/response examples
  - Data models and schemas
  - Authentication guide
  - Error handling
  - Frontend integration examples

- **[data_model_diagram.md](data_model_diagram.md)** - Database schema
  - UML diagram showing all models and relationships
  - Three ecosystem design (Programs, Places, Trips)
  - Design decisions and rationale

## Quick Links

- **Interactive API Docs:** http://localhost:8000/docs (Swagger UI)
- **Alternative Docs:** http://localhost:8000/redoc (ReDoc)

## Viewing UML Diagrams

The UML diagram in `data_model_diagram.md` uses Mermaid syntax.

**To view:**
1. **VS Code:** Install [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid)
2. **GitHub:** Renders automatically when pushed
3. **Online:** Copy code to [mermaid.live](https://mermaid.live)

## For Developers

When adding new features:
1. Update the data model diagram if database changes
2. Update API.md with new endpoints
3. Keep examples current with actual implementation
