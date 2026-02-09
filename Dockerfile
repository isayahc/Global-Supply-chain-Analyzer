# ==========================================
# Stage 1: Build the Frontend (Vite + Bun)
# ==========================================
FROM oven/bun:1 AS frontend-builder

WORKDIR /app/client

# Copy frontend files
# COPY client/package.json client/bun.lockb ./
COPY client/package.json client/bun.lock ./
RUN bun install --frozen-lockfile

COPY client/ .

# Build the static files (creates /dist folder)
RUN bun run build


# ==========================================
# Stage 2: Setup the Backend (FastAPI)
# ==========================================
FROM python:3.11-slim

WORKDIR /app

# Prevent Python from writing pyc files to disc
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install backend dependencies
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY server/ .

# COPY the built frontend from Stage 1 into the backend folder
COPY --from=frontend-builder /app/client/dist /app/static

# Expose port 8000
EXPOSE 8000

# Command to run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]