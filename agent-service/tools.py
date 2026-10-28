from smolagents import tool
import requests
import os
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL")

@tool
def get_mandi_price(commodity: str, district: str) -> str:
    """Fetches current mandi price data for a specific commodity.
    
    Args:
        commodity: name of the crop, e.g. 'turmeric', 'chilli'
        district: Telangana district name (used for context, not filtered directly)
    """
    try:
        res = requests.get(f"{BACKEND_URL}/api/market-prices", timeout=5)
        res.raise_for_status()
        data = res.json()
        filtered = [p for p in data if commodity.lower() in p.get("commodity", "").lower()]
        if filtered:
            return str(filtered)
        else:
            return f"No price data found for '{commodity}'. This commodity is not in the current dataset."
    except Exception as e:
        return f"Error fetching price data: {str(e)}"

    
@tool
def check_cold_storage(district: str) -> str:
    """Checks available cold storage units.
    
    Args:
        district: Telangana district name (used for context; current data has no district field)
    """
    try:
        res = requests.get(f"{BACKEND_URL}/api/storage", timeout=5)
        res.raise_for_status()
        data = res.json()
        available = [s for s in data if s.get("available")]
        return str(available)
    except Exception as e:
        return f"Error fetching cold storage data: {str(e)}"

@tool
def find_transport(pickup_lat: float, pickup_lng: float, district: str) -> str:
    """Finds available transport providers near a pickup location.
    
    Args:
        pickup_lat: latitude of pickup point
        pickup_lng: longitude of pickup point
        district: Telangana district name
    """
    try:
        res = requests.get(f"{BACKEND_URL}/api/transport", params={"district": district}, timeout=5)
        res.raise_for_status()
        return str(res.json())
    except Exception as e:
        return f"Error fetching transport data: {str(e)}"