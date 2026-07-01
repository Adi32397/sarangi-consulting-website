const fs = require('fs');
const path = require('path');
const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const oldStr = `<li style="display: flex; align-items: center; gap: 12px;">
                        <a href="login.html" style="color: var(--primary-green); font-weight: 600;">Login</a>
                        <button type="button" onclick="window.showAnnouncementBanners && window.showAnnouncementBanners()" style="background: none; border: none; cursor: pointer; color: var(--text-grey); font-size: 16px; padding: 4px;" title="View Announcements"><i class="fas fa-ellipsis-v"></i></button>
                    </li>`;

const newStr = `<li><a href="login.html" style="color: var(--primary-green); font-weight: 600;">Login</a></li>
                    <li style="display: flex; align-items: center;">
                        <button type="button" onclick="window.showAnnouncementBanners && window.showAnnouncementBanners()" style="background: none; border: none; cursor: pointer; color: var(--text-grey); font-size: 16px; padding: 0;" title="View Announcements"><i class="fas fa-ellipsis-v"></i></button>
                    </li>`;

let count = 0;
for (const file of files) {
    if (file === 'admin-dashboard.html' || file === 'user-dashboard.html') continue;
    const p = path.join(dir, file);
    let html = fs.readFileSync(p, 'utf-8');
    if (html.includes(oldStr)) {
        html = html.replace(oldStr, newStr);
        fs.writeFileSync(p, html);
        count++;
    } else {
        // Also try to replace with flexbox removed entirely if they have variations
        const regexStr = /<li style="display: flex; align-items: center; gap: 12px;">\s*<a href="login\.html" style="color: var\(--primary-green\); font-weight: 600;">Login<\/a>\s*<button type="button" onclick="window\.showAnnouncementBanners && window\.showAnnouncementBanners\(\)" style="background: none; border: none; cursor: pointer; color: var\(--text-grey\); font-size: 16px; padding: 4px;" title="View Announcements"><i class="fas fa-ellipsis-v"><\/i><\/button>\s*<\/li>/g;
        if (regexStr.test(html)) {
             html = html.replace(regexStr, newStr);
             fs.writeFileSync(p, html);
             count++;
        }
    }
}
console.log(`Updated ${count} HTML files.`);
