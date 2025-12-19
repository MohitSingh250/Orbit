import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()

def test_api():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("Error: GOOGLE_API_KEY not found")
        return

    print(f"Testing API key: {api_key[:10]}...")
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
        result = embeddings.embed_query("Hello world")
        print("Success! Embedding generated.")
        print(f"Vector length: {len(result)}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_api()
