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
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

load_dotenv()

UNSUPPORTED_ASYNCPG_QUERY_PARAMS = {"channel_binding"}

def normalize_database_url(database_url: str) -> str:
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif database_url.startswith("postgresql://") and "+asyncpg" not in database_url:
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    parts = urlsplit(database_url)
    if not parts.query:
        return database_url

    query_params = []
    for key, value in parse_qsl(parts.query, keep_blank_values=True):
        if key in UNSUPPORTED_ASYNCPG_QUERY_PARAMS:
            continue
        if key == "sslmode":
            query_params.append(("ssl", value))
        else:
            query_params.append((key, value))

    return urlunsplit(parts._replace(query=urlencode(query_params)))


DATABASE_URL = normalize_database_url(
    os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
)
SQL_ECHO = os.getenv("SQL_ECHO", "false").lower() == "true"


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


engine = create_async_engine(DATABASE_URL, echo=SQL_ECHO)

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
