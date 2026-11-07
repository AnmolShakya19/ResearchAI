# ResearchAI

### Design and Development of an Intelligent Research Assistant using Full-Stack Technologies, Retrieval-Augmented Generation (RAG), and Large Language Models (LLMs)

ResearchAI is an AI-powered research assistant designed to help students, researchers, and professionals organize research materials, analyze documents, manage research projects, and interact with information through natural language conversations.

The platform combines full-stack web technologies, Retrieval-Augmented Generation (RAG), semantic retrieval, and Large Language Models (LLMs) to generate context-aware responses grounded in uploaded research documents.

ResearchAI also provides dedicated workspaces, a research library, research-paper creation, and note management to support the complete research workflow.

---

## Features

### 1. Authentication and Security
- User registration and login.
- JWT-based authentication.
- Access and refresh token support.
- Secure password handling.
- Protected application routes.
- Google OAuth integration.
- GitHub OAuth integration/configuration support.

### 2. Workspace Management
- Create and manage multiple research workspaces.
- Maintain separate research projects.
- Workspace-specific document management.
- Separate research contexts for different topics.
- Persistent workspace and research organization.

### 3. Intelligent Document Processing
- Upload research documents in supported formats.
- Extract and clean document text.
- Automatic text chunking and segmentation.
- Generate semantic embeddings.
- Store document chunks and associated metadata.
- Retrieve relevant information from uploaded documents.

### 4. Retrieval-Augmented Generation (RAG)
- Semantic document retrieval.
- Vector-based similarity search.
- Context-aware question answering.
- Retrieval of relevant document passages.
- Source-supported responses.
- Multi-document research assistance.
- Workspace-based research context.
- Reduced dependence on unsupported LLM-generated information.

### 5. Research Library

The Research Library provides a dedicated space to manage research materials.

**Papers**
- Create and manage research papers.
- Organize paper content into sections.
- Write abstracts, introductions, literature reviews, and methodology.
- Add results, discussions, conclusions, and references.
- Save research papers.
- Maintain papers within the research workspace.

**Notes**
- Create and save research notes.
- Add note titles and tags.
- Record research findings and observations.
- View and manage saved notes.
- Export notes in Markdown format.

### 6. AI Research Assistance
- Ask questions about uploaded research documents.
- Generate research-oriented summaries.
- Explore information using natural language.
- Receive context-aware answers.
- Access source references used for responses.
- Support multi-turn research conversations.

### 7. User Interface
- Responsive React-based interface.
- Workspace dashboard.
- Research chat interface.
- Document upload and management.
- Research Library with Papers and Notes.
- Profile and settings management.

---

## Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- React Router
- Axios

### Backend
- Python
- FastAPI
- REST APIs
- SQLAlchemy
- PostgreSQL

### Artificial Intelligence and RAG
- Retrieval-Augmented Generation (RAG)
- Large Language Models (LLMs)
- Semantic Embeddings
- Text Chunking and Processing
- Vector Similarity Search
- Context Retrieval
- Source-Grounded Response Generation
- LLM API Integration

### Authentication
- JWT Authentication
- Access and Refresh Tokens
- Google OAuth 2.0
- GitHub OAuth configuration support

### Tools and Infrastructure
- Docker
- Docker Compose
- Git
- GitHub
- PostgreSQL

---

## System Architecture

```text
                  User
                   |
                   v
          React + Vite Frontend
                   |
                   v
             FastAPI Backend
                   |
          Authentication Layer
                   |
                   v
           Workspace Management
                   |
          +--------+---------+
          |                  |
          v                  v
    Document Upload     Research Library
          |              /          \
          v          Papers         Notes
   Text Extraction
          |
          v
     Text Chunking
          |
          v
   Semantic Embeddings
          |
          v
      Vector Store
          |
          v
    Relevant Retrieval
          |
          v
      LLM Processing
          |
          v
   Context-Grounded Answer
          |
          v
   Sources and Response
          |
          v
           User
```

