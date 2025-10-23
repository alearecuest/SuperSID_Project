import streamlit as st
import pandas as pd
from analysis.correlation_solar import compute_correlation, plot_correlation_scatter, align_data as align_solar
from analysis.correlation_weather import compute_correlation as compute_weather, plot_correlation_scatter as plot_weather, align_data as align_weather

def show_correlation():
    st.header("Correlation Analysis")
    st.subheader("Correlation with Solar Activity")
    sid_file = st.file_uploader("Upload SID data (CSV)", type="csv", key="sid_corr")
    solar_file = st.file_uploader("Upload Solar Activity data (CSV)", type="csv", key="solar_corr")
    if sid_file and solar_file:
        sid_df = pd.read_csv(sid_file, parse_dates=['timestamp'])
        solar_df = pd.read_csv(solar_file, parse_dates=['timestamp'])
        merged = align_solar(sid_df, solar_df)
        st.write("Merged Data Sample")
        st.dataframe(merged.head())
        st.write("Correlation: Signal vs Sunspots")
        compute_correlation(merged, 'signal', 'sunspots')
        plot_correlation_scatter(merged, 'signal', 'sunspots')
    else:
        st.info("Upload both SID and Solar Activity data files to analyze correlation.")

    st.subheader("Correlation with Weather Data")
    weather_file = st.file_uploader("Upload Weather data (CSV)", type="csv", key="weather_corr")
    if sid_file and weather_file:
        sid_df = pd.read_csv(sid_file, parse_dates=['timestamp'])
        weather_df = pd.read_csv(weather_file, parse_dates=['timestamp'])
        merged = align_weather(sid_df, weather_df)
        st.write("Merged Data Sample")
        st.dataframe(merged.head())
        st.write("Correlation: Signal vs Temperature")
        compute_weather(merged, 'signal', 'temperature')
        plot_weather(merged, 'signal', 'temperature')
    elif not sid_file:
        st.info("You need to upload SID data before analyzing correlation with weather data.")
