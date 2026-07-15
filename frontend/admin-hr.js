document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch('http://localhost:5000/api/admin/hr-records', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (json.success) {
            const isInternPage = window.location.pathname.includes('interns.html');
            
            // Pick the correct array based on which page the admin is viewing
            const targetData = isInternPage ? json.data.interns : json.data.employees;
            
            // Store globally so the View Modal can access it later
            window.hrData = targetData; 

            // 1. Update Top Stats Cards
            const statValues = document.querySelectorAll('.stat-value');
            if(statValues.length >= 2) {
                statValues[0].innerText = targetData.length; // Total count
                statValues[1].innerText = targetData.filter(r => r.status.toLowerCase() === 'active').length; // Active count
            }

            // 2. Update the Table dynamically
            const tbody = document.querySelector('.bookings-table tbody');
            if (tbody) {
                if (!targetData || targetData.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No records found in database.</td></tr>';
                    return;
                }

                tbody.innerHTML = targetData.map(r => {
                    // Handle column differences between Employee and Intern tables
                    const id = isInternPage ? r.intern_id : r.employee_id;
                    const role = isInternPage ? r.role : r.designation;
                    const badgeClass = r.status.toLowerCase() === 'active' ? 'badge-completed' : 'badge-pending';

                    return `
                        <tr>
                            <td class="booking-id">${id}</td>
                            <td class="client-info">
                                <strong>${r.name}</strong>
                                <span>${r.email}</span>
                            </td>
                            <td>${r.department}</td>
                            <td>${role}</td>
                            <td>${new Date(r.joining_date).toLocaleDateString()}</td>
                            <td>
                                <span class="badge badge-status ${badgeClass}">
                                    ${r.status}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="icon-btn" onclick="viewRecord('${r.id}', '${isInternPage ? 'intern' : 'employee'}')"><i class="fas fa-eye"></i></button>
                                    <button class="icon-btn"><i class="fas fa-edit"></i></button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }
    } catch (error) {
        console.error("Failed to load HR records:", error);
    }
});

// 3. Logic to populate the "View Details" Modal dynamically
window.viewRecord = (dbId, type) => {
    // Find the specific record from the data we saved earlier
    const record = window.hrData.find(r => r.id == dbId);
    if(!record) return;

    if (type === 'employee') {
        document.querySelector('#viewEmployeeModal h3').innerText = `Employee Details - ${record.employee_id}`;
        
        // Grab all the <p> tags in the modal and inject the database data
        const pTags = document.querySelectorAll('#viewEmployeeModal .info-group p');
        pTags[0].innerText = record.name;
        pTags[1].innerText = record.email;
        pTags[2].innerText = record.department;
        pTags[3].innerText = record.designation;
        pTags[4].innerText = new Date(record.joining_date).toLocaleDateString();
        pTags[5].innerText = `₹${Number(record.salary).toLocaleString('en-IN')} / month`;
        
        openModal('viewEmployeeModal');
    } else {
        document.querySelector('#viewInternModal h3').innerText = `Intern Details - ${record.intern_id}`;
        
        // Grab all the <p> tags in the modal and inject the database data
        const pTags = document.querySelectorAll('#viewInternModal .info-group p');
        pTags[0].innerText = record.name;
        pTags[1].innerText = record.email;
        pTags[2].innerText = record.department;
        pTags[3].innerText = record.role;
        pTags[4].innerText = new Date(record.joining_date).toLocaleDateString();
        pTags[5].innerText = `₹${Number(record.stipend).toLocaleString('en-IN')} / month`;
        
        openModal('viewInternModal');
    }
};

// Add Employee logic
const addEmployeeBtn = document.querySelector('#addEmployeeModal .btn-primary');
if (addEmployeeBtn) {
    addEmployeeBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const modal = document.getElementById('addEmployeeModal');
        const inputs = modal.querySelectorAll('input, select');
        
        // Notice we are no longer sending inputs[1].value (email) because the backend generates it!
        const payload = {
            name: inputs[0].value,
            phone: inputs[2].value,
            joining_date: inputs[3].value,
            department: inputs[4].value,
            designation: inputs[5].value,
            salary: inputs[6].value,
            status: inputs[7].value
        };

        if (!payload.name) return alert('Name is required.');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/admin/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (data.success) {
                // Show the Admin the generated credentials!
                alert(`Employee Added Successfully!\n\nPlease save these login details for the employee:\nEmail: ${data.credentials.email}\nPassword: ${data.credentials.password}`);
                closeModal('addEmployeeModal');
                location.reload(); 
            } else { alert('Error: ' + data.message); }
        } catch (err) { alert('Server error while adding employee.'); }
    });
}

// Add Intern logic
const addInternBtn = document.querySelector('#addInternModal .btn-primary');
if (addInternBtn) {
    addInternBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const modal = document.getElementById('addInternModal');
        const inputs = modal.querySelectorAll('input, select');
        
        // Notice we are no longer sending inputs[1].value (email) because the backend generates it!
        const payload = {
            name: inputs[0].value,
            phone: inputs[2].value,
            joining_date: inputs[3].value,
            department: inputs[4].value,
            role: inputs[5].value,       // Interns have a role instead of designation
            stipend: inputs[6].value,    // Interns have stipend instead of salary
            status: inputs[7].value
        };

        if (!payload.name) return alert('Name is required.');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/admin/interns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (data.success) {
                // Show the Admin the generated credentials!
                alert(`Intern Added Successfully!\n\nPlease save these login details for the intern:\nEmail: ${data.credentials.email}\nPassword: ${data.credentials.password}`);
                closeModal('addInternModal');
                location.reload(); 
            } else { alert('Error: ' + data.message); }
        } catch (err) { alert('Server error while adding intern.'); }
    });
}