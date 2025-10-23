import streamlit as st
from PIL import Image
from pages.statistics import show_statistics
from pages.correlation import show_correlation
# ... importa otras páginas

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

st.markdown("---")
st.markdown("**SuperSID Advanced Analysis Frontend - Powered by Stanford Solar Center**")
