import React from "react";
import { useFormContext } from "../contexts/FormContext";
import { generateDocument } from "../utils/documentGenerator";
import { getTodayDate, formatDateToFields, getDateMonthsFromNow } from "../utils/dateUtils";
import SignatureBlock from "../components/SignatureBlock";
import {
  ContractField,
  ContractCheckboxList,
  ContractSection
} from "../components/ContractFields";

const currentDate = formatDateToFields(getTodayDate());

// Helper component: Shows textarea in admin view, static paragraph in client view (hides if empty in client view)
const ContractTextarea = ({ value, onChange, placeholder, className, isClientView }) => {
  if (isClientView) {
    if (!value) return null;
    return (
      <p className="contract-p bg-gray-50 p-3 rounded border border-gray-200">
        {value}
      </p>
    );
  }
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
};

// Helper: Format date for display
const formatDisplayDate = (dateString) => {
  if (!dateString) return "___________";
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Hosting Plan Selector - Interactive in client view, static display in admin
const HostingPlanSelector = () => {
  const { formData, selectedTier, onTierSelect, onShowTierDetails, isClientView } = useFormContext();

  // Use selectedTier from context if available (client view), otherwise fall back to formData
  const currentTier = isClientView ? selectedTier : formData.selectedHostingTier;

  const plans = [
    { id: 'hosting-only', name: 'Hosting Only', price: '$50/month', desc: 'Server hosting, SSL, basic uptime monitoring' },
    { id: 'hosting-basic', name: 'Basic Maintenance', price: '$80/month', desc: 'Hosting + 3 content updates/week' },
    { id: 'hosting-priority', name: 'Priority Maintenance', price: '$100/month', desc: 'Hosting + 15 content updates/week, priority support', recommended: true }
  ];

  // In client view, render interactive radio buttons
  if (isClientView) {
    return (
      <div className="ml-6 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 pointer-events-auto">
        <p className="text-sm text-gray-600 mb-3">
          <strong>Select Your Hosting Plan:</strong>
        </p>
        <div className="space-y-3">
          {plans.map(plan => (
            <label key={plan.id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="hostingTier"
                checked={currentTier === plan.id}
                onChange={() => onTierSelect?.(plan.id)}
                className="w-4 h-4 text-blue-600"
              />
              <span className={`flex-1 ${currentTier === plan.id ? 'font-semibold text-blue-700' : 'text-gray-700'}`}>
                <strong>{plan.name}:</strong> {plan.price}
                {plan.recommended && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Recommended</span>
                )}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onShowTierDetails?.(plan.id);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                See details
              </button>
            </label>
          ))}
        </div>
      </div>
    );
  }

  // In admin view, render static display
  return (
    <div className="ml-6 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-600 mb-3">
        <strong>Available Hosting Plans:</strong>
      </p>
      <ul className="text-sm text-gray-700 space-y-2">
        {plans.map(plan => (
          <li key={plan.id} className={currentTier === plan.id ? 'font-semibold text-blue-700' : ''}>
            • <strong>{plan.name}:</strong> {plan.price} - {plan.desc}
            {currentTier === plan.id && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Selected</span>
            )}
            {plan.recommended && !currentTier && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Recommended</span>
            )}
          </li>
        ))}
      </ul>
      {!currentTier && (
        <p className="text-xs text-gray-500 italic mt-3">
          The client will choose their plan when signing the contract.
        </p>
      )}
    </div>
  );
};

