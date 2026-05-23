<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

# 🎬 CINEPRO Backend API

> A modern cinema booking backend system built with NestJS, PostgreSQL, PayOS and QR Ticket verification.

---

# 🛠️ Tech Stack

## Backend

* NestJS
* Node.js
* TypeScript

## Database

* PostgreSQL
* TypeORM

## Authentication & Security

* JWT Authentication
* Google OAuth2 Login
* Role-Based Access Control (RBAC)

## Payment

* PayOS Integration

## Email & Notification

* Nodemailer
* QRCode Generator

## Media & Storage

* Cloudinary

## Deployment

* Docker
* VPS Deployment

---

# 🏗️ Architecture & Main Features

## 🌟 Main Features

### 👤 Authentication & Authorization

* Register/Login with JWT
* Google OAuth2 Login
* Role-based permissions:

  * ADMIN
  * STAFF
  * USER

---

### 🎥 Movie Management

* Create / Update / Delete movies
* Upload movie poster & trailer
* Movie detail API
* Weekly movie schedule

---

### 🕒 Showtime Management

* Create showtime manually
* Auto generate showtime schedule
* Draft showtime workflow
* Publish draft showtimes
* Weekly showtime API for users

---

### 🪑 Seat Management

* Auto generate room seats
* VIP / STANDARD / COUPLE seats
* Seat locking system
* Seat release system

---

### 🎟️ Booking System

* Create booking
* Booking history
* Cancel booking
* Booking lookup by code

Booking Flow:

```text
Select Showtime
→ Lock Seats
→ Create Booking (PENDING)
→ Create Payment
→ Payment Success
→ Confirm Booking
→ Generate Ticket
→ Send Ticket Email
```

---

### 💳 Payment System

* PayOS Integration
* MOMO / Banking / QR Payment
* Payment webhook handling
* Auto booking confirmation

Payment Flow:

```text
Create Booking
→ Create PayOS Payment
→ User Payment
→ PayOS Webhook
→ Booking PAID
→ Seats SOLD
```

---

### 📧 E-Ticket System

* Generate ticket after payment
* Generate QR Code ticket
* Send ticket via email
* Staff QR ticket verification

Ticket Status:

* VALID
* USED
* CANCELLED

---

# 🗂️ Folder Structure

```bash
src/
│
├── auth/           # Authentication & Authorization
├── booking/        # Booking management
├── cinema/         # Cinema management
├── common/         # Shared utilities, constants, helpers
├── config/         # App & environment configuration
├── dashboard/      # Dashboard & statistics
├── mail/           # Email service & templates
├── migrations/     # Database migrations
├── movie/          # Movie management
├── notification/   # Notifications system
├── payment/        # PayOS payment integration
├── product/        # Products / combos / food
├── seeds/          # Seed data
├── showtime/       # Showtime & seat logic
├── ticket/         # Ticket & QR verification
├── user/           # User management
│
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

---

# 🚀 Getting Started

## Install dependencies

```bash
npm install
```

# 👨‍💻 Contributors

* Nguyễn Sơn
* CINEPRO Development Team

---

# 📄 License

This project is licensed under the MIT License.

