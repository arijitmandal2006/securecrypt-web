/**
 * SecureCrypt - JS-Driven UI & Cryptography
 * * PART 1: DOM GENERATOR (The View)
 * PART 2: UI LOGIC (The Controller)
 * PART 3: CRYPTOGRAPHY (The Model)
 */

// ==========================================
// PART 1: DOM GENERATOR ENGINE
// ==========================================

// Helper to create elements easily
function h(tag, classes, content = '', attributes = {}) {
    const el = document.createElement(tag);
    if (classes) el.className = classes;
    if (typeof content === 'string') el.innerHTML = content;
    else if (content instanceof Node) el.appendChild(content);
    else if (Array.isArray(content)) content.forEach(child => el.appendChild(child));
    
    for (const key in attributes) {
        if (key.startsWith('on')) el.addEventListener(key.substring(2).toLowerCase(), attributes[key]);
        else el.setAttribute(key, attributes[key]);
    }
    return el;
}

// Global References to Inputs (so we can grab them later)
const refs = {
    encryptTab: null,
    decryptTab: null,
    inputSection: null,
    inputText: null,
    inputFile: null,
    fileName: null,
    password: null,
    actionBtn: null,
    outputSection: null,
    outputText: null,
    statusMsg: null,
    downloadLink: null
};

// State
let currentMode = 'encrypt';
let currentInputType = 'text';

function initApp() {
    const root = document.getElementById('app-root');
    
    // 1. Header
    const header = h('header', 'text-center mb-10 fade-in', [
        h('div', 'flex items-center justify-center gap-3 mb-2', [
            h('div', 'fa-solid fa-shield-halved text-cyan-400 fa-flip 1s infinite ease-in-out text-6xl'),
            h('h1', 'text-4xl font-bold text-white tracking-tight', 'SecureCrypt')
        ]),
        h('p', 'text-gray-400 text-sm', 'JavaScript-Rendered Encryption Tool'),
         h('p', 'text-gray-700 text-xs', 'By arijit mandal')
        
    ]);

    // 2. Main Card
    const card = h('main', 'w-full bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden fade-in', [
        
        // Tabs
        h('div', 'flex border-b border-gray-800', [
            refs.encryptTab = h('button', 'flex-1 py-4 text-center font-semibold text-cyan-400 border-b-2 border-cyan-400 bg-gray-850 transition-colors', 
                '<i class="fa-solid fa-lock mr-2"></i> Encrypt', { onClick: () => switchMode('encrypt') }),
            refs.decryptTab = h('button', 'flex-1 py-4 text-center font-semibold text-gray-500 hover:text-gray-300 transition-colors', 
                '<i class="fa-solid fa-lock-open mr-2"></i> Decrypt', { onClick: () => switchMode('decrypt') })
        ]),

        // Content Container
        h('div', 'p-8', [
            
            // Radio Buttons (Text vs File)
            h('div', 'mb-6 flex justify-center gap-6', [
                createRadio('text', 'Text Mode', true),
                createRadio('file', 'File Mode', false)
            ]),

            // Inputs Container
            h('div', 'space-y-4', [
                
                // Text Input Area
                refs.inputSection = h('div', '', [
                    h('label', 'block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider', 'Input Data'),
                    refs.inputText = h('textarea', 'w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-sm focus:border-cyan-400 focus:outline-none transition-all font-mono placeholder-gray-700 text-white', '', { rows: 4, placeholder: 'Enter text here...' })
                ]),

                // File Input Area (Hidden by default)
                refs.fileSection = h('div', 'hidden', [
                    h('label', 'block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider', 'Select File'),
                    h('div', 'relative border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-cyan-400 transition-colors bg-gray-950', [
                        refs.inputFile = h('input', 'absolute inset-0 w-full h-full opacity-0 cursor-pointer', '', { type: 'file', onChange: handleFileSelect }),
                        h('i', 'fa-solid fa-file-arrow-up text-2xl text-gray-600 mb-2'),
                        refs.fileName = h('p', 'text-sm text-gray-400', 'Click or drag file to upload')
                    ])
                ]),

                // Password Field
                h('div', '', [
                    h('label', 'block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider', 'Passphrase'),
                    h('div', 'relative', [
                        refs.password = h('input', 'w-full bg-gray-950 border border-gray-700 rounded-lg p-3 pl-10 text-sm focus:border-cyan-400 focus:outline-none text-white', '', { type: 'password', placeholder: 'Enter secret key...' }),
                        h('i', 'fa-solid fa-key absolute left-3 top-3.5 text-gray-600')
                    ])
                ]),

                // Action Button
                refs.actionBtn = h('button', 'w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold rounded-lg shadow-lg transform active:scale-95 transition-all', 
                    '<i class="fa-solid fa-lock"></i> Encrypt Data', { onClick: executeCrypto })
            ]),

            // Output Section (Hidden by default)
            refs.outputSection = h('div', 'mt-8 pt-6 border-t border-gray-800 hidden', [
                h('div', 'flex justify-between items-center mb-2', [
                    h('label', 'block text-xs font-mono text-cyan-400 uppercase tracking-wider', 'Result'),
                    refs.statusMsg = h('span', 'text-xs font-bold hidden')
                ]),

                // Text Output
                refs.textOutputGroup = h('div', 'relative group', [
                    refs.outputText = h('textarea', 'w-full bg-gray-850 border border-gray-700 rounded-lg p-3 text-xs font-mono text-gray-400 focus:outline-none', '', { readonly: true, rows: 4 }),
                    h('button', 'absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity', 'Copy', { onClick: copyToClipboard })
                ]),

                // File Download Output
                refs.fileOutputGroup = h('div', 'hidden text-center', [
                    h('div', 'p-4 bg-gray-850 rounded-lg border border-gray-700', [
                        h('i', 'fa-solid fa-file-shield text-3xl text-cyan-500 mb-2'),
                        h('p', 'text-sm text-white mb-3', 'Processing Complete'),
                        refs.downloadLink = h('a', 'inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors cursor-pointer', 
                            '<i class="fa-solid fa-download mr-1"></i> Download Result')
                    ])
                ])
            ])
        ])
    ]);

    // ... inside initApp() ...

    // 3. Footer with Social Links
    const footer = h('footer', 'mt-10 mb-6 text-center', [
        h('p', 'text-gray-500 text-xs mb-3', '🔒 All operations happen locally via JavaScript function'),
        
        h('div', 'flex justify-center gap-6', [
            // Instagram
            createSocialLink('instagram', 'https://instagram.com/arijit2006mandal', 'hover:text-pink-500'),
            // X (Twitter)
            createSocialLink('twitter', 'https://x.com/arijitmandal24', 'hover:text-white'),
            // LinkedIn
            createSocialLink('linkedin', 'https://linkedin.com/in/arijitmandal06', 'hover:text-blue-500'),
            // GitHub
            createSocialLink('github', 'https://github.com/arijitmandal2006', 'hover:text-white')
        ])
    ]);

    // Assemble
    root.appendChild(header);
    root.appendChild(card);
    root.appendChild(footer);
}

