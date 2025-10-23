import streamlit as st
import pandas as pd
from analysis.geo_maps import plot_geo_map

def show_geomap():
    st.header("Geographical Mapping")
    events_file = st.file_uploader("Upload SID events data (CSV)", type="csv", key="events_geo")
    stations_file = st.file_uploader("Upload station metadata (CSV)", type="csv", key="stations_geo")
    if events_file and stations_file:
        events_df = pd.read_csv(events_file)
        stations_df = pd.read_csv(stations_file)
        st.write("Stations Data")
        st.dataframe(stations_df)
        st.write("Events Data")
        st.dataframe(events_df)
        plot_geo_map(events_df, stations_df)
