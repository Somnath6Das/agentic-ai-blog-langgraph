from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.sql import func
from src.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    avatar_url = Column(String(300), index=True)
    created_at = Column(TIMESTAMP, server_default=func.now())