import re

with open('register.html', 'r', encoding='utf-8') as f:
    content = f.read()

# We know the duplicate starts with:
#             try {
#                 // Step 1: Register user
#                 const regRes = await fetch(`${API_BASE}/api/auth/register`, {
#                     </li>
# And ends where the REAL script continues:
#             try {
#                 // Step 1: Register user
#                 const regRes = await fetch(`${API_BASE}/api/auth/register`, {
#                     method: 'POST',

# Let's find the indices:
start_str = "            try {\n                // Step 1: Register user\n                const regRes = await fetch(`${API_BASE}/api/auth/register`, {\n                    </li>"
end_str = "            try {\n                // Step 1: Register user\n                const regRes = await fetch(`${API_BASE}/api/auth/register`, {\n                    method: 'POST',"

# Since line endings can be \r\n, let's normalize to \n first for searching
content = content.replace('\r\n', '\n')

idx_start = content.find(start_str)
idx_end = content.find(end_str)

if idx_start != -1 and idx_end != -1 and idx_end > idx_start:
    new_content = content[:idx_start] + content[idx_end:]
    with open('register.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed!")
else:
    print(f"Failed. idx_start: {idx_start}, idx_end: {idx_end}")