// --- Add this Helper Function below initApp ---
function createSocialLink(platform, url, hoverColor) {
    return h('a', `text-gray-500 text-xl transition-colors ${hoverColor}`, 
        `<i class="fa-brands fa-${platform}"></i>`, 
        { href: url, target: '_blank' }
    );
}


// Helper for Radio Buttons
function createRadio(value, label, checked) {
    return h('label', 'flex items-center cursor-pointer gap-2', [
        h('input', 'accent-cyan-400 w-4 h-4', '', { 
            type: 'radio', 
            name: 'inputType', 
            value: value, 
            checked: checked ? 'true' : null,
            onChange: (e) => toggleInputType(e.target.value) 
        }),
        h('span', 'text-sm font-medium', label)
    ]);
}

// ==========================================
// PART 2: UI LOGIC (The Controller)
// ==========================================

function switchMode(mode) {
    currentMode = mode;
    
    // Reset styles
    const activeClass = "flex-1 py-4 text-center font-semibold text-cyan-400 border-b-2 border-cyan-400 bg-gray-850 transition-colors";
    const inactiveClass = "flex-1 py-4 text-center font-semibold text-gray-500 hover:text-gray-300 transition-colors";
    
    refs.encryptTab.className = mode === 'encrypt' ? activeClass : inactiveClass;
    refs.decryptTab.className = mode === 'decrypt' ? activeClass : inactiveClass;
    
    // Update Button Text
    const icon = mode === 'encrypt' ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-lock-open"></i>';
    const text = mode === 'encrypt' ? ' Encrypt Data' : ' Decrypt Data';
    refs.actionBtn.innerHTML = icon + text;

    resetOutput();
}

function toggleInputType(type) {
    currentInputType = type;
    if (type === 'text') {
        refs.inputSection.classList.remove('hidden');
        refs.fileSection.classList.add('hidden');
    } else {
        refs.inputSection.classList.add('hidden');
        refs.fileSection.classList.remove('hidden');
    }
    resetOutput();
}

function handleFileSelect(e) {
    if(e.target.files.length > 0) refs.fileName.innerText = e.target.files[0].name;
}

