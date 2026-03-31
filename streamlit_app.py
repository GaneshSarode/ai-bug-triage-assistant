import streamlit as st

# Title of the app
st.title("Bug Triage Classification")

# User Input Section
st.header("Enter Bug Details")

bug_title = st.text_input("Bug Title")
bug_description = st.text_area("Bug Description")
bug_severity = st.selectbox(
    "Select Bug Severity:",
    ("Low", "Medium", "High")
)

# Submit Button
if st.button("Classify Bug"):
    if bug_title and bug_description:
        # Placeholder for classification logic
        st.success(f"Bug classified successfully!\nTitle: {bug_title}\nSeverity: {bug_severity}")
    else:
        st.error("Please enter both title and description to classify the bug.")
