from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(2042), unique=False, nullable=False)
    username = db.Column(db.String(120), unique=False, nullable=False)
    first_name = db.Column(db.String(120))
    last_name = db.Column(db.String(120))
    age = db.Column(db.Integer)
    region = db.Column(db.String)
    timezone = db.Column(db.String)
    languages = db.Column(db.String)
    xbox = db.Column(db.String)
    psn = db.Column(db.String)
    steam = db.Column(db.String)
    discord = db.Column(db.String)
    nintendo = db.Column(db.String)
    epic_id = db.Column(db.String)
    bio = db.Column(db.String)
    gender = db.Column(db.String)
    admin = db.Column(db.Boolean, unique=False, nullable=True)
    is_deleted = db.Column(db.Boolean, default=False)
    url_image = db.Column(db.String(1024))

    room_participants = db.relationship('Room_participant', backref='user', lazy=True)
    comments = db.relationship('Comment', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "user_id": self.id,
            "email": self.email,
            "username": self.username,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "age": self.age,
            "region": self.region,
            "timezone": self.timezone,
            "languages": self.languages,
            "xbox": self.xbox,
            "psn": self.psn,
            "steam": self.steam,
            "discord": self.discord,
            "nintendo": self.nintendo,
            "epic_id": self.epic_id,
            "bio": self.bio,
            "gender": self.gender,
            "admin": self.admin,
            "is_deleted": self.is_deleted,
            "url_image": self.url_image
        }
    
class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.String)
    time = db.Column(db.String)
    room_name = db.Column(db.String(80), nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'), nullable=False)
    platform = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
    mood = db.Column(db.String, nullable=False)
    reviews = db.Column(db.String)
    room_size = db.Column(db.Integer, nullable=False)
    is_deleted = db.Column(db.Boolean, default=False)

    room_participants = db.relationship('Room_participant', backref='room', lazy=True)
    comments = db.relationship('Comment', backref='room', lazy=True)
    user = db.relationship('User', backref=db.backref('hosted_rooms', lazy=True))
    game = db.relationship('Games', backref=db.backref('rooms', lazy=True))

    def __repr__(self):
        return f'<Room {self.id}>'

    def serialize(self):
        return {
            "room_id": self.id,
            "user_id": self.user_id,
            "date": self.date,
            "time": self.time,
            "room_name": self.room_name,
            "game_id": self.game_id,
            "platform": self.platform,
            "description": self.description,
            "mood": self.mood,
            "reviews": self.reviews,
            "room_size": self.room_size,
            "is_deleted": self.is_deleted
        }
    
class Games(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)

    def __repr__(self):
        return f'<Games {self.id}>'
    
    def serialize(self):
        return {
            "game_id": self.id,
            "name": self.name
        }

class Room_participant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    confirmed = db.Column(db.Boolean(), unique=False, nullable=False)

    def __repr__(self):
        return f'<Room_Participant {self.id}>'

    def serialize(self):
        return {
            "room_participant_id": self.id,
            "room_id": self.room_id,
            "user_id": self.user_id,
            "confirmed": self.confirmed
        }
    
    
class Room_request(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String, nullable=False, default='pending')
    
    user = db.relationship('User', backref=db.backref('requests', lazy=True))
    room = db.relationship('Room', backref=db.backref('requests', lazy=True))

    def __repr__(self):
        return f'<Room_request {self.id}>'
    
    def serialize(self):
        return {
            "room_request_id": self.id,
            "room_id": self.room_id,
            "user_id": self.user_id,
            "status": self.status
        }

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_deleted = db.Column(db.Boolean, default=False)
    is_edited = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    def __repr__(self):
        return f'<Comment {self.id}>'

    def serialize(self):
        return {
            "comment_id": self.id,
            "content": self.content,
            "created_at": self.created_at,
            "is_deleted": self.is_deleted,
            "is_edited": self.is_edited,
            "room_id": self.room_id,
            "user_id": self.user_id,
            "username": self.user.username 
        }

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    reviewed_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)  
    content = db.Column(db.Text, nullable=True)  
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __repr__(self):
        return f'<Review {self.id}>'

    def serialize(self):
        return {
            "review_id": self.id,
            "room_id": self.room_id,
            "reviewer_id": self.reviewer_id,
            "reviewed_user_id": self.reviewed_user_id,
            "score": self.score,
            "content": self.content,
            "created_at": self.created_at
        }
