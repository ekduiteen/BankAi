import os

from sqlmodel import Session, select

from .session import engine
from ..core.security import get_password_hash
from ..models.bank import Bank
from ..models.document import Document, DocumentChunk  # noqa: F401
from ..models.user import User


TEST_ADMIN_PASSWORD = os.getenv("TEST_ADMIN_PASSWORD")
if not TEST_ADMIN_PASSWORD:
    raise RuntimeError("TEST_ADMIN_PASSWORD environment variable must be set")


TEST_ADMINS = [
    {
        "email": "test.superadmin@bankai.local",
        "name": "Test Super Admin",
        "role": "super_admin",
        "department": "QA",
    },
    {
        "email": "madhu.bhandari@nrb.org.np",
        "name": "Madhu Bhandari",
        "role": "bank_admin",
        "department": "QA",
    },
]


def get_default_bank(session: Session) -> Bank:
    bank = session.exec(select(Bank).where(Bank.code == "DEFAULT")).first()
    if bank:
        return bank

    bank = Bank(name="Default Bank", code="DEFAULT")
    session.add(bank)
    session.commit()
    session.refresh(bank)
    return bank


def upsert_test_admins() -> None:
    with Session(engine) as session:
        bank = get_default_bank(session)
        password_hash = get_password_hash(TEST_ADMIN_PASSWORD)

        for admin_data in TEST_ADMINS:
            user = session.exec(select(User).where(User.email == admin_data["email"])).first()
            if user:
                user.name = admin_data["name"]
                user.role = admin_data["role"]
                user.department = admin_data["department"]
                user.bank_id = bank.id
                user.password_hash = password_hash
                user.is_active = True
                action = "Updated"
            else:
                user = User(
                    email=admin_data["email"],
                    password_hash=password_hash,
                    name=admin_data["name"],
                    role=admin_data["role"],
                    department=admin_data["department"],
                    bank_id=bank.id,
                    is_active=True,
                )
                action = "Created"

            session.add(user)
            session.commit()
            print(f"{action} {admin_data['role']}: {admin_data['email']}")


if __name__ == "__main__":
    upsert_test_admins()
