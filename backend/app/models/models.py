from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    DECIMAL,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)

    rates = relationship("Rate", back_populates="admin")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    name = Column(String(80), unique=True, nullable=False)
    slug = Column(String(80), unique=True, nullable=False, index=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    ornaments = relationship(
        "Ornament", back_populates="category", cascade="all, delete-orphan"
    )


class Ornament(Base):
    __tablename__ = "ornaments"

    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    purity = Column(String(20), nullable=True)
    approx_weight_grams = Column(DECIMAL(8, 2), nullable=True)
    making_charge_note = Column(String(255), nullable=True)
    is_visible = Column(Boolean, default=True, index=True)
    model_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="ornaments")
    media = relationship(
        "OrnamentMedia",
        back_populates="ornament",
        cascade="all, delete-orphan",
        order_by="OrnamentMedia.sort_order",
    )
    enquiries = relationship("Enquiry", back_populates="ornament")


class OrnamentMedia(Base):
    __tablename__ = "ornament_media"

    id = Column(Integer, primary_key=True)
    ornament_id = Column(Integer, ForeignKey("ornaments.id"), nullable=False, index=True)
    media_type = Column(Enum("photo", "model", name="media_type"), nullable=False)
    url = Column(String(500), nullable=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    ornament = relationship("Ornament", back_populates="media")


class Rate(Base):
    __tablename__ = "rates"

    id = Column(Integer, primary_key=True)
    metal = Column(Enum("gold", "silver", name="metal_type"), nullable=False, index=True)
    rate_value = Column(DECIMAL(10, 2), nullable=False)
    unit = Column(String(20), default="per gram")
    purity_reference = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=False, index=True)
    set_by_admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    admin = relationship("Admin", back_populates="rates")


class Enquiry(Base):
    __tablename__ = "enquiries"

    id = Column(Integer, primary_key=True)
    ornament_id = Column(
        Integer, ForeignKey("ornaments.id"), nullable=True, index=True
    )
    customer_name = Column(String(100), nullable=False)
    customer_phone = Column(String(20), nullable=False)
    message = Column(Text, nullable=True)
    status = Column(
        Enum("new", "read", "resolved", name="enquiry_status"), default="new", index=True
    )
    created_at = Column(DateTime, default=datetime.utcnow)

    ornament = relationship("Ornament", back_populates="enquiries")
