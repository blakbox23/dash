
import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Privacy Policy</h1>

      <p className="mb-4">
        The <strong>Nairobi Air Quality Portal</strong> is operated by the County Government of Nairobi 
        to share environmental data and promote public health awareness. We are committed to protecting 
        the privacy of our users and ensuring responsible data management.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">1. Information We Collect</h2>
      <p className="mb-4">
        The portal primarily collects non-personal information such as device type, browser version, 
        and usage analytics to improve system performance. Any personal details voluntarily submitted 
        (e.g., via contact forms) are used solely for official communication.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">2. Use of Information</h2>
      <p className="mb-4">
        Data collected is used to enhance user experience, improve service reliability, 
        and generate insights for urban environmental planning.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">3. Data Sharing</h2>
      <p className="mb-4">
        The County Government may share anonymized environmental data with accredited research 
        institutions, health agencies, and policy partners. No personal user data is sold or shared 
        for commercial use.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">4. Cookies</h2>
      <p className="mb-4">
        Our platform may use cookies to remember user preferences or enhance site analytics. 
        You can disable cookies in your browser settings if desired.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">5. Data Security</h2>
      <p className="mb-4">
        The County employs reasonable administrative and technical safeguards to protect data integrity. 
        However, no system is 100% secure, and users should exercise caution when sharing information online.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">6. Data Retention</h2>
      <p className="mb-4">
        Personal information collected through the portal is retained only as long as necessary 
        to fulfill the purpose for which it was collected or as required by law.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">7. Legal Basis for Processing</h2>
      <p className="mb-4">
        All collection and use of personal information on this portal is conducted in compliance 
        with the <strong>Kenya Data Protection Act, 2019</strong>, and related regulations. 
        Users have the right to access, correct, or request deletion of their personal information 
        as provided under the Act.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">8. Your Rights</h2>
      <p className="mb-4">
        Users may request access to their personal data, correction of inaccurate information, 
        or deletion of their data where applicable. Such requests can be made by contacting the 
        <strong> Department of Environment</strong> at 
        <a href="mailto:environment@nairobi.go.ke" className="text-green-700 ml-1 hover:underline">
          environment@nairobi.go.ke
        </a>.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">9. Policy Updates</h2>
      <p className="mb-4">
        We may revise this Privacy Policy periodically. Updates will be posted on this page with a new effective date.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">10. Contact</h2>
      <p>
        For questions about this Privacy Policy, please contact:
        <br />
        <strong>Department of Environment, Nairobi County Government</strong>
        <br />
        Email: <strong>environment@nairobi.go.ke</strong>
      </p>
    </div>
  );
};

export default PrivacyPolicy;
