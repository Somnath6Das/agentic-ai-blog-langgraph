from fastapi import FastAPI
from dotenv import load_dotenv
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from src.routes import auth, profile, public, blogs
from src.database.database import engine
import src.database.user.models as models

load_dotenv() 

# Create user table on server startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)


#? Serves html file saved in blog_files at http://<host>/blog_files/<filename>
app.mount("/blog_files", StaticFiles(directory="blog_files"), name="blog_files")
app.include_router(blogs.router)

# Serves image file saved in UPLOAD_DIR at http://<host>/uploads/<filename>
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.include_router(profile.router)

app.include_router(public.router)

@app.get("/")
def read_root():
    return {"message": "Server running"}


if __name__ == "__main__":
    uvicorn.run("main:app",host="0.0.0.0", port=8000, reload=True)
