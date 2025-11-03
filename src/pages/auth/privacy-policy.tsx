"use client";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Privacy Policy</h1>

      <p className="mb-4">
        This dashboard is an internal system used to manage and analyze Nairobi air quality data.
        Access is restricted to authorized users only. We prioritize the security and privacy of
        all system users and the data processed within the system.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">1. Information We Collect</h2>
      <p className="mb-4">
        We collect user information necessary for system access and accountability, including:
        name, email, assigned role, login records, and system usage logs.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">2. Purpose of Data Collection</h2>
      <p className="mb-4">
        Data is collected to manage user access, ensure platform security, monitor system activity,
        and support operational continuity and performance improvements.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">3. Role-Based Access</h2>
      <p className="mb-4">
        This dashboard operates with two user roles:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Researcher</strong>: Can view analytics, reports and approved datasets.</li>
        <li><strong>Admin</strong>: Manages system settings, users, roles and full dataset access.</li>
      </ul>
      <p className="mb-4">
        Users may only access features permitted under their assigned role.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">4. Logging & Monitoring</h2>
      <p className="mb-4">
        All actions such as login events, data exports, and system changes are logged for security,
        compliance and audit purposes.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">5. Data Sharing</h2>
      <p className="mb-4">
        User information and system logs are not shared outside the organization except when required
        by law or to investigate cybersecurity incidents.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">6. Data Security</h2>
      <p className="mb-4">
        The dashboard uses authentication, encryption and monitoring controls. Users are required to
        protect their login credentials and avoid accessing the platform via insecure networks.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">7. Legal Compliance</h2>
      <p className="mb-4">
        Data handling complies with the <strong>Kenya Data Protection Act, 2019</strong> and relevant
        ICT regulations. Users may request correction of their profile information via system admins.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">8. Contact</h2>
      <p>
        For privacy-related questions, contact:{" "}
        <span className="font-semibold">environment@nairobi.go.ke</span>
      </p>
    </div>
  );
};

export default PrivacyPolicy;
