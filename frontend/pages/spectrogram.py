import streamlit as st
import pandas as pd
from analysis.spectrograms import plot_spectrogram

def show_spectrogram():
    st.header("Spectrogram Visualization")
    uploaded_file = st.file_uploader("Upload your SID data file (CSV)", type="csv", key="sid_spec")
    if uploaded_file:
        df = pd.read_csv(uploaded_file, parse_dates=['timestamp'])
        st.write("Data Sample")
        st.dataframe(df.head())
        st.write("Spectrogram")
        plot_spectrogram(df)
