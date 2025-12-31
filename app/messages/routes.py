# Contributors:
# Cursor AI Assistant - Messaging feature implementation

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from app.db import get_session
from app.deps import current_user
from app.models import Message, Place, StudyAbroadProgram, Trip, User

router = APIRouter(prefix="/messages", tags=["messages"])


def get_user_id(user=Depends(current_user)) -> int:
    """Extract user ID from the current user object."""
    return user.id


# ===== PYDANTIC MODELS =====


class MessageCreate(BaseModel):
    recipient_id: int
    subject: str
    content: str
    related_program_id: Optional[int] = None
    related_place_id: Optional[int] = None
    related_trip_id: Optional[int] = None
    parent_message_id: Optional[int] = None


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    sender_name: Optional[str] = None
    sender_email: str
    recipient_id: int
    recipient_name: Optional[str] = None
    recipient_email: str
    subject: str
    content: str
    read: bool
    created_at: str
    related_program_id: Optional[int] = None
    related_program_name: Optional[str] = None
    related_place_id: Optional[int] = None
    related_place_name: Optional[str] = None
    related_trip_id: Optional[int] = None
    related_trip_name: Optional[str] = None
    parent_message_id: Optional[int] = None


# ===== HELPER FUNCTIONS =====


def get_user_display_name(user: User) -> str:
    """Get a display name for a user."""
    if user.first_name and user.last_name:
        return f"{user.first_name} {user.last_name}"
    elif user.first_name:
        return user.first_name
    return user.email.split("@")[0]


def build_message_response(message: Message, db: Session) -> dict:
    """Build a full message response with user and context info."""
    sender = db.get(User, message.sender_id)
    recipient = db.get(User, message.recipient_id)

    response = {
        "id": message.id,
        "sender_id": message.sender_id,
        "sender_name": get_user_display_name(sender) if sender else None,
        "sender_email": sender.email if sender else "Unknown",
        "recipient_id": message.recipient_id,
        "recipient_name": get_user_display_name(recipient) if recipient else None,
        "recipient_email": recipient.email if recipient else "Unknown",
        "subject": message.subject,
        "content": message.content,
        "read": message.read,
        "created_at": message.created_at.isoformat(),
        "parent_message_id": message.parent_message_id,
    }

    # Add related context if present
    if message.related_program_id:
        program = db.get(StudyAbroadProgram, message.related_program_id)
        response["related_program_id"] = message.related_program_id
        response["related_program_name"] = program.program_name if program else None

    if message.related_place_id:
        place = db.get(Place, message.related_place_id)
        response["related_place_id"] = message.related_place_id
        response["related_place_name"] = place.name if place else None

    if message.related_trip_id:
        trip = db.get(Trip, message.related_trip_id)
        response["related_trip_id"] = message.related_trip_id
        response["related_trip_name"] = trip.destination if trip else None

    return response


# ===== API ROUTES =====


@router.post("", response_model=dict)
def send_message(
    message_data: MessageCreate,
    user_id: int = Depends(get_user_id),
    db: Session = Depends(get_session),
):
    """Send a message to another user."""
    # Validate recipient exists
    recipient = db.get(User, message_data.recipient_id)
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    # Can't message yourself
    if message_data.recipient_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot send message to yourself")

    # Validate parent message if replying
    if message_data.parent_message_id:
        parent = db.get(Message, message_data.parent_message_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Parent message not found")
        # Must be part of the conversation
        if parent.sender_id != user_id and parent.recipient_id != user_id:
            raise HTTPException(status_code=403, detail="Cannot reply to this conversation")

    # Create the message
    message = Message(
        sender_id=user_id,
        recipient_id=message_data.recipient_id,
        subject=message_data.subject,
        content=message_data.content,
        related_program_id=message_data.related_program_id,
        related_place_id=message_data.related_place_id,
        related_trip_id=message_data.related_trip_id,
        parent_message_id=message_data.parent_message_id,
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return {"message": "Message sent successfully", "message_id": message.id}


@router.get("/inbox", response_model=List[dict])
def get_inbox(
    user_id: int = Depends(get_user_id),
    db: Session = Depends(get_session),
    unread_only: bool = False,
):
    """Get all messages received by the current user."""
    query = select(Message).where(Message.recipient_id == user_id)
    if unread_only:
        query = query.where(Message.read.is_(False))
    query = query.order_by(Message.created_at.desc())

    messages = db.exec(query).all()
    return [build_message_response(msg, db) for msg in messages]


@router.get("/sent", response_model=List[dict])
def get_sent_messages(
    user_id: int = Depends(get_user_id),
    db: Session = Depends(get_session),
):
    """Get all messages sent by the current user."""
    messages = db.exec(
        select(Message).where(Message.sender_id == user_id).order_by(Message.created_at.desc())
    ).all()
    return [build_message_response(msg, db) for msg in messages]


@router.get("/unread-count")
def get_unread_count(
    user_id: int = Depends(get_user_id),
    db: Session = Depends(get_session),
):
    """Get the count of unread messages."""
    count = len(
        db.exec(
            select(Message).where(Message.recipient_id == user_id, Message.read.is_(False))
        ).all()
    )
    return {"unread_count": count}


@router.get("/{message_id}", response_model=dict)
def get_message(
    message_id: int,
    user_id: int = Depends(get_user_id),
    db: Session = Depends(get_session),
):
    """Get a specific message."""
    message = db.get(Message, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    # Only sender or recipient can view
    if message.sender_id != user_id and message.recipient_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this message")

    # Mark as read if recipient is viewing
    if message.recipient_id == user_id and not message.read:
        message.read = True
        db.add(message)
        db.commit()
        db.refresh(message)

    return build_message_response(message, db)


@router.put("/{message_id}/read")
def mark_as_read(
    message_id: int,
    user_id: int = Depends(get_user_id),
    db: Session = Depends(get_session),
):
    """Mark a message as read."""
    message = db.get(Message, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    if message.recipient_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to mark this message as read")

    message.read = True
    db.add(message)
    db.commit()

    return {"message": "Message marked as read"}


@router.delete("/{message_id}")
def delete_message(
    message_id: int,
    user_id: int = Depends(get_user_id),
    db: Session = Depends(get_session),
):
    """Delete a message (only sender or recipient can delete)."""
    message = db.get(Message, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    if message.sender_id != user_id and message.recipient_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this message")

    db.delete(message)
    db.commit()

    return {"message": "Message deleted"}


@router.get("/conversation/{other_user_id}", response_model=List[dict])
def get_conversation(
    other_user_id: int,
    user_id: int = Depends(get_user_id),
    db: Session = Depends(get_session),
):
    """Get all messages between current user and another user."""
    messages = db.exec(
        select(Message)
        .where(
            ((Message.sender_id == user_id) & (Message.recipient_id == other_user_id))
            | ((Message.sender_id == other_user_id) & (Message.recipient_id == user_id))
        )
        .order_by(Message.created_at.asc())
    ).all()

    # Mark received messages as read
    for msg in messages:
        if msg.recipient_id == user_id and not msg.read:
            msg.read = True
            db.add(msg)
    db.commit()

    return [build_message_response(msg, db) for msg in messages]
