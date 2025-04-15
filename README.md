# Incident Reporting Application

A full-stack application for reporting and managing incidents in real-time.

## Features

- User authentication and authorization
- Real-time incident reporting
- Incident categorization
- Location-based incident tracking
- Image upload support
- Real-time notifications
- User dashboard for managing reported incidents

## Tech Stack

### Backend

- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Uses http server and does not process request from
-  a frontend hosted on a secure(https) server

### Frontend

- React with TypeScript
- Vite
- Material-UI
- react redux for state management

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- Backend runs on `http://localhost:3000`
- Frontend runs on `http://localhost:5173`

## API Documentation

See `API_REQUIREMENTS.md` for detailed API documentation.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
