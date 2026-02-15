from collections.abc import AsyncGenerator
import uuid

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, relationship
from datetime import datetime, timezone
from fastapi_users.db import (
    SQLAlchemyUserDatabase,
    SQLAlchemyBaseUserTableUUID,
)
from fastapi import Depends
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")


# base class that all models inherit from
class Base(DeclarativeBase):
    pass


# User table - has OAuth support via fastapi_users
class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "users"
    # A user can have many posts; back_populates links it to Post.user
    # This allows: user.posts to get all posts by that user
    posts = relationship("Post", back_populates="user")


# Post table - represents uploaded files/content
class Post(Base):
    __tablename__ = "posts"

    # Unique Post ID (UUID)
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign key: which user owns this post
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Post metadata
    caption = Column(Text)
    url = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_name = Column(String, nullable=False)

    # Timestamp with UTC timezone awareness
    created_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))

    # Relationship back to User; back_populates links it to User.posts
    # This allows: post.user to get the user who owns this post
    user = relationship("User", back_populates="posts")


engine = create_async_engine(DATABASE_URL, echo=True)

# Session factory - creates a new session for each request
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


# Run on startup - create tables if they don't exist
async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# Dependency - FastAPI injects this into route handlers
# Each request gets its own session, which is cleaned up when the reqest ends
async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
