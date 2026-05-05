import os
from sqlmodel import create_engine, Session
from dotenv import load_dotenv
from alembic.config import Config
from alembic import command

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/lipicore")

engine = create_engine(DATABASE_URL, echo=False)

def get_session():
    with Session(engine) as session:
        yield session

def init_db():
    # TODO: Use Alembic migrations in production. For now, create all tables directly.
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)
