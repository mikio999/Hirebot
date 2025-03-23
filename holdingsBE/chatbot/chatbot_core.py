# chatbot/chatbot_core.py
import os, json, pickle, faiss
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime
from .FAISS import chatbot_knowledge_search 

load_dotenv()
API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=API_KEY)
DEFAULT_MODEL = "gpt-4o-mini"

# Load FAQ
with open("chatbot/faq_data.json", "r", encoding="utf-8") as f:
    FAQ_DATABASE = json.load(f)

def get_faq_answer(question):
    for key in FAQ_DATABASE.keys():
        if key in question:
            return FAQ_DATABASE[key]
    return None

# Load vector DB
index = faiss.read_index("chatbot/vector_db.index")
with open("chatbot/knowledge_base.pkl", "rb") as f:
    knowledge_base = pickle.load(f)

def generate_chatbot_response(user_input: str) -> str:
    user_input = user_input.strip().lower()

    # 1. FAQ
    faq_answer = get_faq_answer(user_input)
    if faq_answer:
        return faq_answer

    # 2. PDF Knowledge Search
    pdf_answer = chatbot_knowledge_search(user_input, index, knowledge_base)
    if "❌ 관련 정보를 찾을 수 없습니다." not in pdf_answer:
        messages = [
            {"role": "system", "content": "당신은 HL홀딩스의 채용 전문가 AI 챗봇입니다. 사용자 질문에 정확히 답변하세요."},
            {"role": "user", "content": f"질문: {user_input}\n\n참고 문서:\n{pdf_answer}"}
        ]
        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=messages,
            temperature=0.2,
            max_tokens=500
        )
        return response.choices[0].message.content

    # 3. Default fallback
    messages = [
        {"role": "system", "content": "당신은 HL홀딩스의 채용 전문가 AI 챗봇입니다."},
        {"role": "user", "content": user_input}
    ]
    response = client.chat.completions.create(
        model=DEFAULT_MODEL,
        messages=messages,
        temperature=0.2,
        max_tokens=500
    )
    return response.choices[0].message.content
