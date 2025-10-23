import streamlit as st
import pandas as pd
from analysis.sid_statistics import detect_sid_events, plot_event_frequency, plot_event_duration_histogram

@st.cache_data
def process_sid(file):
    df = pd.read_csv(file, parse_dates=['timestamp'])
    events_df = detect_sid_events(df, threshold=0.5)
    return df, events_df

def show_statistics():
    st.header("SID Event Statistics")
    uploaded_file = st.file_uploader("Upload your SID data file (CSV)", type="csv", key="sid_statistics_upload")
    if uploaded_file:
        df, events_df = process_sid(uploaded_file)
        st.session_state['sid_df'] = df
        st.session_state['events_df'] = events_df
        st.dataframe(events_df)
        st.write(events_df.describe())
        plot_event_frequency(events_df)
        plot_event_duration_histogram(events_df)
