from typing import Optional

from pydantic import BaseModel, Field


class AdminCategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    slug: Optional[str] = None
    display_order: int = 0


class AdminCategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=80)
    slug: Optional[str] = None
    display_order: Optional[int] = None


class AdminOrnamentCreate(BaseModel):
    category_id: int
    name: str = Field(min_length=1, max_length=150)
    description: Optional[str] = None
    purity: Optional[str] = None
    approx_weight_grams: Optional[float] = None
    making_charge_note: Optional[str] = None
    is_visible: bool = True


class AdminOrnamentUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    purity: Optional[str] = None
    approx_weight_grams: Optional[float] = None
    making_charge_note: Optional[str] = None
    is_visible: Optional[bool] = None


class VisibilityUpdate(BaseModel):
    is_visible: bool


class AdminRateSet(BaseModel):
    metal: str = Field(pattern="^(gold|silver)$")
    rate_value: float = Field(gt=0)
    unit: str = "per gram"
    purity_reference: Optional[str] = None


class AdminRateHistoryItem(BaseModel):
    id: int
    rate_value: float
    unit: str
    purity_reference: Optional[str] = None
    is_active: bool
    set_by_admin_id: Optional[int] = None
    created_at: object



class EnquiryStatusUpdate(BaseModel):
    status: str = Field(pattern="^(new|read|resolved)$")


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class AdminProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=100)
