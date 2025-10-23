import React, { useState } from 'react';

function App() {
  const [review, setReview] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Error occurred');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 20, border: '1px solid #ddd', borderRadius: 8, fontFamily: 'Arial' }}>
      <h2>Fake Review Detection</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={review}
          onChange={e => setReview(e.target.value)}
          rows={6}
          style={{ width: '100%', marginBottom: 12 }}
          placeholder="Enter review text..."
        />
        <button type="submit" disabled={loading || !review.trim()} style={{ padding: '8px 16px' }}>
          {loading ? 'Analyzing...' : 'Check Review'}
        </button>
      </form>
      {result && (
        <div style={{ marginTop: 20 }}>
          <strong>Prediction:</strong> {result.prediction}<br />
          {result.probabilities && (
            <span>
              <strong>Probabilities:</strong> Computer Generated: {result.probabilities[0].toFixed(2)}, Original: {result.probabilities[1].toFixed(2)}
            </span>
          )}
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: 20 }}>{error}</div>}
    </div>
  );
}

export default App;
