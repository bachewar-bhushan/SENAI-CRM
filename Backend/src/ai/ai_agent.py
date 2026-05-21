import json
import sys
import os

from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

"""
Receive email body from Node.js
"""

email_body = sys.argv[1]

"""
System prompt
"""

system_prompt = """
You are an AI CRM email classifier.

Analyze the email and return ONLY valid JSON.

Required JSON format:

{
  "category": "",
  "sentiment": "",
  "sentiment_score": 0,
  "urgency": "",
  "requires_human": false,
  "escalation_reason": "",
  "suggested_reply": "",
  "confidence": 0
}

Rules:
- Spam emails require human = false
- Legal/security/GDPR emails require human = true
- Critical emails must be escalated
- Return ONLY JSON
"""

"""
LLM call
"""

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",

    messages=[
        {
            "role": "system",
            "content": system_prompt
        },
        {
            "role": "user",
            "content": email_body
        }
    ],

    temperature=0.2
)

"""
Extract response
"""

result = response.choices[0].message.content

"""
Print result back to Node.js
"""

print(result)