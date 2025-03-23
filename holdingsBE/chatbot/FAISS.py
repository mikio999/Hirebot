import os
import fitz
import openai
import faiss
import numpy as np
from dotenv import load_dotenv

load_dotenv()

def get_embedding(text):
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key is None:
        raise ValueError("❌ ERROR: 환경 변수 'OPENAI_API_KEY'가 설정되지 않았습니다.")

    client = openai.OpenAI(api_key=api_key)
    response = client.embeddings.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return response.data[0].embedding

def extract_text_from_pdfs(folder_path):
    pdf_texts = {}
    pdf_files = [f for f in os.listdir(folder_path) if f.endswith('.pdf')]

    for pdf_file in pdf_files:
        pdf_path = os.path.join(folder_path, pdf_file)
        doc = fitz.open(pdf_path)
        for page_num, page in enumerate(doc, start=1):
            page_text = page.get_text("text").strip()
            if page_text:
                key = f"{pdf_file}_page{page_num}"
                pdf_texts[key] = page_text
    return pdf_texts

def store_pdfs_to_vector_db(folder_path):
    pdf_data = extract_text_from_pdfs(folder_path)
    knowledge_base = []
    pdf_vectors = []

    for filename_page, page_text in pdf_data.items():
        embedding = get_embedding(page_text[:6000])
        pdf_vectors.append(embedding)
        knowledge_base.append((filename_page, page_text))

    if pdf_vectors:
        dimension = len(pdf_vectors[0])
        index = faiss.IndexFlatL2(dimension)
        index.add(np.array(pdf_vectors))
        print(f"✅ {len(pdf_vectors)}개의 PDF 페이지 데이터가 벡터 DB에 저장되었습니다!")
    else:
        raise ValueError("⚠️ PDF에서 텍스트를 추출하지 못했습니다.")

    return index, knowledge_base

def chatbot_knowledge_search(user_query, index, knowledge_base, threshold=0.5):
    query_vector = np.array([get_embedding(user_query)])
    distances, indices = index.search(query_vector, 1)

    similarity_score = 1 / (1 + distances[0][0])

    if similarity_score < threshold:
        return "❌ 관련 정보를 찾을 수 없습니다."

    best_match_filename, best_match_text = knowledge_base[indices[0][0]]

    return f"📂 출처: {best_match_filename}\n🔹 관련 정보:\n{best_match_text[:500]}..."


