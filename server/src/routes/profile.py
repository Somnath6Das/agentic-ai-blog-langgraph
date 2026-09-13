import json
import os
from typing import Optional
import uuid
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends, File, Form, HTTPException, UploadFile
from src.database.user.models import User
from sqlalchemy.orm import Session
from src.database.database import engine, get_db
import aiofiles

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
CHUNK_SIZE = 1024 * 1024  # 1 MB

router = APIRouter(prefix="/profile", tags=["profile"])

#------- Upload Profile Picture ---------
@router.patch("/upload")
async def upload_photo(file: UploadFile =File(...), user: Optional[str] = Form(None), db:Session = Depends(get_db)):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    ext = (file.filename or "").rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else "jpg"
    if ext not in {"jpg", "jpeg", "png", "webp"}:
        ext = "jpg"

    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    size = 0
    try:
        async with aiofiles.open(filepath, "wb") as out_file:
            while chunk := await file.read(CHUNK_SIZE):
                size += len(chunk)
                if size > MAX_FILE_SIZE:
                    raise HTTPException(status_code=400, detail="File too large (max 10MB)")
                await out_file.write(chunk)
    except HTTPException:
        if os.path.exists(filepath):
            os.remove(filepath)
        raise
    except Exception:
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(status_code=500, detail="Failed to save file")
    
   
    
  
    user_data = json.loads(user) if user else {}
    avatar_url = f"/uploads/{filename}"

    # save filepath to neon db
    if user_data:
        id = user_data.get("id", "")
        if id:
            db_user = db.query(User).filter(User.id == id).first()
        if db_user:
            db_user.avatar_url = avatar_url # type: ignore
            db.commit()
            db.refresh(db_user)



    # delete old avatar if exists
    if user_data:
        old_avatar_url = user_data.get("avatar_url", "")
        if old_avatar_url:
            old_avatar_name = old_avatar_url.split("/")[-1]
            old_path = os.path.join("uploads", old_avatar_name)
            if os.path.isfile(old_path):
                os.remove(old_path)
                # print(f"Deleted old avatar: {old_path}")

    return {"url": f"/uploads/{filename}"}




#-------- Update User Name ---------------
class UserResponse(BaseModel):
    name: str
    id: str
@router.patch("/name")
async def update_name(body: UserResponse, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == body.id).first()
    if db_user:
        db_user.name = body.name  # type: ignore
        db.commit()
        db.refresh(db_user)
        return db_user