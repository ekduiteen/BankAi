import os
from sqlmodel import create_engine, Session
from dotenv import load_dotenv
from alembic.config import Config
from alembic import command

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/bankai")

engine = create_engine(DATABASE_URL, echo=False)

def get_session():
    with Session(engine) as session:
        yield session

def init_db():
    alembic_cfg = Config(os.path.join(os.path.dirname(__file__), "..", "..", "..", "alembic.ini"))
    alembic_cfg.set_main_option("sqlalchemy.url", DATABASE_URL)
    command.upgrade(alembic_cfg, "head")
