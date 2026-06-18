# SARANGI CONSULTING DIGITAL PLATFORM

## MASTER PROJECT CONSTITUTION (MPC)

### Version 1.0

---

# PROJECT ID

SARANGI-DCP-2026

DCP = Digital Consulting Platform

---

# PROJECT MISSION

Build a world-class Growth & Management Consulting Platform for Sarangi Consulting that combines:

* Premium consulting firm positioning
* Enterprise-grade architecture
* AI-powered business intelligence
* Lead generation systems
* CRM capabilities
* Knowledge management
* Consulting workflow automation

The platform must feel closer to:

* McKinsey
* BCG
* Bain
* Deloitte Digital

than a traditional corporate website.

The final product must not resemble:

* Freelancer portfolios
* Startup templates
* Generic agency websites
* Student projects

The experience should communicate:

* Authority
* Strategic thinking
* Trust
* Professionalism
* Business transformation
* Institutional strength

---

# BRAND SYSTEM

Parent Brand:
Sarangi Group

Current Business Unit:
Sarangi Consulting

Tagline:
STRATEGY THAT SCALES.

Primary Color:
#14532D

Text:
#FFFFFF

Accent:
#0D0D0D

Design Principles:

* Executive
* Minimal
* Premium
* Structured
* Data-driven
* Calm confidence

Avoid:

* Neon colors
* Startup aesthetics
* Excessive gradients
* Visual clutter
* Trendy gimmicks

---

# PROJECT OBJECTIVES

Primary Objectives:

1. Generate qualified consulting leads
2. Build consulting authority
3. Convert visitors into discovery calls
4. Automate consulting workflows
5. Create a scalable consulting ecosystem

Secondary Objectives:

1. Knowledge publishing
2. AI-powered consulting assistance
3. Internal operational efficiency
4. Data-driven decision making

---

# DEVELOPMENT RULES

RULE 1

Never create code without documentation.

RULE 2

Every module requires:

* PRD
* TRD
* API documentation
* Database documentation

RULE 3

No duplicate business logic.

RULE 4

No duplicate API endpoints.

RULE 5

No hardcoded values.

RULE 6

No direct database access from UI.

RULE 7

All features must be reusable.

RULE 8

Everything must be scalable.

RULE 9

Everything must be secured.

RULE 10

Everything must be testable.

---

# DOCUMENTATION TO GENERATE

Create:

/docs

PRD.md
TRD.md
ARCHITECTURE.md
DATABASE.md
API_SPEC.md
SECURITY.md
AI_SYSTEM.md
DEPLOYMENT.md
WORKFLOW.md
TEAM_GUIDELINES.md
CONTRIBUTING.md
UI_SYSTEM.md

Each file must be detailed and enterprise level.

---

# REQUIRED MODULES

MODULE 01

Public Website

Contains:

Home
About
Services
Industries
Insights
Case Studies
Startup Advisory
Contact

Purpose:

Lead generation

---

MODULE 02

Lead Intelligence System

Purpose:

Capture and qualify leads

Features:

Lead forms
Assessments
Downloads
Call bookings
Newsletter

---

MODULE 03

CRM

Purpose:

Manage consulting opportunities

Features:

Lead pipeline
Lead scoring
Lead status tracking
Follow-ups
Notes
Activities

---

MODULE 04

Booking System

Features:

Discovery calls
Advisory sessions
Calendar integration
Notifications

---

MODULE 05

Assessment Engine

Features:

Business assessment
Growth assessment
Operational maturity assessment

Outputs:

Scores
Recommendations
Reports

---

MODULE 06

Knowledge Center

Features:

Articles
Insights
Research reports
Frameworks
Resources

---

MODULE 07

Proposal Generator

Features:

Proposal drafting
Scope creation
Pricing generation
PDF export

---

MODULE 08

Analytics Platform

Features:

Traffic analytics
Lead analytics
Conversion analytics
Business intelligence

---

MODULE 09

AI Consulting Layer

Features:

AI Advisor
AI Diagnosis
AI Recommendations
Meeting Intelligence
Proposal Assistance

---

MODULE 10

