import os
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Load model and vectorizer
try:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, 'model.pkl')
    vectorizer_path = os.path.join(base_dir, 'tfidf_vectorizer.pkl')
    
    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)
    logger.info("Model and vectorizer loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {e}")
    model = None
    vectorizer = None

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy' if model and vectorizer else 'unhealthy',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/hello')
def hello():
    return jsonify({
        'message': 'Hello from Fake Review Detection API!',
        'version': '1.0.0'
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None or vectorizer is None:
        return jsonify({'error': 'Model not loaded properly'}), 500
        
    data = request.get_json()
    review_text = data.get('review', '').strip()
    
    if not review_text:
        return jsonify({'error': 'No review text provided.'}), 400
    
    if len(review_text) < 10:
        return jsonify({'error': 'Review text too short. Minimum 10 characters required.'}), 400
    
    try:
        # Transform text
        x_text = vectorizer.transform([review_text])
        dummy = np.zeros((1, 11))
        feats = np.hstack((x_text.toarray(), dummy))
        
        # Get prediction and probabilities
        probabilities = model.predict_proba(feats)[0]
        prediction = 1 if probabilities[1] >= 0.5 else 0
        
        result = 'Original' if prediction == 1 else 'Computer generated'
        
        logger.info(f"Prediction: {result}, Probabilities: {probabilities}")
        
        return jsonify({
        'prediction': result,
        'probabilities': probabilities.tolist(),
        'confidence': float(max(probabilities)),
        'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': 'Prediction failed'}), 500

@app.route('/api/batch_predict', methods=['POST'])
def batch_predict():
    if model is None or vectorizer is None:
        return jsonify({'error': 'Model not loaded properly'}), 500
        
    data = request.get_json()
    reviews = data.get('reviews', [])
    
    if not reviews:
        return jsonify({'error': 'No reviews provided.'}), 400
    
    results = []
    for review in reviews:
        try:
            x_text = vectorizer.transform([review])
            dummy = np.zeros((1, 11))
            feats = np.hstack((x_text.toarray(), dummy))
            
            probabilities = model.predict_proba(feats)[0]
            prediction = 1 if probabilities[1] >= 0.5 else 0
            result = 'Original' if prediction == 1 else 'Computer generated'
            
            results.append({
                'review': review,
                'prediction': result,
                'probabilities': probabilities.tolist(),
                'confidence': float(max(probabilities))
            })
        except Exception as e:
            results.append({
                'review': review,
                'error': str(e)
            })
    
    return jsonify({
        'results': results,
        'total_processed': len(results),
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)