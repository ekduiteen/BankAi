import json
from types import SimpleNamespace

import pytest
from sqlmodel import Session
from sqlmodel import SQLModel

from app.models.bank import Bank
from app.models.chat import ChatSession
from app.models.document import Document
from app.models.user import User
from app.core.security import get_password_hash
from app.services import rag_service
from test_main import client, engine, get_token


@pytest.fixture(autouse=True)
def setup_test_db():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        bank = Bank(name="Test Bank", code="TEST01")
        session.add(bank)
        session.commit()

        session.add(
            User(
                email="super@test.local",
                password_hash=get_password_hash("password"),
                name="Super Admin",
                role="super_admin",
                bank_id=bank.id,
                is_active=True,
            )
        )
        session.add(
            User(
                email="staff@test.local",
                password_hash=get_password_hash("password"),
                name="Staff User",
                role="staff_user",
                bank_id=bank.id,
                is_active=True,
            )
        )
        session.commit()

    yield
    SQLModel.metadata.drop_all(engine)


def test_staff_can_reload_own_ready_session_upload():
    token = get_token("staff@test.local")

    with Session(engine) as session:
        staff = session.query(User).filter(User.email == "staff@test.local").first()
        bank = session.query(Bank).filter(Bank.code == "TEST01").first()
        chat = ChatSession(bank_id=bank.id, user_id=staff.id, title="Session A")
        session.add(chat)
        session.commit()
        session.refresh(chat)

        own_doc = Document(
            bank_id=bank.id,
            uploaded_by=staff.id,
            title="Loan Policy.pdf",
            file_name="Loan Policy.pdf",
            file_type="pdf",
            file_path="loan-policy.pdf",
            document_type="chat_upload",
            status="ready",
            session_id=chat.id,
            document_scope="session_upload",
            processing_progress=100,
        )
        global_draft = Document(
            bank_id=bank.id,
            uploaded_by=staff.id,
            title="Draft Global.pdf",
            file_name="Draft Global.pdf",
            file_type="pdf",
            file_path="draft-global.pdf",
            document_type="policy",
            status="ready",
            document_scope="global_knowledge",
        )
        session.add(own_doc)
        session.add(global_draft)
        session.commit()
        session.refresh(own_doc)

        chat.active_document_ids_json = json.dumps([own_doc.id])
        session.add(chat)
        session.commit()

    response = client.get("/api/documents?limit=200", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    docs = response.json()
    titles = {doc["title"] for doc in docs}
    assert "Loan Policy.pdf" in titles
    assert "Draft Global.pdf" not in titles


def test_session_rag_prioritizes_active_upload_before_global(monkeypatch):
    calls = []

    def fake_embeddings(_texts):
        return [[0.1, 0.2, 0.3]]

    def fake_search_points(_query_vector, bank_id, limit=5, document_ids=None, session_id=None, document_scope=None):
        calls.append({
            "bank_id": bank_id,
            "limit": limit,
            "document_ids": document_ids,
            "session_id": session_id,
            "document_scope": document_scope,
        })
        if document_scope == "session_upload":
            return [
                SimpleNamespace(
                    payload={"document_id": 1, "text": "Session loan policy says risk review is required."},
                    score=0.95,
                )
            ]
        return [
            SimpleNamespace(
                payload={"document_id": 2, "text": "Global policy has a different answer."},
                score=0.75,
            )
        ]

    def fake_call_llm(prompt):
        assert "Session loan policy says risk review is required." in prompt
        assert "Global policy has a different answer." in prompt
        return "Answer from session upload."

    monkeypatch.setattr(rag_service, "generate_embeddings", fake_embeddings)
    monkeypatch.setattr(rag_service, "search_points", fake_search_points)
    monkeypatch.setattr(rag_service, "call_llm", fake_call_llm)

    with Session(engine) as session:
        bank = Bank(name="RAG Bank", code="RAG01")
        user = User(
            email="rag@test.local",
            password_hash="x",
            name="RAG User",
            role="staff_user",
            bank_id=1,
            is_active=True,
        )
        session.add(bank)
        session.commit()
        session.refresh(bank)
        user.bank_id = bank.id
        session.add(user)
        session.commit()

        session_doc = Document(
            id=1,
            bank_id=bank.id,
            uploaded_by=user.id,
            title="Loan Policy.pdf",
            file_name="Loan Policy.pdf",
            file_type="pdf",
            file_path="loan-policy.pdf",
            document_type="chat_upload",
            status="ready",
            session_id=10,
            document_scope="session_upload",
        )
        global_doc = Document(
            id=2,
            bank_id=bank.id,
            uploaded_by=user.id,
            title="Global Policy.pdf",
            file_name="Global Policy.pdf",
            file_type="pdf",
            file_path="global-policy.pdf",
            document_type="policy",
            status="approved",
            document_scope="global_knowledge",
        )
        session.add(session_doc)
        session.add(global_doc)
        session.commit()

        answer, sources = rag_service.generate_rag_response(
            "What are the risks?",
            bank.id,
            "staff_user",
            session,
            active_document_ids=[1],
            session_id=10,
        )

    assert answer == "Answer from session upload."
    assert sources[0]["document_title"] == "Loan Policy.pdf"
    assert calls[0]["document_scope"] == "session_upload"
    assert calls[0]["session_id"] == 10
    assert calls[0]["document_ids"] == [1]
    assert calls[1]["document_scope"] == "global_knowledge"
