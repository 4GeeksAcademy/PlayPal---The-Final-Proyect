# import sys
# sys.path.append('/workspaces/PlayPal---The-Final-Proyect/src')  # Ajusta esto a la ubicación de tu carpeta src
# from app import app
# from api.models import db, Room
# import logging
# from datetime import datetime

# from apscheduler.schedulers.background import BackgroundScheduler

# logging.basicConfig(level=logging.INFO, filename='room_expiration_log.log', filemode='a',
#                     format='%(asctime)s - %(levelname)s - %(message)s')

# def check_rooms_expiration(app):
#     with app.app_context():
#         rooms = Room.query.filter(Room.is_deleted == False).all()
#         logging.info(f"Checking expiration for {len(rooms)} rooms.")
#         for room in rooms:
#             if room.end_time and datetime.strptime(room.end_time, '%Y-%m-%d %H:%M') < datetime.now():
#                 logging.info(f"Expiring room {room.id} scheduled to end at {room.end_time}.")
#                 room.is_deleted = True
#                 db.session.commit()
#             else:
#                 logging.info(f"Room {room.id} is not expired yet; scheduled to end at {room.end_time}.")

# def setup_scheduler(app):
#     scheduler = BackgroundScheduler()
#     scheduler.add_job(lambda: check_rooms_expiration(app), 'interval', minutes=1)
#     scheduler.start()
#     print("Scheduler started...")

# if __name__ == "__main__":
#     check_rooms_expiration()
