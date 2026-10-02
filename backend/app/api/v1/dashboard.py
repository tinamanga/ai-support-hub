from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security.organization import get_current_membership
from app.database.session import get_db
from app.models.organization_member import OrganizationMember
from app.schemas.dashboard import DashboardOverviewResponse
from app.services.dashboard_service import get_dashboard_overview


router = APIRouter(
    prefix="/organizations/{organization_id}/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "",
    response_model=DashboardOverviewResponse,
)
def dashboard_overview(
    membership: OrganizationMember = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    return get_dashboard_overview(
        db=db,
        organization_id=membership.organization_id,
    )
