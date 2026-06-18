# ARCHITECTURE.md

# Sarangi Consulting Digital Platform

## System Architecture Document

### Version 1.0

---

# DOCUMENT PURPOSE

This document defines the complete architecture of the Sarangi Consulting Digital Platform (SDCP).

It serves as the single source of truth for:

* Software Architecture
* Infrastructure Design
* Module Relationships
* Service Communication
* Data Flow
* AI Architecture
* Security Architecture
* Scalability Planning
* Future Expansion

The platform must be designed as an enterprise-grade consulting operating system rather than a traditional business website.

---

# SYSTEM VISION

Sarangi Consulting Digital Platform is designed to become:

* Lead Generation Engine
* Consulting CRM
* Knowledge Platform
* AI Consulting Assistant
* Business Assessment System
* Proposal Management Platform
* Analytics Hub
* Future Multi-Company Ecosystem

The architecture must support future expansion into:

* Sarangi Group
* Sarangi Consulting
* Sarangi Technologies
* Sarangi Foundation

Without major architectural changes.

---

# HIGH LEVEL ARCHITECTURE

```
                Users
                   │
                   ▼
          Presentation Layer
                   │
                   ▼
             API Gateway
                   │
  ┌────────────────────────────────┐
  │                                │
  ▼                                ▼
```

Core Business Services          AI Services

```
  │                                │

  └──────────────┬─────────────────┘
                 │
                 ▼

          Data Layer

                 │

  ┌──────────────┴──────────────┐
  ▼                             ▼
```

PostgreSQL                   Vector Database

```
                 │

                 ▼

       Analytics Layer

                 │

                 ▼

       Monitoring Layer
```

---

# ARCHITECTURAL PRINCIPLES

1. Modular Architecture

Each module must be independent.

2. Feature Driven Development

Organize by business features.

3. API First Design

Every functionality exposed through APIs.

4. Security First

Every module secured by default.

5. Scalability First

System must scale horizontally.

6. Cloud Native

Deployment-ready for cloud infrastructure.

7. AI Ready

Architecture prepared for AI expansion.

8. Maintainability

Easy onboarding of future developers.

---

# APPLICATION LAYERS

LAYER 1

Presentation Layer

Responsibilities:

User Interface

Forms

Navigation

Client-side validation

Data visualization

Technologies:

Next.js

TypeScript

Tailwind CSS

Framer Motion

---

LAYER 2

API Layer

Responsibilities:

Request routing

Authentication

Authorization

Validation

Rate limiting

Response formatting

Technologies:

NestJS

Express Adapter

---

LAYER 3

Business Layer

Responsibilities:

Business rules

Workflow management

Decision logic

Data orchestration

Feature execution

Examples:

Lead Scoring

Proposal Generation

Assessment Analysis

Booking Workflow

---

LAYER 4

AI Layer

Responsibilities:

Recommendations

Chatbot

Proposal Assistance

Knowledge Search

Meeting Intelligence

Assessment Analysis

Technologies:

OpenAI

Claude

Gemini

LangChain

LlamaIndex

---

LAYER 5

Data Layer

Responsibilities:

Persistent storage

Relationships

Queries

Indexing

Transactions

Technologies:

PostgreSQL

Prisma ORM

Redis Cache

---

LAYER 6

Analytics Layer

Responsibilities:

Event Tracking

Behavior Analysis

Lead Analytics

Conversion Tracking

Performance Metrics

---

# SYSTEM MODULES

MODULE 01

Website Platform

Purpose:

Corporate presence

Lead generation

SEO

Knowledge publishing

Submodules:

Home

About

Services

Industries

Insights

Case Studies

Resources

Contact

Startup Advisory

---

MODULE 02

Lead Intelligence Platform

Purpose:

Lead acquisition

Lead qualification

Lead scoring

Lead tracking

Submodules:

Lead Capture

Lead Pipeline

Lead Scoring

Lead Activity

Lead History

---

MODULE 03

Booking Management

Purpose:

Appointment scheduling

Submodules:

Discovery Calls

Startup Advisory

Availability

Calendar Integration

Notifications

Rescheduling

Cancellation

---

MODULE 04

Assessment Engine

Purpose:

Business diagnosis

Submodules:

Question Engine

Scoring Engine

Benchmark Engine

Recommendation Engine

Report Generator

Assessment Types:

Business Health

Growth Readiness

Operational Excellence

Digital Readiness

---

MODULE 05

Knowledge Management System

Purpose:

Authority building

Submodules:

Articles

Research Reports

Case Studies

Resources

Frameworks

Categories

Tags

Search

---

MODULE 06

Proposal Management System

Purpose:

Consulting proposal generation

Submodules:

Proposal Drafting

PDF Export

Version History

Templates

Client Proposals

Approval Flow

---

MODULE 07

Analytics Platform

Purpose:

Data-driven decisions

Submodules:

Traffic Analytics

Lead Analytics

Conversion Analytics

Content Analytics

Service Analytics

---

MODULE 08

Administration Platform

