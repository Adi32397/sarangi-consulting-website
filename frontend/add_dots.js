const fs = require('fs');
const path = require('path');
const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const targetRegex = /<li>\s*<a[^>]*href="login\.html"[^>]*>Login<\/a>\s*<\/li>/g;
const replacement = `<li style="display: flex; align-items: center; gap: 12px;">
                        <a href="login.html" style="color: var(--primary-green); font-weight: 600;">Login</a>
                        <button onclick="window.showAnnouncementBanners && window.showAnnouncementBanners()" style="background: none; border: none; cursor: pointer; color: var(--text-grey); font-size: 16px; padding: 4px;" title="View Announcements"><i class="fas fa-ellipsis-v"></i></button>
                    </li>`;

let matches = 0;
for (const file of files) {
    if (file === 'login.html' || file === 'admin-dashboard.html' || file === 'user-dashboard.html') continue;
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    if (targetRegex.test(content)) {
        content = content.replace(targetRegex, replacement);
        fs.writeFileSync(filePath, content);
        matches++;
    }
}
console.log('Replaced in ' + matches + ' files');
