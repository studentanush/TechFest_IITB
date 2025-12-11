This markdown file contains information about external AI models used in the project.

LLM Provider: Ollama, Google
Model Used: Llama3.2 , Gemini (API)

Models setup:
1. pip install ollama
2. ollama pull llama3.2
3. ollama serve

Start the Server:
1. Check on http://localhost:11434/ - whether "Ollama is running" or not, if not do 3 command of Models setup once again.
2. Run fastapi Server: uvicorn server:app --reload

It runs on localhost:8000
