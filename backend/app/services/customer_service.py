
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate


def create_customer(
    db: Session,
    organization_id: int,
    customer_data: CustomerCreate,
) -> Customer:
    customer = Customer(
        organization_id=organization_id,
        full_name=customer_data.full_name,
        email=customer_data.email,
        phone=customer_data.phone,
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    return customer


def get_customer(
    db: Session,
    organization_id: int,
    customer_id: int,
) -> Customer | None:
    return db.scalar(
        select(Customer).where(
            Customer.id == customer_id,
            Customer.organization_id == organization_id,
        )
    )


def get_organization_customers(
    db: Session,
    organization_id: int,
) -> list[Customer]:
    return list(
        db.scalars(
            select(Customer)
            .where(
                Customer.organization_id == organization_id,
            )
            .order_by(Customer.created_at.desc())
        ).all()
    )


def update_customer(
    db: Session,
    customer: Customer,
    customer_data: CustomerUpdate,
) -> Customer:
    if customer_data.full_name is not None:
        customer.full_name = customer_data.full_name

    if customer_data.email is not None:
        customer.email = customer_data.email

    if customer_data.phone is not None:
        customer.phone = customer_data.phone

    db.commit()
    db.refresh(customer)

    return customer


def delete_customer(
    db: Session,
    customer: Customer,
) -> None:
    db.delete(customer)
    db.commit()

