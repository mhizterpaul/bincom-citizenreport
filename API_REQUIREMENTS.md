# Incident Reporting Application - API Requirements

## Overview

This document outlines the API requirements for the Incident Reporting Application. The API will handle user authentication, incident management, notifications, and location-based services.

## Base URL

```
/api/v1
```

## Authentication

All endpoints except login and registration require JWT authentication.

- Token should be included in the Authorization header: `Authorization: Bearer <token>`

## API Endpoints

### 1. Authentication

#### Login

- **Endpoint**: `/auth/login`
- **Method**: POST
- **Request Body**:

```json
{
  "email": "string",
  "password": "string"
}
```

- **Response**:

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

#### Register

- **Endpoint**: `/auth/register`
- **Method**: POST
- **Request Body**:

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

### 2. Incidents Management

#### Create New Incident

- **Endpoint**: `/incidents`
- **Method**: POST
- **Request Body**:

```json
{
  "title": "string",
  "description": "string",
  "category": "string", // e.g., "Accident", "Fighting", "Rioting"
  "location": {
    "latitude": "number",
    "longitude": "number"
  },
  "images": ["string"] // Array of base64 encoded images
}
```

- **Response**: 201 Created with incident details

#### Get All Incidents

- **Endpoint**: `/incidents`
- **Method**: GET
- **Query Parameters**:
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
  - `category`: string (optional)
  - `sort`: string (optional, e.g., "newest", "oldest")
- **Response**:

```json
{
  "incidents": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "category": "string",
      "location": {
        "latitude": "number",
        "longitude": "number"
      },
      "images": ["string"],
      "createdAt": "datetime",
      "user": {
        "id": "string",
        "name": "string"
      }
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

#### Get User's Incidents

- **Endpoint**: `/incidents/my-incidents`
- **Method**: GET
- **Query Parameters**:
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
- **Response**: Same as Get All Incidents

### 3. Categories

#### Get All Categories

- **Endpoint**: `/categories`
- **Method**: GET
- **Response**:

```json
{
  "categories": [
    {
      "id": "string",
      "name": "string",
      "description": "string"
    }
  ]
}
```

### 4. Notifications

#### Get User Notifications

- **Endpoint**: `/notifications`
- **Method**: GET
- **Query Parameters**:
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
- **Response**:

```json
{
  "notifications": [
    {
      "id": "string",
      "type": "string",
      "message": "string",
      "incidentId": "string",
      "read": "boolean",
      "createdAt": "datetime"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

#### Mark Notification as Read

- **Endpoint**: `/notifications/{id}/read`
- **Method**: PUT
- **Response**: 200 OK

## Data Models

### User

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "password": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Incident

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "location": {
    "latitude": "number",
    "longitude": "number"
  },
  "images": ["string"],
  "userId": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Category

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Notification

```json
{
  "id": "string",
  "userId": "string",
  "type": "string",
  "message": "string",
  "incidentId": "string",
  "read": "boolean",
  "createdAt": "datetime"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object" // optional
  }
}
```

Common error codes:

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

## Security Requirements

1. All endpoints must use HTTPS
2. Passwords must be hashed using bcrypt
3. JWT tokens must expire after 24 hours
4. Implement CORS policies
5. Input validation for all endpoints
6. File upload size limits for images
7. Rate limiting implementation
