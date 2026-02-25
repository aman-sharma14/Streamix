<div align="center">
  
# 🍿 Streamix

**A modern, scalable microservices-based Movie & TV Show streaming platform built with Spring Boot, React, and MongoDB.**

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=springboot)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

---
</div>

## 🌟 Overview
Streamix is a full-stack replica of premium streaming services designed to demonstrate advanced **Microservice Architecture, Security best practices, and Cloud Deployment patterns**. 

The frontend provides a sleek, Netflix-style user experience, while the backend orchestrates 5 independent, fully-secured Spring Boot microservices capable of handling everything from secure video playback tracking to distributed rate-limiting.

---

## 🏗️ Architecture Stack

### Backend (Microservices)
Built entirely on **Java 21** and **Spring Boot 3**.
* 🛡️ **API Gateway (`8443`)**: Centralized routing, global HTTPS/SSL encryption, Security Headers (HSTS, CSP), and Distributed Rate Limiting via Upstash Redis.
* 🎫 **Discovery Server (`8761`)**: Netflix Eureka server for automatic microservice registration and internal load balancing.
* 🔐 **Identity Service (`8081`)**: Handles User Authentication, JWT Token Generation, BCrypt Hashing, OTP Email Verification (JavaMailSender), and stores users securely in Supabase PostgreSQL.
* 🎬 **Catalog Service (`8082`)**: Interfaces with the external TMDB API and MongoDB Atlas to provide dynamic movie, TV show, and genre metadata.
* 📝 **Interaction Service (`8083`)**: Manages the user "Watchlist" and tracks active video playback "Watch History" progress, storing session data in MongoDB Atlas.

### Frontend
* ⚛️ **React 18**: Component-based architecture with modern Hooks.
* 🎨 **TailwindCSS**: Fully responsive, sleek dark-mode native UI design.
* 🌐 **Axios Interceptors**: Globally catches `401 Unauthorized` errors and seamlessly refreshes authentication context.
* 🛡️ **Iframe Sandboxing**: Safely embeds third-party video players (`vidlink.pro`) while completely blocking popups and malicious scripts via strict HTML5 `sandbox` attributes.

---

## 🔒 Enterprise Security Architecture
Streamix is architected with a security-first mindset, implementing enterprise-grade defenses across the entire stack:
1. **Edge-Level Defenses**: The API Gateway strictly enforces HTTPS, applies stringent Security Headers (HSTS, CSP `default-src 'none'`), and blocks framing to mitigate clickjacking and MIME-sniffing.
2. **Distributed Rate Limiting**: Upstash Redis powers a robust, distributed algorithm at the Gateway level to effortlessly absorb traffic spikes and thwart brute-force attacks across all instances.
3. **Stateless Identity Management**: A fully decoupled Identity Service issues aggressively short-lived JWTs (15m TTL), paired with a secure Redis-backed sliding-window refresh token architecture.
4. **Session Concurrency Control**: Redis Sets enforce strict concurrent session limits across distributed nodes, ensuring a maximum of 5 active devices per account globally.
5. **Secure Video Delivery**: The frontend implements strict HTML5 `sandbox` iframing to neuter malicious scripts and popups from third-party video delivery networks.

---

## ☁️ Cloud Capabilities
This stack is container-native and designed to be infinitely scaled horizontally across managed Kubernetes clusters or resilient PaaS solutions.

- Fully Dockerized with multi-stage, JRE-Alpine optimized images.
- Configured for resilient deployments with `DependsOn` startup choreography and proactive actuator health checks.
- Compatible with highly available managed databases (MongoDB Atlas, Supabase, Upstash).

> *"Built to scale, designed to stream."*