Administration Platform

Features:

Role management
User management
Permissions
Audit logs
System settings

---

# AI SYSTEM REQUIREMENTS

Create separate service:

apps/ai-engine

Modules:

chatbot/
recommendation/
proposal-generator/
lead-scoring/
assessment-analysis/
meeting-intelligence/
knowledge-search/

Architecture:

RAG-Based

Knowledge Sources:

Company Profile
Services Brochure
Case Studies
Insights
Frameworks
Research Reports

Vector Database:

Qdrant

or

Pinecone

---

# RECOMMENDATION ENGINE

Inputs:

Industry
Revenue
Employees
Growth Stage
Challenges

Outputs:

Recommended Service
Priority Issues
Consulting Package
Growth Opportunities

---

# LEAD SCORING ENGINE

Inputs:

Revenue
Industry
Engagement
Downloads
Bookings
Assessment Scores

Output:

0-100 Lead Score

Classification:

Cold
Warm
Hot
Qualified

---

# ASSESSMENT ENGINE

Assessment Types:

Business Health
Growth Readiness
Digital Readiness
Operational Excellence

Outputs:

Scores
Benchmarks
Recommendations
Action Plans

---

# SECURITY REQUIREMENTS

Mandatory:

JWT Authentication

Refresh Tokens

Role Based Access Control

2FA

Password Hashing:

Argon2

Rate Limiting

Input Validation

CSRF Protection

CORS Protection

Audit Logs

Security Logs

Encrypted Secrets

Database Backups

File Scanning

Activity Monitoring

Session Management

---

# DATABASE REQUIREMENTS

Use PostgreSQL

Generate:

ER Diagram

Data Dictionary

Migration Plan

Seed Data Plan

Backup Strategy

Disaster Recovery Strategy

Core Tables:

users
roles
permissions

leads
lead_scores
lead_notes

appointments

services
industries

articles
categories
tags

resources

case_studies

assessments
questions
responses

recommendations

ai_conversations

events

audit_logs

security_logs

---

# FILE STRUCTURE REQUIREMENTS

Use Feature Driven Architecture

apps/

web/
admin/
ai-engine/

shared/

ui/
types/
constants/
utils/

infrastructure/

database/
docker/
terraform/

docs/

tests/

scripts/

---

# UI REQUIREMENTS

Design Style:

Executive Consulting

Reference:

McKinsey
BCG
Bain

Requirements:

Glassmorphism only where appropriate

Smooth animations

Framer Motion

Excellent typography

High readability

Strong whitespace

Premium layouts

Mobile first

Accessibility compliant

WCAG standards

---

# TESTING REQUIREMENTS

Unit Tests

Integration Tests

API Tests

Security Tests

Performance Tests

Accessibility Tests

E2E Tests

Coverage Target:

80%+

---

# DEVOPS REQUIREMENTS

Frontend:

Next.js

Backend:

NestJS

Database:

PostgreSQL

ORM:

Prisma

Cache:

Redis

Queue:

BullMQ

Storage:

AWS S3

Search:

Meilisearch

Monitoring:

Grafana
Prometheus
Sentry

Deployment:

Vercel
Docker
GitHub Actions

---

# TEAM WORK RULES

Every task requires:

Requirement
Design
Implementation
Review
Testing
Documentation

No direct pushes to main branch.

Workflow:

main

develop

feature/*

hotfix/*

release/*

Mandatory Pull Requests

Mandatory Code Reviews

Mandatory Documentation Updates

---

# AGENT EXECUTION INSTRUCTIONS

Before coding:

1. Read all project documentation.
2. Build architecture first.
3. Generate database design.
4. Generate API contracts.
5. Generate UI system.
6. Generate implementation roadmap.
7. Generate milestones.
8. Generate testing strategy.

Only then begin development.

Never skip planning.

Never generate temporary architecture.

Always optimize for:

Scalability
Maintainability
Security
Performance
Reusability

The platform must be capable of supporting future expansion into:

Sarangi Group
Sarangi Technologies
Sarangi Foundation

without requiring a full rewrite.

END OF MASTER PROJECT CONSTITUTION
