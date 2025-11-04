"use client";

const TermsOfService = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Terms of Service</h1>

      <p className="mb-4">
        This dashboard is an internal platform used to manage air quality data and related analytics.
        By accessing this system, you agree to comply with these terms. Unauthorized use is prohibited.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">1. Authorized Use Only</h2>
      <p className="mb-4">
        Access is strictly limited to approved users. Sharing login credentials, attempting unauthorized
        access, or bypassing security controls is forbidden and may result in disciplinary or legal action.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">2. Role Definitions</h2>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Researcher</strong>: Allowed to view analytics, reports and authorized datasets.</li>
        <li><strong>Admin</strong>: Full access including user management, system configuration and all data.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">3. Responsibilities</h2>
      <p className="mb-4">
        Users must handle data responsibly, protect credentials, and act within assigned permissions.
        Admin users hold additional responsibility for safeguarding system integrity.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">4. Data Integrity</h2>
      <p className="mb-4">
        Users may not alter, misrepresent or misuse system data. Suspicious activity must be reported
        immediately to system administrators.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">5. Monitoring & Audits</h2>
      <p className="mb-4">
        System activity including logins, data access and configuration changes may be logged and reviewed
        to ensure compliance and security.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">6. Role Changes & Access Termination</h2>
      <p className="mb-4">
        Role modifications are performed only by authorized administrators. Access may be revoked for
        non-compliance, security risks or organizational changes.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">7. Liability</h2>
      <p className="mb-4">
        The system is provided for official use. The organization is not responsible for losses arising
        from misuse or unauthorized access committed by the user.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">8. Legal Framework</h2>
      <p className="mb-4">
        These terms are governed by Kenyan law. Violations may lead to disciplinary action and legal
        consequences under the Computer Misuse and Cybercrimes Act and applicable data laws.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">9. Contact</h2>
      <p>
        For support or compliance questions, contact:{" "}
        <span className="font-semibold">environment@nairobi.go.ke</span>
      </p>
    </div>
  );
};

export default TermsOfService;
