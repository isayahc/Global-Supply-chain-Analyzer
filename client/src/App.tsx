import { useState } from 'react';
import './App.css';

// ==========================================
// Types
// ==========================================
interface Ingredient {
  name: string;
  amount: string;
}

interface Recipe {
  title: string;
  difficulty: string;
  prep_time_minutes: number;
  calories: number;
  ingredients: Ingredient[];
  instructions: string[];
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface CompanyLocation {
  name: string;
  address: string;
  coordinates: Coordinates;
}

// New Types for Supply Chain
interface SupplyChainNode {
  company_name: string;
  role: string;
  location_query: string;
  found: boolean;
  address?: string;
  coordinates?: Coordinates;
}

interface SupplyChainData {
  product: string;
  supply_chain: SupplyChainNode[];
}

function App() {
  // ==========================================
  // State: Recipe Generator
  // ==========================================
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState('');

  // ==========================================
  // State: Company Locator
  // ==========================================
  const [companyQuery, setCompanyQuery] = useState('');
  const [location, setLocation] = useState<CompanyLocation | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');

  // ==========================================
  // State: Supply Chain X-Ray
  // ==========================================
  const [productQuery, setProductQuery] = useState('');
  const [chainData, setChainData] = useState<SupplyChainData | null>(null);
  const [chainLoading, setChainLoading] = useState(false);
  const [chainError, setChainError] = useState('');

  // ==========================================
  // Function 1: Get Recipe (Gemini)
  // ==========================================
  const getRecipe = async () => {
    setRecipeLoading(true);
    setRecipeError('');
    
    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ['chicken', 'rice', 'soy sauce', 'broccoli'],
          dietary_restrictions: 'gluten-free'
        })
      });

      if (!response.ok) throw new Error('Failed to fetch recipe');
      const data = await response.json();
      setRecipe(data);
    } catch (err) {
      console.error(err);
      setRecipeError('Something went wrong generating the recipe.');
    } finally {
      setRecipeLoading(false);
    }
  };

  // ==========================================
  // Function 2: Get Coordinates (Google Maps)
  // ==========================================
  const getCoords = async () => {
    if (!companyQuery) return;
    
    setLocLoading(true);
    setLocError('');
    setLocation(null);

    try {
      const response = await fetch('/api/get-coords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          company_name: companyQuery,
          city: ''
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setLocation(data);
    } catch (err) {
      console.error(err);
      setLocError('Could not find that company.');
    } finally {
      setLocLoading(false);
    }
  };

  // ==========================================
  // Function 3: Supply Chain Analysis (Gemini + Maps)
  // ==========================================
  const getSupplyChain = async () => {
    if (!productQuery) return;

    setChainLoading(true);
    setChainError('');
    setChainData(null);

    try {
      // Note: Make sure your Python backend expects 'product_name' query param
      // OR update this to send a JSON body if you changed your backend.
      // This assumes: @app.post("/api/supply-chain") def get_supply_chain(product_name: str):
      const response = await fetch(`/api/supply-chain?product_name=${encodeURIComponent(productQuery)}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to analyze supply chain');

      const data = await response.json();
      setChainData(data);
    } catch (err) {
      console.error(err);
      setChainError('Failed to analyze supply chain.');
    } finally {
      setChainLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>🚀 Isayah's Hackathon Dashboard</h1>
      
      {/* =======================================================
          TOOL 1: CHEF-IT-UP
      ======================================================== */}
      <div className="card" style={{ border: '1px solid #444', padding: '20px', marginBottom: '40px', borderRadius: '12px' }}>
        <h2>👨‍🍳 Chef-It-Up (Gemini AI)</h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Generates a recipe based on hardcoded ingredients.</p>
        
        <button onClick={getRecipe} disabled={recipeLoading}>
          {recipeLoading ? 'Cooking...' : '✨ Generate Recipe'}
        </button>

        {recipeError && <p style={{ color: 'red' }}>{recipeError}</p>}

        {recipe && (
          <div className="recipe-card" style={{ textAlign: 'left', background: '#222', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
            <h3 style={{ marginTop: 0 }}>{recipe.title}</h3>
            <p><strong>Calories:</strong> {recipe.calories} | <strong>Time:</strong> {recipe.prep_time_minutes} min</p>
            <h4>Ingredients</h4>
            <ul>
              {recipe.ingredients.map((ing, i) => <li key={i}>{ing.amount} {ing.name}</li>)}
            </ul>
            <h4>Instructions</h4>
            <ol>
              {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
        )}
      </div>

      {/* =======================================================
          TOOL 2: COMPANY LOCATOR
      ======================================================== */}
      <div className="card" style={{ border: '1px solid #444', padding: '20px', marginBottom: '40px', borderRadius: '12px' }}>
        <h2>📍 Company Locator (Google Maps)</h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Finds the exact coordinates of any business.</p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
          <input 
            type="text" 
            placeholder="e.g. Tesla Gigafactory Texas"
            value={companyQuery}
            onChange={(e) => setCompanyQuery(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #666', width: '60%' }}
          />
          <button onClick={getCoords} disabled={locLoading || !companyQuery}>
            {locLoading ? 'Searching...' : 'Find'}
          </button>
        </div>

        {locError && <p style={{ color: 'red' }}>{locError}</p>}

        {location && (
          <div style={{ textAlign: 'left', background: '#1a2e1a', padding: '20px', borderRadius: '8px', marginTop: '20px', border: '1px solid #2e5c2e' }}>
            <h3 style={{ marginTop: 0, color: '#4ade80' }}>{location.name}</h3>
            <p style={{ fontSize: '1.1rem' }}>{location.address}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              <div style={{ background: '#000', padding: '10px', borderRadius: '4px' }}>
                <strong>Latitude:</strong> <br/> {location.coordinates.lat}
              </div>
              <div style={{ background: '#000', padding: '10px', borderRadius: '4px' }}>
                <strong>Longitude:</strong> <br/> {location.coordinates.lng}
              </div>
            </div>
            
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.name + ' ' + location.address)}`} 
              target="_blank" 
              rel="noreferrer"
              style={{ display: 'inline-block', marginTop: '15px', color: '#4ade80' }}
            >
              Open in Google Maps →
            </a>
          </div>
        )}
      </div>

      {/* =======================================================
          TOOL 3: SUPPLY CHAIN X-RAY
      ======================================================== */}
      <div className="card" style={{ border: '1px solid #444', padding: '20px', borderRadius: '12px' }}>
        <h2>📦 Supply Chain X-Ray</h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Gemini identifies the companies. Google Maps finds them.</p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="e.g. iPhone 15 Pro"
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #666', width: '60%' }}
          />
          <button onClick={getSupplyChain} disabled={chainLoading || !productQuery}>
            {chainLoading ? 'Analyzing...' : 'X-Ray'}
          </button>
        </div>

        {chainError && <p style={{ color: 'red' }}>{chainError}</p>}

        {chainData && (
          <div style={{ display: 'grid', gap: '10px', textAlign: 'left' }}>
            <h3 style={{ textAlign: 'center', marginTop: 0 }}>Supply Chain for: {chainData.product}</h3>
            {chainData.supply_chain.map((node, i) => (
              <div key={i} style={{ 
                background: '#222', 
                padding: '15px', 
                borderRadius: '8px', 
                borderLeft: node.found ? '4px solid #4ade80' : '4px solid #ef4444' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '1.1rem' }}>{node.company_name}</strong>
                  <span style={{ fontSize: '0.8rem', background: '#444', padding: '2px 8px', borderRadius: '4px' }}>
                    {node.role}
                  </span>
                </div>
                
                <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#ccc' }}>
                  {node.found ? `📍 ${node.address}` : '❌ Location not found'}
                </p>

                {node.found && node.coordinates && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${node.coordinates.lat},${node.coordinates.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.85rem', color: '#4ade80', textDecoration: 'none' }}
                  >
                    View on Map ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default App;