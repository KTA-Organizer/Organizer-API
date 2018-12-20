# KTA Organizer JSON/REST API
![travis dev status](https://travis-ci.org/KTA-Organizer/Organizer-API.svg?branch=dev)

This API provides all logic on which to build the client.

## Deployment
We build this uppon Google Cloud. It uses storage buckets, MySQL, Redis and App Engine.

## Continuous integration
Automatic testing and deployment on Google Cloud is operated by [Travis CI](https://travis-ci.org/KTA-Organizer/Organizer-API).

## [API Docs](https://ktaorganizer.docs.apiary.io/)

## Setup
- `$ npm install`
- Create a `.env.development` file and enter the configuration. You can use `.env.example` as a starting point.

## Development
- `$ npm run watch`

## Testing
- `$ npm test`
