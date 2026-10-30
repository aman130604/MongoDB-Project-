# Master Prompt for ChatGPT: Academic Project Report Generation

Copy and paste the entire prompt below directly into ChatGPT (GPT-4o or ChatGPT Plus recommended).

```markdown
Act as a Senior Academic Technical Writer and Professor of Computer Science. I need you to generate a complete, rigorous, professional, and exhaustive Academic Project Report for my college submission at Lovely Professional University (LPU).

Follow the exact academic structure, formal tone, formatting conventions, tables, and depth of the standard LPU Capstone Project Report format. Do NOT use lazy placeholders, do NOT omit sections, and write complete, well-reasoned technical paragraphs and tables.

Here are all the verified project details, database specifications, empirical data, and system facts you must use:

================================================================================
1. PROJECT & ACADEMIC METADATA
================================================================================
- Project Title: Expense Analytics — Intelligent MongoDB-Based Personal Expense Tracking and Analytics System
- Student Name: Shivam Yadav
- Registration Number: 12300763
- Project Type: Individual Project (No Group)
- Course Name: Intelligent NoSQL Databases
- Course Code: CSE494
- Faculty Mentor / Guide: Anoop Kumar, Assistant Professor
- Department / School: School of Computer Science and Engineering
- Institution: Lovely Professional University, Phagwara, Punjab — 144411
- Academic Term: August – December 2026
- Submission Date: 8th October 2026

================================================================================
2. TECHNOLOGY STACK & ARCHITECTURE
================================================================================
- Architecture: 3-Tier Decoupled Client-Server Architecture:
  React 19 Frontend (SPA) ---> Flask REST API (Python) ---> PyMongo ---> MongoDB 6.0+ (NoSQL)
- Frontend: React 19, Vite 7, Recharts (Bar, Pie/Donut, Area charts), Lucide Icons, Pure Custom Vanilla CSS Design System with CSS variables and responsive design, Google Fonts (Plus Jakarta Sans).
- Backend: Python 3.10+, Flask 3.1.2, PyMongo 4.15.1, Flask-CORS 6.0.1, python-dotenv 1.1.1.
- Database: MongoDB 6.0+ Community Edition / Atlas, Database Name: `expense_analytics`, Collection: `expenses`.
- Server-side Schema Validator: Collection-level `$jsonSchema` with strict validation and error action.

================================================================================
3. DATABASE SCHEMA & VALIDATION RULES (mongodb/schema_validation.js)
================================================================================
The `expenses` collection enforces the following strict BSON schema:
- `_id`: ObjectId (System generated unique identifier)
- `user_id`: String (required, minLength: 1, e.g. "STU001")
- `amount`: Number [double, int, long, decimal] (required, minimum: 0.01)
- `category`: String Enum (required, one of: 'Food', 'Transport', 'Shopping', 'Bills', 'Education', 'Entertainment', 'Healthcare', 'Other')
- `description`: String (required, minLength: 1)
- `payment_method`: String Enum (required, one of: 'Cash', 'UPI', 'Credit Card', 'Debit Card')
- `date`: BSON Date (required, transaction date)
- `merchant`: String (optional, e.g. "Campus Cafe", "Jio")
- `tags`: Array of Strings (optional, e.g. ["food", "college"])
- `created_at`: BSON Date (optional, timestamp of creation)

Validation level: 'strict', validation action: 'error'.

================================================================================
4. EXACT EMPIRICAL ANALYTICS (BASED ON 41 SEEDED REAL-WORLD TRANSACTIONS)
================================================================================
Use these exact mathematical values in the report tables and discussion:
- Total Expenditure: ₹20,808.00
- Total Number of Transactions: 41
- Average Expense per Transaction: ₹507.51
- Highest Spending Category: Bills (₹5,000.00 / 24.03%)

Categorical Breakdown (8 Categories):
1. Bills: ₹5,000.00 (24.03%) [Merchants: Jio, PowerGrid, HomePay]
2. Shopping: ₹3,710.00 (17.83%) [Merchants: StyleHub, TechMart]
3. Food: ₹3,630.00 (17.45%) [Merchants: Campus Cafe, FoodExpress, FreshMart]
4. Education: ₹3,250.00 (15.62%) [Merchants: LearnPro, BookWorld]
5. Entertainment: ₹1,958.00 (9.41%) [Merchants: StreamFlix, CineMax, BookMyShow]
6. Transport: ₹1,430.00 (6.87%) [Merchants: City Auto, Metro, QuickCab, HP Fuel]
7. Healthcare: ₹1,350.00 (6.49%) [Merchants: WellCare Pharmacy, WellCare Clinic]
8. Other: ₹480.00 (2.31%) [Merchants: Local Store]
Total: ₹20,808.00 (100.00%)

Payment Method Breakdown (4 Channels):
1. UPI: ₹11,788.00 (56.65%)
2. Debit Card: ₹3,270.00 (15.72%)
3. Credit Card: ₹2,970.00 (14.27%)
4. Cash: ₹2,780.00 (13.36%)

Monthly Expenditure Trajectory (July–September 2026):
- July 2026 (2026-07): ₹5,789.00 (Semester start supplies, books)
- August 2026 (2026-08): ₹7,440.00 (+28.5% increase due to tuition/exam materials)
- September 2026 (2026-09): ₹7,579.00 (+1.9% sustained spend on rent, tech accessories)

Top 5 Merchants Leaderboard:
1. StyleHub: ₹3,060.00 (4 transactions)
2. Jio: ₹2,200.00 (2 transactions)
3. LearnPro: ₹1,700.00 (2 transactions)
4. BookWorld: ₹1,550.00 (2 transactions)
5. FoodExpress: ₹1,490.00 (4 transactions)

================================================================================
5. CORE MONGODB AGGREGATION PIPELINES (PyMongo & mongosh)
================================================================================
1. Overall Summary Pipeline:
   db.expenses.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, average: { $avg: '$amount' }, count: { $sum: 1 } } }])
2. Category Breakdown Pipeline:
   db.expenses.aggregate([{ $group: { _id: '$category', total: { $sum: '$amount' } } }, { $sort: { total: -1 } }])
3. Monthly Trend Pipeline:
   db.expenses.aggregate([{ $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, total: { $sum: '$amount' } } }, { $sort: { _id: 1 } }])
4. Payment Method Pipeline:
   db.expenses.aggregate([{ $group: { _id: '$payment_method', total: { $sum: '$amount' } } }, { $sort: { total: -1 } }])
5. Highest Category Pipeline:
   db.expenses.aggregate([{ $group: { _id: '$category', total: { $sum: '$amount' } } }, { $sort: { total: -1 } }, { $limit: 1 }])
6. Top Merchants Pipeline:
   db.expenses.aggregate([{ $match: { merchant: { $nin: [null, ''] } } }, { $group: { _id: '$merchant', total: { $sum: '$amount' }, transactions: { $sum: 1 } } }, { $sort: { total: -1 } }, { $limit: 5 }])
7. Daily Spending Trend Pipeline:
   db.expenses.aggregate([{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, total: { $sum: '$amount' } } }, { $sort: { _id: 1 } }])

================================================================================
6. REST API ROUTES SPECIFICATION
================================================================================
- GET /api/health -> Health ping to MongoDB client
- GET /api/expenses -> Multi-filter retrieval (category, payment_method, month, search regex)
- GET /api/expenses/<id> -> Retrieve single document by ObjectId
- POST /api/expenses -> Insert validated document (HTTP 201)
- PUT /api/expenses/<id> -> Update existing document (HTTP 200)
- DELETE /api/expenses/<id> -> Delete document (HTTP 200)
- GET /api/analytics/summary -> Returns total, avg, count, highest category
- GET /api/analytics/categories -> Returns category breakdown array
- GET /api/analytics/monthly -> Returns monthly aggregation array
- GET /api/analytics/payment-methods -> Returns payment channel array
- GET /api/analytics/top-merchants -> Returns top 5 merchants
- GET /api/analytics/trends -> Returns daily trend array

================================================================================
7. REPORT STRUCTURE TO GENERATE (WRITE EVERY SECTION THOROUGHLY):
================================================================================
Generate the full report with the following detailed sections:
1. TITLE PAGE (Lovely Professional University, School of Computer Science & Engineering, Title, Student Name & Reg No, Mentor Name & Designation, Submission Term)
2. DECLARATION (Formal declaration signed by Shivam Yadav)
3. CERTIFICATE (Formal certificate signed by Assistant Professor Anoop Kumar)
4. ACKNOWLEDGEMENT (Recognizing mentor, department, open-source community)
5. ABSTRACT (Comprehensive technical abstract summarizing problem, NoSQL architecture, validation, aggregation, and empirical results)
6. TABLE OF CONTENTS
7. CHAPTER 1: INTRODUCTION
   - 1.1 Background of the Study (Student financial ecosystem, digital payment friction, cognitive disengagement from spending)
   - 1.2 Motivation (Relational RDBMS bottlenecks vs. MongoDB flexible BSON document model and native aggregation engine)
   - 1.3 Problem Statement
   - 1.4 Objectives (5 clear, measurable engineering objectives)
   - 1.5 Overview of the Proposed System (3-tier architecture: React + Vite, Flask, PyMongo, MongoDB)
   - 1.6 Scope and Limitations (In-scope features vs. academic boundaries like lack of live banking APIs)
8. CHAPTER 2: PROFILE OF THE PROBLEM
   - 2.1 Problem Analysis & Real-World Context
   - 2.2 Rationale & Scope of the Study (Technical justification for NoSQL & $jsonSchema)
9. CHAPTER 3: EXISTING SYSTEM & COMPARATIVE ANALYSIS
   - 3.1 Review of Existing Platforms (Spreadsheets, Splitwise, Commercial apps like Walnut/Mint)
   - 3.2 System Architecture Comparison Table (Excel vs. Walnut vs. Expense Analytics)
   - 3.3 What Is New in This System (Database-level validation, native aggregations, privacy, zero licensing cost)
10. CHAPTER 4: PROBLEM ANALYSIS & FEASIBILITY STUDY
    - 4.1 Product Definition
    - 4.2 Feasibility Analysis (Technical, Operational, Economic)
    - 4.3 Risk Analysis & Mitigation (Table with 7 risks: invalid payloads, connection drops, ObjectId errors, etc.)
    - 4.4 Project Plan (5 Agile phases from requirements to testing)
11. CHAPTER 5: SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
    - 5.1 Functional Requirements Table (FR1 to FR12 with Priority: Critical/High/Medium)
    - 5.2 Non-Functional Requirements Table (NFR1 to NFR8: Performance, Security, Reliability, Usability, Maintainability)
    - 5.3 General Description (Product perspective, user characteristics, constraints)
12. CHAPTER 6: SYSTEM DESIGN & ARCHITECTURE
    - 6.1 Three-Tier System Architecture (Detailed narrative & ASCII/Mermaid diagram)
    - 6.2 Database Design & Schema (BSON document structure & $jsonSchema definition)
    - 6.3 Complete API Route Specification Table
    - 6.4 Data Flow Diagrams (Context Level 0 DFD and Level 1 DFD)
    - 6.5 Pseudocode & Algorithms (Algorithm 1: Validated Insertion; Algorithm 2: Dynamic Filter Query Builder; Algorithm 3: Aggregation Execution)
13. CHAPTER 7: TESTING METHODOLOGY & VERIFICATION
    - 7.1 Functional Test Results Summary Table (14 test cases: TC-01 to TC-14, with Test Scenario, Input, Expected, Actual, Status: PASS)
    - 7.2 Structural Code Coverage Table (Controllers, validation, database, UI components)
    - 7.3 Levels of Testing (Unit, Integration, End-to-End, and Usability testing)
    - 7.4 Usability Testing & SUS Score (System Usability Scale score of 84.5 / 100 - Grade A)
14. CHAPTER 8: IMPLEMENTATION, DEPLOYMENT & RESULTS
    - 8.1 Production Deployment Configuration Table
    - 8.2 Results vs. Requirements Table (CRUD response times < 30ms, aggregation < 15ms)
    - 8.3 In-Depth Analysis of Query Outputs (Detailed discussion of the 41-transaction dataset: Categories, Payment Methods, Monthly Spends, Top Merchants)
15. CHAPTER 9: PROJECT LEGACY & FUTURE ENHANCEMENTS
    - 9.1 Current Status of the Project
    - 9.2 Limitations & Future Scope (JWT Multi-tenant Auth, OCR Receipt Scanning, Predictive Budget Warnings)
    - 9.3 Technical & Managerial Lessons Learnt
16. CHAPTER 10: USER MANUAL & INSTALLATION GUIDE
    - 10.1 System Requirements (Client & Server)
    - 10.2 Step-by-Step Installation Commands (MongoDB, Python backend, React frontend)
    - 10.3 User Operation Instructions (Dashboard, Transactions filtering, Modal creation)
17. CHAPTER 11: SELECTED SOURCE CODE LISTINGS
    - Listing 1: mongodb/schema_validation.js
    - Listing 2: backend/database.py
    - Listing 3: backend/app.py (CRUD & Aggregation controllers)
    - Listing 4: frontend/src/services/api.js
18. CHAPTER 12: REFERENCES & BIBLIOGRAPHY
    - 12+ formal academic citations (IEEE/APA format) covering MongoDB, PyMongo, Flask, React, NoSQL databases, and UGC financial wellness advisories.

Begin generating the complete report now. Maintain strict academic rigor and exhaustive detail throughout.
```
