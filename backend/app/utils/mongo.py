from bson import ObjectId
from datetime import datetime

def sanitize_document(doc: dict):
    if not isinstance(doc, dict):
        return doc

    clean = {}
    for key, value in doc.items():

        if isinstance(value, ObjectId):
            clean[key] = str(value)

        elif isinstance(value, datetime):
            clean[key] = value.isoformat()

        elif isinstance(value, list):
            clean[key] = [sanitize_document(v) for v in value]

        elif isinstance(value, dict):
            clean[key] = sanitize_document(value)

        else:
            clean[key] = value

    # Convert MongoDB _id → id
    if "_id" in clean:
        clean["id"] = clean["_id"]
        del clean["_id"]

    return clean
