import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [review, setReview] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState({
    total: 0,
    fake: 0,
    original: 0,
    recent: [],
  });
  const [category, setCategory] = useState('Electronics');
  const [rating, setRating] = useState(5);
  const [activeTab, setActiveTab] = useState('analyzer');
  const [isTyping, setIsTyping] = useState(false);

  const categories = ['Electronics', 'Books', 'Clothing', 'Home', 'Beauty', 'Sports', 'Other'];

  useEffect(() => {
    if (review.length > 0 && !isTyping) {
      setIsTyping(true);
    }
  }, [review]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setIsTyping(false);

    try {
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data);
        
        // Update dashboard
        setDashboard(prev => {
          const isFake = data.prediction !== 'Original';
          const newRecent = [{
            review: review.length > 50 ? review.substring(0, 50) + '...' : review,
            prediction: data.prediction,
            probabilities: data.probabilities,
            category,
            rating,
            time: new Date().toLocaleTimeString()
          }, ...prev.recent].slice(0, 5);
          
          return {
            total: prev.total + 1,
            fake: prev.fake + (isFake ? 1 : 0),
            original: prev.original + (!isFake ? 1 : 0),
            recent: newRecent
          };
        });
      } else {
        setError(data.error || 'Error occurred');
      }
    } catch (err) {
      setError('Network error - make sure backend is running');
    }
    setLoading(false);
  };

  return (
    <div className="netflix-container">
      {/* Netflix-style Header */}
      <header className="netflix-header">
        <div className="header-content">
          <h1 className="logo">
            <span className="logo-red">Fake</span>
            <span className="logo-white">Review</span>
            <span className="logo-red">Detector</span>
          </h1>
          <nav className="nav-tabs">
            <button 
              className={`tab ${activeTab === 'analyzer' ? 'active' : ''}`}
              onClick={() => setActiveTab('analyzer')}
            >
              Review Analyzer
            </button>
            <button 
              className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'analyzer' ? (
          <div className="analyzer-container">
            {/* Hero Section */}
            <div className="hero-section">
              <div className="hero-content">
                <h2 className="hero-title">
                  Detect AI-Generated Reviews
                  <span className="title-gradient"> Instantly</span>
                </h2>
                <p className="hero-subtitle">
                  Advanced machine learning technology to identify computer-generated reviews and protect consumers
                </p>
              </div>
            </div>

            {/* Analysis Card */}
            <div className="analysis-card">
              <div className="card-header">
                <h3>Review Analysis</h3>
                <div className="pulse-dot"></div>
              </div>
              
              <form onSubmit={handleSubmit} className="analysis-form">
                <div className="input-group">
                  <label className="input-label">Review Text</label>
                  <div className="textarea-container">
                    <textarea
                      value={review}
                      onChange={e => {
                        setReview(e.target.value);
                        setIsTyping(true);
                      }}
                      onBlur={() => setIsTyping(false)}
                      rows={6}
                      className="review-textarea"
                      placeholder="Paste or type the review you want to analyze..."
                      required
                    />
                    {isTyping && <div className="typing-indicator"></div>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label">Category</label>
                    <select 
                      value={category} 
                      onChange={e => setCategory(e.target.value)}
                      className="category-select"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Rating</label>
                    <div className="rating-input">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`star ${rating >= star ? 'active' : ''}`}
                          onClick={() => setRating(star)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !review.trim()}
                  className={`analyze-button ${loading ? 'loading' : ''}`}
                >
                  {loading ? (
                    <>
                      <div className="button-loader"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <span className="button-icon">🔍</span>
                      Analyze Review
                    </>
                  )}
                </button>
              </form>

              {/* Result Display */}
              {result && (
                <div className={`result-display ${result.prediction === 'Original' ? 'original' : 'fake'}`}>
                  <div className="result-icon">
                    {result.prediction === 'Original' ? '✅' : '⚠️'}
                  </div>
                  <div className="result-content">
                    <h4 className="result-title">
                      {result.prediction === 'Original' ? 'Authentic Review' : 'AI-Generated Review'}
                    </h4>
                    <p className="result-description">
                      {result.prediction === 'Original' 
                        ? 'This review appears to be written by a human.' 
                        : 'This review shows signs of being computer-generated.'}
                    </p>
                    {result.probabilities && (
                      <div className="probability-meter">
                        <div className="probability-labels">
                          <span>AI Generated: {(result.probabilities[0] * 100).toFixed(1)}%</span>
                          <span>Human Written: {(result.probabilities[1] * 100).toFixed(1)}%</span>
                        </div>
                        <div className="probability-bar">
                          <div 
                            className="probability-fill fake"
                            style={{ width: `${result.probabilities[0] * 100}%` }}
                          ></div>
                          <div 
                            className="probability-fill original"
                            style={{ width: `${result.probabilities[1] * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="error-message">
                  <span className="error-icon">❌</span>
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="dashboard-container">
            <h2 className="dashboard-title">Analytics Dashboard</h2>
            
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>Total Reviews</h3>
                  <div className="stat-number">{dashboard.total}</div>
                </div>
              </div>
              
              <div className="stat-card fake">
                <div className="stat-icon">🤖</div>
                <div className="stat-content">
                  <h3>AI Generated</h3>
                  <div className="stat-number">{dashboard.fake}</div>
                </div>
              </div>
              
              <div className="stat-card original">
                <div className="stat-icon">👤</div>
                <div className="stat-content">
                  <h3>Human Written</h3>
                  <div className="stat-number">{dashboard.original}</div>
                </div>
              </div>
              
              <div className="stat-card accuracy">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <h3>AI Detection Rate</h3>
                  <div className="stat-number">
                    {dashboard.total > 0 ? ((dashboard.fake / dashboard.total) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="recent-section">
              <h3>Recent Analysis</h3>
              <div className="recent-grid">
                {dashboard.recent.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <p>No reviews analyzed yet</p>
                  </div>
                ) : (
                  dashboard.recent.map((item, index) => (
                    <div key={index} className="recent-card">
                      <div className="recent-header">
                        <span className="review-category">{item.category}</span>
                        <div className="review-rating">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className={`star ${i < item.rating ? 'active' : ''}`}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="review-preview">{item.review}</p>
                      <div className="recent-footer">
                        <span className={`prediction-tag ${item.prediction === 'Original' ? 'original' : 'fake'}`}>
                          {item.prediction}
                        </span>
                        <span className="review-time">{item.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;