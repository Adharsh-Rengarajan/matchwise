from starlette.responses import JSONResponse


def api_response(status: int, message: str, data=None):
    return JSONResponse(
        status_code=status,
        content={
            "message": message,
            "data": data
        }
    )
