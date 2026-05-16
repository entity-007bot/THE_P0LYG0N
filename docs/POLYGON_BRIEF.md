# POLYGON Product Brief

POLYGON converts informal work into a usable financial identity. It combines NIN/BVN verification, AI matching, Squad-powered payment records, trust scoring, and public-sector analytics so informal workers can become visible to employers, banks, insurers, telecom partners, and government programs.

## Core Mission

More than 80% of Nigerians work in the informal economy, but many have no durable financial identity, verified work history, or proof of income. Youth unemployment is above 40%, which leaves millions of job seekers, traders, and workers invisible to banks, insurers, and formal support programs.

POLYGON addresses this by turning everyday work and payment activity into trusted economic records:

- Digital identity for informal workers and traders.
- NIN/BVN checks through an identity partner such as Dojah or Smile ID.
- Smart job matching based on skills, location, availability, and work signals.
- Trust scores that translate behavior into lender and insurer readiness.
- Payment and wallet records powered by Squad.
- Government-grade planning data using anonymized, aggregated insights.

## Ecosystem

POLYGON is designed as a trusted informal-economy layer connecting:

| Stakeholder | Role |
| --- | --- |
| Traders | Receive payments, build transaction history, and access financial services. |
| Job seekers | Build work history through matched jobs and proof-of-work records. |
| Banks | Use trust scores and income signals for credit decisions. |
| Telecoms | Extend onboarding and access through USSD, mobile identity, and phone-first flows. |
| Insurers | Price and distribute microinsurance using verified work and risk signals. |
| Government | Monitor employment, inclusion, regional demand, and skill gaps. |

## Key Outputs

- Digital identity profiles.
- Verified identity status, confidence, name, date of birth, and photo metadata.
- Trust scores for creditworthiness and risk assessment.
- Verified work history.
- AI-ranked job matches.
- Wallet and transaction records.
- Anonymized dashboards for government planning.

## Technology And Architecture

AI is used across three core loops:

- Matching: connects worker skills, job demand, and location.
- Trust: builds financial identity from payments, completion behavior, savings, and work history.
- Learning: improves matching, scoring, and planning signals as activity scales.

The payment layer uses Squad API products:

- Payment Gateway for hosted checkout and escrow-style collections.
- Static Virtual Accounts for recurring wallet top-ups and worker accounts.
- Dynamic Virtual Accounts for one-time payments with amount and expiry control.
- Transfer API for payouts, refunds, and disbursements.

Squad is used for money movement, not as the third-party KYC registry. The identity layer verifies NIN or BVN through a dedicated provider, stores a limited verification record, and gives verified users a higher KiScore baseline.

The trust engine weights four signal groups:

| Data Source | Contribution |
| --- | --- |
| Squad webhooks | Transaction frequency, ticket size, income consistency, and payout velocity. |
| Job logs | Completion rate, employer ratings, proof-of-work history, and work duration. |
| Identity provider | NIN/BVN status, confidence, verified name, date of birth, and photo reference. |
| Future telco data | Airtime, USSD activity, mobile money behavior, and SIM-linked continuity where partnerships allow. |

The broader architecture supports:

- Cloud deployment on AWS or GCP.
- USSD access for offline and feature-phone users.
- Microservice deployment with Kubernetes at scale.
- NDPR-compliant data handling.
- Africa-hosted data residency where required.
- Integrations with CBN, NBS, and telecom APIs such as MTN, Glo, and Airtel.

## Scaling Plan

| Phase | Scope | Users | Estimated Cost |
| --- | --- | ---: | ---: |
| Pilot | Lagos | 10,000 | ₦40M - ₦70M |
| Regional | Multi-state | 100,000 | ₦150M - ₦300M |
| National | All states | 1M+ | ₦800M - ₦1.5B |

## Revenue Streams

- Small transaction fees.
- Bank and insurance partnerships for trust scoring and verified economic profiles.
- Government data contracts for anonymized employment, inclusion, and regional planning analytics.

## Impact And Compliance

The government dashboard provides real-time analytics for:

- Unemployment heatmaps.
- Financial inclusion tracking.
- Skill-gap monitoring.
- Job-match and transaction-volume trends.
- Loan repayment and lender-readiness signals.

Privacy controls:

- NDPR-aligned personal-data handling.
- Data sovereignty through Africa-hosted infrastructure where required.
- Public dashboards use anonymized and aggregated data.
- Partner access should follow purpose limitation and least-privilege rules.

Success metrics:

- Active users.
- Job matches.
- Verified work completions.
- Transaction volume.
- Wallet activity.
- Trust-score growth.
- Loan repayment rates.
