from pydantic import BaseModel
from typing import List


class RevenueMonth(BaseModel):
    month: str
    mrr: float
    new_revenue: float
    target: float
    churn: float


class RevenueSnapshot(BaseModel):
    current_mrr: float
    mrr_target: float
    mrr_growth: float
    total_clients: int
    avg_deal_size: float
    pipeline: float
    history: List[RevenueMonth]
