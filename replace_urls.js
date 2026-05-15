const fs = require('fs');
const path = require('path');

function replaceInFiles(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInFiles(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Seller Frontend specific replacements
            if (fullPath.includes('seller-frontend')) {
                content = content.replace(/"http:\/\/localhost:8080\/api/g, '`${process.env.NEXT_PUBLIC_API_URL}');
                content = content.replace(/`http:\/\/localhost:8080\/api/g, '`${process.env.NEXT_PUBLIC_API_URL}');
                content = content.replace(/'http:\/\/localhost:8080\/api/g, '`${process.env.NEXT_PUBLIC_API_URL}');
                
                content = content.replace(/`http:\/\/localhost:8080/g, '`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}');
                content = content.replace(/"http:\/\/localhost:8080/g, '`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}');
                
                content = content.replace(/"http:\/\/localhost:3000/g, '`${process.env.NEXT_PUBLIC_MAIN_URL}');
                content = content.replace(/`http:\/\/localhost:3000/g, '`${process.env.NEXT_PUBLIC_MAIN_URL}');
            }
            
            // Main Frontend specific replacements
            if (fullPath.includes('frontend') && !fullPath.includes('seller-frontend')) {
                content = content.replace(/"http:\/\/localhost:8080\/api/g, '`${process.env.NEXT_PUBLIC_API_URL}');
                content = content.replace(/`http:\/\/localhost:8080\/api/g, '`${process.env.NEXT_PUBLIC_API_URL}');
                content = content.replace(/'http:\/\/localhost:8080\/api/g, '`${process.env.NEXT_PUBLIC_API_URL}');
                
                content = content.replace(/`http:\/\/localhost:8080/g, '`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}');
                content = content.replace(/"http:\/\/localhost:8080/g, '`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}');
                content = content.replace(/'http:\/\/localhost:8080/g, '`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}');
                
                content = content.replace(/"http:\/\/localhost:3001/g, '`${process.env.NEXT_PUBLIC_SELLER_URL}');
                content = content.replace(/`http:\/\/localhost:3001/g, '`${process.env.NEXT_PUBLIC_SELLER_URL}');
            }

            // Fix the broken template strings
            content = content.replace(/`\$\{process\.env\.NEXT_PUBLIC_API_URL\}([^`"']*)["']/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');
            content = content.replace(/`\$\{process\.env\.NEXT_PUBLIC_MAIN_URL\}([^`"']*)["']/g, '`${process.env.NEXT_PUBLIC_MAIN_URL}$1`');
            content = content.replace(/`\$\{process\.env\.NEXT_PUBLIC_SELLER_URL\}([^`"']*)["']/g, '`${process.env.NEXT_PUBLIC_SELLER_URL}$1`');
            
            // For API_URL?.replace
            content = content.replace(/`\$\{process\.env\.NEXT_PUBLIC_API_URL\?\.replace\("\/api", ""\)\}([^`"']*)["']/g, '`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}$1`');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

const sellerSrc = path.join(__dirname, 'seller-frontend', 'src');
const frontendSrc = path.join(__dirname, 'frontend', 'src');

if (fs.existsSync(sellerSrc)) replaceInFiles(sellerSrc);
if (fs.existsSync(frontendSrc)) replaceInFiles(frontendSrc);
