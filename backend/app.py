import os
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime, timedelta
import uuid
import json
from collections import defaultdict, Counter

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# In-memory storage for demo (use database in production)
analytics_data = {
    'reviews': [],
    'devices': {},
    'daily_stats': defaultdict(int),
    'weekly_stats': defaultdict(int),
    'monthly_stats': defaultdict(int)
}

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

def generate_device_id():
    """Generate a unique device identifier"""
    return str(uuid.uuid4())

def get_time_buckets(timestamp):
    """Convert timestamp to daily, weekly, and monthly buckets"""
    dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    
    daily_key = dt.strftime('%Y-%m-%d')
    weekly_key = dt.strftime('%Y-%W')  # Year-Week number
    monthly_key = dt.strftime('%Y-%m')
    
    return daily_key, weekly_key, monthly_key

def calculate_temporal_features(device_id, timestamp):
    """Calculate temporal features for a device"""
    daily_key, weekly_key, monthly_key = get_time_buckets(timestamp)
    
    # Update statistics
    analytics_data['daily_stats'][daily_key] += 1
    analytics_data['weekly_stats'][weekly_key] += 1
    analytics_data['monthly_stats'][monthly_key] += 1
    
    # Calculate device-specific stats
    device_reviews = [r for r in analytics_data['reviews'] if r.get('device_id') == device_id]
    
    today_reviews = len([r for r in device_reviews if 
                        datetime.fromisoformat(r['timestamp'].replace('Z', '+00:00')).date() == 
                        datetime.fromisoformat(timestamp.replace('Z', '+00:00')).date()])
    
    week_reviews = len([r for r in device_reviews if 
                       datetime.fromisoformat(r['timestamp'].replace('Z', '+00:00')).strftime('%Y-%W') == 
                       datetime.fromisoformat(timestamp.replace('Z', '+00:00')).strftime('%Y-%W')])
    
    month_reviews = len([r for r in device_reviews if 
                        datetime.fromisoformat(r['timestamp'].replace('Z', '+00:00')).strftime('%Y-%m') == 
                        datetime.fromisoformat(timestamp.replace('Z', '+00:00')).strftime('%Y-%m')])
    
    return {
        'reviews_today': today_reviews,
        'reviews_this_week': week_reviews,
        'reviews_this_month': month_reviews,
        'posting_hour': datetime.fromisoformat(timestamp.replace('Z', '+00:00')).hour,
        'posting_day': datetime.fromisoformat(timestamp.replace('Z', '+00:00')).strftime('%A'),
        'is_weekend': datetime.fromisoformat(timestamp.replace('Z', '+00:00')).weekday() >= 5
    }

def create_dummy_features(frontend_data, temporal_features):
    """
    Create dummy features including temporal analysis
    """
    # Create base dummy features (zeros for original model compatibility)
    dummy_features = np.zeros(11)
    
    # Enhanced features for future model versions (currently not used in prediction)
    enhanced_features = [
        temporal_features['reviews_today'],
        temporal_features['reviews_this_week'],
        temporal_features['reviews_this_month'],
        temporal_features['posting_hour'],
        1 if temporal_features['is_weekend'] else 0,
        frontend_data.get('rating', 0) or 0,
        len(frontend_data.get('device_id', '')),
        hash(frontend_data.get('device_id', '')) % 100  # Device hash for anonymity
    ]
    
    logger.info(f"Enhanced features collected: {enhanced_features}")
    return dummy_features

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy' if model and vectorizer else 'unhealthy',
        'timestamp': datetime.now().isoformat(),
        'analytics_total': len(analytics_data['reviews'])
    })