---

## Project Structure

```text
ResearchAI/
│
├── app/
│   ├── core/
│   │   ├── chunker.py
│   │   ├── config.py
│   │   ├── dependencies.py
│   │   ├── document_processor.py
│   │   ├── email.py
│   │   ├── embedder.py
│   │   ├── prompt_builder.py
│   │   ├── rag_engine.py
│   │   ├── resource_discovery.py
│   │   ├── retriever.py
│   │   ├── security.py
│   │   ├── text_cleaner.py
│   │   └── vector_store.py
│   │
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── database.py
│   └── main.py
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
│
├── tests/
│   └── test_auth.py
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── runtime.txt
└── README.md
```

---

## Code Repository and Dataset Availability

**Source Code**

The complete application source code is available in this GitHub repository:

[https://github.com/AnmolShakya19/ResearchAI](https://github.com/AnmolShakya19/ResearchAI)

The repository contains the frontend, backend, application modules, Docker configuration, dependencies, and tests.

**Research Documents and Datasets**

- ResearchAI is designed to work with user-provided research documents.
- Users can upload their own supported documents for processing and analysis.
- Documents are processed into text chunks and semantic representations for retrieval.
- Uploaded documents and generated vector indexes are maintained separately from the public source-code repository.
- No bundled research dataset is currently distributed with this repository.

**Research Paper Creation**

Users can create and save their own research papers through the Research Library. Paper content is organized into individual academic sections.

**Research Notes**

Users can maintain research notes, organize findings using tags, and export notes as Markdown files.

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/AnmolShakya19/ResearchAI.git
cd ResearchAI
```

### 2. Backend Setup

Create and activate a Python virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

For Windows:

```bash
venv\Scripts\activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables and PostgreSQL connection using your local environment configuration.

Start the backend:

```bash
uvicorn app.main:app --reload
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

### 4. Docker Setup

Alternatively, run the application using Docker Compose:

```bash
docker compose up --build
```

The application services and ports depend on the Docker Compose configuration.

---

## Environment Configuration

Create a local `.env` file and configure the credentials required by the application.

Typical configuration categories include:

- PostgreSQL database connection.
- JWT authentication settings.
- OAuth client credentials.
- LLM API credentials.
- Application configuration.

**Security:** Never upload your `.env` file, API keys, database passwords, or authentication secrets to GitHub.

---

## API Documentation

FastAPI provides interactive API documentation through Swagger UI.

After starting the backend, open:

```text
http://localhost:8000/docs
```

Alternative documentation:

```text
http://localhost:8000/redoc
```

---

## Research Objectives

- Develop an intelligent research assistant using full-stack web technologies.
- Integrate RAG for document-grounded question answering.
- Enable semantic retrieval from uploaded research documents.
- Support independent research workspaces.
- Provide research-paper and note management.
- Improve research organization and knowledge discovery.
- Provide source-supported responses through document retrieval.

---

## Future Enhancements

- Hybrid search and retrieval.
- Advanced citation generation.
- Multi-modal document understanding.
- Additional document-format support.
- Collaborative research workspaces.
- Knowledge graph integration.
- Advanced research-paper export options.

---

## Academic Information

**Author:** Anmol Shakya

**Institution:** Noida Institute of Engineering & Technology (NIET), Greater Noida, Uttar Pradesh

**Degree:** Bachelor of Technology (B.Tech)

**Branch:** Computer Science and Engineering

**Academic Duration:** 2023–2027

**CGPA:** 7.96

---

## Author

**Anmol Shakya**

- GitHub: [AnmolShakya19](https://github.com/AnmolShakya19)
- Email: anmolshakya29381@gmail.com

---

## Acknowledgements

This project represents the application of full-stack development, database management, artificial intelligence, and modern research-assistance technologies as part of my academic learning in Computer Science and Engineering.

---

**If you find this project useful, consider giving the repository a star!**