from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.research_item import ResearchNote, ResearchPaper

router = APIRouter(prefix="/projects/{project_id}/research-library", tags=["Research Library"])

PAPER_SECTIONS = [
    "abstract", "introduction", "literature_review", "methodology",
    "results", "discussion", "conclusion", "references"
]


def verify_project(project_id: int, user: User, db: Session):
    project = db.query(Project).filter(
        Project.id == project_id, Project.user_id == user.id, Project.is_active == True
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def note_out(n):
    return {"id": n.id, "project_id": n.project_id, "title": n.title, "content": n.content,
            "tags": n.tags or [], "source_chat_id": n.source_chat_id,
            "created_at": n.created_at, "updated_at": n.updated_at}


def paper_out(p):
    return {"id": p.id, "project_id": p.project_id, "title": p.title,
            "sections": p.sections or {}, "created_at": p.created_at, "updated_at": p.updated_at}


class NoteCreate(BaseModel):
    title: str = Field(default="Untitled note", max_length=300)
    content: str = ""
    tags: list[str] = []
    source_chat_id: Optional[int] = None


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=300)
    content: Optional[str] = None
    tags: Optional[list[str]] = None


class PaperCreate(BaseModel):
    title: str = Field(default="Untitled research paper", max_length=500)
    sections: dict[str, str] = Field(default_factory=dict)


class PaperUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=500)
    sections: Optional[dict[str, str]] = None


@router.get("/notes")
def list_notes(project_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    verify_project(project_id, user, db)
    rows = db.query(ResearchNote).filter_by(project_id=project_id, user_id=user.id).order_by(ResearchNote.updated_at.desc()).all()
    return [note_out(x) for x in rows]


@router.post("/notes", status_code=201)
def create_note(project_id: int, data: NoteCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    verify_project(project_id, user, db)
    note = ResearchNote(user_id=user.id, project_id=project_id, title=data.title.strip() or "Untitled note",
                        content=data.content, tags=data.tags, source_chat_id=data.source_chat_id)
    db.add(note); db.commit(); db.refresh(note)
    return note_out(note)


@router.put("/notes/{note_id}")
def update_note(project_id: int, note_id: int, data: NoteUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    verify_project(project_id, user, db)
    note = db.query(ResearchNote).filter_by(id=note_id, project_id=project_id, user_id=user.id).first()
    if not note: raise HTTPException(status_code=404, detail="Note not found")
    if data.title is not None: note.title = data.title.strip() or "Untitled note"
    if data.content is not None: note.content = data.content
    if data.tags is not None: note.tags = data.tags
    db.commit(); db.refresh(note)
    return note_out(note)


@router.delete("/notes/{note_id}", status_code=204)
def delete_note(project_id: int, note_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    verify_project(project_id, user, db)
    note = db.query(ResearchNote).filter_by(id=note_id, project_id=project_id, user_id=user.id).first()
    if not note: raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note); db.commit()


@router.get("/papers")
def list_papers(project_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    verify_project(project_id, user, db)
    rows = db.query(ResearchPaper).filter_by(project_id=project_id, user_id=user.id).order_by(ResearchPaper.updated_at.desc()).all()
    return [paper_out(x) for x in rows]


@router.post("/papers", status_code=201)
def create_paper(project_id: int, data: PaperCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    verify_project(project_id, user, db)
    sections = {key: data.sections.get(key, "") for key in PAPER_SECTIONS}
    paper = ResearchPaper(user_id=user.id, project_id=project_id, title=data.title.strip() or "Untitled research paper", sections=sections)
    db.add(paper); db.commit(); db.refresh(paper)
    return paper_out(paper)


@router.put("/papers/{paper_id}")
def update_paper(project_id: int, paper_id: int, data: PaperUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    verify_project(project_id, user, db)
    paper = db.query(ResearchPaper).filter_by(id=paper_id, project_id=project_id, user_id=user.id).first()
    if not paper: raise HTTPException(status_code=404, detail="Paper not found")
    if data.title is not None: paper.title = data.title.strip() or "Untitled research paper"
    if data.sections is not None:
        merged = {key: (paper.sections or {}).get(key, "") for key in PAPER_SECTIONS}
        merged.update({key: value for key, value in data.sections.items() if key in PAPER_SECTIONS})
        paper.sections = merged
    db.commit(); db.refresh(paper)
    return paper_out(paper)


@router.delete("/papers/{paper_id}", status_code=204)
def delete_paper(project_id: int, paper_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    verify_project(project_id, user, db)
    paper = db.query(ResearchPaper).filter_by(id=paper_id, project_id=project_id, user_id=user.id).first()
    if not paper: raise HTTPException(status_code=404, detail="Paper not found")
    db.delete(paper); db.commit()
