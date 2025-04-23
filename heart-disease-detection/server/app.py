from flask import Flask, request, jsonify, send_from_directory
import os
import json
import cv2
import numpy as np
from segmentation import load_json_and_image, draw_segmentation  # Code 01
from prediction import predict_single_image, load_model  # Code 02
from PIL import Image
import torch
from flask_cors import CORS  # Added CORS for cross-origin requests
import logging
from google.cloud import storage
from google.api_core import exceptions
from google.oauth2 import service_account
from dotenv import load_dotenv
import base64

# Set up logging for easier debugging
logging.basicConfig(level=logging.INFO)

# Load environment variables from the server folder
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# GCP Bucket Configuration
BUCKET_NAME = "fetal-heart-images-dataset-2025"
try:
    if os.getenv("USE_ENV_CREDENTIALS", "false").lower() == "true":
        credentials_json = base64.b64decode(os.getenv("GOOGLE_CREDENTIALS_BASE64")).decode('utf-8')
        credentials_dict = json.loads(credentials_json)
        credentials = service_account.Credentials.from_service_account_info(credentials_dict)
        client = storage.Client(credentials=credentials)
    else:
        client = storage.Client()
    
    bucket = client.get_bucket(BUCKET_NAME)
    logging.info(f"Successfully connected to bucket: {BUCKET_NAME}")
except exceptions.Forbidden:
    logging.error(f"Permission denied for bucket {BUCKET_NAME}. Check service account roles.")
    raise
except exceptions.NotFound:
    logging.error(f"Bucket {BUCKET_NAME} not found.")
    raise

# Use relative paths
MODEL_PATH = "model_path.pth"  # Relative to server directory
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
try:
    logging.info(f"Loading model from: {os.path.abspath(MODEL_PATH)}")
    model = load_model(MODEL_PATH, num_classes=10, device=device)
    logging.info("Model loaded successfully")
except Exception as e:
    logging.error(f"Failed to load model: {str(e)}")
    raise

# Directory for file uploads, relative to server directory
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
logging.info(f"Upload folder: {os.path.abspath(UPLOAD_FOLDER)}")

# Function to load an image from GCP bucket
def load_image_from_bucket(blob_name):
    try:
        blob = bucket.blob(blob_name)
        image_data = blob.download_as_bytes()
        image = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)
        if image is None:
            logging.error(f"Failed to decode image from {blob_name}")
            return None
        return image
    except exceptions.NotFound:
        logging.error(f"Blob {blob_name} not found in bucket")
        return None
    except Exception as e:
        logging.error(f"Error loading image from bucket: {str(e)}")
        return None

# Function to list all images in the train prefix
def list_train_images():
    try:
        blobs = list(bucket.list_blobs(prefix='train/'))
        return [blob.name for blob in blobs if blob.name.endswith(('.jpg', '.png', '.jpeg'))]
    except Exception as e:
        logging.error(f"Error listing images: {str(e)}")
        return []

# Route for uploading image and JSON files
@app.route('/upload', methods=['POST'])
def upload_files():
    try:
        logging.info("Received upload request")
        if 'image' not in request.files or 'json' not in request.files:
            logging.error("Missing image or JSON file in request")
            return jsonify({'error': 'No image or JSON file part in the request'}), 400
        
        image_file = request.files['image']
        json_file = request.files['json']
        logging.info(f"Files received: Image - {image_file.filename}, JSON - {json_file.filename}")

        image_path = os.path.join(UPLOAD_FOLDER, image_file.filename)
        json_path = os.path.join(UPLOAD_FOLDER, json_file.filename)
        logging.info(f"Saving files to: {os.path.abspath(image_path)}, {os.path.abspath(json_path)}")
        image_file.save(image_path)
        json_file.save(json_path)
        logging.info("Files saved successfully")

        logging.info("Loading JSON and image")
        data, image = load_json_and_image(json_path, image_path)
        if data is None or image is None:
            logging.error("Failed to load JSON or image")
            return jsonify({"error": "Failed to load files"}), 400
        logging.info("JSON and image loaded successfully")

        logging.info("Starting segmentation")
        segmented_image = draw_segmentation(data, image)
        if segmented_image is None:
            logging.error("Segmentation failed")
            return jsonify({"error": "Segmentation failed"}), 500
        logging.info("Segmentation completed")

        segmented_image_path = os.path.join(UPLOAD_FOLDER, 'segmented_output.jpg')
        logging.info(f"Saving segmented image to: {os.path.abspath(segmented_image_path)}")
        cv2.imwrite(segmented_image_path, segmented_image)
        logging.info("Segmented image saved")

        logging.info("Starting prediction")
        predictions = predict_single_image(segmented_image_path, model, ["3VT", "ARSA", "AVSD", "Dilated Cardiac Sinus", "ECIF", "HLHS", "LVOT", "Normal Heart", "TGA", "VSD"], device)
        if predictions is None:
            logging.error("Prediction failed")
            return jsonify({"error": "Prediction failed"}), 500
        logging.info(f"Prediction completed: {predictions}")

        return jsonify({
            "predictions": predictions,
            "annotations": data["shapes"],
            "segmented_image": f'/images/segmented_output.jpg'
        })

    except Exception as e:
        logging.error(f"Error in upload route: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Route to serve the segmented image
@app.route('/images/<filename>')
def serve_image(filename):
    logging.info(f"Serving image: {os.path.join(UPLOAD_FOLDER, filename)}")
    return send_from_directory(UPLOAD_FOLDER, filename)

# Serving the frontend files from 'dist' folder
frontend_folder = os.path.join(os.path.dirname(__file__), "..", "client")
dist_folder = os.path.join(frontend_folder, "dist")
logging.info(f"Frontend dist folder: {os.path.abspath(dist_folder)}")

@app.route("/", defaults={"filename": ""})
@app.route("/<path:filename>")
def index(filename):
    if not filename:
        filename = "index.html"
    logging.info(f"Serving frontend file: {os.path.join(dist_folder, filename)}")
    return send_from_directory(dist_folder, filename)

# Example route to fetch a sample image from bucket for testing
@app.route('/sample-image/<path:blob_name>')
def get_sample_image(blob_name):
    try:
        image = load_image_from_bucket(f"train/{blob_name}")
        if image is None:
            return jsonify({"error": "Image not found in bucket"}), 404
        
        temp_path = os.path.join(UPLOAD_FOLDER, blob_name)
        cv2.imwrite(temp_path, image)
        return send_from_directory(UPLOAD_FOLDER, blob_name)
    except Exception as e:
        logging.error(f"Error fetching sample image: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Optional route to list all train images
@app.route('/list-images')
def list_images():
    images = list_train_images()
    return jsonify({"images": images})

# Main entry point
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)