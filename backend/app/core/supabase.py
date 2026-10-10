from typing import Optional
from backend.app.core.config import settings

supabase_client = None

try:
    from supabase import create_client, Client
    if settings.SUPABASE_URL and settings.SUPABASE_KEY:
        supabase_client: Optional[Client] = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
        )
except ImportError:
    pass
except Exception as e:
    print(f"[Supabase Client Warning] Could not initialize Supabase SDK client: {e}")

def get_supabase() -> Optional[any]:
    """
    Returns an initialized Supabase Python SDK Client if configured, or None.
    Useful for interacting with Supabase Storage, Auth, or Edge Functions.
    """
    return supabase_client
