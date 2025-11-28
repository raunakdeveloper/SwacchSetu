import { transporter } from '../config/nodemailer.js';
import dotenv from 'dotenv';
dotenv.config();

/* =========================
   SEND MAIL FUNCTION
   ========================= */
const sendMail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `GRS System <${process.env.SMTP_TAGLINE}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
  }
};

/* =========================
   UNIVERSAL BASE TEMPLATE WITH LOGO
   ========================= */
const wrapTemplate = (content) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden;">

      <!-- HEADER (Gradient + Center Logo + Title) -->
      <div style="
        background: linear-gradient(to bottom right, #e0f2fe, #d1fae5);
        text-align: center;
        padding: 35px 20px;
      ">

        <!-- LOGO -->
        <img 
          src="${process.env.FRONTEND_URL}/logo.jpeg"
          alt="GRS Logo"
          style="
            width: 176px;
            object-fit: cover;
            margin-bottom: 10px;
          "
        />

        <!-- Titles -->
        <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #000;">
          Garbage Reporting System
        </h1>

        <p style="margin: 8px 0 0 0; font-size: 16px; color: #000;">
          A Digital Bridge for a Cleaner City
        </p>

        <p style="margin: 6px 0 0 0; font-size: 15px; color: #16A34A; font-weight: bold;">
          “Green City, Clean Future.”
        </p>
      </div>


      <!-- BODY -->
      <div style="padding: 25px 25px 30px; color: #000; font-size: 15px; line-height: 1.7;">
        ${content}
      </div>


      <!-- FOOTER -->
      <div style="
        background: linear-gradient(to right, #f0fdf4, #e0f2fe);
        padding: 14px;
        text-align: center;
        font-size: 12px;
        color: #065F46;
      ">
        This is an automated email from SwachhSetu (GRS). Please do not reply.
      </div>

    </div>
  `;
};

/* =========================
   BUTTON COMPONENT
   ========================= */
const button = (url, text) => `
  <div style="text-align:center; margin:25px 0;">
    <a href="${url}"
       style="background:#16A34A; padding:12px 24px; color:white; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">
      ${text}
    </a>
  </div>
`;

/* =========================
   1️⃣ REPORT SUBMITTED
   ========================= */
export const reportSubmitted = async (user, report) => {
  const link = `${process.env.FRONTEND_URL}/reports/${report._id}`;

  const html = wrapTemplate(`
    <h2 style="margin-bottom: 10px;">Report Submitted Successfully</h2>
    <p>Hi ${user.name}, your garbage report has been submitted successfully.</p>

    <div style="background:white; padding:15px; border-radius:8px; margin-top:10px;">
      <p><strong>Issue ID:</strong> ${report.issueId}</p>
      <p><strong>Title:</strong> ${report.title}</p>
      <p><strong>Location:</strong> ${report.location.address}</p>
    </div>

    ${button(link, "View Report")}
    <p>We will notify you when the report is reviewed.</p>
  `);

  await sendMail(user.email, `Report Submitted - Issue #${report.issueId}`, html);
};

/* =========================
   2️⃣ STATUS UPDATED
   ========================= */
export const reportStatusUpdated = async (user, report, newStatus) => {
  const statusText = {
    approved: 'Your report has been approved.',
    inprogress: 'Work has started on your report.',
    rejected: 'Your report has been rejected.',
    completed: 'Your reported issue has been resolved.',
  };

  const link = `${process.env.FRONTEND_URL}/reports/${report._id}`;

  const html = wrapTemplate(`
    <h2>Report Status Updated</h2>
    <p>Hi ${user.name},</p>
    <p>${statusText[newStatus] || "Your report status changed."}</p>

    <div style="background:white; padding:15px; border-radius:8px;">
      <p><strong>Issue ID:</strong> ${report.issueId}</p>
      <p><strong>New Status:</strong> ${newStatus}</p>
      <p><strong>Title:</strong> ${report.title}</p>
    </div>

    ${button(link, "Check Status")}
  `);

  await sendMail(user.email, `Status Update - Issue #${report.issueId}`, html);
};

/* =========================
   3️⃣ REPORT REJECTED
   ========================= */
export const reportRejected = async (user, report, reason) => {
  const link = `${process.env.FRONTEND_URL}/reports/${report._id}`;

  const html = wrapTemplate(`
    <h2>Report Rejected</h2>
    <p>Hi ${user.name}, unfortunately your report could not be accepted.</p>

    <div style="background:white; padding:15px; border-radius:8px;">
      <p><strong>Issue ID:</strong> ${report.issueId}</p>
      <p><strong>Reason:</strong> ${reason}</p>
    </div>

    ${button(link, "View Report")}
  `);

  await sendMail(user.email, `Report Rejected - Issue #${report.issueId}`, html);
};

