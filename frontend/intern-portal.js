const API_BASE = "http://localhost:5000";

if (window.location.pathname.includes("intern-dashboard.html")) {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
    }

    async function loadInternProfile() {
        try {
            const res = await fetch(`${API_BASE}/api/employees/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "login.html";
                return;
            }

            const emp = data.employee;

            document.getElementById("empName").innerText = emp.name;
            document.getElementById("profileName").innerText = emp.name;
            document.getElementById("profileRole").innerText = emp.designation;
            document.getElementById("topProfileName").innerText = emp.name;
            document.getElementById("topProfileRole").innerText = emp.designation;
            document.getElementById("avatarInitials").innerText = emp.name.split(" ").map(n => n[0]).join("").toUpperCase();
            document.getElementById("empId").innerText = emp.employee_id;
            document.getElementById("empDepartment").innerText = emp.department;
            document.getElementById("empJoiningDate").innerText = emp.joining_date;

        } catch (error) {
            console.error(error);
            alert("Could not load intern profile");
        }
    }

    loadInternProfile();

    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });
}

function letterHeader() {
  return `
    <div class="letter-head">
      <h1>Sarangi Consulting</h1>
      <p>Growth & Management Consulting Firm</p>
    </div>
  `;
}

async function openDocument(type, shouldDownload = false) {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/employees/documents/${type}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            alert(data.message || "Could not load document");
            return;
        }

        renderDocument(type, data.employee);

        if (shouldDownload) {
            setTimeout(() => { downloadDocument(); }, 300);
        }

    } catch (error) {
        console.error(error);
        alert("Could not connect to document server.");
    }
}

function renderDocument(type, emp) {
    const preview = document.getElementById("documentPreview");
    const paper = document.getElementById("letterPaper");
    const title = document.getElementById("docTitle");

    preview.style.display = "block";
    let html = "";

    if (type === "offer") {
        title.innerText = "Internship Offer Letter";
        html = `
            ${letterHeader()}
            <h2>Internship Offer Letter</h2>
            <p>Date: ${new Date().toLocaleDateString("en-IN")}</p>
            <p>Dear <strong>${emp.name}</strong>,</p>
            <p>We are pleased to offer you the internship position of <strong>${emp.designation}</strong> at Sarangi Consulting.</p>
            <p>Your joining date will be <strong>${emp.joining_date}</strong>. Your monthly stipend will be <strong>₹${Number(emp.salary).toLocaleString("en-IN")}</strong>.</p>
            <br><br>
            <p><strong>Authorized Signatory</strong><br>Sarangi Consulting</p>
        `;
    }

    if (type === "salary") {
        title.innerText = "Stipend Slip";
        html = `
            ${letterHeader()}
            <h2>Stipend Slip</h2>
            <p><strong>Intern Name:</strong> ${emp.name}</p>
            <p><strong>Intern ID:</strong> ${emp.employee_id}</p>
            <p><strong>Role:</strong> ${emp.designation}</p>
            <hr>
            <p><strong>Basic Stipend:</strong> ₹${Number(emp.salary).toLocaleString("en-IN")}</p>
            <p><strong>Net Pay:</strong> ₹${Number(emp.salary).toLocaleString("en-IN")}</p>
        `;
    }

    if (type === "experience") {
        title.innerText = "Internship Certificate";
        html = `
            ${letterHeader()}
            <h2>Certificate of Completion</h2>
            <p>This is to certify that <strong>${emp.name}</strong> successfully completed their internship with Sarangi Consulting as an <strong>${emp.designation}</strong>.</p>
            <br><br>
            <p><strong>Authorized Signatory</strong><br>Sarangi Consulting</p>
        `;
    }

    paper.innerHTML = html;
    preview.scrollIntoView({ behavior: "smooth" });
}

function downloadDocument() {
  window.print();
}

// --- Document Request & Upload Logic ---

async function loadRequestsAndUploads() {
    const token = localStorage.getItem("token");
    if (!token) return;

    // 1. Load Requests
    try {
        const reqRes = await fetch(`${API_BASE}/api/employees/requests`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const reqData = await reqRes.json();
        
        const reqList = document.getElementById('myRequestsList');
        if (reqData.success && reqData.data.length > 0) {
            reqList.innerHTML = reqData.data.map(req => `
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                    <span><strong>${req.documentType}</strong></span>
                    <span style="color: ${req.status === 'Completed' ? '#16a34a' : '#f97316'}; font-weight: 600;">${req.status}</span>
                </div>
            `).join('');
        } else {
            reqList.innerHTML = '<p style="color: #64748b;">No pending requests.</p>';
        }
    } catch (err) {
        console.error("Failed to load requests", err);
    }

    // 2. Load Admin Uploads
    try {
        const upRes = await fetch(`${API_BASE}/api/employees/my-uploads`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const upData = await upRes.json();
        
        const upList = document.getElementById('adminUploadsList');
        if (upData.success && upData.data.length > 0) {
            upList.innerHTML = upData.data.map(file => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div>
                        <strong style="display: block;">${file.title}</strong>
                        <span style="font-size: 11px; color: #64748b;">Uploaded: ${new Date(file.createdAt).toLocaleDateString()}</span>
                    </div>
                    <a href="${API_BASE}/${file.filePath.replace(/\\/g, '/')}" download target="_blank" class="emp-sidebar-logout" style="background: #eef2ff; color: #2563eb; text-decoration: none; padding: 8px 12px; font-size: 13px;">
                        <i class="fas fa-download"></i>
                    </a>
                </div>
            `).join('');
        } else {
            upList.innerHTML = '<p style="color: #64748b;">No files received yet.</p>';
        }
    } catch (err) {
        console.error("Failed to load uploads", err);
    }
}

// Handle Form Submission
document.getElementById('documentRequestForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const documentType = document.getElementById('requestDocType').value;
    const reason = document.getElementById('requestReason').value;

    try {
        const res = await fetch(`${API_BASE}/api/employees/requests`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ documentType, reason })
        });
        const data = await res.json();
        if (data.success) {
            alert('Request submitted successfully!');
            document.getElementById('documentRequestForm').reset();
            loadRequestsAndUploads(); // Reload the list
        }
    } catch (err) {
        console.error(err);
        alert('Failed to submit request.');
    }
});

// --- CHANGE PASSWORD LOGIC ---
document.getElementById('changePasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    try {
        const res = await fetch(`${API_BASE}/api/auth/change-password`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await res.json();
        if (data.success) {
            alert('Password successfully updated!');
            document.getElementById('changePasswordForm').reset();
        } else {
            alert(data.message || 'Failed to update password');
        }
    } catch (err) {
        console.error(err);
        alert('Server error while changing password.');
    }
});

// Call it on page load
if (window.location.pathname.includes("dashboard.html")) {
    loadRequestsAndUploads();
}