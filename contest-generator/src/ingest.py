import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma

load_dotenv()

# Configuration
DATA_PATH = "data"
CHROMA_PATH = "chroma_db"
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def ingest_data():
    if not GOOGLE_API_KEY:
        print("Error: GOOGLE_API_KEY not found in environment variables.")
        return

    print(f"Loading documents from {DATA_PATH}...")
    
    # Load PDFs
    pdf_loader = DirectoryLoader(DATA_PATH, glob="*.pdf", loader_cls=PyPDFLoader)
    # Load Text files
    txt_loader = DirectoryLoader(DATA_PATH, glob="*.txt", loader_cls=TextLoader)
    
    documents = pdf_loader.load() + txt_loader.load()
    
    if not documents:
        print("No documents found in the data directory.")
        return

    print(f"Loaded {len(documents)} documents. Splitting into chunks...")
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        add_start_index=True
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Total chunks created: {len(chunks)}")
    
    print(f"Generating embeddings and storing in ChromaDB in batches...")
    
    embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
    
    # Initialize Chroma
    vector_store = Chroma(
        persist_directory=CHROMA_PATH,
        embedding_function=embeddings
    )
    
    import time
    batch_size = 5
    total_chunks = len(chunks)
    for i in range(0, total_chunks, batch_size):
        batch = chunks[i:i + batch_size]
        print(f"Processing batch {i//batch_size + 1}/{(total_chunks-1)//batch_size + 1} (Chunks {i} to {min(i+batch_size, total_chunks)} of {total_chunks})...")
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                vector_store.add_documents(batch)
                time.sleep(5) # Conservative sleep to stay well within 15 RPM
                break
            except Exception as e:
                print(f"Error in batch {i//batch_size + 1} (Attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    wait_time = 60 * (attempt + 1)
                    print(f"Waiting {wait_time} seconds before retrying...")
                    time.sleep(wait_time)
                else:
                    print(f"Failed to process batch {i//batch_size + 1} after {max_retries} attempts.")
                    raise e
    
    print(f"Successfully ingested data into {CHROMA_PATH}")

if __name__ == "__main__":
    ingest_data()
