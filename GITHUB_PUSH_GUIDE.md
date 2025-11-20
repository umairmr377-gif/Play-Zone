# How to Push to GitHub - Step by Step Guide

## The Issue
You're getting a **403 Permission Denied** error because your GitHub Personal Access Token (PAT) has expired or doesn't have the right permissions.

## ✅ Solution 1: Use GitHub CLI (Easiest)

### Step 1: Install GitHub CLI (if not installed)
```powershell
winget install GitHub.cli
# Or download from: https://cli.github.com/
```

### Step 2: Authenticate
```powershell
gh auth login
# Follow the prompts:
# - Choose GitHub.com
# - Choose HTTPS
# - Authenticate via web browser
```

### Step 3: Push your code
```powershell
git push origin main
```

---

## ✅ Solution 2: Use Personal Access Token (PAT)

### Step 1: Create a New PAT
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name like "Play Zone Project"
4. Select expiration (90 days recommended)
5. **Check the `repo` scope** (full control of private repositories)
6. Click **"Generate token"**
7. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Use the Token
When you push, Git will ask for credentials:
```powershell
git push origin main
```

**When prompted:**
- Username: `umairmr377-gif`
- Password: `paste_your_token_here` (use the token, not your GitHub password)

---

## ✅ Solution 3: Use Credential Manager (Windows)

### Step 1: Update Windows Credential Manager
1. Press `Win + R`, type `control`, press Enter
2. Go to **Credential Manager** → **Windows Credentials**
3. Find entries related to `github.com`
4. Delete old/invalid entries

### Step 2: Push (will prompt for new credentials)
```powershell
git push origin main
```

### Step 3: Enter Credentials
- Username: `umairmr377-gif`
- Password: Your PAT token (from Solution 2, Step 1)

Windows will save these credentials for future use.

---

## ✅ Solution 4: Use SSH (Most Secure)

### Step 1: Generate SSH Key (if you don't have one)
```powershell
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter to accept default location
# Enter a passphrase (optional but recommended)
```

### Step 2: Add SSH Key to GitHub
1. Copy your public key:
```powershell
cat ~/.ssh/id_ed25519.pub
# Or on Windows:
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

2. Go to: https://github.com/settings/keys
3. Click **"New SSH key"**
4. Paste your public key
5. Click **"Add SSH key"**

### Step 3: Update Remote URL to Use SSH
```powershell
git remote set-url origin git@github.com:umairmr377-gif/Play-Zone.git
```

### Step 4: Push
```powershell
git push origin main
```

---

## 🔍 Check Your Current Setup

### View remote URL:
```powershell
git remote -v
```

### Check if you can authenticate:
```powershell
gh auth status
# (if using GitHub CLI)
```

---

## ⚠️ Important Notes

1. **Never commit your PAT token** - it's visible in your git config
2. **PAT tokens expire** - create new ones periodically
3. **Use SSH for long-term projects** - it's more secure
4. **Use GitHub CLI** - easiest for beginners

---

## 🚀 Quick Start (Recommended for You)

Since you're on Windows, I recommend **Solution 2 (PAT) with Credential Manager**:

1. Create a PAT at https://github.com/settings/tokens (select `repo` scope)
2. Push:
   ```powershell
   git push origin main
   ```
3. Enter your username and paste the token when prompted
4. Windows will save it for future pushes

---

## Need Help?

If you're still having issues:
1. Check if you have write access to the repository
2. Verify your GitHub username is correct
3. Make sure the repository exists and you're a collaborator
4. Try creating a new PAT with all `repo` permissions

