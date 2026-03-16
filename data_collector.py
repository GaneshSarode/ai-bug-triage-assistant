import requests
import pandas as pd
import time
import os

# Configuration
repositories = [
    "facebook/react",
    "microsoft/vscode",
    "kubernetes/kubernetes",
    "tensorflow/tensorflow",
    "torvalds/linux",
]

# GitHub API configuration
GITHUB_API_URL = "https://api.github.com"
TOKEN = 'YOUR_TOKEN_HERE'  # Replace with your token!
HEADERS = {
    'Authorization': f'token {TOKEN}',
    'Accept': 'application/vnd.github.v3+json'
}

issues_data = []

def classify_issue(issue):
    """Classify issue based on title and labels"""
    title_lower = issue['title'].lower()
    body_lower = (issue.get('body') or '').lower()
    labels_list = [label['name'].lower() for label in issue.get('labels', [])]
    
    # Check labels first (most reliable)
    if any('bug' in l for l in labels_list):
        return 'Bug'
    elif any('feature' in l or 'enhancement' in l for l in labels_list):
        return 'Enhancement'
    elif any('doc' in l for l in labels_list):
        return 'Documentation'
    elif any('question' in l for l in labels_list):
        return 'Question'
    
    # Check title as fallback
    if 'bug' in title_lower or 'crash' in title_lower or 'error' in title_lower:
        return 'Bug'
    elif 'feature' in title_lower or 'add' in title_lower:
        return 'Feature'
    elif 'doc' in title_lower or 'readme' in title_lower:
        return 'Documentation'
    elif 'enhance' in title_lower or 'improve' in title_lower:
        return 'Enhancement'
    elif 'question' in title_lower or '?' in title_lower:
        return 'Question'
    else:
        return 'Other'

print("🚀 Starting to collect GitHub issues...")
print(f"Target: 200+ issues from 5 repos\n")

for repo in repositories:
    print(f"📥 Collecting from {repo}...")
    page = 1
    repo_count = 0
    
    while repo_count < 50:  # Get ~50 from each repo
        try:
            url = f"{GITHUB_API_URL}/repos/{repo}/issues?state=all&per_page=100&page={page}&sort=updated"
            print(f"  Fetching page {page}...", end=' ')
            
            response = requests.get(url, headers=HEADERS, timeout=10)
            
            if response.status_code == 200:
                issues = response.json()
                
                if not issues:
                    print("✓ No more issues")
                    break
                
                print(f"✓ Got {len(issues)} issues")
                
                for issue in issues:
                    # Skip pull requests
                    if 'pull_request' in issue:
                        continue
                    
                    label = classify_issue(issue)
                    
                    issues_data.append({
                        'title': issue['title'],
                        'body': (issue.get('body') or '')[:500],  # First 500 chars
                        'label': label,
                        'repo': repo,
                        'url': issue['html_url'],
                        'created_at': issue['created_at'],
                        'state': issue['state']
                    })
                    repo_count += 1
                
                page += 1
                time.sleep(1)  # Rate limiting
            else:
                print(f"❌ Error {response.status_code}")
                if response.status_code == 403:
                    print("  Rate limit hit. Waiting 60 seconds...")
                    time.sleep(60)
                else:
                    break
        
        except Exception as e:
            print(f"❌ Error: {e}")
            time.sleep(5)
    
    print(f"  ✓ Collected {repo_count} issues\n")

# Save to CSV
if issues_data:
    df = pd.DataFrame(issues_data)
    
    # Create data folder if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    csv_path = 'data/training_data.csv'
    df.to_csv(csv_path, index=False)
    
    print(f"\n✅ SUCCESS!")
    print(f"Total issues collected: {len(issues_data)}")
    print(f"Label distribution:")
    print(df['label'].value_counts())
    print(f"\n📁 Saved to: {csv_path}")
else:
    print("\n❌ No issues collected!")
