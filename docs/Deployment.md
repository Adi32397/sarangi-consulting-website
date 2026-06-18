# DEPLOYMENT.md

# Sarangi Consulting Digital Platform

## Deployment & Infrastructure Document

### Version 1.0

---

# DOCUMENT PURPOSE

This document defines:

* Infrastructure Architecture
* Environment Strategy
* Deployment Pipelines
* CI/CD Workflow
* Container Strategy
* Hosting Architecture
* Monitoring
* Logging
* Security Hardening
* Backup Strategy
* Disaster Recovery

This deployment architecture is designed for:

* Enterprise reliability
* High availability
* Scalability
* Security
* Cost efficiency

---

# DEPLOYMENT PHILOSOPHY

Deployment must follow:

1. Security First

2. Zero Downtime Deployments

3. Infrastructure as Code

4. Environment Isolation

5. Automated CI/CD

6. Easy Rollbacks

7. Observability by Default

8. Future Scalability

---

# INFRASTRUCTURE OVERVIEW

```
                Internet
                    │
                    ▼

            Cloudflare CDN

                    │

                    ▼

           Load Balancer

                    │

    ┌───────────────┬───────────────┐
    ▼                               ▼
```

Frontend Cluster               Backend Cluster

```
    │                               │

    ▼                               ▼

  Vercel                      NestJS APIs

                                    │

                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼

          PostgreSQL           Redis Cache          BullMQ

                │

                ▼

              AWS S3

                │

                ▼

          Monitoring Stack
```

---

# ENVIRONMENTS

Three mandatory environments

Development

Staging

Production

---

# DEVELOPMENT ENVIRONMENT

Purpose

Local development

Infrastructure

Developer Machine

Services

Next.js

NestJS

PostgreSQL

Redis

Docker

Characteristics

Fast iteration

Local testing

No public access

---

# STAGING ENVIRONMENT

Purpose

Pre-production validation

Infrastructure

Cloud Hosted

Mirrors production

Used for

QA

Feature Testing

Integration Testing

User Acceptance Testing

Performance Testing

---

# PRODUCTION ENVIRONMENT

Purpose

Live customer traffic

Characteristics

Highly secure

Highly monitored

Highly available

Restricted access

Backup enabled

Disaster recovery enabled

---

# APPLICATION DEPLOYMENT

Frontend

Technology

Next.js

Deployment Platform

Vercel

Advantages

Automatic scaling

Edge delivery

Global CDN

Fast deployment

Automatic previews

Environment Variables

Managed through Vercel

---

Backend

Technology

NestJS

Deployment Method

Docker Containers

Container Registry

GitHub Container Registry

or

Docker Hub

Hosting

AWS ECS

or

Railway

or

DigitalOcean Apps

Preferred

AWS ECS

---

# DATABASE DEPLOYMENT

Database

PostgreSQL

Preferred Providers

AWS RDS

Supabase

Neon

Preferred Choice

AWS RDS PostgreSQL

Requirements

Automatic backups

Read replicas

Encryption at rest

Encryption in transit

Point in time recovery

---

# CACHE DEPLOYMENT

Technology

Redis

Purpose

Caching

Sessions

Rate Limiting

Queue Support

Providers

Upstash Redis

AWS Elasticache

Preferred

AWS Elasticache

---

# FILE STORAGE

Technology

AWS S3

Purpose

Reports

Resources

Proposals

Images

Case Studies

Knowledge Files

AI Documents

Requirements

Versioning Enabled

Private Access

Encrypted Storage

Lifecycle Policies

---

# QUEUE SYSTEM

Technology

BullMQ

Redis

Purpose

Background Processing

Examples

Email Sending

Assessment Analysis

AI Processing

Proposal Generation

Report Exports

Notification Processing

Workflow

Job Created

↓

Queue

↓

Worker

↓

Database Update

↓

Notification

---

# VECTOR DATABASE DEPLOYMENT

Purpose

AI Knowledge Base

Preferred

Qdrant

Alternatives

Pinecone

Stores

Company Documents

Service Documents

Research Reports

Case Studies

Frameworks

Knowledge Base

Deployment

Dedicated AI Service

---

# DOMAIN STRATEGY

Production Domains

