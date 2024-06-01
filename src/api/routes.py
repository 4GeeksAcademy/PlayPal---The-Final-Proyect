"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Room, Games, Room_request, Room_participant, Comment, Review
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity
from datetime import timedelta
import re
import os

from sqlalchemy.exc import SQLAlchemyError
import jwt
import logging

from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer

api = Blueprint('api', __name__)

# Configurar Flask-Mail
mail = Mail()

# Configurar URLSafeTimedSerializer para generación de tokens
s = URLSafeTimedSerializer("YourSecretKey")

# Allow CORS requests to this API
CORS(api)
bcrypt = Bcrypt()

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


@api.route('/signup', methods=['POST'])
def new_user():
    try:
        sign_up_data = request.json
        print("Datos recibidos en la solicitud:", sign_up_data)

        # Obtener los datos del formulario de registro
        email = sign_up_data.get('email')
        password = sign_up_data.get('password')
        username = sign_up_data.get('username')
        first_name = sign_up_data.get('firstName')
        last_name = sign_up_data.get('lastName')
        age = sign_up_data.get('age')
        region = sign_up_data.get('region')
        timezone = sign_up_data.get('timezone')
        languages = sign_up_data.get('languages')
        xbox = sign_up_data.get('xbox')
        psn = sign_up_data.get('psn')
        steam = sign_up_data.get('steam')
        discord = sign_up_data.get('discord')
        nintendo = sign_up_data.get('nintendo')
        epic_id = sign_up_data.get('epicId')
        bio = sign_up_data.get('bio')
        gender = sign_up_data.get('gender')
        admin = sign_up_data.get('admin')
        url_image = sign_up_data.get('url_image')
    
        # Convierte una variable de valor (" ") a booleano
        if admin is not None:
            admin = bool(admin)

        if not email.strip() or not password.strip():
            return jsonify({"message": "Missing required fields: email or password"}), 400
        
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'error': 'Email already exists.'}), 409

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

        print("ESTE ES PASSWORD HASHEADO: ",hashed_password)

        new_user = User(
            email = email,
            password = hashed_password,
            username = username,
            first_name = first_name,
            last_name = last_name,
            age = age,
            region = region,
            timezone = timezone,
            languages = languages,
            xbox = xbox,
            psn = psn,
            steam = steam,
            discord = discord,
            nintendo = nintendo,
            epic_id = epic_id,
            bio = bio,
            gender = gender,
            admin = admin,
            url_image = url_image
            )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User created successfully", "user": new_user.serialize()}), 201
    
    except Exception as e:
        print(str(e))
        return jsonify({"message": "Failed to create user", "error": str(e)}), 500

    

@api.route('/login', methods=['POST'])
def get_token():
    
    def validate_email(email):
        pattern = r'^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$'
        return re.match(pattern, email)
    
    try:
        email = request.json.get('email')
        password = request.json.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required.'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format.'}), 400
        
        login_user = User.query.filter_by(email=email).one_or_none()

        if not login_user:
            return jsonify({'error': 'Email/user not found.'}), 404

        if bcrypt.check_password_hash(login_user.password, password):
            expires = timedelta(hours=1)  # pueden ser "hours", "minutes", "days","seconds"
            user_id = login_user.id
            access_token = create_access_token(identity=user_id, expires_delta=expires)
            time_zone = getattr(login_user, 'timezone', None)
            data_to_return = {
                'token': access_token,
                'user_id': login_user.id,
                'admin': login_user.admin,
                'email': login_user.email,
                'username': login_user.username,
                'first_name': login_user.first_name,
                'last_name': login_user.last_name,
                'age': login_user.age,
                'region': login_user.region,
                'time_zone': time_zone,
                'languages': login_user.languages,
                'xbox': login_user.xbox,
                'psn': login_user.psn,
                'steam': login_user.steam,
                'discord': login_user.discord,
                'nintendo': login_user.nintendo,
                'epic_id': login_user.epic_id,
                'bio': login_user.bio,
                'gender': login_user.gender,
            }
            return jsonify(data_to_return), 200
        else:
            return jsonify({"error": "Incorrect password"}), 404
    
    except Exception as e:
        return jsonify({"error": "The provided email does not correspond to any registered user: " + str(e)}), 500
    

