from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from groq import AsyncGroq


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT settings
JWT_SECRET = os.environ['JWT_SECRET_KEY']
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 720

# Groq AI client (free tier)
GROQ_API_KEY = os.environ['GROQ_API_KEY']
groq_client = AsyncGroq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class EntryCreate(BaseModel):
    title: Optional[str] = ""
    content: str
    mood: Optional[str] = None

class EntryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    mood: Optional[str] = None

class EntryResponse(BaseModel):
    id: str
    user_id: str
    date: str
    title: str
    content: str
    mood: Optional[str] = None
    word_count: int
    created_at: str
    updated_at: str

class TodoCreate(BaseModel):
    text: str
    due_date: Optional[str] = None
    source_entry_id: Optional[str] = None

class TodoUpdate(BaseModel):
    text: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[str] = None

class TodoResponse(BaseModel):
    id: str
    user_id: str
    text: str
    completed: bool
    due_date: Optional[str] = None
    source_entry_id: Optional[str] = None
    created_at: str

class ReminderCreate(BaseModel):
    text: str
    reminder_date: str

class ReminderUpdate(BaseModel):
    text: Optional[str] = None
    reminder_date: Optional[str] = None
    completed: Optional[bool] = None

class ReminderResponse(BaseModel):
    id: str
    user_id: str
    text: str
    reminder_date: str
    completed: bool
    created_at: str

class AIRequest(BaseModel):
    text: str

class AIResponse(BaseModel):
    result: str

class StatsResponse(BaseModel):
    period: str
    entry_count: int
    total_words: int
    avg_words_per_entry: float
    most_active_day: Optional[str] = None


# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        'user_id': user_id,
        'exp': expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        if not user_id:
            raise HTTPException(status_code=401, detail='Invalid token')
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')


# Auth endpoints
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "name": user_data.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Generate token
    token = create_jwt_token(user_id)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            created_at=user_doc["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_jwt_token(user['id'])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user['id'],
            email=user['email'],
            name=user['name'],
            created_at=user['created_at']
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=user['id'],
        email=user['email'],
        name=user['name'],
        created_at=user['created_at']
    )


# Entry endpoints
@api_router.post("/entries", response_model=EntryResponse)
async def create_entry(entry_data: EntryCreate, user_id: str = Depends(get_current_user)):
    entry_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    word_count = len(entry_data.content.split())
    
    entry_doc = {
        "id": entry_id,
        "user_id": user_id,
        "date": datetime.now(timezone.utc).date().isoformat(),
        "title": entry_data.title,
        "content": entry_data.content,
        "mood": entry_data.mood,
        "word_count": word_count,
        "created_at": now,
        "updated_at": now
    }
    
    await db.entries.insert_one(entry_doc)
    
    return EntryResponse(**entry_doc)

@api_router.get("/entries", response_model=List[EntryResponse])
async def get_entries(user_id: str = Depends(get_current_user), skip: int = 0, limit: int = 50):
    entries = await db.entries.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return [EntryResponse(**entry) for entry in entries]

