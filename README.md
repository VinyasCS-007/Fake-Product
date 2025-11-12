
# FakeReview Detector

A modern, AI-powered web application for detecting fake reviews using machine learning. Built with React (frontend) and Flask (backend).

## Features
- Real-time dashboard: total reviews, fake reviews, original reviews
- Product category and rating selection
- Recent analyzed reviews table
- Animated, professional UI
- Custom loading screen

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js & npm

### Backend Setup (Flask)
1. Navigate to the `backend` folder:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   pip install flask flask-cors joblib numpy
   ```
3. Ensure `model.pkl` and `tfidf_vectorizer.pkl` are present in `src/`.
4. Start the backend:
   ```
   python app.py
   ```
   The API runs at `http://localhost:5000`.

### Frontend Setup (React)
1. Navigate to the `frontend` folder:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the frontend:
   ```
   npm start
   ```
   The app runs at `http://localhost:3000`.

## Usage
- Enter a review, select product category and rating, then click "Analyze Review".
- View prediction, probabilities, and dashboard stats.

## Project Structure
```
fake-product-review/
├── Artifacts/
│   └── pipeline_model.joblib
├── Assets/
│   ├── frequency_bigramdictionary_en_243_342.txt
│   └── frequency_dictionary_en_82_765.txt
├── backend/
│   └── app.py
├── Data/
│   ├── Feature-Engineered/
│   │   ├── preprocessed_lemmatization_features.csv
│   │   ├── preprocessed_no_stopwords_features.csv
│   │   ├── preprocessed_no_stopwords_no_lemmatization_features.csv
│   │   ├── preprocessed_stemming_features.csv
│   │   └── preprocessed_stemming_no_stopwords_features.csv
│   ├── Pre-processed/
│   │   ├── encoded_dataset.csv
│   │   ├── exploration.csv
│   │   ├── preprocessed_lemmatization.csv
│   │   ├── preprocessed_no_stopwords.csv
│   │   ├── preprocessed_no_stopwords_no_lemmatization.csv
│   │   ├── preprocessed_stemming.csv
│   │   ├── preprocessed_stemming_no_stopwords.csv
│   │   └── translated_output.csv
│   └── Raw/
│       └── fakeReviewData.csv
├── frontend/
│   ├── App.js
│   ├── index.html
│   ├── index.js
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.css
│       ├── App.js
│       └── index.js
├── Notebooks/
│   ├── N0_exploration.ipynb
│   ├── N1_Pre_processing.ipynb
│   ├── N2_Feature_engineering.ipynb
│   ├── N3_EDA.ipynb
│   ├── N4_Embeddings.ipynb
│   ├── N5_Modal_dev.ipynb
│   ├── N6_pipeline.ipynb
│   ├── progress_log.csv
│   └── mlruns/
│       ├── 0/
│       │   └── meta.yaml
│       └── 391638039569745943/
│           └── meta.yaml
├── public/
│   └── index.html
├── Reports/
├── src/
│   ├── app.py
│   └── temp.py
├── dockerfile
├── LICENSE
├── README.md
├── requirements.txt
```

## License
MIT

---

## Data Collection & Preprocessing

Our data consists of review texts along with corresponding labels indicating whether a review is computer-generated or original. The preprocessing pipeline includes:

- **Text Cleaning:** Removing unwanted characters, punctuation, and noise.
- **Normalization:** Converting text to lower case, tokenizing sentences and words, and applying techniques such as stemming, lemmatization, and stop word removal.
- **Feature Extraction:** Calculating metrics like lexical diversity, average word length, sentiment polarity, subjectivity, Flesch Reading Ease, sentence length, and various part-of-speech counts.

Processed data files are stored in our `../Data/Feature-Engineered/` folder.

---

## Feature Engineering & Embeddings

To capture the nuances of textual data, we explored several embedding techniques:

- **TF-IDF Embeddings:** Transforming text into weighted term-frequency representations.
- **Count Vectorization:** Creating basic term-frequency vectors.
- **Precomputed Embeddings:** Using models such as BERT and GloVe to generate embeddings, which are stored as CSV files in the `../../embeddings/` folder.

These methods provide diverse representations of the data, enabling our models to learn both syntactic and semantic patterns.

You can view all our datasets created throught out the process here:  
[Drive link for all the datasets used](https://drive.google.com/file/d/1DNBx44dBOd0kvqR-lWxq74RI5_hsP6pN/view?usp=drive_link)

---

## Modeling Approaches

### Traditional Machine Learning Models

We experimented with several scikit-learn models:

- **Logistic Regression**
- **Random Forest Classifier**
- **Support Vector Classifier (SVC)**

For each model, we performed hyperparameter tuning using GridSearchCV with feasible parameter grids. Experiment results, including confusion matrices and metrics (accuracy, precision, recall, F1 score), are logged in MLflow.

### Deep Learning Models

To capture complex patterns, we built a deep learning model using TensorFlow Keras:

- **Two-Layer LSTM:** The model includes an embedding layer, two LSTM layers, and dense layers with dropout for regularization.
- **Text Tokenization & Padding:** We convert raw text into sequences using Keras’ Tokenizer and pad them to a uniform length.
- **Evaluation:** Model performance is evaluated on standard metrics and confusion matrices are logged.

---

## Experiment Tracking with MLflow

Our experiments are fully tracked using MLflow. For every run, we log:

- **Parameters:** File names, model types, hyperparameters, and embedding types.
- **Metrics:** Accuracy, precision, recall, and F1 score.
- **Artifacts:** Confusion matrices (as PNG images) and model artifacts.
- **Datasets:** Using the `mlflow.data` API, our dataset information is logged and appears under the MLflow UI's "Datasets" tab (for MLflow ≥ 2.4). When unavailable, the CSV files are logged as artifacts.

You can view all our experiments on Dagshub through MLflow here:  
[View MLflow Experiments on Dagshub](https://dagshub.com/malhar.c.prajapati/my-first-repo.mlflow/)

A progress log (`progress_log.csv`) is maintained to ensure experiments are not re-run unnecessarily.

---

## Deployment

The Fake Review Detection web application is deployed and accessible online. Users can enter review text to receive predictions on whether the review is computer-generated or original. The application also provides various text analytics and visualizations for better interpretability.

**Access the deployed web app here:**  
[Fake Review Detection Web App](https://fake-review-detection-mkgwujmh2b6dzcgb6gka2r.streamlit.app/)

---

## Docker Image

We provide a Docker image for easy deployment of the project. The image includes all necessary code and dependencies.

**To download and run the Docker image:**

1. **Pull the Docker Image:**  
   ```bash
   docker pull malhar2460/fake_review_detection:latest

2. **Run the Docker Container:**
   ```bash
   docker run -p 8501:8501 malhar2460/fake_review_detection:latest

Your application will then be accessible at http://localhost:8501.

For more details, refer to our Docker Hub repository:
Docker Hub: [malhar2460/fake_review_detection](https://hub.docker.com/repository/docker/malhar2460/fake_review_detection/general)

## Conclusion

Our project integrates advanced NLP techniques, comprehensive feature engineering, rigorous experimentation, and robust MLflow-based tracking to build a reproducible system for fake review detection. This documentation provides an end-to-end overview of our process, from data preprocessing and model training to deployment. We encourage you to explore the code repository and MLflow experiment dashboard for more details.

*Thank you for your interest in our project!*
