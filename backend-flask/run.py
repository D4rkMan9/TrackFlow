from dotenv import load_dotenv

load_dotenv()

from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(
        debug=app.config["FLASK_ENV"] == "development",
        port=app.config["FLASK_PORT"],
    )
