from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from chatbot.chatbot_core import generate_chatbot_response

load_dotenv()
app = Flask(__name__)

CORS(app, resources={r"/chat": {"origins": [
    "http://localhost:5173", 
    "http://127.0.0.1:5173", 
    "https://hirebot-6dcac.web.app"
]}})

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_input = data.get("message", "").strip()

        if not user_input:
            return jsonify({"error": "메시지가 비어 있습니다."}), 400

        reply = generate_chatbot_response(user_input)
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
