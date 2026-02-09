from pydantic import BaseModel
from typing import List

# This defines EXACTLY what we want Gemini to give us.
class Ingredient(BaseModel):
    name: str
    amount: str

class Recipe(BaseModel):
    title: str
    difficulty: str
    prep_time_minutes: int
    ingredients: List[Ingredient]
    instructions: List[str]
    calories: int

class Ingredient(BaseModel):
    name: str
    amount: str

class Recipe(BaseModel):
    title: str
    difficulty: str
    prep_time_minutes: int
    ingredients: List[Ingredient]
    instructions: List[str]
    calories: int

class RecipeRequest(BaseModel):
    ingredients: List[str]
    dietary_restrictions: str = "none"

class LocationRequest(BaseModel):
    company_name: str
    city: str = "" # Optional, helps accuracy

class SupplyChainNode(BaseModel):
    company_name: str
    role: str # e.g. "Chip Manufacturer", "Assembly", "Mining"
    location_query: str # e.g. "TSMC Hsinchu Science Park"

class SupplyChainResponse(BaseModel):
    product: str
    nodes: List[SupplyChainNode]