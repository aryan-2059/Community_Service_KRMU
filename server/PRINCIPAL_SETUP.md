# Principal account setup

Teacher accounts created through registration remain pending until a principal approves them. Principal accounts cannot be created through public registration.

After installing server dependencies, create the first principal from PowerShell.
The current app stores records in its JSON store; this command creates the
principal in the store selected by `JSON_STORE_PATH`.

```powershell
Push-Location server
$env:PRINCIPAL_EMAIL = "principal@your-school.edu"
$securePassword = Read-Host "Principal password (12+ characters)" -AsSecureString
$env:PRINCIPAL_PASSWORD = [System.Net.NetworkCredential]::new("", $securePassword).Password
npm run principal:create
Remove-Item Env:PRINCIPAL_EMAIL, Env:PRINCIPAL_PASSWORD
Pop-Location
```

The command only creates a new account; it refuses to change an existing account. Sign in with that account to approve teachers, review class enrollment and quiz records, and manage school meetings.

The principal overview reports quiz attempts and scores currently recorded by the app. Attendance and other offline activity are not tracked.