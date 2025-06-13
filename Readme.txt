Vercel.json
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}

Git repository on the command line
    Initialize The Git Path to Project FolderPath
        git init

    Adding Your Project Files In Git Path
        git add .

    Add Origin To Git Repository
        git remote add origin https://github.com/Frontend-Developerr-NEC/Chat_App.git
    (Or)
    Delete Current Origin And Change Origin
        git remote remove origin
        git remote add origin <new-repository-url>.git

    Adding Git Branch
        git branch -M main

    Viewing Git Current Origin
        git remote -v

    Pull Files To Git Branch Origin
        git pull origin main

    Commit Files Changes In Git
        git commit -m "first commit"

    Push Files To Git Branch Origin
        git push -u origin main 
        (or)
        git push -f origin main