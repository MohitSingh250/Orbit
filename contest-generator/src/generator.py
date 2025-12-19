import os
import json
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import Chroma
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List, Optional

load_dotenv()

# Configuration
CHROMA_PATH = "chroma_db"
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

class Option(BaseModel):
    id: str = Field(description="Option identifier (A, B, C, or D)")
    text: str = Field(description="The text of the option")

class Question(BaseModel):
    title: str = Field(description="A short, descriptive title for the problem")
    statement: str = Field(description="The full problem statement, including any necessary context")
    inputType: str = Field(description="Type of input: 'mcq_single' or 'numeric'")
    options: Optional[List[Option]] = Field(description="List of 4 options for MCQ, null for numeric")
    correctAnswer: str = Field(description="The correct answer. For MCQ, it's the ID (A, B, C, or D). For numeric, it's the number as a string.")
    points: int = Field(description="Points for the question (e.g., 4)")
    difficulty: str = Field(description="Difficulty: 'easy', 'medium', or 'hard'")
    solution: str = Field(description="Detailed step-by-step solution for the problem")

class Contest(BaseModel):
    title: str = Field(description="Title of the contest")
    description: str = Field(description="Brief description of the contest")
    problems: List[Question] = Field(description="List of questions for the contest")

def generate_contest(subject: str, topic: str, num_questions: int = 5):
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY not found")

    embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
    vector_store = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)
    
    # Retrieve relevant context
    query = f"JEE {subject} problems related to {topic}"
    docs = vector_store.similarity_search(query, k=10)
    context = "\n\n".join([doc.page_content for doc in docs])

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.7)
    structured_llm = llm.with_structured_output(Contest)

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert JEE (Mains & Advanced) question setter. Your task is to generate a high-quality contest based on the provided context from textbooks and question banks."),
        ("user", f"Create a JEE contest for {subject} on the topic of '{topic}'. \n\nContext from materials:\n{context}\n\nGenerate {num_questions} questions. Ensure a mix of MCQ and Numeric types. The questions should be challenging and follow the JEE pattern. For MCQs, provide 4 options with IDs A, B, C, and D.")
    ])

    chain = prompt | structured_llm
    contest = chain.invoke({})
    
    return contest

if __name__ == "__main__":
    # Test generation
    try:
        result = generate_contest("Physics", "Laws of Motion", 3)
        print(json.dumps(result.dict(), indent=2))
    except Exception as e:
        print(f"Error: {e}")
