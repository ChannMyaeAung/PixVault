from dotenv import load_dotenv
from imagekitio import ImageKit 
import os 


load_dotenv()

IMAGEKIT_PRIVATE_KEY = os.getenv("IMAGEKIT_PRIVATE_KEY", "")
IMAGEKIT_PUBLIC_KEY = os.getenv("IMAGEKIT_PUBLIC_KEY", "")
IMAGEKIT_URL = os.getenv("IMAGEKIT_URL", "")

# Current SDK version in this project accepts private_key only.
imagekit = ImageKit(private_key=IMAGEKIT_PRIVATE_KEY)
