import streamlit as st
import pandas as pd
from analysis.sid_statistics import detect_sid_events, plot_event_frequency, plot_event_duration_histogram

def show_statistics():
    st.header("SID Event Statistics")
    uploaded_file = st.file_uploader("Upload your SID data file (CSV)", type="csv", key="sid_statistics_upload")
    if uploaded_file:
        df = pd.read_csv(uploaded_file, parse_dates=['timestamp'])
        threshold = st.slider("Event threshold", min_value=0.1, max_value=1.0, value=0.5, step=0.05)
        events_df = detect_sid_events(df, threshold=threshold)

        tab1, tab2, tab3 = st.tabs(["Frequency", "Duration", "Raw Data"])
        with tab1:
            plot_event_frequency(events_df)
        with tab2:
            plot_event_duration_histogram(events_df)
        with tab3:
            st.dataframe(events_df)
    else:
        st.info("Please upload a SID data file to view statistics and visualizations.")
