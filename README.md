# Trainr - Course Management Platform

A modern course management platform with video meetings, screen recording, and community features.

## Features

- 🎥 **Native Video Meetings** - WebRTC-based video calls with screen sharing
- 📹 **Screen Recording** - Loom-style screen recorder for tutorials
- 📚 **Course Management** - Create and manage courses with lessons
- 👥 **Community** - Student interaction and discussions
- 💳 **Subscription Management** - Stripe integration for payments
- 📊 **Analytics Dashboard** - Track student progress and engagement

## Tech Stack

### Frontend
- React 19.1.1
- TypeScript
- Vite 7.1.7
- Tailwind CSS
- Socket.IO Client

### Backend
- Node.js
- Express
- Socket.IO
- Supports both MongoDB (local) and Supabase (production)

## Database Support

The application supports dual database configuration:
- **MongoDB** - For local development
- **Supabase** - For production deployment

See `DATABASE_CONFIG.md` and `DEPLOYMENT_GUIDE.md` for detailed setup instructions.

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (for local development) or Supabase account (for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd trainr-new-k-main
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Backend configuration
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   
   # Frontend configuration
   cd ../frontend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Start backend (in backend directory)
   npm run dev
   
   # Start frontend (in frontend directory)
   npm run dev
   ```

## Environment Configuration

### Local Development (MongoDB)
```env
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/trainr
```

### Production (Supabase)
```env
DB_TYPE=supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-key-here
```

See `.env.example` files for all available options.

## Deployment

See `DEPLOYMENT_GUIDE.md` for step-by-step deployment instructions.

### Quick Deploy to Render/Vercel
1. Set environment variables (see DEPLOYMENT_GUIDE.md)
2. Configure database (Supabase)
3. Deploy backend and frontend

## Documentation

- `DATABASE_CONFIG.md` - Database setup and configuration
- `DEPLOYMENT_GUIDE.md` - Production deployment guide
- `DATABASE_SETUP_README.md` - Quick reference for database setup

## Features in Detail

### Video Meetings
- Create and schedule meetings
- Real-time WebRTC video/audio
- Screen sharing
- Chat functionality
- Participant management
- Meeting expiration validation

### Screen Recording
- Record screen, camera, or both
- Customizable camera overlay
- Audio recording (mic + system)
- WebM output with VP9 codec
- 1080p @ 30fps

### Course Management
- Create courses with multiple lessons
- Track student progress
- Community discussions
- Analytics and insights

## License

[Your License Here]

## Support

For issues and questions, please open a GitHub issue.
