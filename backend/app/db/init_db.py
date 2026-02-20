from app.db.session import Base, engine
from app.models import *

# Create all tables in the database
def init_db():
    Base.metadata.create_all(bind=engine)
