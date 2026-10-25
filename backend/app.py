from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import markdown
import os
from mistralai.client import Mistral
from documents import extract_text
from memory import get_session, add_to_history

load_dotenv()
client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))

app = Flask(__name__)
CORS(app)

with open("architecture_context.md", "r", encoding="utf8") as f:
    ARCHITECTURE_CONTEXT = f.read()

document_text = ""

def build_system_prompt(document_text):
    prompt = (
        "Odgovaraj kao arhitektonski savjetnik. "
        f"Koristi informacije iz ovog dokumenta: {ARCHITECTURE_CONTEXT}"
    )
    if document_text:
        prompt += (
            "Korisnik je učitao dokument. Koristi informacije iz "
            f"{document_text}"
        )
    return prompt

@app.route("/chat", methods=["POST"])
def chat(): 
    data = request.json
    user_message = data.get("message", "")
    session = get_session(data.get("session_id", "default"))

    messages = [{"role": "system", "content": build_system_prompt(session["document"])}]
    messages += session["history"]
    messages.append({"role": "user", "content": user_message})

    try:
        response = client.chat.complete(
            model="ministral-8b-2512", 
            messages=messages,
            temperature=0.5,
            max_tokens=1500,
        )
        reply_raw = response.choices[0].message.content
        reply_html = markdown.markdown(reply_raw)

        add_to_history(session, "user", user_message)
        add_to_history(session, "assistant", reply_raw)

        return jsonify({"reply": reply_html})
    except Exception as e:
        print("Mistral API greška:", e)
    return jsonify({
        "error": "Došlo je do greške prilikom komunikacije s"
        "Mistral API-jem." }), 500

@app.route("/upload", methods=["POST"])
def upload():
    global document_text
    file = request.files.get("file")
    if file is None: 
        return jsonify({"error": "Datoteka nije poslana."}), 400

    session = get_session(request.form.get("session_id", "default"))
    try:
        session["document"] = extract_text(file)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({"message": f"Dokument „{file.filename}“ je učitan."})

if __name__=="__main__": app.run(debug=True)


