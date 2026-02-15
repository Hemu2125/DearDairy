# 📔 DearDiary - Full Stack Diary Application

A feature-rich diary application with AI-powered features, built with React + FastAPI + MongoDB.

## ✨ Features

- 🔐 **User Authentication** - Register/Login with JWT
- 📝 **Diary Entries** - Create, edit, delete entries with mood tracking
- 🤖 **AI Features** - Text improvement, summarization, todo extraction, suggestions (Groq AI - FREE)
- ✅ **Todos & Reminders** - Manage tasks and reminders
- 📊 **Statistics** - Track your journaling habits (weekly/monthly/yearly)
- 🎤 **Voice Input** - Speech-to-text for entries
- 🎨 **Modern UI** - Beautiful animations with Framer Motion

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **MongoDB** - Document database (Motor async driver)
- **Groq AI** - FREE AI inference (Llama 3.3 70B)
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Speech Recognition** - Voice input
- **Sonner** - Toast notifications
- **Lucide React** - Icons

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 1. Clone & Navigate
```bash
cd DearDairy
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies (already done)
pip install -r requirements.txt

# Configure .env file
# Edit .env and add your settings
```

**Important: Get a FREE Groq API Key** (Optional but recommended for AI features)
1. Visit https://console.groq.com
2. Sign up (free)
3. Create an API key
4. Add to `backend/.env`:
   ```
   GROQ_API_KEY="gsk_your_key_here"
   ```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies (already done)
npm install

# Configure .env (already created)
```

### 4. Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows (if installed)
net start MongoDB

# Or download MongoDB Community: https://www.mongodb.com/try/download/community
```

**Option B: MongoDB Atlas (Cloud - FREE)**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free cluster
3. Get connection string
4. Update `backend/.env`:
   ```
   MONGO_URL="mongodb+srv://username:password@cluster.mongodb.net"
   ```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📁 Project Structure

```
DearDiary/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│   
├── frontend/
│   ├── src/
│   │   ├──components/
│   │   │   ├── Navbar.js     # Navbar component
│   │   ├── pages/
│   │   │   ├── App.js        # Main component
│   │   │   ├── Landing.js    # Landing page
│   │   │   ├── Auth.js       # Login/Register
│   │   │   ├── Dashboard.js  # Create entries
│   │   │   ├── Entries.js    # View all entries
│   │   │   ├── Statistics.js # Stats dashboard
│   │   │   └── TodosReminders.js
│   │   ├── main.jsx          # Entry point
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── .env                   # Frontend config
└── README.md
```

## 🔧 Environment Variables

### Backend (.env)
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="deardiary"
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"
GROQ_API_KEY=""  # Optional - for AI features
JWT_SECRET_KEY="your-secret-key-change-in-production"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Diary Entries
- `GET /api/entries` - Get all entries
- `POST /api/entries` - Create entry
- `GET /api/entries/{id}` - Get specific entry
- `PUT /api/entries/{id}` - Update entry
- `DELETE /api/entries/{id}` - Delete entry

### AI Features (Requires GROQ_API_KEY)
- `POST /api/ai/improve-text` - Improve grammar/style
- `POST /api/ai/summarize` - Summarize entry
- `POST /api/ai/extract-todos` - Extract tasks
- `POST /api/ai/generate-suggestions` - Get suggestions

### Todos & Reminders
- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create todo
- `PUT /api/todos/{id}` - Update todo
- `DELETE /api/todos/{id}` - Delete todo
- Similar endpoints for `/api/reminders`

### Statistics
- `GET /api/stats/weekly` - Weekly stats
- `GET /api/stats/monthly` - Monthly stats
- `GET /api/stats/yearly` - Yearly stats

## 🤖 AI Features (FREE with Groq)

The app uses **Groq AI** which is **completely FREE** with generous limits:
- Model: Llama 3.3 70B Versatile
- Super fast inference
- No credit card required
- Sign up: https://console.groq.com

**If you don't set GROQ_API_KEY:**
- All other features work perfectly
- AI features will show "AI service not configured" message

## 🐳 Docker Deployment (Optional)

```bash
# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]

# Build and run
docker build -t deardiary-backend ./backend
docker run -p 8000:8000 --env-file backend/.env deardiary-backend
```

## 🚢 Deployment 

### 1. Render (Backend)
- Deploy backend as Web Service
- Configure env variables

### 2. Vercel (Frontend) 
- Frontend on Vercel (free)

## 🔐 Security Notes

**For Production:**
1. Change `JWT_SECRET_KEY` to a strong random string
2. Use environment-specific CORS origins (not `*`)
3. Enable HTTPS/SSL
4. Use MongoDB Atlas with authentication
5. Add rate limiting
6. Validate all inputs
7. Use secure password requirements

## 🆘 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongod --version

# Or use MongoDB Atlas (cloud)
# Get free cluster at: https://www.mongodb.com/cloud/atlas
```

### Port Already in Use
```bash
# Backend (change port)
uvicorn server:app --reload --port 8001

# Frontend (change in vite.config.js)
```

### CORS Errors
- Ensure backend .env has correct CORS_ORIGINS
- Check frontend .env has correct VITE_API_URL

### AI Features Not Working
1. Get FREE Groq API key: https://console.groq.com
2. Add to backend/.env: `GROQ_API_KEY="gsk_..."`
3. Restart backend server

## 📝 Usage Tips

1. **First time:** Register a new account
2. **Create Entry:** Go to Dashboard, write or speak your entry
3. **AI Features:** Click AI buttons to improve text, get suggestions, etc.
4. **View Entries:** Click "Entries" to see all your past entries
5. **Track Progress:** "Statistics" shows your journaling habits
6. **Manage Tasks:** "Todos & Reminders" for task management

## 🛣️ Roadmap

- [ ] Rich text editor
- [ ] Image attachments
- [ ] Search entries
- [ ] Export to PDF/Markdown
- [ ] Mobile app
- [ ] Dark mode
- [ ] Backup/restore
- [ ] Multiple journals

## 📄 License

MIT License - Free to use and modify

## 🤝 Contributing

Issues and pull requests welcome!

---

**Built with ❤️ using React + FastAPI + MongoDB + Groq AI**

Need help? Create an issue on GitHub!
