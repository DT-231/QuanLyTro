from __future__ import annotations

from typing import Generic, Optional, TypeVar, Any, List
from pydantic import BaseModel, Field, ConfigDict
from pydantic.generics import GenericModel

T = TypeVar("T")


class Response(GenericModel, Generic[T]):
    """Standard API response wrapper.

    Fields:
    - code: HTTP-like numeric code (e.g., 200, 201, 400, 401)
    - message: short message
    - data: payload which can be an object or an array
    """

    code: int = Field(..., description="Response code", examples=[200])
    message: str = Field(..., description="Response message", examples=["success"])
    data: Optional[T] = Field(default=None, description="Response payload")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "examples": [
                {
                    "code": 200,
                    "message": "success",
                    "data": {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "name": "Sample Name",
                        "status": "ACTIVE"
                    }
                }
            ]
        }
    )


class PaginatedData(BaseModel, Generic[T]):
    """Paginated response data wrapper.
    
    Used for list endpoints that support pagination.
    """
    items: List[T] = Field(..., description="List of items")
    total: int = Field(..., description="Total number of items", examples=[100])
    offset: int = Field(..., description="Current offset", examples=[0])
    limit: int = Field(..., description="Items per page", examples=[20])

    model_config = ConfigDict(from_attributes=True)
