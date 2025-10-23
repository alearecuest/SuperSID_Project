import streamlit as st
from analysis.comparisons import plot_intensity_vs_duration

def show_comparisons():
    st.header("Advanced Comparisons")
    events_df = st.session_state.get('events_df')
    if events_df is not None:
        plot_intensity_vs_duration(events_df)
    else:
        st.warning("Please process SID statistics first in the Statistics page.")
