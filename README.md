# 🚀 Social Media Platform

>A full-stack, modern social media platform with real-time messaging, stories, games, and interactive features. Built with React, Node.js, Express, MongoDB, Socket.io and Tailwind CSS

<div align="center">

![React](https://img.shields.io/badge/-React%2018-61DAFB?style=flat-square&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/-Node.js%2018+-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/-Express.js-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/-MongoDB-13AA52?style=flat-square&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/-Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/-Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)

[Overview](#-overview) • [Quick Start](#-quick-start) • [Project Structure](#-project-structure) • [Features](#-features) • [Architecture](#-architecture)

</div>

---

## ✨ Features

### Core Social Features
- 📱 **Feed & Posts** - Create, edit, delete, and interact with posts
- 💬 **Real-time Messaging** - Instant messaging with Socket.io integration
- 📖 **Stories** - Share time-limited stories with your followers
- 🔔 **Notifications** - Real-time notifications for interactions
- 👥 **User Profiles** - Customizable profiles with follower system
- ❤️ **Interactions** - Like, comment, and share posts
- 🔍 **Explore** - Discover new users and content
- 🚫 **Block System** - Block and unblock users
- 📧 **Email Integration** - Contact support and notifications

### Advanced Features
- 🎮 **Interactive Games** - 7 built-in games:
  - Battleship Game
  - King Chess
  - Medieval Defense
  - Neon Snake in Matrix
  - Neon Tic-Tac-Toe
  - Rock Paper Scissors
  - Weird T-Rex

### UI/UX Features
- 🌓 **Dark Mode** - Seamless dark/light theme switching
- ✨ **Smooth Animations** - Framer Motion powered transitions
- 📱 **Responsive Design** - Mobile-first responsive layout
- ⌨️ **Real-time Typing Indicators** - See when others are typing
- 🎨 **Modern Design** - Clean, modern aesthetic with Tailwind CSS
- 🔄 **Loading States** - Skeleton loaders for better UX

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.0
- **Styling:** Tailwind CSS 3.3.0 + PostCSS
- **State Management:** Zustand 4.4.0
- **Routing:** React Router DOM 6.19.0
- **Real-time:** Socket.io Client 4.7.1
- **Animations:** Framer Motion 10.16.0
- **HTTP Client:** Axios 1.6.0
- **Icons:** React Icons 4.12.0
- **Notifications:** React Toastify 9.1.3
- **Date Utilities:** Date-fns 2.30.0

### Backend (Companion)
- **Runtime:** Node.js
- **Framework:** Express.js 4.18.2
- **Database:** MongoDB with Mongoose 7.5.0
- **Real-time:** Socket.io 4.7.1
- **Authentication:** JWT + bcryptjs
- **File Upload:** Multer 1.4.5
- **Email:** Nodemailer 6.9.7
- **Validation:** Express Validator 7.0.0

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Vite dev environment setup

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Social\ Media/client
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment configuration** (if needed)
```bash
# Configure API endpoints in src/services/api.js or .env
```

4. **Start development server**
```bash
npm run dev
```


The application will be available at `http://localhost:5173` (default Vite port)

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Code Quality
```bash
npm run lint
```

---

## 📁 Project Structure

```
client/
├── public/                    # Static assets and games
│   ├── games/                # 7 Interactive games
│   │   ├── Battleship Game/
│   │   ├── King Chess/
│   │   ├── Medieval Defense/
│   │   ├── Neon Snake in Matrix/
│   │   ├── Neon Tic-Tac-Toe/
│   │   ├── Rock Paper Scissors/
│   │   └── Weird T-Rex/
│   ├── logo.png
│   └── default-avatar.svg
│
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── AnimatedCounter.jsx
│   │   ├── AnimatedInput.jsx
│   │   ├── PostCard.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── StoryViewer.jsx
│   │   ├── UserCard.jsx
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   ├── MainLayout.jsx
│   │   ├── Modal Components (BlockConfirmModal, ConfirmModal, etc.)
│   │   ├── messages/          # Message-specific components
│   │   └── ... (30+ components)
│   │
│   ├── pages/                 # Page components
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── FeedPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── MessagesPage.jsx
│   │   ├── NotificationsPage.jsx
│   │   ├── StoriesPage.jsx
│   │   ├── GamesPage.jsx
│   │   ├── ExplorePage.jsx
│   │   ├── SettingsPage.jsx
│   │   ├── PrivacyPage.jsx
│   │   ├── TermsPage.jsx
│   │   ├── ContactPage.jsx
│   │   └── PostDetailPage.jsx
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useConversations.js
│   │   ├── useMessages.js
│   │   ├── useScrollAnimation.js
│   │   ├── useCustom.js
│   │   └── useToast.jsx
│   │
│   ├── services/              # API & real-time services
│   │   ├── api.js            # Axios instance & endpoints
│   │   ├── apiService.js      # API service layer
│   │   └── socketService.js   # Socket.io integration
│   │
│   ├── store/                 # Zustand state management
│   │   ├── authStore.js
│   │   ├── userStore.js
│   │   ├── postStore.js
│   │   ├── messageStore.js
│   │   ├── notificationStore.js
│   │   ├── storyStore.js
│   │   └── themeStore.js
│   │
│   ├── utils/                 # Utility functions
│   │   ├── helpers.js
│   │   ├── avatarHelper.js
│   │   ├── hashtagUtils.js
│   │   └── animationVariants.js
│   │
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
│
├── index.html                 # HTML template
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind CSS config
├── postcss.config.js          # PostCSS config
├── .stylelintrc.json          # Style linter config
├── package.json               # Dependencies & scripts
└── README.md                  # Project documentation
```

---

## 🔌 API Integration

The client connects to a backend API running on `http://localhost:5000` with the following main endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Fetch feed posts
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like post
- `POST /api/posts/:id/unlike` - Unlike post

### Messages
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages/:conversationId` - Get conversation messages
- `POST /api/messages/send` - Send message

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

### Stories
- `GET /api/stories` - Get stories
- `POST /api/stories` - Create story
- `DELETE /api/stories/:id` - Delete story

### Users
- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id/follow` - Follow user
- `POST /api/users/:id/unfollow` - Unfollow user
- `POST /api/users/:id/block` - Block user

---

## 🎨 Styling & Theme

The application uses a modern design system with:

- **Tailwind CSS** for utility-first styling
- **Plus Jakarta Sans** as the primary font family
- **Color Palette:** Light and dark theme support
- **Animations:** Smooth transitions and Framer Motion effects
- **Responsive Design:** Mobile-first approach with breakpoints

### Dark Mode
Dark mode is implemented through:
- `themeStore.js` - Zustand store for theme state
- CSS variables in `index.css`
- Tailwind's `dark:` modifier support

---

## 🔄 Real-time Features

### Socket.io Implementation
Location: `src/services/socketService.js`

**Supported Events:**
- Message notifications
- Typing indicators
- Notification updates
- Online/offline status
- Story updates
- Post interactions

---

## 🎮 Games

The platform integrates 7 fun mini-games:

| Game | Type | Location |
|------|------|----------|
| Battleship | Strategy | `/public/games/Battleship Game/` |
| King Chess | Strategy | `/public/games/King Chess/` |
| Medieval Defense | Tower Defense | `/public/games/Medieval Defense/` |
| Neon Snake | Classic | `/public/games/Neon Snake in Matrix/` |
| Neon Tic-Tac-Toe | Classic | `/public/games/Neon Tic-Tac-Toe/` |
| Rock Paper Scissors | Casual | `/public/games/Rock Paper Scissors/` |
| Weird T-Rex | Arcade | `/public/games/Weird T-Rex/` |

Access games via the Games page at `/games`

---

## 📦 Key Components

### Component Examples

**PostCard** - Displays a single post with interactions
```jsx
<PostCard post={post} onLike={handleLike} />
```

**MessageBubble** - Real-time message display
```jsx
<MessageBubble message={message} isOwn={true} />
```

**StoryViewer** - Interactive story viewer
```jsx
<StoryViewer stories={stories} onClose={handleClose} />
```

**UserCard** - User profile card with follow button
```jsx
<UserCard user={user} onFollow={handleFollow} />
```

---

## 🎯 State Management

The application uses **Zustand** stores for state management:

- **authStore** - Authentication state and JWT tokens
- **userStore** - Current user data and settings
- **postStore** - Posts cache and feed state
- **messageStore** - Conversations and message cache
- **notificationStore** - Notifications and counts
- **storyStore** - User stories and viewing state
- **themeStore** - Dark/light mode preference

---

## � Overview

A production-ready social media platform featuring:

✅ Full user authentication & authorization  
✅ Real-time messaging with Socket.io  
✅ Post creation, editing, and interactions  
✅ Story sharing system  
✅ User profiles with followers system  
✅ Notification system  
✅ 7 interactive games  
✅ Dark/light theme support  
✅ Email notifications  
✅ User blocking & privacy controls  
✅ Responsive design for all devices  
✅ Fast build with Vite

---

## 🏗️ Architecture

### Frontend Architecture
```
React App (Vite)
↓
React Router (Routing)
↓
Zustand (State Management)
├── Auth Store (JWT, User Data)
├── Post Store (Feed, Cache)
├── Message Store (Conversations)
├── Notification Store
├── User Store (Profiles)
├── Story Store
└── Theme Store (Dark Mode)
↓
API & Socket Services
└── Express Backend
```

### Backend Architecture
```
Express.js Server
└── Socket.io (Real-time Events)
    ├── HTTP Routes
    │   ├── Auth (/api/auth)
    │   ├── Posts (/api/posts)
    │   ├── Messages (/api/messages)
    │   ├── Notifications (/api/notifications)
    │   ├── Stories (/api/stories)
    │   └── Comments (/api/comments)
    │
    ├── Middleware
    │   ├── Auth (JWT verification)
    │   ├── Error Handler
    │   └── CORS
    │
    ├── Controllers
    │   └── Business Logic
    │
    ├── Services
    │   └── Complex Operations
    │
    └── MongoDB Database
        ├── Users
        ├── Posts
        ├── Messages
        ├── Conversations
        ├── Notifications
        ├── Stories
        ├── Comments
        └── More...
```

### Data Flow
```
User Action (UI)
↓
React Component State Update
↓
Zustand Store Update
↓
API Service Call / Socket Emit
↓
Backend Processing
↓
MongoDB Query/Update
↓
Response to Frontend
↓
UI Update
```

---

## 📋 Full Quick Start

### Prerequisites

- **Node.js:** 16.x or higher
- **npm/yarn:** Latest version
- **MongoDB:** Local or cloud instance (MongoDB Atlas)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd "Social Media"
```

2. **Setup Backend**
```bash
cd server
npm install

# Create .env file with your configuration
# Example:
# MONGODB_URI=mongodb://localhost:
# JWT_SECRET=your-secret-key
# NODE_ENV=development
# CORS_ORIGIN=http://localhost:
```

3. **Setup Frontend**
```bash
cd ../client
npm install
```

4. **Start Development Servers**

**Terminal 1 - Backend (port 5000):**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend (port 5173):**
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser!

---

## 📁 Full Project Structure

```
Social Media/
├── client/                         # Frontend (React + Vite)
│   ├── public/
│   │   └── games/                 # 7 Interactive games
│   ├── src/
│   │   ├── components/            # Reusable components (30+)
│   │   ├── pages/                 # Page components (14 pages)
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── services/              # API & Socket.io services
│   │   ├── store/                 # Zustand state stores
│   │   ├── utils/                 # Utility functions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── README.md                  # Frontend documentation
│
├── server/                         # Backend (Express + MongoDB)
│   ├── src/
│   │   ├── config/               # Database & Socket config
│   │   ├── controllers/          # Route controllers
│   │   ├── middleware/           # Custom middleware
│   │   ├── models/               # MongoDB models
│   │   ├── routes/               # API routes
│   │   ├── services/             # Business logic
│   │   ├── utils/                # Utility functions
│   │   └── index.js
│   ├── uploads/                  # File uploads
│   ├── package.json
│   ├── seed.js
│   └── README.md                 # Backend documentation
│
├── package.json                   # Root monorepo config
└── README.md                      # This file
```

---

## 🌐 API Endpoints

### Authentication
```
POST   /api/auth/register           Register new user
POST   /api/auth/login              Login user
GET    /api/auth/me                 Get current user
POST   /api/auth/logout             Logout user (client)
```

### Posts
```
GET    /api/posts                   Get feed posts
POST   /api/posts                   Create post
PUT    /api/posts/:id               Update post
DELETE /api/posts/:id               Delete post
POST   /api/posts/:id/like          Like post
POST   /api/posts/:id/unlike        Unlike post
GET    /api/posts/:id               Get single post
```

### Messages
```
GET    /api/messages/conversations  Get all conversations
GET    /api/messages/:conversationId Get messages
POST   /api/messages/send           Send message
```

### Users
```
GET    /api/users/:id               Get user profile
PUT    /api/users/:id               Update profile
POST   /api/users/:id/follow        Follow user
POST   /api/users/:id/unfollow      Unfollow user
POST   /api/users/:id/block         Block user
GET    /api/users/search            Search users
```

### Notifications
```
GET    /api/notifications           Get notifications
PUT    /api/notifications/:id/read  Mark as read
DELETE /api/notifications/:id       Delete notification
```

### Stories
```
GET    /api/stories                 Get stories
POST   /api/stories                 Create story
DELETE /api/stories/:id             Delete story
POST   /api/stories/:id/view        Mark as viewed
```

---

## 🔄 Real-time Events (Socket.io)

### Client → Server
```javascript
// Messages
socket.emit('send_message', { content, recipientId })
socket.emit('typing', { conversationId })

// Notifications
socket.emit('mark_notification_read', { notificationId })

// Presence
socket.emit('user_online', { userId })
```

### Server → Client
```javascript
// Messages
socket.on('message_received', (message) => {...})
socket.on('user_typing', (data) => {...})

// Notifications
socket.on('notification', (notification) => {...})

// Presence
socket.on('user_online', (userId) => {...})
socket.on('user_offline', (userId) => {...})
```

---

## 📊 Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  avatar: String,
  bio: String,
  followers: [ObjectId],
  following: [ObjectId],
  blockedUsers: [ObjectId],
  darkMode: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Post Model
```javascript
{
  _id: ObjectId,
  author: ObjectId (ref: User),
  content: String,
  image: String,
  likes: [ObjectId],
  comments: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```javascript
{
  _id: ObjectId,
  sender: ObjectId (ref: User),
  receiver: ObjectId (ref: User),
  conversation: ObjectId (ref: Conversation),
  content: String,
  image: String,
  isRead: Boolean,
  createdAt: Date
}
```

---

## 🔐 Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcryptjs
- ✅ CORS enabled and configured
- ✅ Input validation (express-validator)
- ✅ Protected routes (auth middleware)
- ✅ Secure password storage
- ✅ User blocking system
- ✅ Privacy controls

---

## 📱 Responsive Design

The platform is fully responsive:
- **Mobile:** Optimized for phones (< 640px)
- **Tablet:** Enhanced layout (640px - 1024px)
- **Desktop:** Full feature desktop experience (> 1024px)

---

## 🚀 Performance

- **Frontend:** Vite for optimized builds
- **Code Splitting:** Lazy loading with React Router
- **Image Optimization:** Optimized avatars and uploads
- **Caching:** Zustand for efficient state management
- **Real-time:** Socket.io with minimal payload

---

## 🐛 Development & Debugging

### Running in Development Mode

**Backend with auto-reload:**
```bash
cd server
npm run dev
```

**Frontend with hot reload:**
```bash
cd client
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd client
npm run build
npm run preview  # Preview production build
```

### Installation & Packages

**For New Packages (Frontend):**
```bash
cd client
npm install <package-name>
```

**For New Packages (Backend):**
```bash
cd server
npm install <package-name>
```

---

## 🌐 Deployment

### Frontend Deployment (Vercel, Netlify, GitHub Pages)
```bash
cd client
npm run build
# Upload dist/ folder to hosting
```

### Backend Deployment (Heroku, Railway, DigitalOcean)
```bash
# Configure environment variables
# Deploy server/ directory
npm start
```

### Environment Variables

**Backend (.env):**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>
JWT_SECRET=<your-secret-key-here>
CORS_ORIGIN=<your-domain-url>
SMTP_EMAIL=<your-email@example.com>
SMTP_PASSWORD=<your-email-password>
```

**Frontend (.env):**
```
VITE_API_URL=<your-api-url>
```

---

## 🗺️ Roadmap

Future enhancements:
- [ ] Video calling feature
- [ ] Live streaming
- [ ] Advanced search and filters
- [ ] User analytics dashboard
- [ ] Custom themes and branding
- [ ] Marketplace integration
- [ ] AI-powered content recommendations
- [ ] Advanced moderation tools
- [ ] API rate limiting
- [ ] Payment integration

---

## 📚 Documentation

- **Frontend Details:** See [client/README.md](./client/README.md)
- **Backend Details:** See [server/README.md](./server/README.md)
- **API Docs:** Check backend routes in `/server/src/routes/`
- **Component Catalog:** Review `/client/src/components/`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📝 Code Style

- **Frontend:** React best practices, functional components
- **Backend:** Express.js conventions, MVC pattern
- **Naming:** CamelCase for JS, PascalCase for components
- **Files:** One component/utility per file

---

## 📞 Support & Contact

For issues, feature requests, or questions:
- Open an issue on GitHub
- Use the contact form in the app (`/contact`)
- Review the Privacy Policy and Terms of Service

---

## 📄 License

© 2026 Zurab Shengelia. All rights reserved.

This project and all its contents are proprietary and owned by Zurab Shengelia. Unauthorized copying, modification, or distribution is prohibited without explicit permission.

---

## 👏 Acknowledgments

- React & React Router communities
- Tailwind CSS team
- Socket.io developers
- MongoDB team
- Express.js community
- All open-source contributors

---

<div align="center">

### Made with ❤️ by me (Zurab Shengelia)

**⭐ If you love this project, please give it a star!**

[📁 Client Docs](./client/README.md) • [📁 Server Docs](./server/README.md)

</div>
