from pydantic import BaseModel, Field, EmailStr, ConfigDict

class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, description="Customer Full Name")
    email: EmailStr = Field(..., description="Unique Email Address")
    phone: str = Field(..., min_length=1, description="Customer Phone Number")

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
