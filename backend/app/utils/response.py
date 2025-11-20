def api_response(status_code: int, message: str, data=None):
    return {
        "status_code": status_code,
        "message": message,
        "data": data
    }
