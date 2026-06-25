import subprocess

# Run git show and capture output as bytes, then decode as utf-8
cmd = ["git", "show", "HEAD:hrms-platform/frontend/src/features/security/SecurityScreen.tsx"]
result = subprocess.run(cmd, capture_output=True, cwd=r"d:\ManageMyOpz\HR_Module_57" if False else r"d:\ManageMyOpz\HR_Module_02")

if result.returncode == 0:
    content = result.stdout.decode('utf-8', errors='ignore')
    with open("temp_head_utf8.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success: Wrote temp_head_utf8.tsx")
else:
    print("Error:", result.stderr.decode('utf-8', errors='ignore'))
