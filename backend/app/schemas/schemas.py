from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


class OrnamentCard(BaseModel):
    id: int
    name: str
    category: str
    purity: Optional[str] = None
    approx_weight_grams: Optional[float] = None
    thumbnail_url: Optional[str] = None

    class Config:
        from_attributes = True


class OrnamentDetail(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str] = None
    purity: Optional[str] = None
    approx_weight_grams: Optional[float] = None
    making_charge_note: Optional[str] = None
    model_url: Optional[str] = None
    photos: List[str] = []

    class Config:
        from_attributes = True


class RateInfo(BaseModel):
    rate_value: float
    unit: str
    purity_reference: Optional[str] = None
    updated_at: datetime


class CurrentRates(BaseModel):
    gold: Optional[RateInfo] = None
    silver: Optional[RateInfo] = None


class EnquiryCreate(BaseModel):
    ornament_id: Optional[int] = None
    customer_name: str = Field(min_length=1, max_length=100)
    customer_phone: str = Field(min_length=7, max_length=20)
    message: Optional[str] = Field(default=None, max_length=2000)


class EnquiryOut(BaseModel):
    id: int
    ornament_id: Optional[int] = None
    ornament_name: Optional[str] = None
    customer_name: str
    customer_phone: str
    message: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class AdminLogin(BaseModel):
    username: str
    password: str


class AdminProfile(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    last_login_at: Optional[datetime] = None

    class Config:
        from_attributes = True
