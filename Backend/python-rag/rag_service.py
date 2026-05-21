import os
import fitz
import docx
import psycopg2

from vertexai import init as vertexai_init

from langchain_google_vertexai import (
    VertexAIEmbeddings
)

from langchain_text_splitters import (
    RecursiveCharacterTextSplitter
)

# =========================================
# CONFIG
# =========================================

PROJECT_ID = "senai-496918"

LOCATION = "us-central1"

DOCUMENTS_DIR = "./documents"

# =========================================
# INITIALIZE VERTEX AI
# =========================================

vertexai_init(
    project=PROJECT_ID,
    location=LOCATION
)

embeddings_model = VertexAIEmbeddings(
    model_name="text-embedding-004"
)

# =========================================
# POSTGRESQL CONNECTION
# =========================================

conn = psycopg2.connect(
    os.getenv("DATABASE_URL")
)
cursor = conn.cursor()

# =========================================
# TEXT SPLITTER
# =========================================

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

# =========================================
# PDF READER
# =========================================

def read_pdf(path):

    text = ""

    pdf = fitz.open(path)

    for page in pdf:
        text += page.get_text()

    return text

# =========================================
# DOCX READER
# =========================================

def read_docx(path):

    doc = docx.Document(path)

    return "\n".join(
        [p.text for p in doc.paragraphs]
    )

# =========================================
# INGEST DOCUMENTS
# =========================================

def ingest_documents():

    files = os.listdir(DOCUMENTS_DIR)

    for file_name in files:

        file_path = os.path.join(
            DOCUMENTS_DIR,
            file_name
        )

        print(
            f"\nProcessing: {file_name}"
        )

        # ---------------------------------
        # READ FILE
        # ---------------------------------

        if file_name.endswith(".pdf"):

            text = read_pdf(file_path)

        elif file_name.endswith(".docx"):

            text = read_docx(file_path)

        else:

            print(
                "Unsupported file"
            )

            continue

        # ---------------------------------
        # CHUNKING
        # ---------------------------------

        chunks = splitter.split_text(
            text
        )

        print(
            f"Chunks: {len(chunks)}"
        )

        # ---------------------------------
        # GENERATE EMBEDDINGS
        # ---------------------------------

        for chunk in chunks:

            embedding = (
                embeddings_model.embed_query(
                    chunk
                )
            )

            # -----------------------------
            # STORE IN DATABASE
            # -----------------------------

            cursor.execute(
                """
                INSERT INTO knowledge_chunks (
                    source_doc,
                    chunk_text,
                    embedding
                )
                VALUES (%s, %s, %s)
                """,
                (
                    file_name,
                    chunk,
                    embedding
                )
            )

        conn.commit()

        print(
            f"Finished: {file_name}"
        )

# =========================================
# SEMANTIC SEARCH
# =========================================

def semantic_search(query):

    # -------------------------------------
    # QUERY EMBEDDING
    # -------------------------------------

    query_embedding = (
        embeddings_model.embed_query(
            query
        )
    )

    # -------------------------------------
    # VECTOR SEARCH
    # -------------------------------------

    cursor.execute(
        """
        SELECT
            id,
            source_doc,
            chunk_text,

            embedding <=> %s AS distance

        FROM knowledge_chunks

        ORDER BY distance ASC

        LIMIT 3
        """,
        (query_embedding,)
    )

    results = cursor.fetchall()

    print("\nTop Results:\n")

    for row in results:

        print(
            f"""
            Source: {row[1]}

            Distance: {row[3]}

            Chunk:
            {row[2][:300]}
            """
        )

# =========================================
# MAIN
# =========================================

if __name__ == "__main__":

    print(
        "\n1. Ingest Documents"
    )

    print(
        "2. Semantic Search"
    )

    choice = input(
        "\nChoose option: "
    )

    if choice == "1":

        ingest_documents()

    elif choice == "2":

        query = input(
            "\nEnter query: "
        )

        semantic_search(query)

    else:

        print("Invalid option")

    cursor.close()

    conn.close()