[www.sarangiconsulting.com](http://www.sarangiconsulting.com)

api.sarangiconsulting.com

admin.sarangiconsulting.com

ai.sarangiconsulting.com

Future

sarangigroup.in

technologies.sarangigroup.in

foundation.sarangigroup.in

---

# DNS MANAGEMENT

Provider

Cloudflare

Responsibilities

DNS

CDN

Caching

SSL

Bot Protection

DDoS Protection

WAF

---

# SSL STRATEGY

Mandatory

HTTPS Everywhere

TLS Version

1.3

Certificates

Cloudflare SSL

Auto Renewal

Enabled

---

# CI/CD PIPELINE

Repository

GitHub

Workflow

Developer

↓

Feature Branch

↓

Pull Request

↓

Code Review

↓

Tests

↓

Merge

↓

Deploy

---

# GITHUB BRANCH STRATEGY

main

Production

develop

Integration Branch

feature/*

Feature Development

hotfix/*

Emergency Fixes

release/*

Release Preparation

---

# AUTOMATED PIPELINE

On Pull Request

Run

Linting

Formatting

Unit Tests

Security Checks

Build Verification

---

On Merge To Develop

Deploy

Staging

---

On Merge To Main

Deploy

Production

---

# REQUIRED GITHUB ACTIONS

Frontend Build

Backend Build

Unit Tests

Integration Tests

Docker Build

Security Scan

Dependency Audit

Deployment Workflow

---

# ENVIRONMENT VARIABLES

Stored In

Secret Manager

Never Commit To Git

Examples

DATABASE_URL

JWT_SECRET

JWT_REFRESH_SECRET

OPENAI_API_KEY

CLAUDE_API_KEY

AWS_ACCESS_KEY

AWS_SECRET_KEY

SMTP_PASSWORD

REDIS_URL

QDRANT_API_KEY

---

# SECRET MANAGEMENT

Production

AWS Secrets Manager

or

Doppler

Requirements

Encrypted

Rotated

Audited

Restricted Access

---

# MONITORING ARCHITECTURE

Purpose

Observe platform health

Stack

Prometheus

Grafana

Sentry

---

# MONITORED METRICS

API Response Time

CPU Usage

Memory Usage

Database Load

Queue Health

Error Rate

AI Requests

User Traffic

Conversion Events

---

# LOGGING STRATEGY

Centralized Logging

Tools

Grafana Loki

Elastic Stack

Preferred

Grafana Loki

Log Categories

Application Logs

Audit Logs

Security Logs

AI Logs

Infrastructure Logs

---

# ALERTING STRATEGY

Notify Team When

API Failure

Database Failure

High Error Rate

Memory Exhaustion

CPU Spike

Queue Failure

Security Event

Failed Deployments

Channels

Email

Slack

Microsoft Teams

---

# BACKUP STRATEGY

Database

Daily Backup

Weekly Snapshot

Monthly Archive

Retention

12 Months

---

Files

AWS S3 Versioning

Enabled

Cross Region Backup

Enabled

---

Configuration

Git Repository

Infrastructure Code

Environment Config

Backed Up Automatically

---

# DISASTER RECOVERY

Recovery Time Objective

RTO

1 Hour

Recovery Point Objective

RPO

15 Minutes

---

Recovery Process

Detect Incident

↓

Restore Database

↓

Restore Files

↓

Validate Services

↓

Restore Traffic

↓

Verify Analytics

↓

Close Incident

---

# SECURITY HARDENING

Web Application Firewall

Enabled

Rate Limiting

Enabled

IP Monitoring

Enabled

DDoS Protection

Enabled

Bot Protection

Enabled

Audit Logging

Enabled

2FA

Mandatory For Admins

Password Hashing

Argon2

Encryption

AES-256

---

# PERFORMANCE OPTIMIZATION

Frontend

Code Splitting

Image Optimization

Edge Caching

SSR

Static Generation

---

Backend

Redis Caching

Database Indexing

Connection Pooling

Queue Workers

Horizontal Scaling

---

Database

Indexes

Query Optimization

Read Replicas

Connection Pooling

---

# SCALING STRATEGY

Phase 1

0 – 10K Monthly Visitors

Single Backend Instance

---

Phase 2

10K – 100K Monthly Visitors

Multiple Backend Instances

Redis Cluster

CDN Optimization

---

Phase 3

100K – 1M Monthly Visitors

Load Balancers

Microservices

Dedicated Analytics

Dedicated AI Infrastructure

---

# INFRASTRUCTURE AS CODE

Preferred

Terraform

Store In

infrastructure/terraform

Modules

Network

Database

Storage

Monitoring

Security

DNS

Compute

---

# DEPLOYMENT CHECKLIST

Before Production

All Tests Passing

Security Scan Complete

Backups Verified

Monitoring Enabled

Logging Enabled

Environment Variables Configured

Rate Limiting Enabled

SSL Verified

Disaster Recovery Tested

Rollback Strategy Tested

---

# SUCCESS CRITERIA

Deployment system is successful when:

Deployments require no manual server access.

Rollback takes less than 5 minutes.

Platform uptime exceeds 99.9%.

Infrastructure scales automatically.

Monitoring detects failures immediately.

Security incidents are logged and traceable.

Future Sarangi Group businesses can be deployed without architectural changes.

---

END OF DEPLOYMENT DOCUMENT
