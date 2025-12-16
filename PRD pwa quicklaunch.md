# Product Requirements Document (PRD): UMKM Quick-Launch PWA

**Author:** [Muhamad Basim]
**Status:** Draft / In-Review
**Version:** 1.0

---

# 1. One Pager

## Overview
**UMKM Quick-Launch** is a mobile-first Progressive Web App (PWA) designed to empower freelance digital marketers ("The Gig Workers") to build, deploy, and manage high-quality landing pages for MSMEs (UMKM) in under 10 minutes.

The platform utilizes a **headless architecture** that abstracts the complexity of **GitHub** (versioning) and **Cloudflare** (hosting) behind a simple "Capture & Publish" interface. It features **Advanced AI Vision** capabilities to automatically generate compelling marketing copy and storytelling based on uploaded photos, eliminating the need for copywriting skills or laptops.

## Problem Statement
* **Hardware Gap:** The majority of MSMEs and field freelancers operate solely on mobile devices and do not own laptops, making traditional web development workflows inaccessible.
* **Technical Complexity:** Setting up hosting, domains, SSL, and repository management is too complex for non-technical marketers.
* **Content Bottleneck:** Writing engaging marketing copy (storytelling) is time-consuming and difficult for many freelancers, slowing down the digitization process.

## Objectives
1.  **Speed to Deploy:** Enable a complete, professional landing page launch in less than **10 minutes** using only a smartphone.
2.  **AI-Driven Automation:** Utilize computer vision to automate content creation (Image-to-Text captioning) to ensure high-quality storytelling with zero manual effort.
3.  **Zero-Ops Architecture:** Completely automate backend processes (GitHub commit & Cloudflare build) so the user never touches code or server configs.

## Constraints
1.  **Device Compatibility:** Must run smoothly on mid-to-low-range Android devices (common in the Indonesian mass market).
2.  **API Dependencies:** Dependent on GitHub API, Cloudflare API, and AI Vision API (e.g., OpenAI/Gemini) availability.
3.  **Connectivity:** Must handle intermittent internet connections typical in field locations (Offline-first approach).

## Persona
**Target User: "The Digital Field Freelancer"**
* **Profile:** A tech-savvy individual looking for side income, or a dedicated digital agent helping local businesses.
* **Behavior:** Works on-the-go, visits clients at markets/shops (on-site), and relies entirely on their smartphone.
* **Motivation:** Wants to deliver quick results to clients to get paid faster without getting bogged down in technical debugging.

## Use Cases
### Scenario: The AI-Powered Site Creation
Rian, a freelancer, visits "Keripik Pisang Bu Ani".
1.  **Capture:** Rian opens the PWA and creates a new project. He takes a photo of the banana chips using the in-app camera.
2.  **AI Processing:** The app's AI analyzes the image, detecting "crispy golden banana chips," and automatically generates a catchy headline and a paragraph of storytelling copy describing the taste and quality.
3.  **Review:** Rian quickly reviews the AI-generated text (minor edits if needed).
4.  **Publish:** Rian clicks "Publish". The app pushes code to GitHub -> Cloudflare builds the site.
5.  **Result:** In minutes, a live URL is ready to share.

---

# 2. PRD Details

## Features In (Scope)

### A. Core PWA & Dashboard
* **Mobile-First Dashboard:** A clean view to manage multiple client projects (List of UMKMs).
* **PWA Installability:** "Add to Home Screen" prompt to function like a native app.

### B. AI & Content Generation (The "Wow" Factor)
* **AI Vision Integration:** When a user uploads/takes a photo, the system sends it to an AI Vision API.
* **Auto-Captioning & Storytelling:** The AI returns a structured description, marketing hook, and product story based on the visual data.
* **Template System:** Pre-built, responsive web templates (Culinary, Fashion, Service) that automatically populate with the AI content and photos.

### C. Headless Deployment Engine
* **GitHub Integration:**
    * System automatically creates a new repository (or branch) for each new project using a generic GitHub account owned by the platform (transparent to the user).
    * Content updates are committed as JSON/Markdown changes.
* **Cloudflare Pages Integration:**
    * Webhooks trigger a build on Cloudflare Pages upon GitHub commit.
    * Returns the live URL (e.g., `project-name.ourplatform.site`) back to the app.

### D. Lead Generation (Conversion)
* **Click-to-WhatsApp:** The primary "Call to Action" (CTA) on the generated landing page. No shopping cart; straightforward connection to the seller's WA number.

## Features Out (Out of Scope for MVP)
* **In-App Transactions (E-commerce):** No shopping cart, payment gateway, or inventory management. Focus is purely on *Lead Generation* via WhatsApp.
* **Custom Domain Purchasing:** Users will use free subdomains initially. No in-app domain registrar integration in V1.
* **Custom Code Editor:** Users cannot edit HTML/CSS manually. They are restricted to the provided templates to ensure stability.

## Success Metrics
* **Primary Metric:** **Time-to-Publish.** Target: < 10 minutes from "Create Project" to "Live URL".
* **Secondary Metric:** **Publish Success Rate.** Target: 99% of "Publish" clicks result in a live site without API errors.
* **Adoption:** Number of active sites generated per freelancer per month.

## Technical Considerations
* **Tech Stack:**
    * **Frontend (PWA):** React/Next.js or Vue (lightweight).
    * **Generated Sites:** Static HTML/Tailwind or Astro (for speed).
    * **AI:** Google Gemini API.
    * **Hosting:** Cloudflare Pages (Free tier/Pro).
* **Image Optimization:** Photos must be compressed on the client-side (phone) before upload to save bandwidth and storage.

## GTM Approach (Go-to-Market)
* **Strategy:** **Hyper-local Field Activation.**
* **Execution:**
    * The core team and early adopters (freelancers) physically visit UMKM clusters (Pasar, Sentra UKM).
    * Demonstrate the "10-minute magic" live in front of the business owner.
    * Onboard the business owner or a local youth (freelancer) to manage the site.
    * Word-of-mouth growth driven by the visible result (the live website).

## Open Issues / Risks
* **API Costs:** Using Advanced AI Vision for every photo can be expensive. Need to implement rate limiting or a quota system per user.
* **GitHub/Cloudflare Limits:** Need to monitor API rate limits if user volume spikes suddenly.

## Q&A
| Asked By | Question | Answer |
| :--- | :--- | :--- |
| **Engineering** | Do users need their own GitHub account? | **No.** The platform handles all GitHub interactions via a central service account or an organization account managed by the backend. |
| **Design** | Can users change colors? | **Limited.** Users can pick from 3-5 preset color themes per template, but cannot pick hex codes manually to keep designs consistent. |
| **Business** | Why no Shopping Cart? | **Speed & Simplicity.** Managing inventory and payment gateways is too complex for the target UMKM persona right now. WhatsApp is the standard. |

## Feature Timeline (Phasing)

| Phase | Feature Set | Est. Date |
| :--- | :--- | :--- |
| **Phase 1 (MVP)** | PWA Shell, Camera Capture, Basic Template, GitHub/Cloudflare Connect, **Text-Only AI**. | Month 1-2 |
| **Phase 2 (Visual)** | **Advanced AI Vision (Image-to-Text)**, Offline Sync, Multiple Templates. | Month 3 |
| **Phase 3 (Scale)** | Premium Domains, Analytics Dashboard for Freelancers. | Month 4+ |