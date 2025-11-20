from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers.auth_controller import router as auth_router
from app.controllers.recruiter_controller import router as recruiter_router
from app.controllers.jobseeker_controller import router as jobseeker_router
from app.controllers.job_controller import router as job_router
from app.controllers.application_controller import router as application_router

from app.utils.response import api_response

app = FastAPI(title="MatchWise", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(job_router)
app.include_router(auth_router)
app.include_router(recruiter_router)
app.include_router(jobseeker_router)
app.include_router(application_router)

@app.get("/")
async def root():
    return api_response(200, "MatchWise API is running")


@app.get("/health")
async def health_check():
    return api_response(200, "healthy")
