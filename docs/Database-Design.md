# DATABASE_DESIGN.md

# Sarangi Consulting Digital Platform

## Database Design Document

### Version 1.0

---

# DOCUMENT PURPOSE

This document defines:

* Database Architecture
* Entity Relationships
* Data Modeling
* Table Structures
* Constraints
* Indexing Strategy
* Audit Strategy
* Analytics Storage
* AI Storage
* Future Expansion Planning

The database must support:

* Sarangi Consulting
* Future Sarangi Group
* AI Services
* CRM
* Assessments
* Knowledge Platform
* Analytics Platform

Without requiring redesign.

---

# DATABASE PHILOSOPHY

Design Principles:

1. Normalized Data Structure

2. Scalable Relationships

3. High Performance Queries

4. Secure Data Storage

5. Auditability

6. AI Ready

7. Multi Business Unit Ready

8. Enterprise Grade

---

# DATABASE TECHNOLOGY

Primary Database

PostgreSQL

Version:

16+

ORM

Prisma

Migration Tool

Prisma Migrate

Connection Pooling

PgBouncer

---

# DATABASE MODULES

Core Identity

CRM

Bookings

Services

Industries

Content

Assessments

AI

Analytics

Notifications

Audit Logs

Security Logs

Files

Future Multi-Company System

---

# GLOBAL TABLE STANDARDS

Every table must contain:

id

created_at

updated_at

created_by

updated_by

is_active

Example:

id UUID PRIMARY KEY

created_at TIMESTAMP

updated_at TIMESTAMP

created_by UUID

updated_by UUID

is_active BOOLEAN

---

==================================================
IDENTITY MODULE
===============

# USERS

Table:

users

Purpose:

Platform users

Fields:

id

first_name

last_name

email

phone

password_hash

avatar_url

role_id

status

last_login

email_verified

two_factor_enabled

created_at

updated_at

Indexes:

email UNIQUE

role_id

status

---

# ROLES

roles

Fields:

id

name

description

created_at

updated_at

Example Roles:

Super Admin

Admin

Consultant

Sales

Content Manager

---

# PERMISSIONS

permissions

Fields:

id

name

module

description

---

# ROLE_PERMISSIONS

role_permissions

Fields:

role_id

permission_id

---

==================================================
CRM MODULE
==========

# LEADS

Table:

leads

Purpose:

Store all prospects

Fields:

id

name

email

phone

company

designation

industry_id

revenue_range

employee_count

website

challenge_summary

source

status

lead_score

assigned_to

notes

created_at

updated_at

Indexes:

email

phone

industry_id

lead_score

status

assigned_to

---

# LEAD_NOTES

lead_notes

Fields:

id

lead_id

user_id

note

created_at

---

# LEAD_ACTIVITIES

lead_activities

Purpose:

Track interactions

Fields:

id

lead_id

activity_type

description

performed_by

created_at

Examples:

Call

Email

Meeting

Proposal Sent

Follow Up

---

# LEAD_SCORING_HISTORY

lead_scoring_history

Fields:

id

lead_id

previous_score

new_score

reason

created_at

---

==================================================
BOOKING MODULE
==============

# BOOKINGS

bookings

Fields:

id

lead_id

service_id

booking_type

meeting_date

meeting_time

timezone

status

meeting_link

notes

created_at

Indexes:

meeting_date

status

lead_id

---

# AVAILABILITY

availability

Fields:

id

user_id

day_of_week

start_time

end_time

is_available

---

==================================================
SERVICES MODULE
===============

# SERVICES

services

Fields:

id

name

slug

short_description

full_description

service_type

icon

status

created_at

---

Examples:

Growth Consulting

Management Consulting

Startup Consulting

Operations Consulting

Digital Transformation

Marketing Consulting

Organization & Leadership Consulting

---

# INDUSTRIES

industries

Fields:

id

name

slug

description

status

created_at

---

==================================================
KNOWLEDGE PLATFORM
==================

# ARTICLES

articles

Fields:

id

title

slug

excerpt

content

featured_image

author_id

status

published_at

seo_title

seo_description

views

created_at

Indexes:

slug

status

published_at

---

# CATEGORIES

categories

Fields:

id

name

slug

description

---

# TAGS

tags

Fields:

id

name

slug

---

# ARTICLE_CATEGORIES

article_categories

article_id

category_id

---

# ARTICLE_TAGS

article_tags

article_id

tag_id

---

# RESOURCES

resources

Purpose:

Downloads

Templates

Reports

Fields:

id

title

description

resource_type

file_url

download_count

status

