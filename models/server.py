from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain_ollama import ChatOllama
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from pydantic import BaseModel, Field
from typing import List
from langchain_core.output_parsers import PydanticOutputParser
from sentence_transformers import SentenceTransformer
from fastapi import FastAPI, UploadFile, File, Form
from typing import List
import os
from fastapi.middleware.cors import CORSMiddleware
from speakerLLM import speakUp
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
#Pydantic Classes
class Reframe(BaseModel):
    reframe_qns: bool = False
    reformed_qns: str = ""
    reframe_options: bool = False
    reformed_options: str = ""

class Question(BaseModel):
    question: str = Field(description="The question text")
    type: str = Field(description="Question type: scq, mcq, or ve")
    options: List[str] = Field(description="4 options as ['A) ...', 'B) ...', 'C) ...', 'D) ...']")
    correct_option_content: str = Field(description="Full text of correct answer")
    correct_option_letter: str = Field(description="Letter only: A, B, C, or D")
    context: str = Field(description="Source excerpt under 100 chars")
    explanation: str = Field(description="Why this answer is correct")
    difficulty: float = Field(description="Difficulty from -2.0 to 2.0, decimals allowed")
    sub_topics: List[str] = Field(description="2-3 relevant subtopics")
    reframe: Reframe = Field(default_factory=Reframe)

class Quiz(BaseModel):
    quiz_name: str = Field(description="Concise title (3-8 words)")
    questions: List[Question] = Field(description="Array of question objects")

parser = PydanticOutputParser(pydantic_object=Quiz)

llm = ChatOllama(
    model="llama3.2",
    temperature=0,
    format="json",
    num_predict=8192
)
def format_docs(docs):
        return "\n\n".join(d.page_content for d in docs)

@app.post('/generate-quiz')
async def generateChain(prompt: str = Form(...),file:UploadFile = File(...)):
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    if not file.filename:
        return {"error": "No filename provided"}
    file_path = os.path.join(upload_dir, file.filename)


    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    if(file.content_type=="application/pdf"):
        loaders = PyPDFLoader(file_path=file_path)
    if(file.content_type=="application/vnd.openxmlformats-officedocument.wordprocessingml.document"):
        loaders = Docx2txtLoader(file_path=file_path)
    if(file.content_type=="text/plain"):
        loaders = TextLoader(file_path=file_path)

    documents = loaders.load()

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=200,chunk_overlap=30)
    texts = text_splitter.split_documents(documents)
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorDb = Chroma.from_documents(documents=texts,embedding=embeddings,persist_directory='chroma_db')
    vectorDb.persist()
    vectorDb = Chroma(persist_directory='chroma_db',embedding_function=embeddings)
    retriver = vectorDb.as_retriever()

    quiz_prompt = ChatPromptTemplate.from_template("""
    You are an expert quiz generator. Create EXACTLY {num_questions} questions.

    CRITICAL: Output complete, valid JSON. DO NOT truncate.

    Structure:
    - quiz_name: Concise title (3-8 words) summarizing the document
    - questions: Array with EXACTLY {num_questions} question objects

    Each question object:
    - question: Question text
    - type: "scq" (single correct), "mcq" (multiple correct)
    - options: Array ["A) option1", "B) option2", "C) option3", "D) option4"]
    - correct_option_content: Full text of correct answer
    - correct_option_letter: Letter only (A, B, C, or D)
    - context: Brief source excerpt (under 100 chars)
    - explanation: Detailed solution
    - difficulty: -2.0 to 2.0 (decimals allowed: -1.5, 0, 0.5, 1.0, etc.)
    - sub_topics: Array of 2-3 specific subtopics
    - reframe: Object with {{
        "reframe_qns": false,
        "reformed_qns": "",
        "reframe_options": false,
        "reformed_options": ""
    }}

    Return ONLY valid JSON with this EXACT structure (no markdown, no code blocks):

    {{
    "quiz_name": "...",
    "questions":
    [
        {{"question": "...",
        "type": "...", 
        "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
        "correct_option_content": "...",
        "correct_option_letter": "...",
        "context": "...",
        "explanation": "...", 
        "difficulty":"..." , 
        "sub_topics": ["...", "..."],
        "reframe:{{   
        "reframe_qns": false,
        "reformed_qns": "...",
        "reframe_options": false, 
        "reformed_options": "..."     
        }}
        }}
    ]
    }}
                                                
    FOLLOWING ARE THE "CORRECT" EXAMPLES OF A OUTPUT FORMAT JSON YOU MUST REPLACE CONTENT ACCORDINGLY:

    {{
    "quiz_name": "Brief Quiz Title",
    "questions": [
        {{
        "question": "What is...?",
        "type": "scq",
        "options": ["A) Option one", "B) Option two", "C) Option three", "D) Option four"],
        "correct_option_content": "Option one",
        "correct_option_letter": "A",
        "context": "Brief source excerpt",
        "explanation": "This is correct because...",
        "difficulty": 0.5,
        "sub_topics": ["topic1", "topic2"],
        "reframe": {{"reframe_qns": false, "reformed_qns": "", "reframe_options": false, "reformed_options": ""}}
        }}
    ]
    }}      

                                                
    DOCUMENT CONTEXT:
    {context}
    JSON OUTPUT:""")

    quiz_generator = (
        {
            "context": lambda x: format_docs(retriver.invoke("quiz questions")),
            "num_questions": lambda x: x
        }
        | quiz_prompt
        | llm
        | parser
    )
    res = speakUp("IDENTIFY THE NUMBER OF QUESTIONS AND STRICTLY RETURN THE VALUE ONLY",prompt)
    
    total_questions= int(res)
    batch_size=5
    all_questions = []
    quiz_name = None
    if(total_questions<batch_size):
        return "MINIMUM 5 QUESTIONS ARE REQUIRED TO BE GENERATED"
        
    batches = (total_questions + batch_size - 1) // batch_size
    for batch_num in range(batches):
        remaining = total_questions - len(all_questions)
        current_size = min(batch_size, remaining)
        
        print(f"Batch {batch_num + 1}/{batches}: Generating {current_size} questions...")
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                batch_quiz = quiz_generator.invoke(current_size)
                
                # Validate all questions are complete
                valid_questions = [
                    q for q in batch_quiz.questions
                    if all(hasattr(q, field) for field in ['difficulty', 'sub_topics'])
                ]
                
                if len(valid_questions) >= current_size:
                    all_questions.extend(valid_questions[:current_size])
                    if not quiz_name:
                        quiz_name = batch_quiz.quiz_name
                    print(f"Got {current_size} questions (Total: {len(all_questions)})")
                    break
                else:
                    print(f"Only {len(valid_questions)}/{current_size} complete. Retry {attempt + 1}/{max_retries}")
                    
            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {e}")
        
        if len(all_questions) >= total_questions:
            break
    
    quiz = Quiz(
        quiz_name=quiz_name or "Generated Quiz",
        questions=all_questions[:total_questions]
    )
    quiz_json = quiz.model_dump()
    return quiz_json

