const fs = require('fs');
const path = require('path');

const directoryPath = __dirname;
const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.html'));

const targetContent = `<div class="header-actions">
                <a href="startup-advisory.html" class="btn btn-primary d-none-mobile">Register Advisory Session</a>
                <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Toggle Menu">
                    <i class="fas fa-bars"></i>
                </button>
            </div>`;
            
const replacementContent = `<div class="header-actions" style="display: flex; gap: 12px; align-items: center;">
                <a href="login.html" class="btn btn-outline d-none-mobile" style="padding: 0 16px; height: 40px; line-height: 38px; border: 1px solid var(--primary-green); color: var(--primary-green);">Login</a>
                <a href="startup-advisory.html" class="btn btn-primary d-none-mobile">Register Advisory Session</a>
                <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Toggle Menu">
                    <i class="fas fa-bars"></i>
                </button>
            </div>`;

let modifiedCount = 0;

for (const file of files) {
    if (file === 'index.html' || file === 'login.html' || file === 'admin-dashboard.html' || file === 'user-dashboard.html') continue;
    
    const filePath = path.join(directoryPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Some files might have slightly different spacing, so a regex replacement is safer
    // But let's try strict first
    if (content.includes('class="header-actions"')) {
        // Try simple replacement first
        if (!content.includes('href="login.html" class="btn btn-outline')) {
            // Regex to replace the header-actions block
            const regex = /<div class="header-actions">\s*<a href="startup-advisory\.html" class="btn btn-primary d-none-mobile">Register Advisory Session<\/a>\s*<button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Toggle Menu">\s*<i class="fas fa-bars"><\/i>\s*<\/button>\s*<\/div>/g;
            content = content.replace(regex, replacementContent);
            fs.writeFileSync(filePath, content);
            modifiedCount++;
        }
    }
}

console.log('Modified ' + modifiedCount + ' files.');
