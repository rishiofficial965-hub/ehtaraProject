import re
from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator

class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100, description="Customer Full Name")
    email: EmailStr = Field(..., description="Unique Email Address")
    phone: str = Field(..., min_length=1, description="Customer Phone Number")

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Full name cannot be empty or only whitespace")
        if not re.match(r"^[a-zA-Z\s\-\']+$", v):
            raise ValueError("Full name must contain only letters, spaces, hyphens, or apostrophes")
        return v

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: EmailStr) -> EmailStr:
        return v.strip().lower()

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^\+?[0-9][0-9\-\s\(\)]*$", v):
            raise ValueError("Invalid phone number format")
        digits = re.sub(r"\D", "", v)
        if not (7 <= len(digits) <= 15):
            raise ValueError("Phone number must contain between 7 and 15 digits")
        return v

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

