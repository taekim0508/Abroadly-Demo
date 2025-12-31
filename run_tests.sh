#!/bin/bash

# Script to run all tests for Abroadly project
# Sprint 3 - Part 2

echo "======================================"
echo "Abroadly Testing Suite"
echo "Sprint 3 - Part 2"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Backend Tests
echo -e "${BLUE}Running Backend Tests (pytest)...${NC}"
echo "--------------------------------------"

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
elif [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run backend tests with coverage
python -m pytest --cov=app --cov-report=html --cov-report=term-missing

BACKEND_EXIT=$?

if [ $BACKEND_EXIT -eq 0 ]; then
    echo -e "${GREEN}✓ Backend tests passed${NC}"
else
    echo -e "${RED}✗ Backend tests failed${NC}"
fi

echo ""
echo "--------------------------------------"
echo ""

# Frontend Tests
echo -e "${BLUE}Running Frontend Tests (Jest)...${NC}"
echo "--------------------------------------"

cd abroadly
npm run test:coverage

FRONTEND_EXIT=$?

if [ $FRONTEND_EXIT -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend tests passed${NC}"
else
    echo -e "${RED}✗ Frontend tests failed${NC}"
fi

cd ..

echo ""
echo "======================================"
echo "Test Summary"
echo "======================================"

if [ $BACKEND_EXIT -eq 0 ] && [ $FRONTEND_EXIT -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    echo ""
    echo "Coverage Reports:"
    echo "  Backend:  htmlcov/index.html"
    echo "  Frontend: abroadly/coverage/lcov-report/index.html"
    exit 0
else
    echo -e "${RED}Some tests failed${NC}"
    echo "Backend: $([ $BACKEND_EXIT -eq 0 ] && echo 'PASS' || echo 'FAIL')"
    echo "Frontend: $([ $FRONTEND_EXIT -eq 0 ] && echo 'PASS' || echo 'FAIL')"
    exit 1
fi