@api.route('/request-reset-password', methods=['POST'])
def request_reset_password():
    email = request.json.get('email')
    user = User.query.filter_by(email=email).first()
    if user:
        token = s.dumps(email, salt='password-reset-salt')
        
        # Usar la URL del frontend del archivo .env
        frontend_url = os.getenv('FRONTEND_URL')
        link = f"{frontend_url}/reset-password/"
        msg = Message("Password Reset Request", recipients=[email])
        msg.body = f"Please click the link to reset your password: {link}"
        print(link)  # Imprime el link en la consola para verificarlo
        mail.send(msg)
        return jsonify({"message": "Password reset link sent", "token":token}), 200
    return jsonify(message="Email not found"), 404

@api.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    try:
        # Limpiar el token de caracteres inesperados
        token = token.strip()
        email = s.loads(token, salt='password-reset-salt', max_age=3600)  # Token válido por 1 hora
    except Exception as e:
        print(f"Error loading token: {e}")
        return jsonify(message="Token is invalid or expired"), 400

    new_password = request.json.get('password')
    if not new_password:
        return jsonify(message="New password is required"), 400

    user = User.query.filter_by(email=email).first()
    if user:
        user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        db.session.commit()
        return jsonify(message="Password updated successfully"), 200

    return jsonify(message="User not found"), 404




@api.route('/home', methods=['GET'])
def get_current_rooms():
    try:
        current_rooms = Room.query.filter_by(is_deleted=False).all()
        serialized_rooms = []

        for room in current_rooms:
            participants = []
            for participant in room.room_participants:
                participants.append({
                    "participant_id": participant.user.id,
                    "participant_name": participant.user.username,
                    "confirmed": participant.confirmed
                })

            serialized_room = {
                "room_id": room.id,
                "room_size": room.room_size,
                "game_name": room.game.name,
                "room_name": room.room_name,
                "description": room.description,
                "host_name": room.user.username,
                "date": room.date,
                "time": room.time,
                "platform": room.platform,
                "mood": room.mood,
                "participants": participants  
            }
            serialized_rooms.append(serialized_room)

        return jsonify(serialized_rooms), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/create_room', methods=['POST'])
@jwt_required()  # Esta decoración asegura que el usuario esté autenticado con un token JWT válido
def create_room():
    try:
        # Extraer datos del token JWT para obtener la identidad del usuario
        current_user_id = get_jwt_identity()
        
        # Obtener los datos de la solicitud JSON
        room_data = request.json
        
        # Verificar que todos los campos necesarios estén presentes
        required_fields = ['date', 'time', 'room_name', 'game_id', 'platform', 'description', 'mood', 'room_size']
        for field in required_fields:
            if field not in room_data or not room_data[field]:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Crear una nueva instancia de Room con los datos proporcionados
        new_room = Room(
            user_id=current_user_id,  # Asignar al usuario actual como el anfitrión de la sala
            date=room_data.get('date'),
            time=room_data.get('time'),
            room_name=room_data.get('room_name'),
            game_id=room_data.get('game_id'),
            platform=room_data.get('platform'),
            description=room_data.get('description'),
            mood=room_data.get('mood'),
            room_size=room_data.get('room_size')
        )
        
        # Agregar la nueva sala a la base de datos y confirmar la transacción
        db.session.add(new_room)
        db.session.commit()
        
        return jsonify({"message": "Room created successfully", "room": new_room.serialize()}), 201
    
    except Exception as e:
        return jsonify({"message": "Failed to create room", "error": str(e)}), 500
    

@api.route('/create_game', methods=['POST'])
@jwt_required()
def create_game():
    try:
        # Obtener el ID de usuario del token de acceso
        current_user_id = get_jwt_identity()

        # Verificar si el usuario es admin
        current_user = User.query.get(current_user_id)
        if not current_user or not current_user.admin:
            return jsonify({"error": "Only admins can create games."}), 403

        game_data = request.json
        print("Datos recibidos en la solicitud:", game_data)

        name = game_data.get('name')

        if not name:
            return jsonify({"error": "Missing required field: name"}), 400

        existing_game = Games.query.filter_by(name=name).first()
        if existing_game:
            return jsonify({'error': 'Game already exists.'}), 409

        new_game = Games(
            name=name
        )

        db.session.add(new_game)
        db.session.commit()

        return jsonify({"message": "Game created successfully", "game": new_game.serialize()}), 201
    
    except Exception as e:
        print(str(e))
        return jsonify({"message": "Failed to create game", "error": str(e)}), 500
    

