# MERN Stack Chat Application

A real-time chat application built with MongoDB, Express.js, React, Node.js, Socket.IO, and Tailwind CSS.

## Features

- **User Authentication**: Register and login with JWT tokens and comprehensive validation
- **Email Validation**: Only accepts valid email addresses from recognized providers
- **Password Security**: Strong password requirements with real-time strength indicator
- **Rate Limiting**: Protection against spam and brute force attacks
- **Real-time Messaging**: Instant messaging using Socket.IO
- **Individual Chat**: Private messaging between friends with unique user codes
- **Friend System**: Send/receive friend requests using unique user codes
- **Multiple Chat Rooms**: Switch between different chat channels
- **Typing Indicators**: See when other users are typing
- **Online Status**: Track user online/offline status
- **Responsive Design**: Beautiful UI with Tailwind CSS
- **Message History**: Persistent message storage in MongoDB

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **Tailwind CSS** - Styling
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Navigation
- **React Hot Toast** - Notifications

## User Registration Requirements

### Email Validation
- Must be a valid email format (user@domain.com)
- Must use a recognized email provider (Gmail, Yahoo, Outlook, etc.)
- Temporary or disposable email addresses are not allowed

### Username Requirements
- 3-20 characters long
- Can contain letters, numbers, and underscores only
- Cannot use reserved usernames (admin, moderator, etc.)

### Password Requirements
- Minimum 8 characters long
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one number
- Real-time password strength indicator

### Security Features
- Rate limiting: 3 registration attempts per 15 minutes per IP
- Rate limiting: 5 login attempts per 15 minutes per IP
- JWT token-based authentication
- Password hashing with bcrypt

## Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mern-chat-app
   ```

2. **Install dependencies for both client and server**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/chatapp
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # For local MongoDB installation
   mongod
   
   # Or use MongoDB Atlas cloud database
   # Update MONGODB_URI in .env file with your Atlas connection string
   ```

## Running the Application

### Development Mode

1. **Start both client and server concurrently**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend React app on `http://localhost:3000`

### Production Mode

1. **Build the client**
   ```bash
   npm run build
   ```

2. **Start the server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Messages
- `GET /api/messages/:room` - Get messages for a room
- `POST /api/messages` - Send a message

## Socket Events

### Client to Server
- `sendMessage` - Send a new message
- `joinRoom` - Join a chat room
- `typing` - Start typing indicator
- `stopTyping` - Stop typing indicator

### Server to Client
- `newMessage` - Receive new message
- `userJoined` - User joined notification
- `userLeft` - User left notification
- `userTyping` - Typing indicator
- `roomJoined` - Room join confirmation

## Project Structure

```
mern-chat-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # Express routes
│   ├── middleware/         # Custom middleware
│   ├── socket/             # Socket.IO handlers
│   └── server.js           # Main server file
├── package.json            # Root package.json
└── README.md
```

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Join Rooms**: Click on different channels in the sidebar to switch rooms
3. **Send Messages**: Type in the message input and press Enter or click Send
4. **Real-time Updates**: See messages appear instantly and typing indicators

## Available Chat Rooms

- **#general** - Main chat room
- **#random** - Random discussions
- **#tech** - Technology discussions
- **#gaming** - Gaming discussions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Make sure MongoDB is running
   - Check the MONGODB_URI in your .env file

2. **Socket Connection Issues**
   - Ensure both client and server are running
   - Check if ports 3000 and 5000 are available

3. **Authentication Issues**
   - Verify JWT_SECRET is set in .env
   - Clear browser localStorage if needed

### Support

If you encounter any issues, please create an issue in the repository or contact the maintainers.