from langchain_openai import OpenAI
import sys

def generate_response(prompt):
    llm = OpenAI(api_key="YOUR_OPENAI_API_KEY")
    response = llm.invoke(prompt)
    return response

if __name__ == "__main__":
    prompt = sys.argv[1]
    print(generate_response(prompt))
