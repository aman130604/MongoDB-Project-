from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo.errors import PyMongoError, WriteError
from database import client, db, expenses

app = Flask(__name__)
CORS(app)

CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Education", "Entertainment", "Healthcare", "Other"]
PAYMENT_METHODS = ["Cash", "UPI", "Credit Card", "Debit Card"]


def serialize(doc):
    if not doc:
        return None
    result = dict(doc)
    result["_id"] = str(result["_id"])
    if isinstance(result.get("date"), datetime):
        result["date"] = result["date"].strftime("%Y-%m-%d")
    if isinstance(result.get("created_at"), datetime):
        result["created_at"] = result["created_at"].isoformat()
    return result


def parse_payload(data, partial=False):
    allowed = {"user_id", "amount", "category", "description", "payment_method", "date", "merchant", "tags"}
    payload = {k: data[k] for k in data if k in allowed}
    if not partial:
        required = ["user_id", "amount", "category", "description", "payment_method", "date"]
        missing = [k for k in required if k not in payload or payload[k] in (None, "")]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")
    if "amount" in payload:
        try:
            payload["amount"] = float(payload["amount"])
        except (TypeError, ValueError):
            raise ValueError("Amount must be numeric")
        if payload["amount"] <= 0:
            raise ValueError("Amount must be greater than 0")
    if "category" in payload and payload["category"] not in CATEGORIES:
        raise ValueError("Invalid category")
    if "payment_method" in payload and payload["payment_method"] not in PAYMENT_METHODS:
        raise ValueError("Invalid payment method")
    if "date" in payload:
        try:
            payload["date"] = datetime.strptime(payload["date"], "%Y-%m-%d")
        except (TypeError, ValueError):
            raise ValueError("Date must use YYYY-MM-DD")
    if "tags" in payload and payload["tags"] is None:
        payload["tags"] = []
    return payload


@app.get("/api/health")
def health():
    try:
        client.admin.command("ping")
        return jsonify({"status": "ok", "database": db.name})
    except Exception as exc:
        return jsonify({"status": "error", "message": str(exc)}), 503


@app.get("/api/expenses")
def get_expenses():
    query = {}
    category = request.args.get("category")
    payment_method = request.args.get("payment_method")
    search = request.args.get("search", "").strip()
    month = request.args.get("month")
    if category and category != "All": query["category"] = category
    if payment_method and payment_method != "All": query["payment_method"] = payment_method
    if search:
        query["$or"] = [{"description": {"$regex": search, "$options": "i"}}, {"merchant": {"$regex": search, "$options": "i"}}]
    if month:
        try:
            start = datetime.strptime(month + "-01", "%Y-%m-%d")
            year, mon = start.year, start.month
            end = datetime(year + (mon == 12), 1 if mon == 12 else mon + 1, 1)
            query["date"] = {"$gte": start, "$lt": end}
        except ValueError:
            return jsonify({"error": "Invalid month"}), 400
    docs = expenses.find(query).sort("date", -1)
    return jsonify([serialize(d) for d in docs])


@app.get("/api/expenses/<expense_id>")
def get_expense(expense_id):
    try:
        doc = expenses.find_one({"_id": ObjectId(expense_id)})
    except InvalidId:
        return jsonify({"error": "Invalid expense ID"}), 400
    if not doc: return jsonify({"error": "Expense not found"}), 404
    return jsonify(serialize(doc))


@app.post("/api/expenses")
def create_expense():
    try:
        payload = parse_payload(request.get_json(force=True))
        payload["created_at"] = datetime.now(timezone.utc)
        result = expenses.insert_one(payload)
        return jsonify(serialize(expenses.find_one({"_id": result.inserted_id}))), 201
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except WriteError as exc:
        return jsonify({"error": "MongoDB validation failed", "details": str(exc.details or exc)}), 400
    except PyMongoError as exc:
        return jsonify({"error": "Database error", "details": str(exc)}), 500


@app.put("/api/expenses/<expense_id>")
def update_expense(expense_id):
    try:
        payload = parse_payload(request.get_json(force=True), partial=True)
        if not payload: return jsonify({"error": "No fields supplied"}), 400
        result = expenses.update_one({"_id": ObjectId(expense_id)}, {"$set": payload})
    except InvalidId:
        return jsonify({"error": "Invalid expense ID"}), 400
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except WriteError as exc:
        return jsonify({"error": "MongoDB validation failed", "details": str(exc.details or exc)}), 400
    if result.matched_count == 0: return jsonify({"error": "Expense not found"}), 404
    return jsonify(serialize(expenses.find_one({"_id": ObjectId(expense_id)})))


@app.delete("/api/expenses/<expense_id>")
def delete_expense(expense_id):
    try:
        result = expenses.delete_one({"_id": ObjectId(expense_id)})
    except InvalidId:
        return jsonify({"error": "Invalid expense ID"}), 400
    if result.deleted_count == 0: return jsonify({"error": "Expense not found"}), 404
    return jsonify({"message": "Expense deleted successfully"})


@app.get("/api/analytics/summary")
def summary():
    total = list(expenses.aggregate([{"$group": {"_id": None, "total": {"$sum": "$amount"}, "average": {"$avg": "$amount"}, "count": {"$sum": 1}}}]))
    total = total[0] if total else {"total": 0, "average": 0, "count": 0}
    highest = list(expenses.aggregate([
        {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}},
        {"$sort": {"total": -1}}, {"$limit": 1}
    ]))
    return jsonify({"total": round(total.get("total", 0), 2), "average": round(total.get("average", 0), 2), "count": total.get("count", 0), "highest_category": highest[0]["_id"] if highest else "N/A"})


@app.get("/api/analytics/categories")
def categories():
    data = expenses.aggregate([{"$group": {"_id": "$category", "total": {"$sum": "$amount"}}}, {"$sort": {"total": -1}}])
    return jsonify([{"category": d["_id"], "total": round(d["total"], 2)} for d in data])


@app.get("/api/analytics/monthly")
def monthly():
    data = expenses.aggregate([
        {"$group": {"_id": {"$dateToString": {"format": "%Y-%m", "date": "$date"}}, "total": {"$sum": "$amount"}}},
        {"$sort": {"_id": 1}}
    ])
    return jsonify([{"month": d["_id"], "total": round(d["total"], 2)} for d in data])


@app.get("/api/analytics/payment-methods")
def payment_methods():
    data = expenses.aggregate([{"$group": {"_id": "$payment_method", "total": {"$sum": "$amount"}}}, {"$sort": {"total": -1}}])
    return jsonify([{"payment_method": d["_id"], "total": round(d["total"], 2)} for d in data])


@app.get("/api/analytics/top-merchants")
def top_merchants():
    data = expenses.aggregate([{"$match": {"merchant": {"$nin": [None, ""]}}}, {"$group": {"_id": "$merchant", "total": {"$sum": "$amount"}, "transactions": {"$sum": 1}}}, {"$sort": {"total": -1}}, {"$limit": 5}])
    return jsonify([{"merchant": d["_id"], "total": round(d["total"], 2), "transactions": d["transactions"]} for d in data])


@app.get("/api/analytics/trends")
def trends():
    data = expenses.aggregate([
        {"$group": {"_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$date"}}, "total": {"$sum": "$amount"}}},
        {"$sort": {"_id": 1}}
    ])
    return jsonify([{"date": d["_id"], "total": round(d["total"], 2)} for d in data])


if __name__ == "__main__":
    app.run(debug=True, port=5000)