const WebDesignSidebarForm = ({ page = 'provider' }) => {
  const { formData, updateField } = useFormContext();

  if (page === 'provider') {
    return (
      <div>
        <h3 className="sidebar-section-title">Developer Information</h3>
        <div className="sidebar-section">
          <div>
            <label className="form-label">Business Name</label>
            <input
              type="text"
              value={formData.developerCompany}
              onChange={(e) => updateField("developerCompany", e.target.value)}
              className="form-input"
              placeholder="Your Web Services LLC"
            />
          </div>
          <div>
            <label className="form-label">Location</label>
            <input
              type="text"
              value={formData.developerLocation}
              onChange={(e) => updateField("developerLocation", e.target.value)}
              className="form-input"
              placeholder="City, State, USA"
            />
          </div>
          <div>
            <label className="form-label">Your Name (for signature)</label>
            <input
              type="text"
              value={formData.developerName}
              onChange={(e) => updateField("developerName", e.target.value)}
              className="form-input"
              placeholder="John Developer"
            />
          </div>
        </div>

        <div className="section-divider mt-6">
          <h3 className="sidebar-section-title">Project Details</h3>
          <div className="sidebar-section">
            <div>
              <label className="form-label">Project Title</label>
              <input
                type="text"
                value={formData.projectTitle}
                onChange={(e) => updateField("projectTitle", e.target.value)}
                className="form-input"
                placeholder="Company Website Redesign"
              />
            </div>
            <div>
              <label className="form-label">Total Project Fee ($)</label>
              <input
                type="number"
                value={formData.totalFee}
                onChange={(e) => updateField("totalFee", e.target.value)}
                className="form-input"
                placeholder="2500"
              />
            </div>
            <div>
              <label className="form-label">Deposit Amount ($)</label>
              <input
                type="number"
                value={formData.depositAmount}
                onChange={(e) => updateField("depositAmount", e.target.value)}
                className="form-input"
                placeholder="1250"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Client page
  return (
    <div>
      <h3 className="sidebar-section-title">Client Information</h3>
      <div className="sidebar-section">
        <div>
          <label className="form-label">Client/Company Name</label>
          <input
            type="text"
            value={formData.clientCompanyName}
            onChange={(e) => updateField("clientCompanyName", e.target.value)}
            className="form-input"
            placeholder="Client Business Inc"
          />
        </div>
        <div>
          <label className="form-label">Client Contact Name</label>
          <input
            type="text"
            value={formData.clientName}
            onChange={(e) => updateField("clientName", e.target.value)}
            className="form-input"
            placeholder="Jane Client"
          />
        </div>
        <div>
          <label className="form-label">Client Address</label>
          <input
            type="text"
            value={formData.clientAddress}
            onChange={(e) => updateField("clientAddress", e.target.value)}
            className="form-input"
            placeholder="456 Business Ave, City, State, ZIP"
          />
        </div>
        <div>
          <label className="form-label">Client Email</label>
          <input
            type="email"
            value={formData.clientEmail}
            onChange={(e) => updateField("clientEmail", e.target.value)}
            className="form-input"
            placeholder="client@example.com"
          />
        </div>
        <div>
          <label className="form-label">Client Phone</label>
          <input
            type="tel"
            value={formData.clientPhone}
            onChange={(e) => updateField("clientPhone", e.target.value)}
            className="form-input"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
    </div>
  );
};

const WebDesignDocument = () => {
  const { formData, updateField, isClientView, signatureData, typedName } = useFormContext();

  const toggleDesignService = (index) => {
    const current = formData.designServices || [];
    const newServices = [...current];
    newServices[index] = !newServices[index];
    updateField("designServices", newServices);
  };

  const toggleDevService = (index) => {
    const current = formData.devServices || [];
    const newServices = [...current];
    newServices[index] = !newServices[index];
    updateField("devServices", newServices);
  };

  const toggleFunctionality = (index) => {
    const current = formData.functionality || [];
    const newServices = [...current];
    newServices[index] = !newServices[index];
    updateField("functionality", newServices);
  };

  const toggleClientContent = (index) => {
    const current = formData.clientContent || [];
    const newServices = [...current];
    newServices[index] = !newServices[index];
    updateField("clientContent", newServices);
  };

  const toggleDeliverable = (index) => {
    const current = formData.deliverables || [];
    const newServices = [...current];
    newServices[index] = !newServices[index];
    updateField("deliverables", newServices);
  };

  return (
    <div className="contract-doc">
      <h1 className="contract-h1">WEBSITE DESIGN AND DEVELOPMENT AGREEMENT</h1>

      <p className="contract-p">
        This Website Design and Development Agreement (the "Agreement") is
        entered into as of this{" "}
        <ContractField
          value={formData.day}
          onChange={(e) => updateField("day", e.target.value)}
          placeholder="__"
          className="contract-input-short"
          isClientView={isClientView}
          hideIfEmpty={false}
        />{" "}
        day of{" "}
        <ContractField
          value={formData.month}
          onChange={(e) => updateField("month", e.target.value)}
          placeholder="________"
          className="contract-input-medium"
          isClientView={isClientView}
          hideIfEmpty={false}
        />
        ,{" "}
        <ContractField
          value={formData.year}
          onChange={(e) => updateField("year", e.target.value)}
          placeholder="____"
          className="contract-input w-[50px]"
          isClientView={isClientView}
          hideIfEmpty={false}
        />{" "}
        {!isClientView && (
          <span className="text-[10pt] text-gray-600 ml-2">
            (or select:
            <input
              type="date"
              defaultValue={getTodayDate()}
              onChange={(e) => {
                const dateFields = formatDateToFields(e.target.value);
                updateField("day", dateFields.day);
                updateField("month", dateFields.month);
                updateField("year", dateFields.year);
              }}
              className="contract-date-picker"
            />
            )
          </span>
        )}{" "}
        (the "Effective Date"), by and between:
      </p>

      <p className="contract-p">
        <ContractField
          value={formData.developerCompany}
          onChange={(e) => updateField("developerCompany", e.target.value)}
          placeholder="Developer Business Name"
          className="contract-input-inline contract-input-long"
          isClientView={isClientView}
          hideIfEmpty={false}
        />
        , a web development and marketing business with its principal place of
        business located at{" "}
        <ContractField
          value={formData.developerLocation}
          onChange={(e) => updateField("developerLocation", e.target.value)}
          placeholder="City, State, USA"
          className="contract-input-inline contract-input-long"
          isClientView={isClientView}
          hideIfEmpty={false}
        />{" "}
        (hereinafter referred to as the "Developer")
      </p>

      <p className="contract-p-center">-And-</p>

      <p className="contract-p">
        <ContractField
          value={formData.clientCompanyName}
          onChange={(e) => updateField("clientCompanyName", e.target.value)}
          placeholder="Client Company Name"
          className="contract-input-inline contract-input-long"
          isClientView={isClientView}
          hideIfEmpty={false}
        />
        , an individual or business entity with its principal address at{" "}
        <ContractField
          value={formData.clientAddress}
          onChange={(e) => updateField("clientAddress", e.target.value)}
          placeholder="Client Address"
          className="contract-input-inline contract-input-long"
          isClientView={isClientView}
          hideIfEmpty={false}
        />
        , E-mail:{" "}
        <ContractField
          type="email"
          value={formData.clientEmail}
          onChange={(e) => updateField("clientEmail", e.target.value)}
          placeholder="client@example.com"
          className="contract-input-inline w-[200px]"
          isClientView={isClientView}
          hideIfEmpty={false}
        />
        , Phone Number:{" "}
        <ContractField
          type="tel"
          value={formData.clientPhone}
          onChange={(e) => updateField("clientPhone", e.target.value)}
          placeholder="(555) 123-4567"
          className="contract-input-inline w-[140px]"
          isClientView={isClientView}
          hideIfEmpty={false}
        />{" "}
        (hereinafter referred to as the "Client")
      </p>

      <p className="contract-p">
        (Together, the Developer and the Client may be referred to as the
        "Parties" and individually as a "Party")
      </p>

      <h2 className="contract-h2">BACKGROUND</h2>

      <p className="contract-p">
        WHEREAS, the Developer is engaged in the business of providing website
        design and development services, including the creation, customization,
        and deployment of websites for a variety of clients across different
        industries, and possesses the expertise, tools, and resources necessary
        to design, develop, and implement professional digital platforms
        tailored to each client's specific needs and preferences;
      </p>

      <p className="contract-p">
        WHEREAS, the Client desires to engage the Developer to perform certain
        website design and development services, as more fully described in this
        Agreement, with the intention of launching a customized website to
        support the Client's business or personal objectives, and acknowledges
        the Developer's expertise and authority in carrying out such work;
      </p>

      <p className="contract-p">
        WHEREAS, the Parties intend to set forth the terms and conditions under
        which the Developer shall perform the services, and the Client shall
        compensate the Developer, including limitations on liability, ownership
        rights, and other key provisions that protect the interests of both
        Parties and promote a clear understanding of their respective
        responsibilities.
      </p>

      <p className="contract-p">
        NOW, THEREFORE, in consideration of the mutual promises and covenants
        set forth herein, and intending to be legally bound, the Parties agree
        to the terms and conditions contained in this Agreement.
      </p>

      <h2 className="contract-h2">1. DEFINITIONS</h2>

      <p className="contract-p">
        For the purposes of this Agreement, the following terms shall have the
        meanings assigned to them below. Each defined term shall apply
        throughout this Agreement in the context in which it appears.
      </p>

      <p className="contract-p">
        <strong>"Deliverables"</strong> Means the completed website, files,
        graphics, scripts, and other materials that the Developer agrees to
        provide to the Client as outlined in the Scope of Work described in
        Exhibit A.
      </p>

      <p className="contract-p">
        <strong>"Final Website"</strong> Means the complete, functional, and
        Client-approved version of the website delivered by the Developer upon
        conclusion of the design and development phase, subject to any revisions
        as specified in this Agreement.
      </p>

      <p className="contract-p">
        <strong>"Hosting Platform"</strong> Means the third-party or
        Developer-managed server environment where the Final Website may be
        uploaded for public or private access via the internet.
      </p>

      <p className="contract-p">
        <strong>"Scope of Work"</strong> Means the detailed description of
        services, features, number of pages, functionalities, design elements,
        and specifications that the Developer agrees to deliver, as set forth in
        Exhibit A to this Agreement.
      </p>

      <p className="contract-p">
        <strong>"Exhibit A"</strong> Means the written attachment to this
        Agreement that contains the Scope of Work mutually agreed upon by the
        Parties and forms an integral part of this Agreement.
      </p>

      <p className="contract-p">
        <strong>"Intellectual Property Rights"</strong> Means all current and
        future rights under patent law, copyright law, trade secret law,
        trademark law, moral rights law, and other similar rights recognized by
        any jurisdiction, whether registered or unregistered.
      </p>

      <p className="contract-p">
        <strong>"Client Content"</strong> Means all text, images, graphics,
        videos, trademarks, logos, and other materials provided by the Client to
        be included in the website, whether created by the Client or sourced
        from third parties.
      </p>

      <p className="contract-p">
        <strong>"Scope Creep"</strong> Means any request by the Client that
        expands, modifies, or deviates from the Scope of Work set forth in
        Exhibit A without a formal amendment or additional written agreement.
      </p>

      <p className="contract-p">
        <strong>"Revisions Period"</strong> Means the limited time frame
        following the initial delivery of the Deliverables during which the
        Client may request changes, adjustments, or modifications, as defined
        under this Agreement.
      </p>

      <p className="contract-p">
        <strong>"Accessibility Standards"</strong> Means the legal and
        regulatory requirements related to website usability for individuals
        with disabilities, including but not limited to standards set forth
        under the Americans with Disabilities Act (ADA) and other applicable
        guidelines.
      </p>

      <p className="contract-p">
        <strong>"Data Compliance Laws"</strong> Means all applicable laws and
        regulations governing the collection, storage, processing, and sharing
        of personal or sensitive data, including but not limited to the General
        Data Protection Regulation (GDPR), the California Consumer Privacy Act
        (CCPA), and other relevant legislation.
      </p>

      <h2 className="contract-h2">2. SCOPE OF SERVICES</h2>

      <p className="contract-p">
        The Developer shall perform the website design and development services
        selected by the Client and described in the Scope of Work set forth in
        Exhibit A, which forms an integral part of this Agreement. These
        services shall include the design, development, and delivery of the
        Deliverables as outlined therein.
      </p>

      <p className="contract-p">
        If the Client selects hosting services in Exhibit A, the Developer will
        assist in placing the Final Website on the Hosting Platform identified.
        The terms governing the hosting service shall be those of the relevant
        hosting provider.
      </p>

      <h2 className="contract-h2">3. CLIENT RESPONSIBILITIES</h2>

      <p className="contract-p">
        The Client shall have the following responsibilities under this
        Agreement:
      </p>

      <p className="contract-p">
        The Client shall provide all necessary Client Content required to
        complete the Scope of Work described in Exhibit A. Such content must be
        submitted in a timely manner and in formats reasonably requested by the
        Developer.
      </p>

      <p className="contract-p">
        The Client confirms that all Client Content is accurate, not misleading,
        and fully compliant with applicable laws and regulations, including
        those concerning advertising, copyright, accessibility, and data
        protection.
      </p>

      <p className="contract-p">
        The Client warrants that it either owns or has valid permission to use
        all Client Content provided and that such content does not infringe upon
        the Intellectual Property Rights of any third party.
      </p>

      <p className="contract-p">
        The Client shall remain solely responsible for the legal, regulatory,
        and factual accuracy of all Client Content used in the Final Website.
      </p>

      <p className="contract-p">
        The Client agrees to cooperate fully with the Developer during all
        phases of the project, including but not limited to the timely review of
        Deliverables, prompt communication, and the approval or revision of
        submitted work as necessary to facilitate progress and timely delivery.
      </p>

      <p className="contract-p">
        The Client agrees to make all payments in a timely manner, either in
        full upfront or in accordance with the payment schedule or project
        milestones outlined in Exhibit B.
      </p>

      <h2 className="contract-h2">4. TIMELINE AND DELIVERY</h2>

      <p className="contract-p">
        The Developer shall perform the services and deliver the Deliverables in
        accordance with the milestones and delivery schedule set forth in
        Exhibit B. The Client acknowledges that adherence to the timeline is
        dependent on the timely cooperation of the Client, including the
        submission of all required Client Content, approvals, and feedback.
      </p>

      <p className="contract-p">
        The project shall be deemed complete upon delivery of the Final Website
        in accordance with the approved Scope of Work described in Exhibit A,
        provided that the Developer has fulfilled all tasks and specifications
        outlined therein, and that any agreed-upon revisions during the
        Revisions Period have been completed.
      </p>

      <h2 className="contract-h2">5. REVISIONS AND CHANGE REQUESTS</h2>

      <p className="contract-p">
        The Developer shall provide up to{" "}
        <ContractField
          value={formData.revisionRounds}
          onChange={(e) => updateField("revisionRounds", e.target.value)}
          placeholder="2"
          className="contract-input-short"
          isClientView={isClientView}
        />{" "}
        rounds of revisions following the initial delivery of the Deliverables.
        These revisions must be requested by the Client within{" "}
        <ContractField
          value={formData.revisionDays}
          onChange={(e) => updateField("revisionDays", e.target.value)}
          placeholder="7"
          className="contract-input-short"
          isClientView={isClientView}
        />{" "}
        calendar days from the date of delivery. Each round of revisions must be
        reasonable in nature and limited to modifications that fall within the
        originally agreed Scope of Work. Revisions requested outside this
        timeframe shall not be accepted unless otherwise agreed in writing.
      </p>

      <p className="contract-p">
        Revisions shall not include requests for additional pages, features,
        redesigns, structural changes, or any modifications that substantially
        alter the layout, functionality, or purpose of the website as originally
        specified. The Developer reserves the right to determine whether a
        requested change qualifies as a revision or constitutes an expansion of
        the scope.
      </p>

      <p className="contract-p">
        Any request that goes beyond the permitted rounds of revisions or that
        introduces new features, pages, functionalities, or requirements shall
        be considered Scope Creep. The Developer shall not be obligated to carry
        out such changes unless the Client completes and signs a formal revision
        request form that outlines the additional work, associated fees, and any
        required adjustments to the project timeline. Work described in such a
        form shall not commence until accepted in writing by the Developer.
      </p>

      <p className="contract-p">
        The Developer shall have no obligation to perform any further revisions
        or address any Client concerns raised after the completion of the
        project and the expiration of the Revisions Period, unless a separate
        maintenance or service agreement has been executed. All post-delivery
        support or modification requests shall be subject to a new and
        independent agreement with mutually agreed terms.
      </p>

      <h2 className="contract-h2">6. HOSTING AND MAINTENANCE (OPTIONAL SERVICES)</h2>

      <p className="contract-p">
        The Client acknowledges that hosting and maintenance are distinct
        services and are not included in the Developer's website design and
        development obligations under this Agreement. These services shall be
        considered optional and may be made available by the Developer at its
        sole discretion.
      </p>

      <p className="contract-p">
        The Developer shall have no obligation to provide hosting or maintenance
        unless the Client expressly selects these services in Exhibit A and
        agrees to the corresponding fees and conditions. In such cases, the
        Developer shall facilitate the setup or transfer of the Final Website to
        the selected Hosting Platform and may, if applicable, offer continued
        support or updates under separately defined terms.
      </p>

      <p className="contract-p">
        The Developer makes no guarantees regarding the performance, uptime,
        security, or service quality of any third-party Hosting Platform,
        whether recommended by the Developer or selected by the Client. The
        Client acknowledges that hosting services are subject to the terms and
        policies of the chosen hosting provider and are beyond the Developer's
        control.
      </p>

      <p className="contract-p">
        The Developer shall not be liable for any issues arising from the
        Client's hosting environment, including but not limited to data loss,
        unauthorized access, downtime, security breaches, or technical failures.
        The Client is solely responsible for understanding and maintaining any
        hosting-related obligations.
      </p>

      <p className="contract-p">
        The Developer shall not be responsible for renewing or managing any
        third-party hosting accounts, domain names, SSL certificates, or other
        external services unless otherwise agreed in writing.
      </p>

      <h2 className="contract-h2">7. FEES AND PAYMENT TERMS</h2>

      <p className="contract-p">
        The Client agrees to pay the Developer the fees associated with the
        services selected in Exhibit A, in accordance with the payment schedule
        or milestones set forth in Exhibit B. All fees are stated in U.S.
        dollars and are exclusive of any applicable taxes or third-party costs
        unless otherwise specified.
      </p>

      <p className="contract-p">
        Payments shall be made promptly upon the due dates specified in Exhibit
        B. Where the payment structure includes milestone-based billing, the
        Developer reserves the right to withhold the delivery of Deliverables or
        suspend work until payment for the corresponding milestone is received
        in full.
      </p>

      <p className="contract-p">
        Any delay in payment beyond{" "}
        <ContractField
          value={formData.lateDays}
          onChange={(e) => updateField("lateDays", e.target.value)}
          placeholder="5"
          className="contract-input-short"
          isClientView={isClientView}
        />{" "}
        calendar days from the due date shall incur a late fee of{" "}
        <ContractField
          value={formData.lateFeePercent}
          onChange={(e) => updateField("lateFeePercent", e.target.value)}
          placeholder="5"
          className="contract-input-short"
          isClientView={isClientView}
        />
        % of the outstanding balance. Continued non-payment beyond{" "}
        <ContractField
          value={formData.suspensionDays}
          onChange={(e) => updateField("suspensionDays", e.target.value)}
          placeholder="10"
          className="contract-input-short"
          isClientView={isClientView}
        />{" "}
        calendar days may result in the suspension or termination of services,
        at the Developer's discretion, without prejudice to any other rights or
        remedies available under this Agreement or at law.
      </p>

      <p className="contract-p">
        All payments made are non-refundable once the corresponding work has
        been performed or Deliverables have been provided, regardless of whether
        the Client chooses to proceed with the project or use the completed
        work.
      </p>

      <p className="contract-p">
        Any work requested by the Client that falls outside the original Scope
        of Work and is accepted by the Developer through a formal revision
        request form or other written confirmation shall be subject to
        additional charges, which must be paid in advance or as otherwise agreed
        before such work begins.
      </p>

      <p className="contract-p">
        All payments shall be made through the method specified by the
        Developer. The Client shall bear all transaction fees, currency
        conversion costs, or bank charges, if any, associated with the method of
        payment.
      </p>

      <p className="contract-p">
        The Developer shall have the right to pause all services, including
        access to in-progress work or project files, until any outstanding
        balances are cleared.
      </p>

      <h2 className="contract-h2">8. INTELLECTUAL PROPERTY RIGHTS</h2>

      <p className="contract-p">
        All rights, title, and interest in and to the website's underlying
        source code, development frameworks, tools, libraries, and reusable
        components used or created by the Developer in the course of providing
        the services shall remain the exclusive property of the Developer. This
        includes any proprietary methods, scripts, and templates developed
        independently or during the performance of this Agreement.
      </p>

      <p className="contract-p">
        All content provided by the Client, including text, images, videos,
        logos, and other materials defined as Client Content, shall remain the
        property of the Client. The Client grants the Developer a limited,
        non-exclusive license to use such content solely for the purpose of
        completing the Scope of Work under this Agreement.
      </p>

      <p className="contract-p">
        Upon full payment of all fees due under this Agreement, the Client shall
        be granted a non-exclusive, non-transferable, royalty-free license to
        use, reproduce, and publicly display the Final Website as delivered by
        the Developer. This license does not include any rights to resell,
        sublicense, or redistribute the Developer's proprietary components or
        tools independently of the Final Website.
      </p>

      <p className="contract-p">
        Nothing in this Agreement shall be interpreted to transfer ownership of
        any intellectual property belonging to the Developer. Any additional
        usage, modification, or reuse of the Developer's proprietary materials
        outside the scope of this project shall require the Developer's prior
        written consent and may be subject to additional fees.
      </p>

      <h2 className="contract-h2">9. LIABILITY AND INDEMNIFICATION</h2>

      <p className="contract-p">
        The Developer shall not be liable for any direct, indirect, incidental,
        special, consequential, or exemplary damages arising out of or in
        connection with the use, performance, or functionality of the website,
        whether such damages result from breach of contract, negligence, strict
        liability, or otherwise, even if the Developer has been advised of the
        possibility of such damages.
      </p>

      <p className="contract-p">
        The Developer shall not be responsible for any damages, penalties, or
        legal claims arising from or related to: cyberattacks, unauthorized
        access, or malicious activities targeting the website after delivery;
        copyright infringement, trademark misuse, or other intellectual property
        violations related to Client Content; violations of Accessibility
        Standards, including but not limited to non-compliance with the
        Americans with Disabilities Act (ADA) or similar regulations; failure to
        comply with data protection or privacy laws, including but not limited
        to the General Data Protection Regulation (GDPR), the California
        Consumer Privacy Act (CCPA), or any other Data Compliance Laws.
      </p>

      <p className="contract-p">
        The Client acknowledges and agrees that it is solely responsible for the
        legality, accuracy, and compliance of all content, features, and data
        collection mechanisms included on the website. The Developer does not
        provide legal or regulatory compliance services and offers no warranty
        that the website will meet any specific legal standards.
      </p>

      <p className="contract-p">
        The Client shall indemnify, defend, and hold harmless the Developer, its
        employees, contractors, and affiliates from and against any and all
        claims, damages, liabilities, losses, costs, or expenses (including
        reasonable attorneys' fees) arising from or related to any third-party
        claim based on the content, operation, or use of the website, including
        but not limited to claims involving the areas listed above.
      </p>

      <p className="contract-p">
        This indemnity obligation shall survive the termination or expiration of
        this Agreement.
      </p>

      <h2 className="contract-h2">10. WARRANTIES AND DISCLAIMERS</h2>

      <p className="contract-p">
        The Developer warrants that the Final Website, as delivered to the
        Client, will operate in material conformity with the specifications
        described in the Scope of Work and will be free from critical functional
        defects that would prevent its basic operation. This limited warranty is
        valid for a period of{" "}
        <ContractField
          value={formData.warrantyDays}
          onChange={(e) => updateField("warrantyDays", e.target.value)}
          placeholder="7"
          className="contract-input-short"
          isClientView={isClientView}
        />{" "}
        calendar days from the date of final delivery and applies solely to the
        website as provided by the Developer, without any subsequent
        modifications or interference by the Client or any third party.
      </p>

      <p className="contract-p">
        This limited warranty does not cover errors, issues, or incompatibilities
        arising from: alterations or edits made to the website by the Client or
        any third party; changes or updates in third-party software, plugins,
        hosting platforms, browsers, or operating systems after delivery; the
        addition of new content, features, or components not originally included
        in the Scope of Work; misuse, neglect, or failure to follow the
        Developer's usage or maintenance instructions, if any are provided.
      </p>

      <p className="contract-p">
        Except as expressly stated above, the Developer makes no warranties,
        express or implied, including but not limited to any implied warranties
        of merchantability, fitness for a particular purpose, or
        non-infringement. The Developer does not warrant that the website will
        operate uninterrupted or error-free under all circumstances or that it
        will remain compatible with future technologies or third-party systems.
      </p>

      <p className="contract-p">
        The Developer shall have no obligation to provide any bug fixes,
        updates, security patches, or technical support beyond the delivery date
        unless the Parties enter into a separate maintenance agreement. In the
        absence of such an agreement, any post-delivery services requested by
        the Client shall be considered outside the scope of this Agreement and
        may be subject to additional charges and a new written arrangement.
      </p>

      <h2 className="contract-h2">11. LIMITATION OF LIABILITY</h2>

      <p className="contract-p">
        To the fullest extent permitted by applicable law, the total liability
        of the Developer for any and all claims arising out of or relating to
        this Agreement, whether in contract, tort, negligence, strict liability,
        or otherwise, shall be strictly limited to the total amount actually
        paid by the Client to the Developer under this Agreement.
      </p>

      <p className="contract-p">
        In no event shall the Developer be liable to the Client or to any third
        party for any indirect, incidental, consequential, special, exemplary,
        or punitive damages, including but not limited to loss of profits, loss
        of business opportunities, loss of data, or reputational harm, even if
        the Developer has been advised of the possibility of such damages.
      </p>

      <p className="contract-p">
        The Client acknowledges and agrees that this limitation of liability is
        a material term of this Agreement, that it reflects a fair allocation of
        risk, and that the Developer would not have entered into this Agreement
        without this limitation in place.
      </p>

      <h2 className="contract-h2">12. TERM AND TERMINATION</h2>

      <p className="contract-p">
        This Agreement shall commence on the Effective Date stated above and
        shall remain in full force and effect until all services described in
        the Scope of Work have been completed and the Final Website has been
        delivered, unless terminated earlier in accordance with this section.
      </p>

      <p className="contract-p">
        The Developer shall have the right to terminate this Agreement at any
        time, with immediate effect, by providing written notice to the Client
        if the Client fails to make timely payments, delays or obstructs the
        progress of the work, breaches any material provision of this Agreement,
        or engages in conduct that makes further cooperation impractical or
        unreasonable. In such cases, the Developer shall retain the right to all
        amounts paid and shall be entitled to recover any unpaid fees for work
        completed, including any approved revisions or partial deliverables, as
        well as any additional losses, costs, or damages incurred as a result of
        the Client's breach or conduct.
      </p>

      <p className="contract-p">
        The Client may terminate this Agreement for convenience by providing no
        less than{" "}
        <ContractField
          value={formData.terminationNoticeDays}
          onChange={(e) => updateField("terminationNoticeDays", e.target.value)}
          placeholder="10"
          className="contract-input-short"
          isClientView={isClientView}
        />{" "}
        calendar days' written notice to the Developer. In the event of such
        termination, the Developer shall be entitled to full compensation for
        all work performed up to the termination date, including work in
        progress, partially completed deliverables, and any time or resources
        committed in reliance on the Agreement. All deposits or milestone
        payments made prior to termination shall be deemed non-refundable under
        all circumstances.
      </p>

      <p className="contract-p">
        Upon termination for any reason, the Client shall have no right to use,
        access, or take possession of any incomplete, unpaid, or unapproved
        work, including drafts, source files, or staging versions of the
        website. The Developer shall have no further obligation to continue
        work, release files, or provide support following termination.
      </p>

      <p className="contract-p">
        The termination of this Agreement shall be without prejudice to any
        other legal or equitable remedies available to the Developer.
      </p>

      <h2 className="contract-h2">13. CONFIDENTIALITY</h2>

      <p className="contract-p">
        Each party agrees to maintain in strict confidence all confidential,
        proprietary, or non-public information disclosed by the other party,
        whether in written, oral, visual, or electronic form, that is marked as
        confidential or that a reasonable person would understand to be
        confidential under the circumstances. This includes, but is not limited
        to, business strategies, trade secrets, technical processes, pricing,
        project materials, client lists, source files, code, templates, scripts,
        development methods, and any other information related to the disclosing
        party's business operations or technology.
      </p>

      <p className="contract-p">
        The receiving party shall not disclose, use, copy, reproduce, or
        otherwise exploit any confidential information for any purpose other
        than fulfilling its obligations under this Agreement. The receiving
        party shall take all reasonable steps to protect the confidentiality of
        such information and shall ensure that its employees, contractors,
        agents, or affiliates who may access such information are bound by
        confidentiality obligations no less restrictive than those contained
        herein.
      </p>

      <p className="contract-p">
        The obligations in this section shall survive the termination or
        expiration of this Agreement for a period of{" "}
        <ContractField
          value={formData.confidentialityYears}
          onChange={(e) => updateField("confidentialityYears", e.target.value)}
          placeholder="3"
          className="contract-input-short"
          isClientView={isClientView}
        />{" "}
        years, or indefinitely with respect to trade secrets, proprietary source
        code, or any information designated by the Developer as confidential
        with ongoing sensitivity.
      </p>

      <h2 className="contract-h2">14. FORCE MAJEURE</h2>

      <p className="contract-p">
        The Developer shall not be held liable for any delay or failure in the
        performance of its obligations under this Agreement if such delay or
        failure is due to causes beyond its reasonable control, including but
        not limited to acts of God, natural disasters, epidemics, pandemics,
        wars, terrorism, labor strikes, supply shortages, power outages,
        internet or telecommunications failures, or actions of governmental
        authorities.
      </p>

      <p className="contract-p">
        In such an event, the affected obligations shall be suspended for the
        duration of the delay, and the Developer shall notify the Client of the
        nature and expected duration of the force majeure event as soon as
        reasonably practicable. If the delay exceeds thirty calendar days,
        either party may terminate the Agreement without penalty, provided that
        the Client shall remain responsible for payment for all work performed
        up to the date of termination.
      </p>

      <h2 className="contract-h2">15. NOTICES</h2>

      <p className="contract-p">
        All notices, requests, demands, or other communications required or
        permitted under this Agreement shall be made in writing and delivered to
        the parties at the addresses provided above or to such other address as
        either party may designate in writing.
      </p>

      <p className="contract-p">
        Notices shall be deemed effective when delivered personally, sent by
        certified mail (return receipt requested), delivered by a nationally
        recognized courier service, or emailed with confirmation of receipt.
      </p>

      <h2 className="contract-h2">16. GOVERNING LAW AND JURISDICTION</h2>

      <p className="contract-p">
        This Agreement shall be governed by and construed in accordance with the
        laws of the State of{" "}
        <ContractField
          value={formData.governingState}
          onChange={(e) => updateField("governingState", e.target.value)}
          placeholder="New Jersey"
          className="contract-input-medium"
          isClientView={isClientView}
        />
        , without regard to its conflict of law principles. Any legal action or
        proceeding arising out of or relating to this Agreement shall be brought
        exclusively in the Superior Court of{" "}
        <ContractField
          value={formData.courtCounty}
          onChange={(e) => updateField("courtCounty", e.target.value)}
          placeholder="Monmouth County"
          className="contract-input-medium"
          isClientView={isClientView}
        />
        ,{" "}
        <ContractField
          value={formData.governingState}
          onChange={(e) => updateField("governingState", e.target.value)}
          placeholder="New Jersey"
          className="contract-input-medium"
          isClientView={isClientView}
        />
        , and each party irrevocably submits to the personal and exclusive
        jurisdiction of such courts.
      </p>

      <p className="contract-p">
        In the event of any dispute, claim, or disagreement arising out of or
        relating to this Agreement or the services provided, the parties agree
        to first attempt to resolve the matter through good-faith discussions.
        If the dispute cannot be resolved through direct negotiation within ten
        calendar days, either party may proceed to seek legal remedies in the
        designated court.
      </p>

      <p className="contract-p">
        Nothing in this section shall prevent the Developer from seeking
        injunctive or equitable relief in any court of competent jurisdiction to
        protect its intellectual property rights or confidential information.
      </p>

      <h2 className="contract-h2">17. MISCELLANEOUS PROVISIONS</h2>

      <p className="contract-p">
        No modification, amendment, or waiver of any provision of this Agreement
        shall be effective unless made in writing and signed by both parties.
        The Developer shall not be bound by any terms proposed by the Client
        that are additional to or inconsistent with the terms of this Agreement
        unless expressly agreed to in writing.
      </p>

      <p className="contract-p">
        If any provision of this Agreement is found to be invalid, unlawful, or
        unenforceable under any applicable law, such provision shall be deemed
        severed from this Agreement, and the remaining provisions shall remain
        in full force and effect.
      </p>

      <p className="contract-p">
        The Client may not assign or transfer any rights or obligations under
        this Agreement without the prior written consent of the Developer. The
        Developer may assign this Agreement to any successor or affiliated
        entity without notice to the Client.
      </p>

      <p className="contract-p">
        This Agreement may be executed in counterparts, each of which shall be
        deemed an original, and all of which together shall constitute one and
        the same instrument. Signatures delivered by electronic means shall have
        the same force and effect as original signatures.
      </p>

      <p className="contract-p">
        This Agreement, including all attached exhibits, constitutes the entire
        agreement between the parties with respect to the subject matter hereof
        and supersedes all prior and contemporaneous understandings,
        communications, proposals, or agreements, whether oral or written.
      </p>

      {/* EXHIBIT A - SCOPE OF WORK */}
      <div className="contract-section-divider">
        <h2 className="contract-h2 text-center text-[14pt]">
          EXHIBIT A - SCOPE OF WORK
        </h2>

        <p className="contract-p">
          This Exhibit is incorporated into and made part of the Website Design
          and Development Agreement between{" "}
          <strong>{formData.developerCompany || "[Developer]"}</strong>{" "}
          ("Developer") and the Client named below.
        </p>

        <p className="contract-p">
          <strong>Client Name:</strong>{" "}
          <ContractField
            value={formData.clientName}
            onChange={(e) => updateField("clientName", e.target.value)}
            placeholder="Client Contact Name"
            className="contract-input-inline contract-input-long"
            isClientView={isClientView}
          />
        </p>

        <p className="contract-p">
          <strong>Project Title:</strong>{" "}
          <ContractField
            value={formData.projectTitle}
            onChange={(e) => updateField("projectTitle", e.target.value)}
            placeholder="Website Project Title"
            className="contract-input-inline contract-input-long"
            isClientView={isClientView}
          />
        </p>

        <p className="contract-p">
          <strong>Date of Exhibit:</strong>{" "}
          {isClientView ? (
            <span className="font-medium text-gray-900 border-b border-gray-400 px-1">
              {formatDisplayDate(formData.exhibitDate)}
            </span>
          ) : (
            <input
              type="date"
              value={formData.exhibitDate}
              onChange={(e) => updateField("exhibitDate", e.target.value)}
              className="contract-input w-[140px]"
            />
          )}
        </p>

        <h3 className="contract-h3">Project Overview</h3>
        <ContractTextarea
          value={formData.projectOverview}
          onChange={(e) => updateField("projectOverview", e.target.value)}
          placeholder="Describe the project goals, target audience, and key objectives..."
          className="contract-textarea ml-0 w-full"
          isClientView={isClientView}
        />

        <h3 className="contract-h3">Design Services {!isClientView && "(select all that apply)"}</h3>
        <ContractCheckboxList
          items={[
            "Custom Homepage Design",
            "Interior Page Templates",
            "Mobile and Tablet Responsive Layouts",
            "Logo Design or Branding Elements",
            "Custom Icons or Graphics",
            "Basic Accessibility Best Practices (visual contrast, font sizing, alt text)",
            "Design Review and Mockup Presentation",
          ]}
          checkedArray={formData.designServices}
          onToggle={toggleDesignService}
          isClientView={isClientView}
        />

        <h3 className="contract-h3">Development Services {!isClientView && "(select all that apply)"}</h3>
        <ContractCheckboxList
          items={[
            "Static Website (HTML, CSS, JavaScript)",
            "CMS Integration (e.g., WordPress, Shopify)",
            "E-commerce Functionality (Cart, Checkout, Product Pages)",
            "Contact Form or Lead Capture Form",
            "Newsletter Signup Integration",
            "Blog or News Module",
            "Basic Search Engine Optimization Setup (Meta tags, structure)",
            "Cookie Banner or Consent Tool (if requested)",
          ]}
          checkedArray={formData.devServices}
          onToggle={toggleDevService}
          isClientView={isClientView}
        />

        <h3 className="contract-h3">Functionality Requirements {!isClientView && "(check if included)"}</h3>
        <ContractCheckboxList
          items={[
            "User Registration / Login",
            "Appointment Booking / Scheduling Integration",
            "Payment Gateway Setup",
            "Third-Party Integration (e.g., CRM, Analytics)",
            "Language Translation / Multilingual Support",
          ]}
          checkedArray={formData.functionality}
          onToggle={toggleFunctionality}
          isClientView={isClientView}
        />

        {formData.functionality?.[2] && (
          <p className="contract-p ml-6">
            Payment Gateway Name:{" "}
            <ContractField
              value={formData.paymentGateway}
              onChange={(e) => updateField("paymentGateway", e.target.value)}
              placeholder="Stripe, PayPal, etc."
              className="contract-input-inline contract-input-medium"
              isClientView={isClientView}
            />
          </p>
        )}

        {formData.functionality?.[3] && (
          <p className="contract-p ml-6">
            Third-Party Tool:{" "}
            <ContractField
              value={formData.thirdPartyTool}
              onChange={(e) => updateField("thirdPartyTool", e.target.value)}
              placeholder="HubSpot, Google Analytics, etc."
              className="contract-input-inline contract-input-medium"
              isClientView={isClientView}
            />
          </p>
        )}

        <p className="contract-p">
          <strong>Total Number of Website Pages Included:</strong>{" "}
          <ContractField
            type="number"
            value={formData.totalPages}
            onChange={(e) => updateField("totalPages", e.target.value)}
            placeholder="5"
            className="contract-input w-[60px]"
            isClientView={isClientView}
          />
        </p>

        <h3 className="contract-h3">Client Content Responsibilities</h3>
        <p className="contract-p">
          The Client shall provide the following content assets in an
          appropriate digital format:
        </p>
        <ContractCheckboxList
          items={[
            "Page Text and Headlines",
            "High-resolution Images",
            "Product Listings or Descriptions",
            "Embedded Videos or Links",
            "Logo Files (AI, EPS, or PNG preferred)",
          ]}
          checkedArray={formData.clientContent}
          onToggle={toggleClientContent}
          isClientView={isClientView}
        />

        <p className="contract-p">
          <strong>All content must be delivered by:</strong>{" "}
          {(() => {
            // Calculate 2 months from effective date
            const monthNames = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const monthIndex = monthNames.indexOf(formData.month);
            if (monthIndex !== -1 && formData.day && formData.year) {
              const effectiveDate = new Date(parseInt(formData.year), monthIndex, parseInt(formData.day));
              effectiveDate.setMonth(effectiveDate.getMonth() + 2);
              return `${monthNames[effectiveDate.getMonth()]} ${effectiveDate.getDate()}, ${effectiveDate.getFullYear()}`;
            }
            return "(2 months from Effective Date)";
          })()}
        </p>
        <p className="contract-p text-sm italic">
          Delays in content submission may impact the project timeline.
        </p>

        <h3 className="contract-h3">Deliverables</h3>
        <p className="contract-p">
          The Developer will provide the following upon project completion:
        </p>
        <ContractCheckboxList
          items={[
            "Fully functional website matching approved designs",
            "Uploaded to Client-selected Hosting Platform",
            "Access credentials or CMS login (if applicable)",
            "Handover of front-end files (HTML/CSS/JS) or admin credentials",
            "Instructional notes or onboarding session",
          ]}
          checkedArray={formData.deliverables}
          onToggle={toggleDeliverable}
          isClientView={isClientView}
        />

        <h3 className="contract-h3">Hosting & Maintenance Services</h3>
        <p className="contract-p">
          Upon completion of the website, the Client will select a hosting and maintenance plan from the options below. The first billing cycle will begin automatically after the complimentary support period expires.
        </p>

        {/* Hosting Plans - Interactive in client view, static in admin */}
        <HostingPlanSelector />

        <p className="contract-p">
          <strong>Cancellation Policy:</strong> The Client may cancel their hosting and maintenance plan at any time before the first billing cycle begins with no payment obligations. Upon cancellation (or if the plan lapses), the Client will receive all website build files via email, enabling them to pursue alternative hosting arrangements. Once cancelled, the website will be removed from the Developer's servers at the end of the current billing period. The Client assumes full responsibility for hosting, security, and maintenance of their website thereafter.
        </p>

        <p className="contract-p">
          <em>Full hosting and maintenance terms will be provided on the following page.</em>
        </p>
      </div>

      {/* EXHIBIT B - PAYMENT SCHEDULE */}
      <div className="contract-section-divider">
        <h2 className="contract-h2 text-center text-[14pt]">
          EXHIBIT B - PAYMENT SCHEDULE
        </h2>

        <p className="contract-p">
          <strong>Total Project Fee:</strong> $
          <ContractField
            type="number"
            value={formData.totalFee}
            onChange={(e) => updateField("totalFee", e.target.value)}
            placeholder="0.00"
            className="contract-input w-[100px]"
            isClientView={isClientView}
          />
        </p>

        <h3 className="contract-h3">Payment Structure</h3>
        {isClientView ? (
          <p className="ml-6 mb-4">
            <span className="text-green-600 mr-2">✓</span>
            <span className="font-medium">
              {formData.paymentStructure === "upfront" && "Full payment upfront before work begins"}
              {formData.paymentStructure === "deposit" && "Deposit + Final Payment"}
              {formData.paymentStructure === "milestones" && "Milestone-based payments"}
              {!formData.paymentStructure && "Not selected"}
            </span>
          </p>
        ) : (
          <div className="flex flex-col ml-6 mb-4">
            <label className="contract-checkbox-label">
              <input
                type="radio"
                checked={formData.paymentStructure === "upfront"}
                onChange={() => updateField("paymentStructure", "upfront")}
                className="contract-checkbox"
              />
              <span>Full payment upfront before work begins</span>
            </label>
            <label className="contract-checkbox-label">
              <input
                type="radio"
                checked={formData.paymentStructure === "deposit"}
                onChange={() => updateField("paymentStructure", "deposit")}
                className="contract-checkbox"
              />
              <span>Deposit + Final Payment</span>
            </label>
            <label className="contract-checkbox-label">
              <input
                type="radio"
                checked={formData.paymentStructure === "milestones"}
                onChange={() => updateField("paymentStructure", "milestones")}
                className="contract-checkbox"
              />
              <span>Milestone-based payments</span>
            </label>
          </div>
        )}

        {formData.paymentStructure === "deposit" && (
          <div className="ml-6 mb-4">
            <p className="contract-p">
              <strong>Deposit Amount:</strong> $
              <ContractField
                type="number"
                value={formData.depositAmount}
                onChange={(e) => updateField("depositAmount", e.target.value)}
                placeholder="0.00"
                className="contract-input w-[100px]"
                isClientView={isClientView}
              />{" "}
              (due before work begins)
            </p>
            <p className="contract-p">
              <strong>Final Payment:</strong> $
              {formData.totalFee && formData.depositAmount
                ? (
                    parseFloat(formData.totalFee) -
                    parseFloat(formData.depositAmount)
                  ).toFixed(2)
                : "0.00"}{" "}
              (due upon project completion)
            </p>
          </div>
        )}

        {formData.paymentStructure === "milestones" && (
          <div className="ml-6 mb-4">
            <p className="contract-p">
              <strong>Milestone 1 - Project Start:</strong> $
              <ContractField
                type="number"
                value={formData.milestone1}
                onChange={(e) => updateField("milestone1", e.target.value)}
                placeholder="0"
                className="contract-input w-[80px]"
                isClientView={isClientView}
              />
            </p>
            <p className="contract-p">
              <strong>Milestone 2 - Design Approval:</strong> $
              <ContractField
                type="number"
                value={formData.milestone2}
                onChange={(e) => updateField("milestone2", e.target.value)}
                placeholder="0"
                className="contract-input w-[80px]"
                isClientView={isClientView}
              />
            </p>
            <p className="contract-p">
              <strong>Milestone 3 - Development Complete:</strong> $
              <ContractField
                type="number"
                value={formData.milestone3}
                onChange={(e) => updateField("milestone3", e.target.value)}
                placeholder="0"
                className="contract-input w-[80px]"
                isClientView={isClientView}
              />
            </p>
            <p className="contract-p">
              <strong>Milestone 4 - Final Delivery:</strong> $
              <ContractField
                type="number"
                value={formData.milestone4}
                onChange={(e) => updateField("milestone4", e.target.value)}
                placeholder="0"
                className="contract-input w-[80px]"
                isClientView={isClientView}
              />
            </p>
          </div>
        )}

        <p className="contract-p">
          <strong>Estimated Completion Date:</strong>{" "}
          {isClientView ? (
            <span className="font-medium text-gray-900 border-b border-gray-400 px-1">
              {formatDisplayDate(formData.completionDate)}
            </span>
          ) : (
            <input
              type="date"
              value={formData.completionDate}
              onChange={(e) => updateField("completionDate", e.target.value)}
              className="contract-input w-[140px]"
            />
          )}
        </p>
      </div>

      {/* SIGNATURES SECTION - Always show so it appears in PDF */}
      <div className="contract-signature-section">
        <h3 className="contract-h3">SIGNATURES</h3>

        <div className="grid grid-cols-2 gap-8">
          <SignatureBlock
            title="FOR THE SERVICE PROVIDER"
            companyName={formData.developerCompany}
            personName={formData.developerName}
            signatureData={formData.developerSignature}
            signatureAlt="Service provider signature"
            date={formData.day && formData.month && formData.year
              ? `${formData.month} ${formData.day}, ${formData.year}`
              : ""}
            className="contract-signature-block"
          />

          <SignatureBlock
            title="FOR THE CLIENT"
            companyName={formData.clientCompanyName}
            personName={typedName || formData.clientName}
            signatureData={signatureData}
            signatureAlt="Client signature"
            date={formData.day && formData.month && formData.year
              ? `${formData.month} ${formData.day}, ${formData.year}`
              : ""}
          />
        </div>
      </div>

      {/* DOWNLOAD BUTTONS - Admin view only */}
      {!isClientView && (
        <div
          className="contract-section-divider text-center"
          data-export-control="true"
        >
          <h3 className="contract-h3 text-center mb-5">Download Contract</h3>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => generateDocument(formData, "pdf")}
              className="btn-primary"
            >
              Download as PDF
            </button>
            <button
              onClick={() => generateDocument(formData, "doc")}
              className="btn-secondary"
            >
              Download as DOC
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const WebDesignContract = {
  id: "web-design",
  name: "Website Design and Development Agreement",
  defaultFields: {
    developerCompany: "",
    developerLocation: "",
    developerName: "",
    developerSignature: "", // Developer signature from business profile
    clientCompanyName: "",
    clientName: "",
    clientAddress: "",
    clientEmail: "",
    clientPhone: "",
    day: currentDate.day,
    month: currentDate.month,
    year: currentDate.year,
    projectTitle: "",
    projectOverview: "",
    revisionRounds: "2",
    revisionDays: "7",
    lateDays: "5",
    lateFeePercent: "5",
    suspensionDays: "10",
    warrantyDays: "7",
    terminationNoticeDays: "10",
    confidentialityYears: "3",
    governingState: "New Jersey",
    courtCounty: "Monmouth County",
    designServices: [
      "Custom Homepage Design",
      "Interior Page Templates",
      "Mobile and Tablet Responsive Layouts",
      "Custom Icons or Graphics",
    ],
    devServices: [
      "Basic Search Engine Optimization Setup (Meta tags, structure)",
    ],
    functionality: [],
    paymentGateway: "",
    thirdPartyTool: "",
    totalPages: "",
    clientContent: [],
    contentDeadline: "",
    deliverables: [],
    // Hosting tier selection: 'hosting-only', 'hosting-basic', 'hosting-priority', 'none'
    selectedHostingTier: null,
    totalFee: "",
    paymentStructure: "deposit",
    depositAmount: "",
    milestone1: "",
    milestone2: "",
    milestone3: "",
    milestone4: "",
    completionDate: getDateMonthsFromNow(1),
    exhibitDate: "",
  },
  SidebarForm: WebDesignSidebarForm,
  Document: WebDesignDocument,
};
