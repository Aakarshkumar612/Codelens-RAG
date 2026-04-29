from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    REPOS_DIR: str = "./repos"
    CHROMA_DIR: str = "./chroma_db"
    EMBED_MODEL: str = "all-MiniLM-L6-v2"
    LINES_PER_CHUNK: int = 50
    CHUNK_OVERLAP: int = 10
    RETRIEVAL_K: int = 8
    MAX_FILE_KB: int = 512
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