@app.route('/api/device/register', methods=['POST'])
def register_device():
    """Register a new device and return device ID"""
    device_id = generate_device_id()
    analytics_data['devices'][device_id] = {
        'created_at': datetime.now().isoformat(),
        'last_seen': datetime.now().isoformat(),
        'total_reviews': 0
    }
    
    logger.info(f"New device registered: {device_id}")
    
    return jsonify({
        'device_id': device_id,
        'status': 'registered',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/analytics/summary')
def get_analytics_summary():
    """Get comprehensive analytics summary"""
    total_reviews = len(analytics_data['reviews'])
    unique_devices = len(analytics_data['devices'])
    
    # Calculate recent activity
    today = datetime.now().date()
    reviews_today = len([r for r in analytics_data['reviews'] if 
                        datetime.fromisoformat(r['timestamp'].replace('Z', '+00:00')).date() == today])
    
    # Device activity distribution
    device_activity = Counter([r.get('device_id') for r in analytics_data['reviews'] if r.get('device_id')])
    most_active_device = device_activity.most_common(1)[0] if device_activity else (None, 0)
    
    return jsonify({
        'total_reviews': total_reviews,
        'unique_devices': unique_devices,
        'reviews_today': reviews_today,
        'daily_stats': dict(analytics_data['daily_stats']),
        'weekly_stats': dict(analytics_data['weekly_stats']),
        'monthly_stats': dict(analytics_data['monthly_stats']),
        'most_active_device': {
            'device_id': most_active_device[0],
            'review_count': most_active_device[1]
        } if most_active_device[0] else None,
        'device_activity_distribution': dict(device_activity)
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None or vectorizer is None:
        return jsonify({'error': 'Model not loaded properly'}), 500
        
    data = request.get_json()
    review_text = data.get('review', '').strip()
    
    # Enhanced features
    rating = data.get('rating', None)
    category = data.get('category', '')
    device_id = data.get('device_id', '')
    user_timestamp = data.get('timestamp', datetime.now().isoformat())
    
    if not review_text:
        return jsonify({'error': 'No review text provided.'}), 400
    
    if len(review_text) < 10:
        return jsonify({'error': 'Review text too short. Minimum 10 characters required.'}), 400
    
    try:
        # Calculate temporal features
        temporal_features = calculate_temporal_features(device_id, user_timestamp)
        
        # Transform text (main model feature)
        x_text = vectorizer.transform([review_text])
        
        # Create enhanced dummy features
        dummy_features = create_dummy_features(data, temporal_features)
        dummy_features = dummy_features.reshape(1, -1)
        
        # Combine features
        feats = np.hstack((x_text.toarray(), dummy_features))
        
        # Get prediction
        probabilities = model.predict_proba(feats)[0]
        prediction = 1 if probabilities[1] >= 0.5 else 0
        result = 'Original' if prediction == 1 else 'Computer generated'
        
        # Store analytics data
        review_record = {
            'id': str(uuid.uuid4()),
            'review_preview': review_text[:100] + '...' if len(review_text) > 100 else review_text,
            'prediction': result,
            'confidence': float(max(probabilities)),
            'rating': rating,
            'category': category,
            'device_id': device_id,
            'timestamp': user_timestamp,
            'temporal_features': temporal_features,
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        analytics_data['reviews'].append(review_record)
        
        # Update device stats
        if device_id and device_id in analytics_data['devices']:
            analytics_data['devices'][device_id]['last_seen'] = datetime.now().isoformat()
            analytics_data['devices'][device_id]['total_reviews'] += 1
        
        logger.info(f"Prediction: {result}, Device: {device_id}, Temporal: {temporal_features}")
        
        return jsonify({
            'prediction': result,
            'probabilities': probabilities.tolist(),
            'confidence': float(max(probabilities)),
            'timestamp': datetime.now().isoformat(),
            'temporal_analysis': temporal_features,
            'device_analytics': {
                'device_id': device_id,
                'reviews_today': temporal_features['reviews_today'],
                'reviews_this_week': temporal_features['reviews_this_week'],
                'reviews_this_month': temporal_features['reviews_this_month']
            },
            'features_collected': {
                'review_text': True,
                'rating': rating is not None,
                'category': bool(category),
                'device_tracking': bool(device_id),
                'temporal_analysis': True
            }
        })
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': 'Prediction failed'}), 500

@app.route('/api/device/<device_id>/stats')
def get_device_stats(device_id):
    """Get statistics for a specific device"""
    if device_id not in analytics_data['devices']:
        return jsonify({'error': 'Device not found'}), 404
    
    device_reviews = [r for r in analytics_data['reviews'] if r.get('device_id') == device_id]
    
    # Calculate temporal patterns
    posting_hours = [r['temporal_features']['posting_hour'] for r in device_reviews]
    posting_days = [r['temporal_features']['posting_day'] for r in device_reviews]
    
    return jsonify({
        'device_id': device_id,
        'total_reviews': len(device_reviews),
        'first_seen': analytics_data['devices'][device_id]['created_at'],
        'last_seen': analytics_data['devices'][device_id]['last_seen'],
        'posting_patterns': {
            'common_hours': Counter(posting_hours).most_common(),
            'common_days': Counter(posting_days).most_common(),
            'avg_reviews_per_day': len(device_reviews) / max(1, len(set(
                datetime.fromisoformat(r['timestamp'].replace('Z', '+00:00')).strftime('%Y-%m-%d')
                for r in device_reviews
            )))
        },
        'recent_activity': device_reviews[-10:]  # Last 10 reviews
    })

@app.route('/api/temporal/patterns')
def get_temporal_patterns():
    """Get overall temporal patterns across all reviews"""
    if not analytics_data['reviews']:
        return jsonify({'message': 'No data available'})
    
    all_reviews = analytics_data['reviews']
    
    # Calculate patterns
    posting_hours = [r['temporal_features']['posting_hour'] for r in all_reviews]
    posting_days = [r['temporal_features']['posting_day'] for r in all_reviews]
    predictions = [r['prediction'] for r in all_reviews]
    
    # Time-based prediction rates
    hour_predictions = {}
    for hour in range(24):
        hour_reviews = [r for r in all_reviews if r['temporal_features']['posting_hour'] == hour]
        if hour_reviews:
            fake_count = len([r for r in hour_reviews if r['prediction'] == 'Computer generated'])
            hour_predictions[hour] = {
                'total_reviews': len(hour_reviews),
                'fake_percentage': (fake_count / len(hour_reviews)) * 100
            }
    
    return jsonify({
        'total_reviews': len(all_reviews),
        'hourly_distribution': Counter(posting_hours),
        'daily_distribution': Counter(posting_days),
        'prediction_by_hour': hour_predictions,
        'recent_trends': {
            'last_24_hours': len([r for r in all_reviews if 
                                 datetime.now() - datetime.fromisoformat(
                                     r['timestamp'].replace('Z', '+00:00')) < timedelta(hours=24)]),
            'last_week': len([r for r in all_reviews if 
                             datetime.now() - datetime.fromisoformat(
                                 r['timestamp'].replace('Z', '+00:00')) < timedelta(days=7)])
        }
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)