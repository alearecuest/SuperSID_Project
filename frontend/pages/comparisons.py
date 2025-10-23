import streamlit as st
import pandas as pd
from analysis.comparisons import plot_intensity_vs_duration, plot_seasonal_trend

def show_comparisons():
    st.header("Advanced Comparisons")
    events_file = st.file_uploader("Upload SID events data (CSV)", type="csv", key="events_comp")
    if events_file:
        events_df = pd.read_csv(events_file, parse_dates=['start', 'end'])
        st.write("Events Data")
        st.dataframe(events_df)
        st.write("Intensity vs Duration")
        plot_intensity_vs_duration(events_df)
        st.write("Seasonal Trend")
        plot_seasonal_trend(events_df)
