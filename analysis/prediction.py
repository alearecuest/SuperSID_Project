"""
SID Event Prediction

Uses machine learning or statistical modeling to predict SID events from SuperSID data.

Usage:
    python analysis/prediction.py ../data/your_data_file.csv

Requirements:
    pandas, scikit-learn, matplotlib

Author: Alejandro Arévalo
"""

import sys
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt

def load_data(filepath):
    df = pd.read_csv(filepath, parse_dates=['timestamp'])
    df['hour'] = df['timestamp'].dt.hour
    df['is_event'] = (df['signal'] > 0.5).astype(int)
    return df

def train_model(df):
    features = ['signal', 'hour']
    X = df[features]
    y = df['is_event']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)
    print(classification_report(y_test, y_pred))
    return clf, X_test, y_test, y_pred

def plot_confusion(y_test, y_pred):
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(4,4))
    plt.imshow(cm, cmap='Blues')
    plt.title('SID Event Prediction Confusion Matrix')
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.colorbar()
    plt.show()

def main(filepath):
    df = load_data(filepath)
    clf, X_test, y_test, y_pred = train_model(df)
    plot_confusion(y_test, y_pred)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analysis/prediction.py ../data/your_data_file.csv")
        sys.exit(1)
    main(sys.argv[1])
