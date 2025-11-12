import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [review, setReview] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('Electronics');
  const [rating, setRating] = useState(5);
  const [activeTab, setActiveTab] = useState('analyzer');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [deviceId, setDeviceId] = useState('');
  const [temporalStats, setTemporalStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const categories = ['Electronics', 'Books', 'Clothing', 'Home', 'Beauty', 'Sports', 'Other'];

  const quickExamples = [
    {
      text: "This product is absolutely amazing! It exceeded all my expectations and works perfectly. Highly recommended!",
      type: "suspicious"
    },
    {
      text: "Good product. Works as described. Fast shipping. Satisfied with purchase. Would buy again.",
      type: "ai-generated"
    },
    {
      text: "The quality is exceptional and the customer service was outstanding. Definitely worth every penny!",
      type: "human"
    },
    {
      text: "Item arrived quickly. Packaging was good. Product meets expectations. Good value for money.",
      type: "suspicious"
    }
  ];

  // Initialize device ID and load analytics
  useEffect(() => {
    initializeDevice();
    loadAnalytics();
    loadAnalysisHistory();
    
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const initializeDevice = async () => {
    try {
      let savedDeviceId = localStorage.getItem('deviceId');
      if (!savedDeviceId) {
        savedDeviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('deviceId', savedDeviceId);
      }
      setDeviceId(savedDeviceId);
      await loadDeviceStats(savedDeviceId);
    } catch (error) {
      console.error('Device initialization failed:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Enhanced mock analytics data
      const mockAnalytics = {
        total_reviews: 1567,
        unique_devices: 589,
        reviews_today: 67,
        accuracy_rate: 96.8,
        daily_stats: {
          '2024-01-15': 34,
          '2024-01-16': 45,
          '2024-01-17': 56,
          '2024-01-18': 39,
          '2024-01-19': 48,
          '2024-01-20': 63,
          '2024-01-21': 52
        },
        weekly_stats: {
          '2024-02': 289,
          '2024-03': 345,
          '2024-04': 398,
          '2024-05': 421
        },
        most_active_device: {
          device_id: 'device-abc123xyz',
          review_count: 89,
          last_active: '2 hours ago'
        },
        hourly_distribution: Array.from({length: 24}, (_, i) => 
          Math.floor(Math.random() * 80) + 20
        ),
        daily_distribution: {
          'Monday': 156, 'Tuesday': 178, 'Wednesday': 145, 
          'Thursday': 167, 'Friday': 198, 'Saturday': 134, 'Sunday': 121
        },
        detection_stats: {
          ai_detected: 523,
          human_confirmed: 987,
          suspicious: 57
        }
      };
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const loadDeviceStats = async (deviceId) => {
    try {
      const mockStats = {
        device_id: deviceId,
        total_reviews: Math.floor(Math.random() * 20) + 5,
        first_seen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        last_seen: new Date().toISOString(),
        trust_score: Math.floor(Math.random() * 30) + 70,
        posting_patterns: {
          avg_reviews_per_day: (Math.random() * 2 + 0.5).toFixed(1),
          peak_hours: [14, 19, 21],
          common_categories: ['Electronics', 'Books', 'Home']
        }
      };
      setTemporalStats(mockStats);
    } catch (error) {
      console.error('Failed to load device stats:', error);
    }
  };

  const loadAnalysisHistory = () => {
    const savedHistory = localStorage.getItem('analysisHistory');
    if (savedHistory) {
      setAnalysisHistory(JSON.parse(savedHistory));
    }
  };

  const saveAnalysisHistory = (history) => {
    localStorage.setItem('analysisHistory', JSON.stringify(history));
  };

  const handleReviewChange = useCallback((text) => {
    setReview(text);
    setIsTyping(true);
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    setTypingTimeout(timeout);
  }, [typingTimeout]);

  const analyzeReview = async (reviewText) => {
    // Enhanced mock analysis with more realistic data
    const wordCount = reviewText.split(/\s+/).length;
    const charCount = reviewText.length;
    const hasPersonalDetails = /I |my |me |personally/i.test(reviewText);
    const repetitionScore = calculateRepetitionScore(reviewText);
    
    // More sophisticated mock analysis
    let aiProbability = 0.3; // Base probability
    
    // Factors that increase AI probability
    if (wordCount < 15) aiProbability += 0.2;
    if (repetitionScore > 0.3) aiProbability += 0.25;
    if (!hasPersonalDetails) aiProbability += 0.15;
    if (reviewText.includes('fast shipping') || reviewText.includes('would buy again')) aiProbability += 0.1;
    
    aiProbability = Math.min(aiProbability, 0.95); // Cap at 95%
    
    const prediction = aiProbability > 0.6 ? 'AI Generated' : 'Human Written';
    const confidence = Math.max(aiProbability, 1 - aiProbability);
    
    return {
      prediction,
      confidence,
      probabilities: [aiProbability, 1 - aiProbability],
      analysis: {
        word_count: wordCount,
        repetition_score: repetitionScore,
        has_personal_pronouns: hasPersonalDetails,
        sentiment: aiProbability > 0.6 ? 'generic_positive' : 'authentic_positive'
      },
      temporal_analysis: {
        reviews_today: Math.floor(Math.random() * 15) + 5,
        reviews_this_week: Math.floor(Math.random() * 100) + 50,
        reviews_this_month: Math.floor(Math.random() * 400) + 200,
        posting_hour: new Date().getHours(),
        device_trust_score: temporalStats?.trust_score || 75
      }
    };
  };

  const calculateRepetitionScore = (text) => {
    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    return 1 - (uniqueWords.size / words.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!review.trim() || loading || review.length < 10) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setIsTyping(false);

    try {
      const data = await analyzeReview(review);
      setResult(data);
      
      // Update analytics
      await loadAnalytics();

      // Add to history
      const newAnalysis = {
        id: Date.now(),
        review: review.length > 100 ? review.substring(0, 100) + '...' : review,
        prediction: data.prediction,
        confidence: Math.round(data.confidence * 100),
        category,
        rating,
        timestamp: new Date().toISOString(),
        analysis: data.analysis
      };
      
      const updatedHistory = [newAnalysis, ...analysisHistory.slice(0, 9)];
      setAnalysisHistory(updatedHistory);
      saveAnalysisHistory(updatedHistory);

    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (example) => {
    setReview(example.text);
    handleReviewChange(example.text);
  };

  const clearAnalysis = () => {
    setReview('');
    setResult(null);
    setError(null);
    setIsTyping(false);
  };

  return (
    <div className="netflix-app">
      {/* Navigation Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">
            <span className="logo-red">AI</span>Detect
          </h2>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'analyzer' ? 'active' : ''}`}
            onClick={() => { setActiveTab('analyzer'); setSidebarOpen(false); }}
          >
            🕵️ Analyzer
          </button>
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => { setActiveTab('analytics'); setSidebarOpen(false); }}
          >
            📈 Analytics
          </button>
          <button 
            className={`nav-item ${activeTab === 'temporal' ? 'active' : ''}`}
            onClick={() => { setActiveTab('temporal'); setSidebarOpen(false); }}
          >
            ⏰ Patterns
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <span className="username">Analyst</span>
              <span className="user-role">Premium Member</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-container">
        {/* Top Navigation Bar */}
        <header className="top-nav">
          <div className="nav-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              ☰
            </button>
            <h1 className="nav-logo">
              <span className="logo-red">AI</span>Detect
            </h1>
          </div>
          <div className="nav-center">
            <div className="nav-tabs">
              {['analyzer', 'dashboard', 'analytics', 'temporal'].map(tab => (
                <button
                  key={tab}
                  className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'analyzer' && '🕵️ Analyzer'}
                  {tab === 'dashboard' && '📊 Dashboard'}
                  {tab === 'analytics' && '📈 Analytics'}
                  {tab === 'temporal' && '⏰ Patterns'}
                </button>
              ))}
            </div>
          </div>
          <div className="nav-right">
            <div className="nav-actions">
              <button className="nav-action-btn">🔔</button>
              <button className="nav-action-btn">⚙️</button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="content-area">
          {activeTab === 'analyzer' && (
            <AnalyzerView 
              review={review}
              loading={loading}
              error={error}
              result={result}
              category={category}
              rating={rating}
              temporalStats={temporalStats}
              deviceId={deviceId}
              quickExamples={quickExamples}
              isTyping={isTyping}
              onReviewChange={handleReviewChange}
              onCategoryChange={setCategory}
              onRatingChange={setRating}
              onSubmit={handleSubmit}
              onLoadExample={loadExample}
              onClearAnalysis={clearAnalysis}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView 
              analysisHistory={analysisHistory}
              analytics={analytics}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView analytics={analytics} />
          )}

          {activeTab === 'temporal' && (
            <TemporalView analytics={analytics} />
          )}
        </main>
      </div>

      {/* Overlay for sidebar */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
}

// Analyzer View Component
const AnalyzerView = ({ 
  review, loading, error, result, category, rating, temporalStats, deviceId,
  quickExamples, isTyping, onReviewChange, onCategoryChange, onRatingChange, 
  onSubmit, onLoadExample, onClearAnalysis 
}) => (
  <div className="analyzer-view">
    {/* Hero Section */}
    <section className="hero-banner">
      <div className="hero-content">
        <div className="hero-badge">AI-Powered Detection</div>
        <h1 className="hero-title">
          Detect
          <span className="gradient-text"> AI-Generated Reviews</span>
        </h1>
        <p className="hero-description">
          Advanced machine learning analyzes writing patterns to identify computer-generated content with 96.8% accuracy
        </p>
        
        {/* Device Info */}
        {deviceId && (
          <div className="device-info-card">
            <div className="device-header">
              <span className="device-icon">📱</span>
              <span className="device-id">Device: {deviceId.substring(0, 8)}...</span>
              {temporalStats && (
                <span className="trust-score">
                  Trust Score: {temporalStats.trust_score}%
                </span>
              )}
            </div>
            {temporalStats && (
              <div className="device-stats">
                <div className="device-stat">
                  <span className="stat-value">{temporalStats.total_reviews || 0}</span>
                  <span className="stat-label">Total Reviews</span>
                </div>
                <div className="device-stat">
                  <span className="stat-value">{temporalStats.posting_patterns?.avg_reviews_per_day || 0}</span>
                  <span className="stat-label">Avg/Day</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>

    {/* Analysis Card */}
    <section className="analysis-section">
      <div className="netflix-card">
        <div className="card-header">
          <h2 className="card-title">Review Analysis</h2>
          <div className="card-controls">
            <div className="typing-indicator">
              <div className={`pulse-dot ${isTyping ? 'typing' : ''}`}></div>
              {isTyping ? 'Typing...' : 'Ready to analyze'}
            </div>
            <button 
              className="control-btn secondary"
              onClick={onClearAnalysis}
              disabled={!review && !result}
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Quick Examples */}
        <div className="examples-section">
          <h3 className="examples-title">Quick Examples</h3>
          <div className="examples-grid">
            {quickExamples.map((example, index) => (
              <button
                key={index}
                className={`example-card ${example.type}`}
                onClick={() => onLoadExample(example)}
              >
                <span className="example-number">#{index + 1}</span>
                <span className="example-text">
                  {example.text.substring(0, 50)}...
                </span>
                <span className="example-type">{example.type}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="analysis-form">
          <div className="input-group">
            <label className="input-label">
              Review Text
              <span className="char-counter">{review.length}/5000</span>
            </label>
            <div className="textarea-container">
              <textarea
                value={review}
                onChange={e => onReviewChange(e.target.value)}
                rows={6}
                className="review-textarea"
                placeholder="Paste or type the review you want to analyze... (Minimum 10 characters)"
                maxLength={5000}
              />
              <div className="textarea-footer">
                <span className="word-count">
                  {review.split(/\s+/).filter(word => word.length > 0).length} words
                </span>
                <span className="min-chars">
                  {review.length < 10 ? `${10 - review.length} more characters needed` : 'Ready to analyze'}
                </span>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label className="input-label">Product Category</label>
              <select 
                value={category} 
                onChange={e => onCategoryChange(e.target.value)}
                className="category-select"
              >
                <option value="Electronics">📱 Electronics</option>
                <option value="Books">📚 Books</option>
                <option value="Clothing">👕 Clothing</option>
                <option value="Home">🏠 Home</option>
                <option value="Beauty">💄 Beauty</option>
                <option value="Sports">⚽ Sports</option>
                <option value="Other">📦 Other</option>
              </select>
            </div>
            
            <div className="input-group">
              <label className="input-label">User Rating</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${rating >= star ? 'active' : ''}`}
                    onClick={() => onRatingChange(star)}
                  >
                    ★
                  </button>
                ))}
                <span className="rating-text">{rating}.0</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !review.trim() || review.length < 10}
            className={`analyze-button ${loading ? 'loading' : ''} ${
              !review.trim() || review.length < 10 ? 'disabled' : ''
            }`}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
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

        {/* Enhanced Result Display */}
        {result && (
          <div className={`result-display ${result.prediction === 'Human Written' ? 'human' : 'ai'}`}>
            <div className="result-header">
              <div className="result-icon">
                {result.prediction === 'Human Written' ? '✅' : '🤖'}
              </div>
              <div className="result-title-section">
                <h3 className="result-title">
                  {result.prediction}
                </h3>
                <div className="confidence-badge">
                  {Math.round(result.confidence * 100)}% Confidence
                </div>
              </div>
            </div>
            
            <p className="result-description">
              {result.prediction === 'Human Written' 
                ? 'This review shows natural language patterns consistent with authentic human writing.' 
                : 'This review exhibits patterns commonly associated with AI-generated content.'}
            </p>
            
            <div className="probability-breakdown">
              <div className="probability-item">
                <span className="prob-label">AI Generated</span>
                <div className="prob-bar-container">
                  <div 
                    className="prob-bar ai"
                    style={{ width: `${result.probabilities[0] * 100}%` }}
                  ></div>
                </div>
                <span className="prob-value">{(result.probabilities[0] * 100).toFixed(1)}%</span>
              </div>
              <div className="probability-item">
                <span className="prob-label">Human Written</span>
                <div className="prob-bar-container">
                  <div 
                    className="prob-bar human"
                    style={{ width: `${result.probabilities[1] * 100}%` }}
                  ></div>
                </div>
                <span className="prob-value">{(result.probabilities[1] * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Analysis Details */}
            {result.analysis && (
              <div className="analysis-details">
                <h4>📊 Analysis Details</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Word Count</span>
                    <span className="detail-value">{result.analysis.word_count}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Repetition Score</span>
                    <span className="detail-value">{(result.analysis.repetition_score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Personal Pronouns</span>
                    <span className="detail-value">{result.analysis.has_personal_pronouns ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Sentiment</span>
                    <span className="detail-value">{result.analysis.sentiment.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Temporal Analysis */}
            {result.temporal_analysis && (
              <div className="temporal-analysis">
                <h4>⏰ Activity Context</h4>
                <div className="temporal-stats">
                  <div className="temporal-stat">
                    <span className="stat-label">Today's Reviews</span>
                    <span className="stat-value">{result.temporal_analysis.reviews_today}</span>
                  </div>
                  <div className="temporal-stat">
                    <span className="stat-label">This Week</span>
                    <span className="stat-value">{result.temporal_analysis.reviews_this_week}</span>
                  </div>
                  <div className="temporal-stat">
                    <span className="stat-label">Device Trust</span>
                    <span className="stat-value">{result.temporal_analysis.device_trust_score}%</span>
                  </div>
                  <div className="temporal-stat">
                    <span className="stat-label">Posting Hour</span>
                    <span className="stat-value">{result.temporal_analysis.posting_hour}:00</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <strong>Analysis Failed</strong>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  </div>
);

// Dashboard View Component
const DashboardView = ({ analysisHistory, analytics }) => (
  <div className="dashboard-view">
    <div className="dashboard-header">
      <h1 className="dashboard-title">Review Dashboard</h1>
      <p className="dashboard-subtitle">Real-time insights and analysis overview</p>
    </div>
    
    <div className="stats-grid">
      <div className="stat-card total">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <h3>Total Analyzed</h3>
          <div className="stat-number">{analytics?.total_reviews || 0}</div>
          <div className="stat-trend">+12% this week</div>
        </div>
      </div>
      
      <div className="stat-card ai">
        <div className="stat-icon">🤖</div>
        <div className="stat-content">
          <h3>AI Detected</h3>
          <div className="stat-number">{analytics?.detection_stats?.ai_detected || 0}</div>
          <div className="stat-trend">+8% this month</div>
        </div>
      </div>
      
      <div className="stat-card human">
        <div className="stat-icon">👤</div>
        <div className="stat-content">
          <h3>Human Confirmed</h3>
          <div className="stat-number">{analytics?.detection_stats?.human_confirmed || 0}</div>
          <div className="stat-trend">+15% this month</div>
        </div>
      </div>
      
      <div className="stat-card accuracy">
        <div className="stat-icon">🎯</div>
        <div className="stat-content">
          <h3>Accuracy Rate</h3>
          <div className="stat-number">{analytics?.accuracy_rate || 96.8}%</div>
          <div className="stat-trend">+2.3% improved</div>
        </div>
      </div>
    </div>

    <div className="recent-section">
      <div className="section-header">
        <h3>Recent Analysis</h3>
        <span className="section-badge">{analysisHistory.length} items</span>
      </div>
      <div className="recent-grid">
        {analysisHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h4>No reviews analyzed yet</h4>
            <p>Start analyzing reviews to see them appear here</p>
          </div>
        ) : (
          analysisHistory.map((item) => (
            <div key={item.id} className="recent-card">
              <div className="recent-header">
                <span className="review-category">{item.category}</span>
                <div className="review-meta">
                  <div className="review-rating">
                    {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                  </div>
                  <span className="review-time">
                    {new Date(item.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
              <p className="review-preview">{item.review}</p>
              <div className="recent-footer">
                <span className={`prediction-tag ${item.prediction === 'Human Written' ? 'human' : 'ai'}`}>
                  {item.prediction} ({item.confidence}%)
                </span>
                <span className="analysis-time">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

// Analytics View Component
const AnalyticsView = ({ analytics }) => (
  <div className="analytics-view">
    <div className="analytics-header">
      <h1>Advanced Analytics</h1>
      <p>Deep insights and performance metrics</p>
    </div>
    
    {analytics ? (
      <>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>📈 Review Volume</h3>
            <div className="volume-stats">
              <div className="volume-stat">
                <span className="volume-number">{analytics.total_reviews}</span>
                <span className="volume-label">Total Reviews</span>
              </div>
              <div className="volume-stat">
                <span className="volume-number">{analytics.reviews_today}</span>
                <span className="volume-label">Today</span>
              </div>
              <div className="volume-stat">
                <span className="volume-number">{analytics.unique_devices}</span>
                <span className="volume-label">Unique Devices</span>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <h3>📱 Device Activity</h3>
            {analytics.most_active_device && (
              <div className="device-activity">
                <div className="top-device">
                  <span>Most Active Device</span>
                  <strong>{analytics.most_active_device.device_id.substring(0, 12)}...</strong>
                  <span>({analytics.most_active_device.review_count} reviews)</span>
                </div>
                <div className="device-info">
                  <span>Last active: {analytics.most_active_device.last_active}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="detection-stats">
          <h3>Detection Statistics</h3>
          <div className="stats-cards">
            <div className="stat-mini-card ai">
              <span className="mini-stat-value">{analytics.detection_stats?.ai_detected || 0}</span>
              <span className="mini-stat-label">AI Detected</span>
            </div>
            <div className="stat-mini-card human">
              <span className="mini-stat-value">{analytics.detection_stats?.human_confirmed || 0}</span>
              <span className="mini-stat-label">Human Confirmed</span>
            </div>
            <div className="stat-mini-card suspicious">
              <span className="mini-stat-value">{analytics.detection_stats?.suspicious || 0}</span>
              <span className="mini-stat-label">Suspicious</span>
            </div>
          </div>
        </div>

        <div className="time-distribution">
          <h3>⏰ Time Distribution</h3>
          <div className="distribution-grid">
            <div className="distribution-card">
              <h4>Daily Stats (Last 7 days)</h4>
              <div className="stats-list">
                {Object.entries(analytics.daily_stats).slice(-7).map(([date, count]) => (
                  <div key={date} className="stat-item">
                    <span>{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span>{count} reviews</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="distribution-card">
              <h4>Weekly Overview</h4>
              <div className="stats-list">
                {Object.entries(analytics.weekly_stats).slice(-4).map(([week, count]) => (
                  <div key={week} className="stat-item">
                    <span>Week {week.split('-')[1]}</span>
                    <span>{count} reviews</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    ) : (
      <div className="loading-analytics">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    )}
  </div>
);

// Temporal Patterns View Component
const TemporalView = ({ analytics }) => (
  <div className="temporal-view">
    <div className="temporal-header">
      <h1>Temporal Patterns</h1>
      <p>Review posting patterns and activity trends</p>
    </div>
    
    <div className="patterns-grid">
      <div className="pattern-card">
        <h3>🕒 Hourly Activity</h3>
        <div className="hourly-chart">
          {Array.from({ length: 24 }, (_, hour) => {
            const count = analytics?.hourly_distribution?.[hour] || Math.floor(Math.random() * 80) + 20;
            const maxCount = Math.max(...(analytics?.hourly_distribution || Array.from({length: 24}, () => 100)));
            return (
              <div key={hour} className="hour-bar">
                <div className="hour-label">
                  {hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour-12}PM`}
                </div>
                <div className="bar-container">
                  <div 
                    className="activity-bar"
                    style={{ 
                      height: `${(count / maxCount) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="hour-count">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pattern-card">
        <h3>📅 Daily Patterns</h3>
        <div className="daily-chart">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
            const count = analytics?.daily_distribution?.[day] || Math.floor(Math.random() * 100) + 50;
            const maxCount = Math.max(...Object.values(analytics?.daily_distribution || 
              {Monday: 100, Tuesday: 90, Wednesday: 80, Thursday: 85, Friday: 95, Saturday: 70, Sunday: 65}));
            return (
              <div key={day} className="day-item">
                <span className="day-name">{day.substring(0, 3)}</span>
                <div className="day-bar">
                  <div 
                    className="day-activity"
                    style={{ 
                      width: `${(count / maxCount) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="day-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    <div className="peak-hours">
      <h3>📊 Peak Activity Hours</h3>
      <div className="peak-cards">
        <div className="peak-card">
          <span className="peak-time">2:00 PM</span>
          <span className="peak-label">Most Active</span>
        </div>
        <div className="peak-card">
          <span className="peak-time">7:00 PM</span>
          <span className="peak-label">Evening Peak</span>
        </div>
        <div className="peak-card">
          <span className="peak-time">10:00 AM</span>
          <span className="peak-label">Morning Peak</span>
        </div>
      </div>
    </div>
  </div>
);

export default App;