created_at

---

# RESOURCE_DOWNLOADS

resource_downloads

Fields:

id

resource_id

lead_id

downloaded_at

---

==================================================
CASE STUDIES
============

# CASE_STUDIES

case_studies

Fields:

id

title

slug

industry_id

challenge

strategy

implementation

outcomes

metrics

status

published_at

---

==================================================
ASSESSMENT ENGINE
=================

# ASSESSMENTS

assessments

Fields:

id

name

type

description

status

created_at

Examples:

Business Health

Growth Readiness

Operational Excellence

Digital Readiness

---

# QUESTIONS

questions

Fields:

id

assessment_id

question_text

question_type

weight

sort_order

---

# RESPONSES

responses

Fields:

id

assessment_id

question_id

lead_id

answer

score

created_at

---

# ASSESSMENT_RESULTS

assessment_results

Fields:

id

lead_id

assessment_id

overall_score

growth_score

operations_score

marketing_score

technology_score

summary

recommendations

created_at

---

==================================================
PROPOSAL SYSTEM
===============

# PROPOSALS

proposals

Fields:

id

lead_id

generated_by

title

version

scope

pricing

timeline

status

file_url

created_at

---

# PROPOSAL_HISTORY

proposal_history

Fields:

id

proposal_id

action

performed_by

created_at

---

==================================================
AI SYSTEM
=========

# AI_CONVERSATIONS

ai_conversations

Fields:

id

lead_id

session_id

message

response

tokens_used

model

created_at

---

# AI_RECOMMENDATIONS

ai_recommendations

Fields:

id

lead_id

recommendation_type

input_data

output_data

confidence_score

created_at

---

# AI_MEETING_SUMMARIES

ai_meeting_summaries

Fields:

id

booking_id

summary

action_items

risks

opportunities

created_at

---

==================================================
VECTOR DATABASE
===============

Qdrant

Collections:

company_documents

services

articles

frameworks

case_studies

research_reports

playbooks

---

Stored Metadata:

document_id

title

source

category

tags

created_at

---

==================================================
ANALYTICS MODULE
================

# EVENTS

events

Fields:

id

session_id

user_id

event_type

page_url

metadata

created_at

Examples:

Page View

Download

Booking

Assessment

Lead Created

Proposal Generated

AI Interaction

---

# PAGE_VIEWS

page_views

Fields:

id

session_id

page

duration

created_at

---

# CONVERSIONS

conversions

Fields:

id

lead_id

conversion_type

source

created_at

---

==================================================
NOTIFICATIONS
=============

# NOTIFICATIONS

notifications

Fields:

id

user_id

title

message

type

is_read

created_at

---

==================================================
FILE MANAGEMENT
===============

# FILES

files

Fields:

id

name

path

size

mime_type

uploaded_by

created_at

---

==================================================
AUDIT SYSTEM
============

# AUDIT_LOGS

audit_logs

Purpose:

Track every important action

Fields:

id

user_id

action

module

record_id

old_value

new_value

ip_address

created_at

---

# SECURITY_LOGS

security_logs

Fields:

id

user_id

event_type

ip_address

device_info

location

created_at

Examples:

Login Success

Login Failure

Password Change

Role Change

Permission Change

---

==================================================
MULTI COMPANY FUTURE SYSTEM
===========================

# ORGANIZATIONS

organizations

Fields:

id

name

slug

brand_color

status

created_at

Examples:

Sarangi Consulting

Sarangi Technologies

Sarangi Foundation

---

# ORGANIZATION_USERS

organization_users

Fields:

organization_id

user_id

role_id

---

# ORGANIZATION_CONTENT

organization_content

Fields:

organization_id

article_id

resource_id

service_id

---

==================================================
INDEXING STRATEGY
=================

High Priority Indexes:

email

phone

slug

status

created_at

lead_score

industry_id

service_id

published_at

assessment_id

booking_date

event_type

---

==================================================
BACKUP STRATEGY
===============

Daily Backup

Weekly Backup

Monthly Backup

Retention:

12 Months

Storage:

AWS S3

Encrypted

---

==================================================
DISASTER RECOVERY
=================

Recovery Time Objective

RTO:

1 Hour

Recovery Point Objective

RPO:

15 Minutes

---

==================================================
ESTIMATED SCALE
===============

100,000+ Monthly Visitors

50,000+ Leads

10,000+ Assessments

1,000+ Articles

500,000+ Analytics Events

Multiple Business Units

AI Knowledge Base Expansion

Without Database Redesign

---

END OF DATABASE DESIGN DOCUMENT