function resetOutput() {
    // 1. Hide the result section
    refs.outputSection.classList.add('hidden');
    refs.outputText.value = '';
    refs.statusMsg.classList.add('hidden');
    
    // 2. Clear Password
    refs.password.value = ''; 

    // 3. NEW: Clear Input Fields (Text & File)
    if (refs.inputText) refs.inputText.value = ''; 
    if (refs.inputFile) refs.inputFile.value = '';
    if (refs.fileName) refs.fileName.innerText = 'Click or drag file to upload';
}

function showStatus(msg, type) {
    refs.statusMsg.classList.remove('hidden', 'text-green-400', 'text-red-400');
    refs.statusMsg.classList.add(type === 'error' ? 'text-red-400' : 'text-green-400');
    refs.statusMsg.innerHTML = type === 'error' 
        ? `<i class="fa-solid fa-circle-xmark"></i> ${msg}`
        : `<i class="fa-solid fa-check"></i> ${msg}`;
    
    // Show Output Section wrapper to display the status
    refs.outputSection.classList.remove('hidden');
    
    // Hide data containers if error
    if(type === 'error') {
        refs.textOutputGroup.classList.add('hidden');
        refs.fileOutputGroup.classList.add('hidden');
    }
}

function copyToClipboard() {
    refs.outputText.select();
    document.execCommand('copy');
    showStatus('Copied to clipboard!', 'success');
}

// ==========================================
// PART 3: CRYPTOGRAPHY (The Model)
// ==========================================

async function executeCrypto() {
    const password = refs.password.value;
    
    // 1. Clear password immediately
    refs.password.value = ''; 

    if (!password) return alert("Please enter a password.");

    try {
        if (currentInputType === 'text') {
            const text = refs.inputText.value;
            if (!text) return alert("Please enter text.");

            let result;
            if (currentMode === 'encrypt') {
                result = await encryptText(text, password);
                showStatus("Encryption Successful", "success");
            } else {
                result = await decryptText(text, password);
                showStatus("Decryption Successful", "success");
            }
            
            refs.textOutputGroup.classList.remove('hidden');
            refs.fileOutputGroup.classList.add('hidden');
            refs.outputText.value = result;

        } else {
            const file = refs.inputFile.files[0];
            if (!file) return alert("Please select a file.");

            if (currentMode === 'encrypt') {
                await encryptFile(file, password);
                showStatus("File Encrypted", "success");
            } else {
                await decryptFile(file, password);
                showStatus("File Decrypted", "success");
            }
            refs.textOutputGroup.classList.add('hidden');
            refs.fileOutputGroup.classList.remove('hidden');
        }
    } catch (error) {
        console.error(error);
        if (error.name === 'OperationError') {
            showStatus("Wrong Password!", "error");
        } else if (error.message.includes('valid base64') || error.name === 'InvalidCharacterError') {
            showStatus("Invalid Input (Garbage Data)", "error");
        } else {
            showStatus("Operation Failed", "error");
        }
    }
}

// --- Crypto Logic (Same as before) ---

async function deriveKey(password) {
    const enc = new TextEncoder();
    const hash = await crypto.subtle.digest("SHA-256", enc.encode(password));
    return crypto.subtle.importKey("raw", hash.slice(0, 16), { name: "AES-CBC" }, false, ["encrypt", "decrypt"]);
}

async function encryptText(text, password) {
    const key = await deriveKey(password);
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, key, new TextEncoder().encode(text));
    
    const buffer = new Uint8Array(iv.byteLength + encrypted.byteLength);
    buffer.set(iv, 0);
    buffer.set(new Uint8Array(encrypted), 16);
    return arrayBufferToBase64(buffer);
}

async function decryptText(base64, password) {
    const key = await deriveKey(password);
    const data = base64ToArrayBuffer(base64);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv: data.slice(0, 16) }, key, data.slice(16));
    return new TextDecoder().decode(decrypted);
}

async function encryptFile(file, password) {
    const key = await deriveKey(password);
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const content = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, key, await file.arrayBuffer());
    
    const buffer = new Uint8Array(iv.byteLength + content.byteLength);
    buffer.set(iv, 0);
    buffer.set(new Uint8Array(content), 16);
    
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    refs.downloadLink.href = url;
    refs.downloadLink.download = file.name + ".enc";
}

async function decryptFile(file, password) {
    const key = await deriveKey(password);
    const buffer = new Uint8Array(await file.arrayBuffer());
    const content = await crypto.subtle.decrypt({ name: "AES-CBC", iv: buffer.slice(0, 16) }, key, buffer.slice(16));
    
    const blob = new Blob([content], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    refs.downloadLink.href = url;
    refs.downloadLink.download = "decrypted_" + file.name.replace(".enc", "");
}

// Helpers
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
    try {
        const binary = window.atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes.buffer;
    } catch(e) { throw new Error("Invalid base64"); }
}

// Initialize on Load
window.addEventListener('DOMContentLoaded', initApp);