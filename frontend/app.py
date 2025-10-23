import streamlit as st
from PIL import Image
from pages.statistics import show_statistics
from pages.correlation import show_correlation
from pages.spectrogram import show_spectrogram
from pages.prediction import show_prediction
from pages.geomap import show_geomap
from pages.comparisons import show_comparisons

logo = Image.open("assets/stanford_logo.png")
st.set_page_config(page_title="SuperSID Analysis Frontend", page_icon=logo, layout="wide")

st.sidebar.image(logo, use_column_width=True)
st.sidebar.title("SuperSID Analysis")
st.sidebar.markdown("Powered by Stanford Solar Center")

page = st.sidebar.radio(
    "Select analysis page:",
    (
        "Statistics",
        "Correlation",
        "Spectrogram",
        "Prediction",
        "Geo Map",
        "Comparisons"
    )
)

if page == "Statistics":
    show_statistics()
elif page == "Correlation":
    show_correlation()
elif page == "Spectrogram":
    show_spectrogram()
elif page == "Prediction":
    show_prediction()
elif page == "Geo Map":
    show_geomap()
elif page == "Comparisons":
    show_comparisons()

st.markdown("---")
st.markdown("**SuperSID Advanced Analysis Frontend - Powered by Stanford Solar Center**")
