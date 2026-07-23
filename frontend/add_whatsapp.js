const fs = require('fs');
const path = require('path');

const directoryPath = __dirname;
const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.html'));

const whatsappSnippet = `
    <!-- Floating WhatsApp Button -->
    <a href="#" id="whatsapp-btn" class="whatsapp-float" target="_blank" rel="noopener noreferrer">
        <i class="fab fa-whatsapp"></i>
    </a>

    <style>
        .whatsapp-float {
            position: fixed;
            width: 60px;
            height: 60px;
            bottom: 40px;
            right: 40px;
            background-color: #25d366;
            color: #FFF;
            border-radius: 50px;
            text-align: center;
            font-size: 30px;
            box-shadow: 2px 2px 3px #999;
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
            text-decoration: none;
        }
        .whatsapp-float:hover {
            transform: scale(1.1);
            color: #FFF;
        }
    </style>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const waBtn = document.getElementById('whatsapp-btn');
            if (waBtn) {
                let serviceContext = 'General Inquiry';
                let waMessage = encodeURIComponent(\`Hi Sarangi Consulting! I'm interested in learning more about your services (\${serviceContext}).\`);
                let waNumber = '919999999999';
                
                waBtn.href = \`https://wa.me/\${waNumber}?text=\${waMessage}\`;

                waBtn.addEventListener('click', () => {
                    fetch(`${API_BASE_URL}/api/whatsapp/click`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            page: window.location.pathname || 'home',
                            service: serviceContext
                        })
                    }).catch(err => console.error('Failed to log WhatsApp click:', err));
                });
            }
        });
    </script>
`;

let modifiedCount = 0;

for (const file of files) {
    if (file === 'index.html' || file === 'footer.html' || file === 'header.html') continue;
    
    const filePath = path.join(directoryPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('id="whatsapp-btn"')) {
        continue;
    }
    
    if (content.includes('</body>')) {
        content = content.replace('</body>', whatsappSnippet + '\n</body>');
        fs.writeFileSync(filePath, content);
        modifiedCount++;
    }
}

console.log('Modified ' + modifiedCount + ' files.');