Purpose:

Operational control

Submodules:

Dashboard

User Management

Role Management

Permissions

Audit Logs

Settings

---

# AI ARCHITECTURE

AI is isolated from the core platform.

Directory:

apps/ai-engine

Reason:

Independent scaling

Independent deployment

Independent upgrades

Reduced complexity

---

AI SERVICES

AI Advisor

Purpose:

Website assistant

Capabilities:

Answer questions

Recommend services

Guide visitors

Generate leads

---

Recommendation Engine

Purpose:

Consulting recommendations

Input:

Industry

Revenue

Employees

Business Challenges

Output:

Recommended Service

Growth Opportunities

Consulting Plan

---

Assessment Analysis Engine

Purpose:

Analyze business assessments

Input:

Assessment Responses

Output:

Business Diagnosis

Scores

Recommendations

Action Plan

---

Lead Intelligence Engine

Purpose:

Lead qualification

Input:

Lead profile

Behavioral data

Output:

Lead score

Priority ranking

Qualification status

---

Proposal Assistant

Purpose:

Proposal drafting

Input:

Industry

Challenges

Scope

Output:

Proposal draft

Scope recommendations

Timeline suggestions

---

Meeting Intelligence

Purpose:

Meeting analysis

Input:

Meeting recording

Output:

Summary

Action Items

Risks

Recommendations

---

# AI KNOWLEDGE ARCHITECTURE

Pattern:

RAG

Retrieval Augmented Generation

Knowledge Sources:

Company Profile

Service Brochure

Articles

Case Studies

Research Reports

Internal Frameworks

Playbooks

Storage:

Vector Database

Preferred:

Qdrant

Alternative:

Pinecone

---

# DATA ARCHITECTURE

Primary Database:

PostgreSQL

Responsibilities:

Users

CRM

Content

Assessments

Bookings

Analytics

Audit Logs

AI Metadata

---

CACHE LAYER

Technology:

Redis

Purpose:

Session storage

API caching

Rate limiting

Performance optimization

---

FILE STORAGE

Technology:

AWS S3

Stores:

Documents

Reports

Images

Resources

Proposals

Exports

Backups

---

# EVENT DRIVEN ARCHITECTURE

Pattern:

Event Based Processing

Examples:

Lead Created

Assessment Completed

Proposal Generated

Booking Scheduled

Resource Downloaded

Article Published

Flow:

Event

↓

Queue

↓

Worker

↓

Processing

↓

Database

↓

Notification

Technology:

BullMQ

Redis

---

# ANALYTICS ARCHITECTURE

Flow:

Frontend

↓

Event Collection

↓

Analytics Service

↓

Data Processing

↓

Dashboard

Tracked Events:

Page Views

Downloads

Bookings

Lead Creation

Assessment Completion

Proposal Generation

AI Usage

---

# SECURITY ARCHITECTURE

Authentication

JWT Access Token

Refresh Token

2FA

Session Validation

---

Authorization

RBAC

Role Based Access Control

Roles:

Super Admin

Admin

Consultant

Sales

Content Manager

---

Password Security

Argon2 Hashing

Minimum Length:

12 Characters

Password Rotation:

Optional

---

API Protection

Rate Limiting

Request Validation

CSRF Protection

CORS Protection

IP Monitoring

---

Data Security

Encrypted Secrets

Encrypted Tokens

Secure Storage

Audit Logging

Security Logging

---

# OBSERVABILITY ARCHITECTURE

Monitoring Stack

Prometheus

Grafana

Sentry

---

Metrics

CPU

Memory

Database Performance

API Latency

Error Rate

AI Usage

Queue Health

---

Logging

Application Logs

Security Logs

Audit Logs

AI Logs

System Logs

---

# DEPLOYMENT ARCHITECTURE

Frontend

Next.js

Deployment:

Vercel

---

Backend

NestJS

Deployment:

Docker

Cloud Server

---

Database

PostgreSQL

Managed Cloud Instance

---

Cache

Redis

Managed Service

---

Storage

AWS S3

---

Monitoring

Grafana

Prometheus

Sentry

---

# REPOSITORY STRUCTURE

sarangi-platform/

apps/

web/
admin/
ai-engine/

packages/

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

# FUTURE EXPANSION STRATEGY

Current:

Sarangi Consulting

Future:

Sarangi Group

├── Sarangi Consulting

├── Sarangi Technologies

├── Sarangi Foundation

Architecture must support:

Shared Authentication

Shared CRM

Shared Analytics

Shared Knowledge System

Separate Business Units

Separate Permissions

Separate Branding

Single Platform

---

# SUCCESS CRITERIA

The architecture is successful if:

New modules can be added independently.

AI services can scale independently.

Business units can be added without rewrites.

System supports 100,000+ monthly visitors.

System supports enterprise clients.

System remains maintainable after years of growth.

Development teams can work simultaneously without conflicts.

The platform operates as a consulting operating system rather than a traditional company website.

---

END OF ARCHITECTURE DOCUMENT
