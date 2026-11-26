from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str


class OrnamentCard(BaseModel):
    id: int
    name: str
    category: str
    purity: Optional[str] = None
    approx_weight_grams: Optional[float] = None
    thumbnail_url: Optional[str] = None


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


class OrnamentList(BaseModel):
    items: List[OrnamentCard]
    total: int
    page: int
    page_size: int
    pages: int


class RateInfo(BaseModel):
    rate_value: float
    unit: str
    purity_reference: Optional[str] = None
    updated_at: datetime


class CurrentRates(BaseModel):
    gold: Optional[RateInfo] = None
    silver: Optional[RateInfo] = None


class RatePoint(BaseModel):
    date: str
    rate_value: float


class RateHistory(BaseModel):
    gold: List[RatePoint] = []
    silver: List[RatePoint] = []


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


class AdminLogin(BaseModel):
    username: str
    password: str


class AdminProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    full_name: Optional[str] = None
    last_login_at: Optional[datetime] = None



class ShopSettingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    shop_name: str
    address_line1: str
    address_line2: str
    phone: str
    whatsapp_phone: str
    map_embed_url: str
    show_map: bool
    show_whatsapp: bool
    show_whatsapp_fab: bool
    show_enquiry: bool

class ShopSettingUpdate(BaseModel):
    shop_name: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    phone: str | None = None
    whatsapp_phone: str | None = None
    map_embed_url: str | None = None
    show_map: bool | None = None
    show_whatsapp: bool | None = None
    show_whatsapp_fab: bool | None = None
    show_enquiry: bool | None = None

