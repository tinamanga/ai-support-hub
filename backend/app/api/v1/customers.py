
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.enums.roles import OrganizationRole
from app.core.security.organization import require_roles
from app.database.session import get_db
from app.models.customer import Customer
from app.models.organization_member import OrganizationMember
from app.schemas.customer import (
    CustomerCreate,
    CustomerResponse,
    CustomerUpdate,
)
from app.services.customer_service import (
    create_customer,
    delete_customer,
    get_customer,
    get_organization_customers,
    update_customer,
)


router = APIRouter(
    prefix="/organizations/{organization_id}/customers",
    tags=["Customers"],
)


@router.post(
    "",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_customer_endpoint(
    organization_id: int,
    customer_data: CustomerCreate,
    membership: OrganizationMember = Depends(
        require_roles(
            OrganizationRole.OWNER,
            OrganizationRole.ADMIN,
            OrganizationRole.AGENT,
        )
    ),
    db: Session = Depends(get_db),
):
    return create_customer(
        db=db,
        organization_id=organization_id,
        customer_data=customer_data,
    )


@router.get(
    "",
    response_model=list[CustomerResponse],
)
def list_customers(
    organization_id: int,
    membership: OrganizationMember = Depends(
        require_roles(
            OrganizationRole.OWNER,
            OrganizationRole.ADMIN,
            OrganizationRole.AGENT,
            OrganizationRole.MEMBER,
        )
    ),
    db: Session = Depends(get_db),
):
    return get_organization_customers(
        db=db,
        organization_id=organization_id,
    )


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
)
def get_customer_endpoint(
    organization_id: int,
    customer_id: int,
    membership: OrganizationMember = Depends(
        require_roles(
            OrganizationRole.OWNER,
            OrganizationRole.ADMIN,
            OrganizationRole.AGENT,
            OrganizationRole.MEMBER,
        )
    ),
    db: Session = Depends(get_db),
):
    customer = get_customer(
        db=db,
        organization_id=organization_id,
        customer_id=customer_id,
    )

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )

    return customer


@router.patch(
    "/{customer_id}",
    response_model=CustomerResponse,
)
def update_customer_endpoint(
    organization_id: int,
    customer_id: int,
    customer_data: CustomerUpdate,
    membership: OrganizationMember = Depends(
        require_roles(
            OrganizationRole.OWNER,
            OrganizationRole.ADMIN,
            OrganizationRole.AGENT,
        )
    ),
    db: Session = Depends(get_db),
):
    customer = get_customer(
        db=db,
        organization_id=organization_id,
        customer_id=customer_id,
    )

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )

    return update_customer(
        db=db,
        customer=customer,
        customer_data=customer_data,
    )


@router.delete(
    "/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_customer_endpoint(
    organization_id: int,
    customer_id: int,
    membership: OrganizationMember = Depends(
        require_roles(
            OrganizationRole.OWNER,
            OrganizationRole.ADMIN,
        )
    ),
    db: Session = Depends(get_db),
):
    customer = get_customer(
        db=db,
        organization_id=organization_id,
        customer_id=customer_id,
    )

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )

    delete_customer(
        db=db,
        customer=customer,
    )

    return None

