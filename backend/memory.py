MAX_MESSAGES = 10

sessions = {}

def get_session(session_id):
    """Returns the memory of this user; creates an empty one the first time."""
    if session_id not in sessions:
        sessions[session_id] = {"history": [], "document": ""}
    return sessions[session_id]

def add_to_history(session, role, text):
    """role is 'user' or 'assistant'. Keeps only the newest MAX_MESSAGES messages."""
    session["history"].append({"role": role, "content": text})
    session["history"] = session["history"][-MAX_MESSAGES:]