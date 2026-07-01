const fs = require('fs');
const path = require('path');
const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

// The previously inserted string
const targetStr = `<button onclick="window.showAnnouncementBanners && window.showAnnouncementBanners()" style="background: none; border: none; cursor: pointer; color: var(--text-grey); font-size: 16px; padding: 4px;" title="View Announcements"><i class="fas fa-ellipsis-v"></i></button>`;

// The new string with type="button"
const replacementStr = `<button type="button" onclick="window.showAnnouncementBanners && window.showAnnouncementBanners()" style="background: none; border: none; cursor: pointer; color: var(--text-grey); font-size: 16px; padding: 4px;" title="View Announcements"><i class="fas fa-ellipsis-v"></i></button>`;

let matches = 0;
for (const file of files) {
    if (file === 'login.html' || file === 'admin-dashboard.html' || file === 'user-dashboard.html') continue;
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes(targetStr)) {
        content = content.replace(targetStr, replacementStr);
        fs.writeFileSync(filePath, content);
        matches++;
    }
}
console.log('Replaced in ' + matches + ' files');
