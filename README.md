# Event App

A full-stack event management application built with vanilla JavaScript and Node.js.

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