/* =========================
   4️⃣ REPORT ASSIGNED TO WORKER
   ========================= */
export const reportAssignedToWorker = async (user, report, worker) => {
  const link = `${process.env.FRONTEND_URL}/reports/${report._id}`;

  const html = wrapTemplate(`
    <h2>Your Report Has Been Assigned</h2>
    <p>Hello ${user.name}, your report has been assigned to a cleaning worker.</p>

    <div style="background:white; padding:15px; border-radius:8px;">
      <p><strong>Worker:</strong> ${worker.name}</p>
      <p><strong>Issue ID:</strong> ${report.issueId}</p>
    </div>

    ${button(link, "View Report")}
  `);

  await sendMail(user.email, `Report Assigned - Issue #${report.issueId}`, html);
};

/* =========================
   5️⃣ NEW ASSIGNMENT TO WORKER
   ========================= */
export const newAssignmentToWorker = async (worker, report) => {
   const html = wrapTemplate(`
    <h2>New Work Assignment</h2>
    <p>Hello ${worker.name}, you have received a new cleaning assignment.</p>

    <div style="background:white; padding:15px; border-radius:8px;">
      <p><strong>Issue ID:</strong> ${report.issueId}</p>
      <p><strong>Title:</strong> ${report.title}</p>
      <p><strong>Location:</strong> ${report.location.address}</p>
    </div>
  `);

  await sendMail(worker.email, `New Assignment - Issue #${report.issueId}`, html);
};

/* =========================
   6️⃣ WORK IN PROGRESS
   ========================= */
export const reportInProgress = async (user, report) => {
  const link = `${process.env.FRONTEND_URL}/reports/${report._id}`;

  const html = wrapTemplate(`
    <h2>Work In Progress</h2>
    <p>Hi ${user.name}, work on your issue has officially started.</p>

    <div style="background:white; padding:15px; border-radius:8px;">
      <p><strong>Issue ID:</strong> ${report.issueId}</p>
      <p><strong>Title:</strong> ${report.title}</p>
    </div>

    ${button(link, "Track Progress")}
  `);

  await sendMail(user.email, `Work Started - Issue #${report.issueId}`, html);
};

/* =========================
   7️⃣ WORKER REJECTED TASK
   ========================= */
export const reportRejectedByWorker = async (user, report, reason) => {
  const link = `${process.env.FRONTEND_URL}/reports/${report._id}`;

  const html = wrapTemplate(`
    <h2>Worker Rejected the Task</h2>
    <p>Hi ${user.name}, the assigned worker has rejected your report.</p>

    <div style="background:white; padding:15px; border-radius:8px;">
      <p><strong>Issue ID:</strong> ${report.issueId}</p>
      <p><strong>Reason:</strong> ${reason}</p>
    </div>

    ${button(link, "View Report")}
  `);

  await sendMail(user.email, `Worker Rejected - Issue #${report.issueId}`, html);
};

/* =========================
   8️⃣ REPORT COMPLETED
   ========================= */
export const reportCompleted = async (user, report) => {
  const link = `${process.env.FRONTEND_URL}/reports/${report._id}`;

  const html = wrapTemplate(`
    <h2>Issue Resolved</h2>
    <p>Hi ${user.name}, your reported issue has been successfully resolved.</p>

    <div style="background:white; padding:15px; border-radius:8px;">
      <p><strong>Issue ID:</strong> ${report.issueId}</p>
      <p><strong>Title:</strong> ${report.title}</p>
    </div>

    ${button(link, "View Details")}
  `);

  await sendMail(user.email, `Issue Resolved - Issue #${report.issueId}`, html);
};

/* =========================
   📢 NOTICE EMAILS
   ========================= */
export const sendPublicNoticeEmails = async (users, notice, frontendUrl) => {
  const url = `${frontendUrl || process.env.FRONTEND_URL}/notices`;

  const htmlContent = wrapTemplate(`
    <h2>New Public Notice</h2>
    <p>${notice.title}</p>
    <p>${notice.description || ""}</p>
    ${button(url, "View Notice")}
  `);

  await Promise.all(
    users.map(user => sendMail(user.email, `Notice: ${notice.title}`, htmlContent))
  );
};

export const sendWorkerNoticeEmails = async (workers, notice, frontendUrl) => {
  const url = `${frontendUrl || process.env.FRONTEND_URL}/dashboard/worker/notices`;

  const htmlContent = wrapTemplate(`
    <h2>New Worker Notice</h2>
    <p>${notice.title}</p>
    <p>${notice.description || ""}</p>
    ${button(url, "View Notice")}
  `);

  await Promise.all(
    workers.map(worker => sendMail(worker.email, `Notice: ${notice.title}`, htmlContent))
  );
};
