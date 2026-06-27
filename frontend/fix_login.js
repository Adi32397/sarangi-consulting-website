const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && !['login.html','admin-dashboard.html','user-dashboard.html','register.html','header.html','footer.html'].includes(f));

// Revert index.html header-actions to its original state (no inline style hack)
// Then add Login as a nav link instead

let fixed = 0;

for (const file of files) {
  const fp = path.join(dir, file);
  let c = fs.readFileSync(fp, 'utf8');

  // 1. Revert header-actions: remove the inline style + remove the injected login button link
  c = c.replace(
    /<div class="header-actions" style="display: flex; gap: 12px; align-items: center;">\s*<a href="login\.html" class="btn btn-outline d-none-mobile"[^>]*>Login<\/a>\s*/g,
    '<div class="header-actions">\n                '
  );

  // 2. Add Login to the desktop nav <ul> if not already there
  if (!c.includes('href="login.html"')) {
    c = c.replace(
      /<li><a href="contact\.html">Contact<\/a><\/li>\s*<\/ul>/,
      `<li><a href="contact.html">Contact</a></li>
                    <li><a href="login.html" style="color: var(--primary-green); font-weight: 600;">Login</a></li>
                </ul>`
    );
  }

  fs.writeFileSync(fp, c);
  fixed++;
}

// Special handling for index.html
const indexPath = path.join(dir, 'index.html');
let idx = fs.readFileSync(indexPath, 'utf8');

// Revert the header-actions inline style and Login btn
idx = idx.replace(
  /<div class="header-actions" style="display: flex; gap: 12px; align-items: center;">\s*<a href="login\.html" class="btn btn-outline d-none-mobile"[^>]*>Login<\/a>\s*/g,
  '<div class="header-actions">\n                '
);

// Add Login to nav if not there
if (!idx.includes('href="login.html"')) {
  idx = idx.replace(
    /<li><a href="contact\.html">Contact<\/a><\/li>\s*<\/ul>/,
    `<li><a href="contact.html">Contact</a></li>
                    <li><a href="login.html" style="color: var(--primary-green); font-weight: 600;">Login</a></li>
                </ul>`
  );
}

fs.writeFileSync(indexPath, idx);

console.log(`Fixed ${fixed + 1} files.`);
