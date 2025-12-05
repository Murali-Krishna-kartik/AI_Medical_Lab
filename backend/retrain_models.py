"""
Script to retrain models with current sklearn version
"""
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report
import pickle
import os

def create_sample_diabetes_model():
    """Create a sample diabetes prediction model"""
    # Create synthetic diabetes dataset (replace with real data if available)
    np.random.seed(42)
    n_samples = 1000
    
    # Generate synthetic features similar to diabetes dataset
    pregnancies = np.random.randint(0, 18, n_samples)
    glucose = np.random.normal(120, 30, n_samples)
    blood_pressure = np.random.normal(70, 12, n_samples)
    skin_thickness = np.random.normal(20, 8, n_samples)
    insulin = np.random.normal(80, 40, n_samples)
    bmi = np.random.normal(32, 8, n_samples)
    diabetes_pedigree = np.random.uniform(0.078, 2.42, n_samples)
    age = np.random.randint(21, 81, n_samples)
    
    # Create target based on realistic diabetes risk factors
    risk_score = (
        (glucose > 140) * 0.3 +
        (bmi > 30) * 0.2 +
        (age > 45) * 0.15 +
        (pregnancies > 5) * 0.1 +
        (blood_pressure > 80) * 0.1 +
        (diabetes_pedigree > 0.5) * 0.15
    )
    
    # Add some randomness
    risk_score += np.random.normal(0, 0.1, n_samples)
    target = (risk_score > 0.5).astype(int)
    
    # Create feature matrix
    X = np.column_stack([
        pregnancies, glucose, blood_pressure, skin_thickness,
        insulin, bmi, diabetes_pedigree, age
    ])
    
    # Train model
    X_train, X_test, y_train, y_test = train_test_split(X, target, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Test accuracy
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Diabetes model accuracy: {accuracy:.3f}")
    
    return model

def create_sample_heart_model():
    """Create a sample heart disease prediction model"""
    np.random.seed(42)
    n_samples = 1000
    
    # Generate synthetic heart disease features
    age = np.random.randint(29, 78, n_samples)
    sex = np.random.randint(0, 2, n_samples)
    cp = np.random.randint(0, 4, n_samples)  # chest pain type
    trestbps = np.random.normal(130, 17, n_samples)  # resting blood pressure
    chol = np.random.normal(246, 51, n_samples)  # cholesterol
    fbs = np.random.randint(0, 2, n_samples)  # fasting blood sugar
    restecg = np.random.randint(0, 3, n_samples)  # resting ECG
    thalach = np.random.normal(150, 22, n_samples)  # max heart rate
    exang = np.random.randint(0, 2, n_samples)  # exercise induced angina
    oldpeak = np.random.uniform(0, 6.2, n_samples)  # ST depression
    slope = np.random.randint(0, 3, n_samples)
    ca = np.random.randint(0, 4, n_samples)  # number of major vessels
    thal = np.random.randint(0, 4, n_samples)
    
    # Create target based on heart disease risk factors
    risk_score = (
        (age > 55) * 0.2 +
        (sex == 1) * 0.15 +  # male
        (cp == 0) * 0.2 +  # asymptomatic chest pain
        (trestbps > 140) * 0.1 +
        (chol > 240) * 0.1 +
        (thalach < 150) * 0.1 +
        (exang == 1) * 0.15
    )
    
    risk_score += np.random.normal(0, 0.1, n_samples)
    target = (risk_score > 0.4).astype(int)
    
    X = np.column_stack([
        age, sex, cp, trestbps, chol, fbs, restecg,
        thalach, exang, oldpeak, slope, ca, thal
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, target, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Heart disease model accuracy: {accuracy:.3f}")
    
    return model

def create_sample_kidney_model():
    """Create a sample kidney disease prediction model"""
    np.random.seed(42)
    n_samples = 1000
    
    # Generate synthetic kidney disease features (simplified)
    age = np.random.randint(20, 90, n_samples)
    bp = np.random.normal(80, 15, n_samples)  # blood pressure
    sg = np.random.uniform(1.005, 1.025, n_samples)  # specific gravity
    al = np.random.randint(0, 6, n_samples)  # albumin
    su = np.random.randint(0, 6, n_samples)  # sugar
    rbc = np.random.randint(0, 2, n_samples)  # red blood cells
    pc = np.random.randint(0, 2, n_samples)  # pus cell
    
    # Create target
    risk_score = (
        (age > 60) * 0.2 +
        (bp > 90) * 0.3 +
        (al > 2) * 0.25 +
        (su > 0) * 0.15 +
        (rbc == 1) * 0.1
    )
    
    risk_score += np.random.normal(0, 0.1, n_samples)
    target = (risk_score > 0.4).astype(int)
    
    X = np.column_stack([age, bp, sg, al, su, rbc, pc])
    
    X_train, X_test, y_train, y_test = train_test_split(X, target, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Kidney disease model accuracy: {accuracy:.3f}")
    
    return model

def create_sample_liver_model():
    """Create a sample liver disease prediction model"""
    np.random.seed(42)
    n_samples = 1000
    
    # Generate synthetic liver disease features
    age = np.random.randint(10, 90, n_samples)
    gender = np.random.randint(0, 2, n_samples)
    total_bilirubin = np.random.uniform(0.1, 75, n_samples)
    direct_bilirubin = np.random.uniform(0.1, 19.7, n_samples)
    alkaline_phosphotase = np.random.uniform(63, 2110, n_samples)
    alamine_aminotransferase = np.random.uniform(10, 2000, n_samples)
    aspartate_aminotransferase = np.random.uniform(10, 4929, n_samples)
    total_proteins = np.random.uniform(2.7, 9.6, n_samples)
    albumin = np.random.uniform(0.9, 5.5, n_samples)
    albumin_globulin_ratio = np.random.uniform(0.3, 2.8, n_samples)
    
    # Create target
    risk_score = (
        (total_bilirubin > 10) * 0.2 +
        (alkaline_phosphotase > 200) * 0.15 +
        (alamine_aminotransferase > 56) * 0.2 +
        (aspartate_aminotransferase > 40) * 0.2 +
        (albumin < 3.5) * 0.15 +
        (age > 50) * 0.1
    )
    
    risk_score += np.random.normal(0, 0.1, n_samples)
    target = (risk_score > 0.4).astype(int)
    
    X = np.column_stack([
        age, gender, total_bilirubin, direct_bilirubin,
        alkaline_phosphotase, alamine_aminotransferase,
        aspartate_aminotransferase, total_proteins,
        albumin, albumin_globulin_ratio
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, target, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Liver disease model accuracy: {accuracy:.3f}")
    
    return model

def create_sample_breast_cancer_model():
    """Create a sample breast cancer prediction model"""
    np.random.seed(42)
    n_samples = 1000
    
    # Generate synthetic breast cancer features (30 features like Wisconsin dataset)
    features = []
    for i in range(30):
        if i < 10:  # mean features
            features.append(np.random.normal(14, 4, n_samples))
        elif i < 20:  # se features
            features.append(np.random.normal(1, 0.5, n_samples))
        else:  # worst features
            features.append(np.random.normal(16, 5, n_samples))
    
    X = np.column_stack(features)
    
    # Create target based on some features
    risk_score = (
        (X[:, 0] > 15) * 0.3 +  # mean radius
        (X[:, 2] > 100) * 0.2 +  # mean perimeter
        (X[:, 5] > 0.1) * 0.2 +  # mean compactness
        (X[:, 20] > 20) * 0.3   # worst radius
    )
    
    risk_score += np.random.normal(0, 0.1, n_samples)
    target = (risk_score > 0.4).astype(int)
    
    X_train, X_test, y_train, y_test = train_test_split(X, target, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Breast cancer model accuracy: {accuracy:.3f}")
    
    return model

def main():
    """Retrain all models with current sklearn version"""
    models_dir = "aimodels"
    
    print("Retraining models with current sklearn version...")
    
    # Create models
    models = {
        "diabetes.pkl": create_sample_diabetes_model(),
        "heart.pkl": create_sample_heart_model(),
        "kidney.pkl": create_sample_kidney_model(),
        "liver.pkl": create_sample_liver_model(),
        "breast_cancer.pkl": create_sample_breast_cancer_model()
    }
    
    # Save models
    for filename, model in models.items():
        filepath = os.path.join(models_dir, filename)
        with open(filepath, 'wb') as f:
            pickle.dump(model, f)
        print(f"Saved {filename}")
    
    print("All models retrained and saved successfully!")

if __name__ == "__main__":
    main()