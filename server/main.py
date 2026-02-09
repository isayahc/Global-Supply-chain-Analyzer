from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

# 1. Allow the frontend to talk to the backend
origins = [
    "http://localhost:5173",  # Vite's default port
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. A simple test route
@app.get("/api/hello")
def read_root():
    return {"message": "Hello from FastAPI + Python!"}



app = FastAPI()

# ... (Your existing API routes and CORS logic go here) ...

# 1. Mount the "static" folder (the built React app)
# Check if directory exists to avoid errors in dev mode
if os.path.isdir("static"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

# 2. Catch-all route for the SPA (Single Page Application)
# This ensures that if you refresh the page on /dashboard, it still loads index.html
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # If API request, let it fall through (you might need better logic here depending on setup)
    if full_path.startswith("api"):
        return {"error": "API route not found"}
    
    # Otherwise, serve the React app
    if os.path.exists("static/index.html"):
        return FileResponse("static/index.html")
    return {"message": "Frontend not built or not found (Are you in Dev mode?)"}