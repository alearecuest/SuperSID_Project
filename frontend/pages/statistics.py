import streamlit as st
import pandas as pd
from analysis.sid_statistics import detect_sid_events, plot_event_frequency, plot_event_duration_histogram

def show_statistics():
    st.header("SID Event Statistics")
    uploaded_file = st.file_uploader("Upload your SID data file (CSV)", type="csv", key="sid_statistics_upload")
    if uploaded_file:
        df = pd.read_csv(uploaded_file, parse_dates=['timestamp'])
        events_df = detect_sid_events(df, threshold=0.5)
        st.subheader("Detected SID Events")
        st.dataframe(events_df)
        st.subheader("Event Statistics")
        st.write(events_df.describe())
        st.subheader("Event Frequency Plot")
        plot_event_frequency(events_df)
        st.subheader("Event Duration Histogram")
        plot_event_duration_histogram(events_df)
