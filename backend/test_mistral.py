
import os
from pathlib import Path

from dotenv import load_dotenv
from mistralai.client import Mistral
from mistralai.client.errors.sdkerror import SDKError

# Load the .env file from the same directory as this script.
load_dotenv(Path(__file__).resolve().parent / ".env")

api_key = os.getenv("MISTRAL_API_KEY")

if not api_key:
    raise RuntimeError(
        "MISTRAL_API_KEY is missing. Check your backend/.env file."
    )

client = Mistral(api_key=api_key)

try:
    response = client.chat.complete(
        model="ministral-8b-2512",
        messages=[
            {"role": "user", "content": "Reply with hello"}
        ],
        max_tokens=50,
    )

    print(response.choices[0].message.content)

except SDKError as e:
    print("Mistral API request failed.")
    print("Error:", e)

    # This SDK error may expose the HTTP response as http_res.
    http_response = getattr(e, "http_res", None)

    if http_response is not None:
        print("\nHTTP status:", http_response.status_code)
        print("\nRelevant response headers:")

        for name, value in http_response.headers.items():
            if "rate" in name.lower() or name.lower() == "retry-after":
                print(f"{name}: {value}")

        print("\nResponse body:")
        print(getattr(e, "http_res_text", "Not available"))
