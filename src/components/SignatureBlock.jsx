import React from "react";

/**
 * Reusable signature block component for contracts
 * @param {Object} props
 * @param {string} props.title - Header text (e.g., "FOR THE SERVICE PROVIDER", "FOR THE CLIENT")
 * @param {string} props.companyName - Company/business name to display
 * @param {string} props.personName - Individual's name
 * @param {string} props.signatureData - Base64 signature image data (optional)
 * @param {string} props.signatureAlt - Alt text for signature image
 * @param {string} props.date - Formatted date string
 * @param {string} props.className - Additional CSS classes for the container
 * @param {boolean} props.useInlineStyles - Use inline styles instead of Tailwind classes (for ContractDocument)
 * @param {Object} props.style - Additional inline styles for the container
 */
const SignatureBlock = ({
  title,
  companyName,
  personName,
  signatureData,
  signatureAlt = "Signature",
  date,
  className = "",
  useInlineStyles = false,
  style = {},
}) => {
  // Format name with company: "Person Name of Company Name"
  const formattedName = personName
    ? `${personName}${companyName ? ` of ${companyName}` : ""}`
    : "";

  // Inline styles for ContractDocument.jsx
  if (useInlineStyles) {
    return (
      <div style={style}>
        <p style={{ fontWeight: 'bold', marginBottom: '16px' }}>{title}</p>
        <p>{companyName}</p>
        <p style={{ marginTop: '24px' }}>Signature: _________________________</p>
        <p style={{ marginTop: '16px' }}>Name: {formattedName}</p>
        <p style={{ marginTop: '16px' }}>Date: {date}</p>
      </div>
    );
  }

  // Tailwind classes for HostingContract.jsx and WebDesignContract.jsx
  return (
    <div className={className}>
      <p className="contract-p-bold mb-4">{title}</p>
      <p className="contract-p">{companyName}</p>
      {signatureData ? (
        <div className="mt-6">
          <p className="contract-p mb-2">Signature:</p>
          <div className="border-b-2 border-gray-400 pb-2 inline-block">
            <img
              src={signatureData}
              alt={signatureAlt}
              className="h-16 max-w-[200px] object-contain"
            />
          </div>
        </div>
      ) : (
        <p className="contract-p mt-6">Signature: _________________________</p>
      )}
      <p className="contract-p mt-4">Name: {formattedName}</p>
      <p className="contract-p mt-4">Date: {date}</p>
    </div>
  );
};

export default SignatureBlock;
