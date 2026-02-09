from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import google.generativeai as genai
import googlemaps
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# --- CONFIGURATION ---
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gmaps = googlemaps.Client(key=os.getenv("MAPS_API_KEY"))

# --- CORS ---
origins = ["*"] # For hackathon speed, allow all
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---
class SupplyChainNode(BaseModel):
    company_name: str
    role: str
    location_query: str 

class SupplyChainResponse(BaseModel):
    product: str
    risk_score: int  # 0 (Safe) to 100 (Critical Risk)
    risk_summary: str # e.g. "Highly concentrated in East Asia."
    nodes: List[SupplyChainNode]

# --- HELPER: MAPS SEARCH ---
def get_coords_for_node(node: SupplyChainNode):
    try:
        places_result = gmaps.places(query=node.location_query)
        if places_result['status'] == 'OK' and places_result['results']:
            top_result = places_result['results'][0]
            return {
                **node.dict(),
                "found": True,
                "coordinates": top_result['geometry']['location'],
                "address": top_result['formatted_address']
            }
    except Exception as e:
        print(f"Error: {e}")
    return {**node.dict(), "found": False, "coordinates": None, "address": "Unknown"}

# --- ENDPOINT: CRISIS MANAGER ---
@app.post("/api/supply-chain")
def get_supply_chain(product_name: str):
    # 1. NEW PROMPT: Ask for Risk Analysis
    prompt = f"""
    Analyze the supply chain for: {product_name}.
    
    Task 1: Identify 5 critical companies (Tier 1 & 2 suppliers).
    Task 2: Assess the "Supply Chain Resilience Score" (0 = Very Safe, 100 = Critical Risk).
    
    Consider:
    - Geographic concentration (e.g. is everything in one region?)
    - Geopolitical stability of those regions.
    - Single points of failure (e.g. only one factory makes this).

    Return JSON with:
    - product
    - risk_score (int)
    - risk_summary (1 short sentence)
    - nodes (list of companies with name, role, and location_query)
    """

    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=SupplyChainResponse
        )
    )
    
    chain_data = json.loads(response.text)
    
    # 2. Ground with Google Maps
    nodes = [SupplyChainNode(**node) for node in chain_data['nodes']]
    with ThreadPoolExecutor() as executor:
        enriched_nodes = list(executor.map(get_coords_for_node, nodes))

    # 3. Return the fully enriched crisis report
    return {
        "product": chain_data['product'],
        "risk_score": chain_data['risk_score'],
        "risk_summary": chain_data['risk_summary'],
        "supply_chain": enriched_nodes
    }

# --- STATIC FILES (KEEP AT BOTTOM) ---
if os.path.isdir("static"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if full_path.startswith("api"): return {"error": "API route not found"}
    target_file = f"static/{full_path}"
    if os.path.exists(target_file) and os.path.isfile(target_file):
        media_type = "image/svg+xml" if full_path.endswith(".svg") else None
        return FileResponse(target_file, media_type=media_type)
    if os.path.exists("static/index.html"): return FileResponse("static/index.html")
    return {"message": "Frontend not found"}