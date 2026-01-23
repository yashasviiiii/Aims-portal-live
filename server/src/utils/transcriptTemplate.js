export const transcriptHTML = ({ student, records, cgpa }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      color: #1f2937;
    }

    .header {
      display: flex;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }

    .logo {
      width: 70px;
    }

    .title {
      flex: 1;
      text-align: center;
    }

    .title h1 {
      margin: 0;
      font-size: 20px;
    }

    .title p {
      margin: 4px 0 0;
      font-size: 12px;
      color: #475569;
    }

    .card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      font-size: 13px;
    }

    .label {
      color: #6b7280;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: bold;
    }

    .cgpa {
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      border-radius: 10px;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .cgpa-value {
      font-size: 36px;
      font-weight: 800;
      color: #4338ca;
    }

    .session {
      margin-bottom: 24px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    .session-header {
      background: #0f172a;
      color: white;
      padding: 10px 14px;
      font-size: 13px;
      display: flex;
      justify-content: space-between;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    th, td {
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
      text-align: left;
    }

    th {
      background: #f8fafc;
      color: #475569;
    }

    .grade {
      font-weight: bold;
      color: #4338ca;
    }
  </style>
</head>

<body>

  <!-- HEADER -->
  <div class="header">
    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMR21KHZ2caqEURBHcmT_uT21leMPtaB0j7w&s" class="logo" />
    <div class="title">
      <h1>Indian Institute of Technology Ropar</h1>
      <p>Official Academic Transcript</p>
    </div>
  </div>

  <!-- STUDENT INFO -->
  <div class="card">
    <div class="grid">
      <div>
        <div class="label">First Name</div>
        ${student.firstName}
      </div>
      <div>
        <div class="label">Last Name</div>
        ${student.lastName}
      </div>
      <div>
        <div class="label">Roll No</div>
        ${student.email.split("@")[0]}
      </div>
      <div>
        <div class="label">Department</div>
        ${student.department}
      </div>
      <div style="grid-column: span 2">
        <div class="label">Email</div>
        ${student.email}
      </div>
    </div>
  </div>

  <!-- CGPA -->
  <div class="cgpa">
    <div>
      <strong>Cumulative Grade Point Average</strong><br />
      <small>Calculated based on all completed sessions</small>
    </div>
    <div class="cgpa-value"> ${cgpa !== null ? Number(cgpa).toFixed(2) : "N/A"}
</div>
  </div>

  <!-- SESSIONS -->
  ${records.map(session => `
    <div class="session">
      <div class="session-header">
        <span>Academic Session: ${session.session}</span>
        <span>Credits: ${session.totalCredits} | SGPA: ${session.sgpa?.toFixed(2) ?? "NA"}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Course</th>
            <th>Status</th>
            <th>Category</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          ${session.courses.map((c, i) => `
            <tr>
              <td>${i + 1}</td>
            <td>${c.courseCode} | ${c.courseName}</td>
            <td>Approved</td>
            <td>Core</td>
            <td class="grade">${c.grade ?? "NA"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `).join("")}

</body>
</html>
`;
