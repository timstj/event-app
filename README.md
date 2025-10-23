# Event Management App

I'm building this event management application to continue to learn full-stack development and explore modern web technologies. It's an ongoing project where I experiment with different approaches and continuously add new features, but still trying to follow industry standards when implementing.

## What I'm Building

This is a social event management app where people can create events, invite friends, and manage RSVPs. I started this project to get hands-on experience with building something from scratch without relying on frameworks.

**Current Status:** Actively developing - adding new features regularly and planning to deploy it soon.

## What It Does Right Now

- Create and manage events
- Friend system - add friends, send requests
- Event invitations with RSVP tracking
- User authentication and profiles
- Search for users and events

I've been focusing a lot on making the UI look good recently.

## Tech Choices

**Frontend:** Vanilla JavaScript, HTML, CSS
- Chose vanilla JS to really understand the fundamentals
- No frameworks - wanted to learn how things work under the hood
- Modern CSS with gradients and animations

**Backend:** Node.js + Express + PostgreSQL
- Express because it's straightforward and well-documented
- PostgreSQL for learning relational database design
- JWT for authentication

## Project Structure
* event_app/
    * client/ Frontend application
        * scripts/
            * auth/ # Authentication logic
            * components/ # Reusable UI components
            * pages/ # Page-specific controllers
            * services/ # API service layer
            * utils/ # Utility functions
        * styles/ # CSS stylesheets
        * *.html # HTML pages
    * server/ # Backend API
        * src/
            * config/ # Database configuration
            * controllers/ # Request handlers
            * data/ # Tables setup
            * middlewares/ # Middlewares
            * models/ # Database models
            * routes/ # API routes
            * seeds/ # Seeds to generate data
            * utils/ # Utility functions
        * package.json
    * README.md

## What I'm Learning

This project has taught me a lot about:
- Building APIs from scratch
- Database design and relationships
- Frontend architecture without frameworks
- Git workflow with feature branches and proper commits
- UI/UX design principles

## Current Challenges

- Handling edge cases in the invitation system
- Planning the deployment process

## What's Next

- Deploy to production
- Add real-time notifications
- Optimization
- Add tests

## Running It Locally

You'll need Node.js and PostgreSQL installed.

```bash
# Backend
cd server
npm install
# Set up your .env file with database credentials
npm run dev

# Frontend
cd client
# Open index.html with Live Server or similar
```

The database setup scripts are in `server/src/data/` if you want to create the tables.

## Why I Built This

I wanted to build something substantial to continue to learn full-stack development. Instead of following only tutorials, I decided to build something I'd actually use and figure out the problems as they came up. It's been challenging but really rewarding.

---

Feel free to look around the code or reach out if you have questions!