import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.app:app", host="0.0.0.0", port=8000, reload=True) # inside app folder app(app.py) then run app variable inside app.py so app.app:app
