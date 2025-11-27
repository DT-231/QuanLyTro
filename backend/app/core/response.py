from __future__ import annotations

from typing import Any
from app.schemas.response_schema import Response


def _normalize_data(data: Any) -> Any:
    """Ensure data defaults to {} (object) when None.

    Call sites that explicitly want an array can pass [] as data.
    """
    if data is None:
        return {}
    return data


def success(data: Any = None, message: str = "success") -> Response[Any]:
    return Response(code=200, message=message, data=_normalize_data(data))


def created(data: Any = None, message: str = "success") -> Response[Any]:
    return Response(code=201, message=message, data=_normalize_data(data))


def bad_request(message: str = "bad request", data: Any = None) -> Response[Any]:
    return Response(code=400, message=message, data=_normalize_data(data))


def unauthorized(message: str = "unauthorized", data: Any = None) -> Response[Any]:
    return Response(code=401, message=message, data=_normalize_data(data))


def forbidden(message: str = "forbidden", data: Any = None) -> Response[Any]:
    return Response(code=403, message=message, data=_normalize_data(data))


def not_found(message: str = "not found", data: Any = None) -> Response[Any]:
    return Response(code=404, message=message, data=_normalize_data(data))


def conflict(message: str = "conflict", data: Any = None) -> Response[Any]:
    return Response(code=409, message=message, data=_normalize_data(data))


def unprocessable_entity(message: str = "unprocessable entity", data: Any = None) -> Response[Any]:
    return Response(code=422, message=message, data=_normalize_data(data))


def internal_error(message: str = "internal server error", data: Any = None) -> Response[Any]:
    return Response(code=500, message=message, data=_normalize_data(data))


def no_content(message: str = "no content") -> Response[Any]:
    """Response for successful deletion or operations with no content to return."""
    return Response(code=204, message=message, data={})


def custom(code: int, message: str = "custom", data: Any = None) -> Response[Any]:
    return Response(code=code, message=message, data=_normalize_data(data))