# Para obtener un room de un user particular-------------------------------------------------------------------------------------------

@api.route('/room/<int:room_id>', methods=['GET'])
@jwt_required()
def get_room(room_id):
    try:
        # Obtener el ID de usuario del token de acceso
        current_user_id = get_jwt_identity()

        # Verificar si el usuario existe
        current_user = User.query.get(current_user_id)
        if not current_user:
            return jsonify({"error": "User not found."}), 404

        # Verificar si el usuario es el creador del room o un administrador
        room = Room.query.filter_by(id=room_id).first()
        if not room:
            return jsonify({"error": "Room not found."}), 404

        # Verificar permisos
        if room.user_id != current_user_id and not current_user.admin:
            return jsonify({"error": "Unauthorized."}), 403

        return jsonify(room.serialize()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    

#update Room --------------------------------------------------------------------------------------------------------------
@api.route('/room/<int:room_id>', methods=['PUT'])
@jwt_required()
def update_room(room_id):
    try:
        # Obtener el ID de usuario del token de acceso
        current_user_id = get_jwt_identity()

        # Verificar si el usuario existe
        current_user = User.query.get(current_user_id)
        if not current_user:
            return jsonify({"error": "User not found."}), 404

        # Verificar si el room existe
        room = Room.query.get(room_id)
        if not room:
            return jsonify({"error": "Room not found."}), 404

        # Verificar permisos
        if room.user_id != current_user_id and not current_user.admin:
            return jsonify({"error": "Unauthorized."}), 403

        # Actualizar los datos del room
        room_data = request.json
        room.date = room_data.get('date', room.date)
        room.time = room_data.get('time', room.time)
        room.room_name = room_data.get('room_name', room.room_name)
        room.game_id = room_data.get('game_id', room.game_id)
        room.platform = room_data.get('platform', room.platform)
        room.description = room_data.get('description', room.description)
        room.mood = room_data.get('mood', room.mood)
        room.room_size = room_data.get('room_size', room.room_size)

        db.session.commit()
        return jsonify({"message": "Room updated successfully", "room": room.serialize()}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# DELETE ROOM -------------------------------------------------------------------------------------------------------

@api.route('/room/<int:room_id>', methods=['DELETE'])
@jwt_required()
def delete_room(room_id):
    try:
        # Obtener el ID de usuario del token de acceso
        current_user_id = get_jwt_identity()

        # Verificar si el usuario existe
        current_user = User.query.get(current_user_id)
        if not current_user:
            return jsonify({"error": "User not found."}), 404

        # Verificar si el room existe
        room = Room.query.get(room_id)
        if not room:
            return jsonify({"error": "Room not found."}), 404

        # Verificar permisos
        if room.user_id != current_user_id and not current_user.admin:
            return jsonify({"error": "Unauthorized."}), 403

        # Eliminación lógica del room
        room.is_deleted = True
        db.session.commit()
        return jsonify({"message": "Room deleted successfully (logical delete)"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Obteniendo la información del usuario-------------------------------------------------------------------------

@api.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    try:
        # Obtener el ID de usuario del token de acceso
        current_user_id = get_jwt_identity()

        # Verificar si el usuario solicitado es el mismo que el usuario autenticado o si el usuario autenticado es admin
        if current_user_id != user_id:
            current_user = User.query.get(current_user_id)
            if not current_user or not current_user.admin:
                return jsonify({"error": "Unauthorized."}), 403

        user = User.query.get(user_id)
        if user:
            return jsonify(user.serialize()), 200
        else:
            return jsonify({"error": "User not found."}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# EDIT USER -------------------------------------------------------------------------------------------------------------------------
@api.route('/user/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    try:
        # Obtener el ID de usuario del token de acceso
        current_user_id = get_jwt_identity()

        # Obtener la instancia del usuario actual
        current_user = User.query.get(current_user_id)

        # Verificar si el usuario actual es admin o el mismo usuario que solicita la actualización
        if not current_user or (current_user.id != user_id and not current_user.admin):
            return jsonify({"error": "Unauthorized."}), 403

        user = User.query.get(user_id)
        if user:
            user_data = request.json

            # Solo actualizar el password si se proporciona uno nuevo, de lo contrario, mantener el actual
            new_password = user_data.get('password')
            if new_password:
                user.password = bcrypt.generate_password_hash(new_password).decode("utf-8")

            # Actualizar los demás campos si se proporcionan, de lo contrario, mantener los valores actuales
            user.username = user_data.get('username', user.username)
            user.first_name = user_data.get('first_name', user.first_name)
            user.last_name = user_data.get('last_name', user.last_name)
            user.age = user_data.get('age', user.age)
            user.region = user_data.get('region', user.region)
            user.timezone = user_data.get('timezone', user.timezone)
            user.languages = user_data.get('languages', user.languages)
            user.xbox = user_data.get('xbox', user.xbox)
            user.psn = user_data.get('psn', user.psn)
            user.steam = user_data.get('steam', user.steam)
            user.google_play = user_data.get('google_play', user.google_play)
            user.nintendo = user_data.get('nintendo', user.nintendo)
            user.epic_id = user_data.get('epic_id', user.epic_id)
            user.bio = user_data.get('bio', user.bio)
            user.gender = user_data.get('gender', user.gender)
            user.url_image = user_data.get('url_image', user.url_image)

            # Solo permitir que los administradores actualicen el campo admin
            if current_user.admin:
                user.admin = user_data.get('admin', user.admin)

            db.session.commit()
            return jsonify({"message": "User updated successfully", "user": user.serialize()}), 200
        else:
            return jsonify({"error": "User not found."}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
#--DELETE USER----------------------------------------------------------------------------------------------------------------------------------------------
@api.route('/user/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Verificar si el usuario autenticado es admin o es el mismo usuario que solicita la eliminación
        if not current_user or (current_user.id != user_id and not current_user.admin):
            return jsonify({"error": "Unauthorized."}), 403

        user_to_delete = User.query.get(user_id)

        if user_to_delete:
            # Verificar si se está intentando eliminar a un usuario admin sin ser admin
            if user_to_delete.admin and not current_user.admin:
                return jsonify({"error": "Cannot delete an admin user."}), 403

            if current_user.admin:
                # Si el usuario autenticado es admin, eliminar físicamente el usuario
                db.session.delete(user_to_delete)
                db.session.commit()
                return jsonify({"message": "User deleted physically by admin"}), 200
            else:
                # Si el usuario no es admin, realizar eliminación lógica
                user_to_delete.is_deleted = True
                db.session.commit()
                return jsonify({"message": "User deleted logically"}), 200
        else:
            return jsonify({"error": "User not found."}), 404

    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error.", "details": str(e)}), 500
    except jwt.ExpiredSignatureError:
        logging.error("Token has expired.")
        return jsonify({"error": "Token has expired."}), 401
    except jwt.InvalidTokenError:
        logging.error("Invalid token.")
        return jsonify({"error": "Invalid token."}), 401
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred.", "details": str(e)}), 500


# ---------------------------------------JOIN a ROOM--------------------------------------------------------------
@api.route('/room/<int:room_id>/join', methods=['POST'])
@jwt_required()
def join_room(room_id):
    try:
        current_user_id = get_jwt_identity()
        room = Room.query.get(room_id)
        if not room:
            return jsonify({"error": "Room not found"}), 404

        current_user = User.query.get(current_user_id)

        # Comprobar si el usuario tiene la plataforma correspondiente
        if room.platform != 'All':
            if room.platform == 'PC':
                if not (current_user.steam or current_user.epic_id):
                    return jsonify({"error": "You do not have a PC ID (Steam or Epic) associated with your profile"}), 400
            else:
                if not getattr(current_user, room.platform.lower(), None):
                    return jsonify({"error": f"You do not have a {room.platform} ID associated with your profile"}), 400
        
        # Verificar si la solicitud ya existe
        existing_request = Room_request.query.filter_by(room_id=room_id, user_id=current_user_id).first()
        if existing_request:
            if existing_request.status == 'abandoned':
                existing_request.status = 'pending'
                db.session.commit()
                return jsonify({"message": "Rejoin request sent successfully", "request": existing_request.serialize()}), 200
            else:
                return jsonify({"error": "Request already exists"}), 400
        
        # Crear nueva solicitud
        new_request = Room_request(room_id=room_id, user_id=current_user_id, status='pending')
        db.session.add(new_request)
        db.session.commit()
        
        return jsonify({"message": "Request to join room sent successfully", "request": new_request.serialize()}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#-----------------------------------PENDING "JOIN" REQUEST-------------------------------------------------

@api.route('/room/<int:room_id>/requests', methods=['GET'])
@jwt_required()
def get_room_requests(room_id):
    try:
        current_user_id = get_jwt_identity()
        room = Room.query.get(room_id)
        if not room:
            return jsonify({"error": "Room not found"}), 404

        # Verificar permisos
        if room.user_id != current_user_id:
            current_user = User.query.get(current_user_id)
            if not current_user or not current_user.admin:
                return jsonify({"error": "Unauthorized"}), 403

        requests = Room_request.query.filter_by(room_id=room_id, status="pending").all()
        serialized_requests = []
        for req in requests:
            user = User.query.get(req.user_id)
            serialized_request = req.serialize()
            serialized_request['participant_name'] = user.username
            serialized_requests.append(serialized_request)

        return jsonify({"requests": serialized_requests}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


#--------------ACCEPT OR REJECT "JOIN" & ROOM UPDATE-------------------------------------------

@api.route('/room/<int:room_id>/requests/<int:request_id>', methods=['PUT'])
@jwt_required()
def update_room_request(room_id, request_id):
    try:
        current_user_id = get_jwt_identity()
        
        # Obtener el room
        room = Room.query.get(room_id)
        if not room:
            return jsonify({"error": "Room not found"}), 404

        # Verificar permisos
        if room.user_id != current_user_id:
            current_user = User.query.get(current_user_id)
            if not current_user or not current_user.admin:
                return jsonify({"error": "Unauthorized"}), 403

        # Obtener la solicitud de unión
        join_request = Room_request.query.get(request_id)
        if not join_request or join_request.room_id != room_id:
            return jsonify({"error": "Request not found"}), 404

        response_data = request.json
        new_status = response_data.get('status')
        if new_status not in ["accepted", "rejected"]:
            return jsonify({"error": "Invalid status"}), 400

        join_request.status = new_status

        # Si la solicitud es aceptada, añadir al usuario a los participantes del room
        if new_status == "accepted":
            user = User.query.get(join_request.user_id)
            if user:
                new_participant = Room_participant(room_id=room_id, user_id=join_request.user_id, confirmed=True)
                db.session.add(new_participant)
        
        db.session.commit()
        return jsonify({"message": "Request updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#---------------Determine Room_Request Status-------------------------------------------------------------------------------------------
@api.route('/room/<int:room_id>/request_status', methods=['GET'])
@jwt_required()
def check_request_status(room_id):
    try:
        current_user_id = get_jwt_identity()
        existing_request = Room_request.query.filter_by(room_id=room_id, user_id=current_user_id).first()
        if existing_request:
            return jsonify({"request_status": existing_request.status}), 200
        else:
            return jsonify({"request_status": "None"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
#---------------Delete Room_Request -------------------------------------------------------------------------------------------    
@api.route('/room/<int:room_id>/withdraw_request', methods=['DELETE'])
@jwt_required()
def withdraw_request(room_id):
    try:
        current_user_id = get_jwt_identity()
        existing_request = Room_request.query.filter_by(room_id=room_id, user_id=current_user_id).first()
        if not existing_request:
            return jsonify({"error": "Request not found"}), 404

        db.session.delete(existing_request)
        db.session.commit()
        
        return jsonify({"message": "Request withdrawn successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#--------GET GAMES--------------------------------------------------------------------------------------------------------------
@api.route('/games', methods=['GET'])
def get_games():
    try:
        games = Games.query.all()
        return jsonify([game.serialize() for game in games]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


#------------------USER COMMENTS-------------------------------------------------------------------------------------------------
@api.route('/room/<int:room_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(room_id):
    try:
        current_user_id = get_jwt_identity()
        print(f"Current User ID: {current_user_id}")

        room = Room.query.get(room_id)
        if not room:
            return jsonify({"error": "Room not found"}), 404

        comment_data = request.json
        is_host = comment_data.get('isHost', False)  # Obtener el indicador isHost del frontend
        content = comment_data.get('content')
        print(f"is_Host {is_host}")
        if not content:
            return jsonify({"error": "Missing required field: content"}), 400

        participant = Room_participant.query.filter_by(room_id=room_id, user_id=current_user_id, confirmed=True).first()
        print(f"Participant: {participant}")

        if not participant and not is_host:
            return jsonify({"error": "Unauthorized. Only participants or hosts can comment."}), 403

        new_comment = Comment(
            room_id=room_id,
            user_id=current_user_id,
            content=content
        )

        db.session.add(new_comment)
        db.session.commit()

        return jsonify({"message": "Comment created successfully", "comment": new_comment.serialize()}), 201

    except Exception as e:
        print(f"Exception: {str(e)}")
        return jsonify({"error": str(e)}), 500



#------------------GET COMMENT----------------------------------------------------------------------------------------------
@api.route('/room/<int:room_id>/comments', methods=['GET'])
@jwt_required()
def get_room_comments(room_id):
    try:
        current_user_id = get_jwt_identity()
        room = Room.query.get(room_id)
        if not room:
            return jsonify({"error": "Room not found"}), 404

        # Verificar si el usuario es participante del room o el host
        participation = Room_participant.query.filter_by(room_id=room_id, user_id=current_user_id, confirmed=True).first()
        is_host = room.user_id == current_user_id
        if not participation and not is_host:
            return jsonify({"error": "Unauthorized"}), 403

        comments = Comment.query.filter_by(room_id=room_id).all()
        serialized_comments = [comment.serialize() for comment in comments]
        return jsonify({"comments": serialized_comments}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


#------------------UPDATE COMMENT----------------------------------------------------------------------------------------------
@api.route('/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    try:
        current_user_id = get_jwt_identity()
        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify({"error": "Comment not found"}), 404

        if comment.user_id != current_user_id:
            return jsonify({"error": "Unauthorized"}), 403

        comment_data = request.json
        content = comment_data.get('content')
        if not content:
            return jsonify({"error": "Content is required"}), 400

        comment.content = content
        comment.is_edited = True

        db.session.commit()
        return jsonify({"message": "Comment updated successfully", "comment": comment.serialize()}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#----------DELETE COMMENT ------------------------------------------------------------------------------------
@api.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    try:
        current_user_id = get_jwt_identity()
        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify({"error": "Comment not found"}), 404

        current_user = User.query.get(current_user_id)
        if not current_user:
            return jsonify({"error": "User not found"}), 404

        # Verificar si el usuario es el autor del comentario o un administrador
        if comment.user_id != current_user_id and not current_user.admin:
            return jsonify({"error": "Unauthorized"}), 403

        # Si es admin, eliminar el comentario físicamente
        if current_user.admin:
            db.session.delete(comment)
            db.session.commit()
            return jsonify({"message": "Comment deleted permanently by admin"}), 200
        else:
            # Si no es admin, realizar una eliminación lógica
            comment.is_deleted = True
            db.session.commit()
            return jsonify({"message": "Comment deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#-------------ALL COMMENTS FOR ADMIN---------------------------------------------------------------------------
@api.route('/admin/comments', methods=['GET'])
@jwt_required()
def get_all_comments():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        if not current_user or not current_user.admin:
            return jsonify({"error": "Unauthorized"}), 403

        comments = Comment.query.all()
        return jsonify([comment.serialize() for comment in comments]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


#-------------ALL USERS FOR ADMIN---------------------------------------------------------------------------
@api.route('/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        if not current_user or not current_user.admin:
            return jsonify({"error": "Unauthorized"}), 403

        users = User.query.all()
        return jsonify([user.serialize() for user in users]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

#---------------ALL ROOMS FOR ADMIN-------------------------------------------------------------------------------------------
@api.route('/admin/rooms', methods=['GET'])
@jwt_required()
def get_all_rooms():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        if not current_user or not current_user.admin:
            return jsonify({"error": "Unauthorized"}), 403

        rooms = Room.query.all()
        return jsonify([room.serialize() for room in rooms]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


#-------------POST REVIEW------------------------------------------------------------------------------------------------------
@api.route('/room/<int:room_id>/review', methods=['POST'])
@jwt_required()
def review_users(room_id):
    try:
        current_user_id = get_jwt_identity()
        room = Room.query.get(room_id)
        if not room:
            return jsonify({"error": "Room not found"}), 404

        # Verificar si el usuario es participante del room
        participation = Room_participant.query.filter_by(room_id=room_id, user_id=current_user_id).first()
        if not participation:
            return jsonify({"error": "Unauthorized"}), 403

        reviews_data = request.json.get('reviews', [])
        for review_data in reviews_data:
            reviewed_user_id = review_data.get('user_id')
            score = review_data.get('score')
            content = review_data.get('content', '')  # Obtener el comentario, si se proporciona

            # Evitar que el usuario se califique a sí mismo
            if reviewed_user_id == current_user_id:
                continue

            # Evitar puntuaciones inválidas
            if score < 1 or score > 5:
                return jsonify({"error": "Score must be between 1 and 5"}), 400

            new_review = Review(
                room_id=room_id,
                reviewer_id=current_user_id,
                reviewed_user_id=reviewed_user_id,
                score=score,
                content=content
            )
            db.session.add(new_review)

        db.session.commit()
        return jsonify({"message": "Reviews submitted successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#---------------GET REVIEW-----------------------------------------------------------------------------------------------------
@api.route('/room/<int:room_id>/reviews', methods=['GET'])
@jwt_required()
def get_room_reviews(room_id):
    try:
        current_user_id = get_jwt_identity()
        room = Room.query.get(room_id)
        if not room:
            return jsonify({"error": "Room not found"}), 404

        # Verificar si el usuario es participante del room o admin
        participation = Room_participant.query.filter_by(room_id=room_id, user_id=current_user_id).first()
        if not participation and not User.query.get(current_user_id).admin:
            return jsonify({"error": "Unauthorized"}), 403

        reviews = Review.query.filter_by(room_id=room_id).all()
        serialized_reviews = [review.serialize() for review in reviews]
        return jsonify({"reviews": serialized_reviews}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
#---------------Put Kick or Abandon participant-----------------------------------------------------------------------------------------------------
@api.route('/room/<int:room_id>/update_participant_status', methods=['PUT'])
@jwt_required()
def update_participant_status(room_id):
    try:
        current_user_id = get_jwt_identity()
        room = Room.query.get(room_id)
        if not room:
            return jsonify({"error": "Room not found"}), 404

        participant_id = request.json.get('participant_id')
        status = request.json.get('status')
        if not participant_id or not status:
            return jsonify({"error": "Missing participant_id or status"}), 400

        room_request = Room_request.query.filter_by(room_id=room_id, user_id=participant_id).first()
        if not room_request:
            return jsonify({"error": "Room request not found"}), 404

        # Verificar permisos
        if status == 'kicked' and room.user_id != current_user_id:
            return jsonify({"error": "Unauthorized. Only the host can kick participants."}), 403
        if status == 'abandoned' and current_user_id != participant_id:
            return jsonify({"error": "Unauthorized. Only the participant can abandon the room."}), 403

        room_request.status = status

        room_participant = Room_participant.query.filter_by(room_id=room_id, user_id=participant_id).first()
        if room_participant and status in ['kicked', 'abandoned']:
            db.session.delete(room_participant)
        
        db.session.commit()

        return jsonify({"message": f"Participant status updated to {status} successfully"}), 200

    except Exception as e:
        print(f"Exception: {str(e)}")
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        print(f"Exception: {str(e)}")
        return jsonify({"error": str(e)}), 500

