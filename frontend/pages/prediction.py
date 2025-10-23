import streamlit as st
import pandas as pd
from analysis.prediction import train_model, plot_confusion

def show_prediction():
    st.header("SID Event Prediction")
    uploaded_file = st.file_uploader("Upload your SID data file (CSV)", type="csv", key="sid_pred")
    if uploaded_file:
        df = pd.read_csv(uploaded_file, parse_dates=['timestamp'])
        st.subheader("Data Sample")
        st.dataframe(df.head())
        clf, X_test, y_test, y_pred = train_model(df)
        st.subheader("Prediction Results")
        st.write("Confusion Matrix")
        plot_confusion(y_test, y_pred)
    else:
        st.info("Please upload your SID data file to run predictions.")