@api_router.get("/entries/{entry_id}", response_model=EntryResponse)
async def get_entry(entry_id: str, user_id: str = Depends(get_current_user)):
    entry = await db.entries.find_one({"id": entry_id, "user_id": user_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    return EntryResponse(**entry)

@api_router.put("/entries/{entry_id}", response_model=EntryResponse)
async def update_entry(entry_id: str, entry_data: EntryUpdate, user_id: str = Depends(get_current_user)):
    entry = await db.entries.find_one({"id": entry_id, "user_id": user_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    update_data = {k: v for k, v in entry_data.model_dump().items() if v is not None}
    
    if 'content' in update_data:
        update_data['word_count'] = len(update_data['content'].split())
    
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.entries.update_one({"id": entry_id}, {"$set": update_data})
    
    updated_entry = await db.entries.find_one({"id": entry_id}, {"_id": 0})
    return EntryResponse(**updated_entry)

@api_router.delete("/entries/{entry_id}")
async def delete_entry(entry_id: str, user_id: str = Depends(get_current_user)):
    result = await db.entries.delete_one({"id": entry_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    return {"message": "Entry deleted successfully"}


# AI endpoints
@api_router.post("/ai/improve-text", response_model=AIResponse)
async def improve_text(request: AIRequest, user_id: str = Depends(get_current_user)):
    if not groq_client:
        raise HTTPException(status_code=503, detail="AI service not configured. Please set GROQ_API_KEY in .env")
    
    try:
        completion = await groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an English writing assistant. Improve the given text for grammar, clarity, and style while maintaining the original meaning and tone. Return only the improved text without explanations."},
                {"role": "user", "content": request.text}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        return AIResponse(result=completion.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@api_router.post("/ai/summarize", response_model=AIResponse)
async def summarize_text(request: AIRequest, user_id: str = Depends(get_current_user)):
    if not groq_client:
        raise HTTPException(status_code=503, detail="AI service not configured. Please set GROQ_API_KEY in .env")
    
    try:
        completion = await groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a diary entry summarizer. Create a concise, meaningful summary of the given diary entry. Capture the key events, emotions, and insights. Return only the summary without explanations."},
                {"role": "user", "content": request.text}
            ],
            temperature=0.7,
            max_tokens=500
        )
        return AIResponse(result=completion.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@api_router.post("/ai/extract-todos", response_model=AIResponse)
async def extract_todos(request: AIRequest, user_id: str = Depends(get_current_user)):
    if not groq_client:
        raise HTTPException(status_code=503, detail="AI service not configured. Please set GROQ_API_KEY in .env")
    
    try:
        completion = await groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a task extraction assistant. Analyze the diary entry and extract actionable tasks or to-dos mentioned. Return them as a simple numbered list. If no tasks are found, return 'No tasks found'."},
                {"role": "user", "content": request.text}
            ],
            temperature=0.5,
            max_tokens=500
        )
        return AIResponse(result=completion.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@api_router.post("/ai/generate-suggestions", response_model=AIResponse)
async def generate_suggestions(request: AIRequest, user_id: str = Depends(get_current_user)):
    if not groq_client:
        raise HTTPException(status_code=503, detail="AI service not configured. Please set GROQ_API_KEY in .env")
    
    try:
        completion = await groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a personal growth coach. Based on the diary entry, provide 2-3 thoughtful suggestions for personal improvement, productivity, or well-being. Be encouraging and specific. Format as a simple numbered list."},
                {"role": "user", "content": request.text}
            ],
            temperature=0.8,
            max_tokens=600
        )
        return AIResponse(result=completion.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


# Todo endpoints
@api_router.get("/todos", response_model=List[TodoResponse])
async def get_todos(user_id: str = Depends(get_current_user)):
    todos = await db.todos.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [TodoResponse(**todo) for todo in todos]

@api_router.post("/todos", response_model=TodoResponse)
async def create_todo(todo_data: TodoCreate, user_id: str = Depends(get_current_user)):
    todo_id = str(uuid.uuid4())
    
    todo_doc = {
        "id": todo_id,
        "user_id": user_id,
        "text": todo_data.text,
        "completed": False,
        "due_date": todo_data.due_date,
        "source_entry_id": todo_data.source_entry_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.todos.insert_one(todo_doc)
    return TodoResponse(**todo_doc)

@api_router.put("/todos/{todo_id}", response_model=TodoResponse)
async def update_todo(todo_id: str, todo_data: TodoUpdate, user_id: str = Depends(get_current_user)):
    todo = await db.todos.find_one({"id": todo_id, "user_id": user_id}, {"_id": 0})
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    update_data = {k: v for k, v in todo_data.model_dump().items() if v is not None}
    await db.todos.update_one({"id": todo_id}, {"$set": update_data})
    
    updated_todo = await db.todos.find_one({"id": todo_id}, {"_id": 0})
    return TodoResponse(**updated_todo)

@api_router.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str, user_id: str = Depends(get_current_user)):
    result = await db.todos.delete_one({"id": todo_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    return {"message": "Todo deleted successfully"}


# Reminder endpoints
@api_router.get("/reminders", response_model=List[ReminderResponse])
async def get_reminders(user_id: str = Depends(get_current_user)):
    reminders = await db.reminders.find({"user_id": user_id}, {"_id": 0}).sort("reminder_date", 1).to_list(1000)
    return [ReminderResponse(**reminder) for reminder in reminders]

@api_router.post("/reminders", response_model=ReminderResponse)
async def create_reminder(reminder_data: ReminderCreate, user_id: str = Depends(get_current_user)):
    reminder_id = str(uuid.uuid4())
    
    reminder_doc = {
        "id": reminder_id,
        "user_id": user_id,
        "text": reminder_data.text,
        "reminder_date": reminder_data.reminder_date,
        "completed": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.reminders.insert_one(reminder_doc)
    return ReminderResponse(**reminder_doc)

@api_router.put("/reminders/{reminder_id}", response_model=ReminderResponse)
async def update_reminder(reminder_id: str, reminder_data: ReminderUpdate, user_id: str = Depends(get_current_user)):
    reminder = await db.reminders.find_one({"id": reminder_id, "user_id": user_id}, {"_id": 0})
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    update_data = {k: v for k, v in reminder_data.model_dump().items() if v is not None}
    await db.reminders.update_one({"id": reminder_id}, {"$set": update_data})
    
    updated_reminder = await db.reminders.find_one({"id": reminder_id}, {"_id": 0})
    return ReminderResponse(**updated_reminder)

@api_router.delete("/reminders/{reminder_id}")
async def delete_reminder(reminder_id: str, user_id: str = Depends(get_current_user)):
    result = await db.reminders.delete_one({"id": reminder_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    return {"message": "Reminder deleted successfully"}


# Statistics endpoints
@api_router.get("/stats/weekly", response_model=StatsResponse)
async def get_weekly_stats(user_id: str = Depends(get_current_user)):
    # Get entries from last 7 days
    seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).date().isoformat()
    entries = await db.entries.find(
        {"user_id": user_id, "date": {"$gte": seven_days_ago}},
        {"_id": 0}
    ).to_list(1000)
    
    entry_count = len(entries)
    total_words = sum(entry.get('word_count', 0) for entry in entries)
    avg_words = total_words / entry_count if entry_count > 0 else 0
    
    # Find most active day
    day_counts = {}
    for entry in entries:
        day = entry.get('date')
        day_counts[day] = day_counts.get(day, 0) + 1
    
    most_active_day = max(day_counts.items(), key=lambda x: x[1])[0] if day_counts else None
    
    return StatsResponse(
        period="weekly",
        entry_count=entry_count,
        total_words=total_words,
        avg_words_per_entry=round(avg_words, 1),
        most_active_day=most_active_day
    )

@api_router.get("/stats/monthly", response_model=StatsResponse)
async def get_monthly_stats(user_id: str = Depends(get_current_user)):
    # Get entries from last 30 days
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).date().isoformat()
    entries = await db.entries.find(
        {"user_id": user_id, "date": {"$gte": thirty_days_ago}},
        {"_id": 0}
    ).to_list(1000)
    
    entry_count = len(entries)
    total_words = sum(entry.get('word_count', 0) for entry in entries)
    avg_words = total_words / entry_count if entry_count > 0 else 0
    
    # Find most active day
    day_counts = {}
    for entry in entries:
        day = entry.get('date')
        day_counts[day] = day_counts.get(day, 0) + 1
    
    most_active_day = max(day_counts.items(), key=lambda x: x[1])[0] if day_counts else None
    
    return StatsResponse(
        period="monthly",
        entry_count=entry_count,
        total_words=total_words,
        avg_words_per_entry=round(avg_words, 1),
        most_active_day=most_active_day
    )

@api_router.get("/stats/yearly", response_model=StatsResponse)
async def get_yearly_stats(user_id: str = Depends(get_current_user)):
    # Get entries from last 365 days
    one_year_ago = (datetime.now(timezone.utc) - timedelta(days=365)).date().isoformat()
    entries = await db.entries.find(
        {"user_id": user_id, "date": {"$gte": one_year_ago}},
        {"_id": 0}
    ).to_list(10000)
    
    entry_count = len(entries)
    total_words = sum(entry.get('word_count', 0) for entry in entries)
    avg_words = total_words / entry_count if entry_count > 0 else 0
    
    # Find most active day
    day_counts = {}
    for entry in entries:
        day = entry.get('date')
        day_counts[day] = day_counts.get(day, 0) + 1
    
    most_active_day = max(day_counts.items(), key=lambda x: x[1])[0] if day_counts else None
    
    return StatsResponse(
        period="yearly",
        entry_count=entry_count,
        total_words=total_words,
        avg_words_per_entry=round(avg_words, 1),
        most_active_day=most_active_day
    )


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()