from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, auth
import os

try:
    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    if not service_account_path or not os.path.exists(service_account_path):
        raise FileNotFoundError(
            "FIREBASE_SERVICE_ACCOUNT_PATH environment variable not set or file not found. "
            "Please set it to the path of your Firebase service account key JSON file."
        )
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    print("Please ensure your Firebase service account key is correctly configured.")
    pass


app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dummy data for suggestions
SUGGESTIONS = [
    "MRI LUMBO-SACRAL SPINE",
    "Sagittal and Axial T1 and T2 W sequences",
    "Coronal and Sagittal STIR sequences",
    "Screening sagittal T1W sequence through cervico-dorsal spine",
    "Anterior wedge compression of L1 vertebral body noted with loss of up to 40% height",
    "Marginal osteophytes are noted at multiple levels",
    "Fecalarthropathy noted with ligamentum flavum thickening of lower lumbar levels",
]

oauth2_scheme = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)):
    """
    Verifies the Firebase ID token from the Authorization header.
    """
    try:
        decoded_token = auth.verify_id_token(credentials.credentials)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

class AutocompleteResponse(BaseModel):
    suggestions: list[str]

@app.get("/autocomplete", response_model=AutocompleteResponse)
async def autocomplete(query: str, current_user: dict = Depends(get_current_user)):
    """
    Returns a list of matching suggestions based on the query.
    Protected by Firebase Authentication.
    """
    if not query:
        return {"suggestions": []}
    matching_suggestions = [
        s for s in SUGGESTIONS if s.lower().startswith(query.lower())
    ]
    matching_suggestions.sort(key=lambda x: (not x.lower().startswith(query.lower()), len(x)))
    return {"suggestions": matching_suggestions[:5]}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
