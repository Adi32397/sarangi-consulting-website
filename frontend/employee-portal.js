const API_BASE = "http://localhost:5000";

// Only run this if we are on the employee dashboard
if (window.location.pathname.includes("employee-dashboard.html")) {
    // 1. Check for the standard unified 'token'
    const token = localStorage.getItem("token");

    if (!token) {
        // Redirect to the unified login page
        window.location.href = "login.html";
    }

    async function loadEmployeeProfile() {
        try {
            // Note: Make sure your backend allows the unified JWT token to access this route
            const res = await fetch(`${API_BASE}/api/employees/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
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

            document.querySelector(".emp-top-avatar").innerText =
                emp.name.split(" ").map(n => n[0]).join("").toUpperCase();

            document.getElementById("empId").innerText = emp.employee_id;
            document.getElementById("empDesignation").innerText = emp.designation;
            document.getElementById("empDepartment").innerText = emp.department;
            document.getElementById("empJoiningDate").innerText = emp.joining_date;

            // Optional: Save specific employee data if needed for documents
            localStorage.setItem("employeeData", JSON.stringify(emp));

        } catch (error) {
            console.error(error);
            alert("Could not load employee profile");
        }
    }

    loadEmployeeProfile();

    // Logout button logic
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("employeeData");
        window.location.href = "login.html";
    });
}

// --- Document Generation Logic ---

function letterHeader() {
  return `
    <div class="letter-head">
      <h1>Sarangi Consulting</h1>
      <p>Growth & Management Consulting Firm</p>
    </div>
  `;
}

async function openDocument(type, shouldDownload = false) {
    // 2. Use the unified token for document requests too
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/employees/documents/${type}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            alert(data.message || "Could not load document");
            return;
        }

        const emp = data.employee;

        renderDocument(type, emp);

        if (shouldDownload) {
            setTimeout(() => {
                downloadDocument();
            }, 300);
        }

    } catch (error) {
        console.error(error);
        alert("Could not connect to employee document server.");
    }
}

function renderDocument(type, emp) {
    const preview = document.getElementById("documentPreview");
    const paper = document.getElementById("letterPaper");
    const title = document.getElementById("docTitle");

    preview.style.display = "block";

    let html = "";

    if (type === "offer") {
        title.innerText = "Offer Letter";
        html = `
            ${letterHeader()}
            <h2>Offer Letter</h2>
            <p>Date: ${new Date().toLocaleDateString("en-IN")}</p>

            <p>Dear <strong>${emp.name}</strong>,</p>

            <p>
                We are pleased to offer you the position of
                <strong>${emp.designation}</strong> at Sarangi Consulting.
            </p>

            <p>
                Your joining date will be <strong>${emp.joining_date}</strong>.
                Your monthly salary will be <strong>₹${Number(emp.salary).toLocaleString("en-IN")}</strong>.
            </p>

            <p>
                We welcome you to Sarangi Consulting and look forward to your contribution.
            </p>

            <br><br>
            <p><strong>Authorized Signatory</strong><br>Sarangi Consulting</p>
        `;
    }

    if (type === "salary") {
        title.innerText = "Salary Slip";
        html = `
            ${letterHeader()}
            <h2>Salary Slip</h2>

            <p><strong>Employee Name:</strong> ${emp.name}</p>
            <p><strong>Employee ID:</strong> ${emp.employee_id}</p>
            <p><strong>Designation:</strong> ${emp.designation}</p>
            <p><strong>Department:</strong> ${emp.department}</p>

            <hr>

            <p><strong>Basic Salary:</strong> ₹${Number(emp.salary).toLocaleString("en-IN")}</p>
            <p><strong>Deductions:</strong> ₹0</p>
            <p><strong>Net Pay:</strong> ₹${Number(emp.salary).toLocaleString("en-IN")}</p>
        `;
    }

    if (type === "experience") {
        title.innerText = "Experience Letter";
        html = `
            ${letterHeader()}
            <h2>Experience Letter</h2>

            <p>
                This is to certify that <strong>${emp.name}</strong> worked with
                Sarangi Consulting as <strong>${emp.designation}</strong>.
            </p>

            <p>
                During the tenure, the employee contributed to consulting,
                operations and project-related responsibilities.
            </p>

            <p>
                We appreciate their contribution and wish them success in future endeavors.
            </p>

            <br><br>
            <p><strong>Authorized Signatory</strong><br>Sarangi Consulting</p>
        `;
    }

    if (type === "relieving") {
        title.innerText = "Relieving Letter";
        html = `
            ${letterHeader()}
            <h2>Relieving Letter</h2>

            <p>Dear <strong>${emp.name}</strong>,</p>

            <p>
                This is to confirm that you have been relieved from your duties at
                Sarangi Consulting after completion of your assigned responsibilities.
            </p>

            <p>
                We appreciate your contribution and wish you the best for your future.
            </p>

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