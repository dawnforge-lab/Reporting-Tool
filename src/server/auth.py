from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
try:
    from jose import JWTError, jwt
except ImportError:
    print("\n\n====== CRITICAL ERROR ======")
    print("The jose module is not installed or not accessible.")
    print("Please run the following commands manually to fix this issue:")
    print("1. Open a command prompt as administrator")
    print("2. Navigate to your project directory:")
    print("   cd \"C:\\Users\\EugenBucurescu\\Desktop\\Reporting Workflow\"")
    print("3. Activate the virtual environment:")
    print("   venv\\Scripts\\activate")
    print("4. Install the missing package:")
    print("   pip install python-jose==3.3.0 passlib==1.7.4")
    print("5. Verify the installation:")
    print("   python -c \"import jose; print('Jose installed successfully')\"")
    print("===========================\n")
    raise ImportError("The jose module is required for authentication. See instructions above to install it.")

from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Config
SECRET_KEY = os.getenv("SECRET_KEY", "defaultsecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Security utilities
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def verify_password(plain_password, hashed_password):
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Generate a password hash."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """Get the current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode JWT
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        
        if username is None:
            raise credentials_exception
        
        # In a real app, you would validate against a database
        # For simplicity, we just return the payload
        return {"username": username, "role": payload.get("role", "user")}
    
    except JWTError:
        raise credentials_exception

# Simple user database - replace with a real database in production
fake_users_db = {
    "admin": {
        "username": "admin",
        "email": "admin@example.com",
        "hashed_password": get_password_hash("admin"),
        "role": "admin",
    }
}

def authenticate_user(username: str, password: str):
    """Authenticate a user by username and password."""
    if username not in fake_users_db:
        return False
    
    user = fake_users_db[username]
    if not verify_password(password, user["hashed_password"]):
        return False
    
    return user 