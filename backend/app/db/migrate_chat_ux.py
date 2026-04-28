import asyncio
from sqlalchemy import text
from app.db.session import engine

def migrate():
    with engine.begin() as conn:
        print("Starting Database Migration for Chat UX...")
        
        # Add to Document
        try:
            conn.execute(text("ALTER TABLE document ADD COLUMN session_id INTEGER REFERENCES chatsession(id);"))
            print("Added session_id to document")
        except Exception as e:
            print(f"Skipped adding session_id: {e}")
            
        try:
            conn.execute(text("ALTER TABLE document ADD COLUMN document_scope VARCHAR DEFAULT 'global_knowledge';"))
            print("Added document_scope to document")
        except Exception as e:
            print(f"Skipped adding document_scope: {e}")
            
        try:
            conn.execute(text("ALTER TABLE document ADD COLUMN processing_progress INTEGER DEFAULT 0;"))
            print("Added processing_progress to document")
        except Exception as e:
            print(f"Skipped adding processing_progress: {e}")
            
        try:
            conn.execute(text("ALTER TABLE document ADD COLUMN processing_message VARCHAR;"))
            print("Added processing_message to document")
        except Exception as e:
            print(f"Skipped adding processing_message: {e}")
            
        try:
            conn.execute(text("ALTER TABLE document ADD COLUMN summary VARCHAR;"))
            print("Added summary to document")
        except Exception as e:
            print(f"Skipped adding summary: {e}")

        # Add to ChatSession
        try:
            conn.execute(text("ALTER TABLE chatsession ADD COLUMN active_document_ids_json VARCHAR DEFAULT '[]';"))
            print("Added active_document_ids_json to chatsession")
        except Exception as e:
            print(f"Skipped adding active_document_ids_json: {e}")
            
        try:
            conn.execute(text("ALTER TABLE chatsession ADD COLUMN session_summary VARCHAR;"))
            print("Added session_summary to chatsession")
        except Exception as e:
            print(f"Skipped adding session_summary: {e}")
            
        # Add to ChatMessage
        try:
            conn.execute(text("ALTER TABLE chatmessage ADD COLUMN status VARCHAR DEFAULT 'completed';"))
            print("Added status to chatmessage")
        except Exception as e:
            print(f"Skipped adding status: {e}")
            
        print("Migration complete!")

if __name__ == "__main__":
    migrate()
