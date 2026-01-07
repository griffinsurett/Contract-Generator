import React from 'react'
import { generateDocument } from '../utils/documentGenerator'

const ContractDocument = ({ formData, updateField }) => {
  const {
    serviceProviderName,
    serviceProviderCompany,
    serviceProviderLocation,
    clientFirstName,
    clientCompanyName,
    clientAddress,
    clientEmail,
    clientPhone,
    day,
    month,
    year,
    websiteType,
    dynamicFeatures,
    formspreeManagement,
    serviceStartDate,
    billingPeriod,
    totalFee,
    feeFrequency,
    invoicingMethod,
    invoicingOther,
    lateFeeAmount,
    lateFeePercentage,
    lateFeeDays,
    additionalNotes,
    maintenanceServices,
    contentUpdates,
    formMonitoring
  } = formData

  const docStyle = {
    backgroundColor: 'white',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    minHeight: '11in',
    padding: '1in',
    fontFamily: 'Times New Roman, serif',
    fontSize: '11pt',
    lineHeight: '1.6',
    color: '#000'
  }

  const h1Style = {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '16pt',
    marginBottom: '24px'
  }

  const h2Style = {
    fontWeight: 'bold',
    fontSize: '12pt',
    marginTop: '24px',
    marginBottom: '12px'
  }

  const h3Style = {
    fontWeight: 'bold',
    fontSize: '11pt',
    marginTop: '16px',
    marginBottom: '12px'
  }

  const pStyle = {
    marginBottom: '12px',
    textAlign: 'justify'
  }

  const editableInputStyle = {
    border: 'none',
    borderBottom: '1px solid #666',
    outline: 'none',
    fontFamily: 'Times New Roman, serif',
    fontSize: '11pt',
    padding: '2px 4px',
    backgroundColor: 'transparent',
    textAlign: 'center'
  }

  const inlineEditableStyle = {
    ...editableInputStyle,
    fontWeight: 'bold',
    textAlign: 'left',
    minWidth: '100px'
  }

  const toggleMaintenanceService = (index) => {
    const current = maintenanceServices || []
    const newServices = [...current]
    newServices[index] = !newServices[index]
    updateField('maintenanceServices', newServices)
  }

  const toggleContentUpdate = (index) => {
    const current = contentUpdates || []
    const newUpdates = [...current]
    newUpdates[index] = !newUpdates[index]
    updateField('contentUpdates', newUpdates)
  }

  return (
    <div style={docStyle}>
      {/* Title */}
      <h1 style={h1Style}>
        WEBSITE HOSTING AND MAINTENANCE AGREEMENT
      </h1>

      {/* Opening */}
      <p style={pStyle}>
        This Website Hosting and Maintenance Agreement (the "Agreement") is entered into as of this{' '}
        <input
          type="text"
          value={day}
          onChange={(e) => updateField('day', e.target.value)}
          style={{...editableInputStyle, width: '30px'}}
        />
        {' '}day of{' '}
        <input
          type="text"
          value={month}
          onChange={(e) => updateField('month', e.target.value)}
          style={{...editableInputStyle, width: '100px'}}
        />
        ,{' '}
        <input
          type="text"
          value={year}
          onChange={(e) => updateField('year', e.target.value)}
          style={{...editableInputStyle, width: '50px'}}
        />
        {' '}
        <span style={{ fontSize: '10pt', color: '#666', marginLeft: '8px' }}>
          (or select: 
          <input
            type="date"
            onChange={(e) => {
              const selectedDate = new Date(e.target.value + 'T00:00:00')
              const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']
              updateField('day', selectedDate.getDate().toString())
              updateField('month', monthNames[selectedDate.getMonth()])
              updateField('year', selectedDate.getFullYear().toString())
            }}
            style={{
              marginLeft: '4px',
              padding: '2px 4px',
              fontSize: '10pt',
              border: '1px solid #999',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          />
          )
        </span>
        <br />
        (the "Effective Date") by and between:
      </p>

      <p style={pStyle}>
        <input
          type="text"
          value={serviceProviderCompany}
          onChange={(e) => updateField('serviceProviderCompany', e.target.value)}
          placeholder="Service Provider Company Name"
          style={{...inlineEditableStyle, width: '300px'}}
        />
        , a service provider that facilitates and manages website hosting and maintenance through third-party hosting platforms on behalf of its clients, with its principal place of business located at{' '}
        <input
          type="text"
          value={serviceProviderLocation}
          onChange={(e) => updateField('serviceProviderLocation', e.target.value)}
          placeholder="Service Provider Location"
          style={{...editableInputStyle, width: '300px', textAlign: 'left'}}
        />
        {' '}(hereinafter referred to as the "Service Provider")
      </p>

      <p style={{...pStyle, textAlign: 'center'}}>-And-</p>

      <p style={pStyle}>
        <input
          type="text"
          value={clientFirstName}
          onChange={(e) => updateField('clientFirstName', e.target.value)}
          placeholder="Client First Name"
          style={{...inlineEditableStyle, width: '150px'}}
        />
        {' '}a{' '}
        <input
          type="text"
          value={clientCompanyName}
          onChange={(e) => updateField('clientCompanyName', e.target.value)}
          placeholder="Client Company Name"
          style={{...inlineEditableStyle}}
        />
        , an individual or business entity with its principal address at{' '}
        <input
          type="text"
          value={clientAddress}
          onChange={(e) => updateField('clientAddress', e.target.value)}
          placeholder="Client Address"
          style={{...inlineEditableStyle}}
        />
        , E-mail:{' '}
        <input
          type="email"
          value={clientEmail}
          onChange={(e) => updateField('clientEmail', e.target.value)}
          placeholder="client@example.com"
          style={{...inlineEditableStyle}}
        />
        , Phone Number:{' '}
        <input
          type="tel"
          value={clientPhone}
          onChange={(e) => updateField('clientPhone', e.target.value)}
          placeholder="(555) 123-4567"
          style={{...inlineEditableStyle}}
        />
        {' '}(hereinafter referred to as the "Client")
      </p>

      <p style={pStyle}>
        (Together, the Service Provider and the Client may be referred to as the "Parties" and individually as a "Party")
      </p>

      {/* BACKGROUND */}
      <h2 style={h2Style}>BACKGROUND</h2>

      <p style={pStyle}>
        WHEREAS, the Client desires to retain ongoing website hosting, maintenance, and content update services to support the continued functionality and reliability of a completed website delivered by the Service Provider or an affiliated contractor;
      </p>

      <p style={pStyle}>
        WHEREAS, the Service Provider offers managed hosting facilitation, maintenance, and selective content update services for static websites, with limited support for dynamic elements such as contact forms, media, and tracking scripts, all facilitated through third-party hosting platforms;
      </p>

      <p style={pStyle}>
        WHEREAS, the Parties seek to establish clear terms that define the scope of services, limitations, responsibilities, and protections related to such hosting and maintenance work, while preventing misunderstandings, unplanned expansion of work, or scope creep.
      </p>

      <p style={pStyle}>
        NOW THEREFORE, in consideration of the mutual promises and covenants set forth herein, and intending to be legally bound, the Parties agree to the terms and conditions stated in this Agreement.
      </p>

      {/* 1. DEFINITIONS */}
      <h2 style={h2Style}>1. DEFINITIONS</h2>

      <p style={pStyle}>
        <strong>"Static Website"</strong> means a website that primarily consists of fixed content and files, without server-side processing or real-time interactions, typically suitable for informational purposes without requiring dynamic integrations.
      </p>

      <p style={pStyle}>
        <strong>"Dynamic Functionality"</strong> means any feature of a website that involves user interaction, server-side scripting, external application integration, databases, or other components that generate content or behavior based on user input or system activity.
      </p>

      <p style={pStyle}>
        <strong>"Hosting Platform"</strong> means the third-party service selected by the Service Provider to store, serve, and deliver the website files to users via the internet, including any associated infrastructure and tools.
      </p>

      <p style={pStyle}>
        <strong>"Maintenance"</strong> means routine tasks performed by the Service Provider to ensure the hosted website remains functional, updated, and free from technical errors, including content corrections, form testing, minor visual adjustments, and monthly software/package updates applicable to the static site stack.
      </p>

      <p style={pStyle}>
        <strong>"Content Update"</strong> means any modification made to existing text, images, videos, metadata, or tags within the website's current structure, as requested by the Client and falling within the limitations defined in this Agreement.
      </p>

      <p style={pStyle}>
        <strong>"Scope Creep"</strong> means the unauthorized or unintended expansion of work or services beyond the limits agreed upon in this Agreement, including but not limited to requests for new pages, major design changes, or unplanned features.
      </p>

      <p style={pStyle}>
        <strong>"Structural Change"</strong> means any modification that alters the layout, navigation, functionality, or framework of the website, including the creation of new pages, sections, or integrated features beyond simple content updates.
      </p>

      <p style={pStyle}>
        <strong>"Form Submission Management"</strong> means the monitoring and validation of contact form functionality, ensuring that submissions are correctly processed and delivered through a designated form-handling service.
      </p>

      <p style={pStyle}>
        <strong>"Maintenance Request"</strong> means a written communication submitted by the Client using the format set out in Exhibit B, specifying the updates or adjustments requested under the scope of Maintenance or Content Update.
      </p>

      <p style={pStyle}>
        <strong>"Third-Party Terms"</strong> means the legal policies, service terms, and limitations imposed by any external service provider used in the delivery of hosting or related tools, including those of the Hosting Platform and any form-processing service.
      </p>

      {/* 2. SCOPE OF HOSTING SERVICES */}
      <h2 style={h2Style}>2. SCOPE OF HOSTING SERVICES</h2>

      <p style={pStyle}>
        <strong>2.1 Managed Hosting Facilitation.</strong> The Service Provider shall facilitate and manage the hosting of the Client's Static Website using a Hosting Platform selected at the sole discretion of the Service Provider. Hosting services shall include the setup, configuration, and deployment of website files to the designated Hosting Platform, ensuring the website is publicly accessible via the internet for the duration of this Agreement. The Service Provider shall monitor basic website performance, including uptime visibility and general accessibility, and shall address minor technical issues as they arise through reasonable efforts.
      </p>

      <p style={pStyle}>
        <strong>2.2 Hosting Platform Responsibility.</strong> The scope of hosting is limited to Static Websites, and does not include Dynamic Functionality unless expressly agreed in writing under a separate agreement. The Service Provider shall also ensure that the website's contact form remains operational through Form Submission Management using third-party tools, provided the form setup remains unchanged. Hosting is provided on a managed basis, and the Service Provider is not responsible for the infrastructure, availability guarantees, or policies of the Hosting Platform itself. All Hosting Services are subject to applicable Third-Party Terms.
      </p>

      <p style={pStyle}>
        <strong>2.3 Exclusions.</strong> No analytics/tracking implementation beyond basic tag insertion, no SEO services beyond basic metadata updates, and no standalone security monitoring or incident response are included beyond what the Hosting Platform natively provides, unless separately agreed in writing.
      </p>

      {/* 3. SCOPE OF MAINTENANCE */}
      <h2 style={h2Style}>3. SCOPE OF MAINTENANCE AND CONTENT UPDATES</h2>

      <p style={pStyle}>
        <strong>3.1 Included Services.</strong> The Service Provider shall provide ongoing Maintenance and limited Content Updates for the hosted website during the term of this Agreement. Valid Content Updates include changes to text, images, videos, metadata, or tracking tags within the website's existing layout and structure. The Client may also request updates such as adding a new service area, replacing a photo or video, or inserting standard analytics or advertising tags, provided these updates remain consistent with the website's current content types and format.
      </p>

      <p style={pStyle}>
        <strong>3.2 Monthly Software/Package Updates.</strong> The Service Provider will apply routine updates for the static site's build tooling or package dependencies (as applicable to a static site) under the Service Provider's control, excluding any redesign, code refactor, feature addition beyond maintenance scope.
      </p>

      <p style={pStyle}>
        <strong>3.3 Structural Change Exclusions.</strong> All updates must fit within the framework of the originally designed website and shall not involve any Structural Changes. Specifically, the creation of new pages, redesign of existing layouts, integration of third-party applications, or expansion of site functionality shall not be included in Maintenance or Content Updates. Such requests fall outside the agreed scope and shall require a separate written agreement before any work is initiated.
      </p>

      <p style={pStyle}>
        <strong>3.4 Request Process.</strong> Requests for Maintenance or Content Updates must be submitted using the Maintenance Request format set out in Exhibit B and will be handled at the Service Provider's discretion, based on reasonableness and workload.
      </p>

      <p style={pStyle}>
        <strong>3.5 Emergency Measures & Pass-Through Costs.</strong> In the event of abusive traffic (including DDoS), Service Provider may, at its discretion, implement emergency measures (e.g., enable CDN/WAF, temporarily restrict traffic, or place the site in maintenance mode). Any third-party fees, usage surcharges, or configuration costs incurred will be passed through to Client upon invoice. Service Provider is not liable for availability impacts resulting from such events or measures.
      </p>

      {/* 4. LIMITATIONS */}
      <h2 style={h2Style}>4. LIMITATIONS ON SERVICES / SCOPE CREEP DISCLAIMER</h2>

      <p style={pStyle}>
        The Parties expressly acknowledge that the services covered under this Agreement are limited in nature and scope. Any requests involving new sections, full-page additions, advanced integrations, or any form of redesign or re-architecture of the website shall be considered Structural Changes and are not included in the services defined herein. The Service Provider shall not be obligated to perform such work unless the Parties enter into a separate written agreement outlining the new scope, timeline, and applicable fees.
      </p>

      <p style={pStyle}>
        Examples of permitted changes under this Agreement include updating existing service areas, replacing or adding photos or videos, revising written content, or inserting tracking or analytics tags within existing pages. Examples of excluded changes include adding new pages, changing navigation menus, building interactive elements, integrating third-party platforms, or altering the overall layout or structure of the site.
      </p>

      <p style={pStyle}>
        This provision is expressly intended to prevent Scope Creep and to preserve the clarity, enforceability, and contractual integrity of the agreed-upon deliverables. The Service Provider reserves the exclusive right, in its sole discretion, to decline, postpone, or condition the acceptance of any requests that exceed the scope of services defined in this Agreement, unless and until such services are separately negotiated and memorialized in a written agreement signed by both Parties.
      </p>

      {/* 5. FORM MANAGEMENT AND MONITORING */}
      <h2 style={h2Style}>5. FORM MANAGEMENT AND MONITORING</h2>

      <p style={pStyle}>
        <strong>5.1 Third-Party Processor.</strong> As part of the ongoing Maintenance services, the Service Provider shall be responsible for monitoring the functionality of the website's contact form and ensuring that form submissions are processed and delivered as intended. This includes routine testing of form delivery through the designated form-handling tool and addressing minor issues that may interfere with proper operation, provided the form configuration remains unchanged.
      </p>

      <p style={pStyle}>
        <strong>5.2 Limitations.</strong> The Service Provider facilitates Form Submission Management through a third-party service, such as Formspree or its equivalent, and makes no representation or warranty regarding the reliability, uptime, or data processing practices of such external providers. All form-related services are subject to the applicable Third-Party Terms, and the Service Provider disclaims all liability arising from interruptions, delays, errors, or data loss attributable to the third-party form service.
      </p>

      {/* 6. CLIENT RESPONSIBILITIES */}
      <h2 style={h2Style}>6. CLIENT RESPONSIBILITIES</h2>

      <p style={pStyle}>
        The Client agrees to fulfill the following responsibilities to enable effective delivery of the services described in this Agreement:
      </p>

      <p style={pStyle}>
        <strong>Timely Content Provision:</strong> The Client shall provide all required content materials, including text, images, videos, and other media in a timely and complete manner and in the format reasonably requested by the Service Provider.
      </p>

      <p style={pStyle}>
        <strong>Review and Approvals:</strong> The Client shall review and respond to all updates, maintenance work, and other deliverables promptly and shall provide clear written approval or feedback within a reasonable timeframe.
      </p>

      <p style={pStyle}>
        <strong>Issue Reporting:</strong> The Client shall notify the Service Provider in writing of any known technical issues, functional errors, or website malfunctions as soon as they are discovered.
      </p>

      <p style={pStyle}>
        <strong>Third Party Access Credentials:</strong> Where necessary, the Client shall provide access credentials or relevant authorization for third-party accounts or tools used in connection with the hosted website, such as domain registrars, analytics services, or form handlers.
      </p>

      <p style={pStyle}>
        <strong>Ongoing Cooperation:</strong> The Client agrees to maintain responsive communication with the Service Provider throughout the duration of this Agreement and to cooperate reasonably in all matters relating to the services provided.
      </p>

      <p style={pStyle}>
        <strong>Retention of Backup Copies:</strong> The Client shall be solely responsible for maintaining backup copies of all content and data provided to the Service Provider, unless separately agreed in writing.
      </p>

      <p style={pStyle}>
        <strong>Designated Point of Contact:</strong> The Client shall designate a single point of contact for all communications relating to the services under this Agreement in order to avoid miscommunication or conflicting instructions.
      </p>

      {/* 7. FEES AND PAYMENT TERMS */}
      <h2 style={h2Style}>7. FEES AND PAYMENT TERMS</h2>

      <p style={pStyle}>
        The Client agrees to pay the Service Provider the applicable fees for hosting and maintenance services as outlined in Exhibit A, which may be charged on a monthly or annual basis, depending on the selected plan. All fees are due in advance of the service period and are nonrefundable once the billing cycle has commenced unless expressly stated otherwise in this Agreement.
      </p>

      <p style={pStyle}>
        Invoices shall be issued electronically, and payments shall be made through the method specified by the Service Provider. The Service Provider reserves the right to suspend services, including access to the hosted website, if payment is not received within five calendar days following the due date stated on the invoice.
      </p>

      <p style={pStyle}>
        Any late payment shall be subject to a late fee of five percent of the outstanding balance per thirty-day period or the maximum permitted by law, whichever is lower. Continued nonpayment exceeding thirty calendar days may result in the permanent suspension of hosting services and removal of the website from the Hosting Platform.
      </p>

      <p style={pStyle}>
        The Service Provider shall not be obligated to commence or continue any service unless all outstanding fees are paid in full. The Client shall also be responsible for any third-party transaction or processing fees incurred during payment.
      </p>

      {/* 8. TERM AND TERMINATION */}
      <h2 style={h2Style}>8. TERM AND TERMINATION</h2>

      <p style={pStyle}>
        This Agreement shall commence on the Effective Date and shall remain in effect on a rolling monthly or annual basis, depending on the hosting plan selected by the Client, as specified in Exhibit A, unless terminated in accordance with this section.
      </p>

      <p style={pStyle}>
        The Agreement shall automatically renew at the end of each billing cycle unless the Client provides written notice of nonrenewal at least ten calendar days prior to the renewal date. The Service Provider may also decline renewal by giving similar written notice within the same timeframe.
      </p>

      <p style={pStyle}>
        Either Party may terminate this Agreement at any time by providing at least ten calendar days' written notice to the other Party. The Service Provider may suspend or terminate services immediately if the Client materially breaches the terms of this Agreement, including failure to pay fees, misuse of the hosting services, or repeated interference with the scope of agreed deliverables.
      </p>

      <p style={pStyle}>
        Upon termination, the Service Provider shall retain the hosted website files and related data for up to seven calendar days unless instructed otherwise in writing. After this period, all website files and data under the Service Provider's control may be permanently deleted without further notice. The Client is solely responsible for downloading or transferring any content or data prior to deletion.
      </p>

      <p style={pStyle}>
        No refunds shall be issued for any unused portion of the hosting term unless otherwise agreed in writing.
      </p>

      {/* 9. DATA SECURITY AND PRIVACY COMPLIANCE */}
      <h2 style={h2Style}>9. DATA SECURITY AND PRIVACY COMPLIANCE</h2>

      <p style={pStyle}>
        The Service Provider shall take reasonable measures to ensure that form submissions processed through the website's designated form tool are correctly routed to the Client's chosen email address or destination. However, the Service Provider does not access, store, or manage form data beyond basic form functionality testing and shall not be held liable for the content, accuracy, or legal compliance of any data collected through the website.
      </p>

      <p style={pStyle}>
        The Client acknowledges that they are the data controller for all information submitted through the website's forms and shall remain solely responsible for ensuring compliance with applicable data protection laws, including but not limited to laws governing consent, data retention, and user notification requirements.
      </p>

      <p style={pStyle}>
        All form submissions shall be handled using a third-party form processor selected by the Service Provider or the Client, and such data shall be subject to the privacy practices and legal terms of that provider. The Service Provider makes no warranties or representations regarding the data handling practices, availability, or compliance posture of such third-party services and disclaims all responsibility for any resulting data breaches, delivery failures, or compliance violations beyond its direct control.
      </p>

      {/* 10. INTELLECTUAL PROPERTY RIGHTS */}
      <h2 style={h2Style}>10. INTELLECTUAL PROPERTY RIGHTS</h2>

      <p style={pStyle}>
        The Client shall retain full ownership of all original content, including text, images, videos, logos, and other proprietary materials provided by the Client for use on the hosted website. This ownership extends to any edits or updates made to such content during the course of the hosting and maintenance services.
      </p>

      <p style={pStyle}>
        The Service Provider shall retain all rights, title, and interest in and to any tools, systems, scripts, configurations, or custom settings used to deploy, maintain, or support the website through the Hosting Platform. This includes, without limitation, any server-side configurations, deployment scripts, automation tools, or other infrastructure components developed or maintained by the Service Provider in the course of fulfilling this Agreement.
      </p>

      <p style={pStyle}>
        Nothing in this Agreement shall be interpreted as granting the Client any rights to the Service Provider's proprietary systems, workflows, or hosting framework, except as necessary for the Client's use and display of the website during the term of this Agreement.
      </p>

      {/* 11. WARRANTIES AND DISCLAIMERS */}
      <h2 style={h2Style}>11. WARRANTIES AND DISCLAIMERS</h2>

      <p style={pStyle}>
        The Client acknowledges and agrees that the services provided under this Agreement are subject to reasonable technical and operational limitations. Accordingly, the following warranties and disclaimers shall apply:
      </p>

      <p style={pStyle}>
        The Service Provider shall make commercially reasonable efforts to ensure that the hosted website remains accessible and functional during the term of this Agreement.
      </p>

      <p style={pStyle}>
        The Service Provider does not warrant uninterrupted access or continuous uptime of the website. Service interruptions may occur due to maintenance, hosting provider outages, or circumstances beyond the Service Provider's control.
      </p>

      <p style={pStyle}>
        The Service Provider does not guarantee full compliance with accessibility laws, privacy regulations, or any industry-specific requirements unless such compliance has been expressly agreed upon in a separate written agreement. Any basic accessibility or compliance support provided shall be limited to reasonable efforts and shall not constitute a legal warranty or certification.
      </p>

      <p style={pStyle}>
        The Service Provider does not provide advanced analytics/tracking management, comprehensive SEO services, or security monitoring beyond what the Hosting Platform natively provides, unless expressly agreed in a separate written agreement.
      </p>

      <p style={pStyle}>
        All services are provided on an "as-is" and "as-available" basis. The Service Provider disclaims all other warranties, whether express or implied, including but not limited to any warranties of merchantability, fitness for a particular purpose, or noninfringement.
      </p>

      {/* 12. LIMITATION OF LIABILITY */}
      <h2 style={h2Style}>12. LIMITATION OF LIABILITY</h2>

      <p style={pStyle}>
        To the fullest extent permitted by applicable law, the total cumulative liability of the Service Provider for any claims, losses, damages, or causes of action arising out of or related to this Agreement, whether in contract, tort, or otherwise, shall be strictly limited to the total amount of fees actually paid by the Client to the Service Provider under this Agreement in the three calendar months immediately preceding the event giving rise to the claim.
      </p>

      <p style={pStyle}>
        In no event shall the Service Provider be liable for any indirect, incidental, special, consequential, or exemplary damages, including but not limited to loss of profits, business interruption, loss of data, or reputational harm, even if advised of the possibility of such damages.
      </p>

      <p style={pStyle}>
        The Client acknowledges that this limitation of liability is a material part of the consideration exchanged under this Agreement and forms an essential basis of the bargain between the Parties.
      </p>

      {/* 13. INDEMNIFICATION */}
      <h2 style={h2Style}>13. INDEMNIFICATION</h2>

      <p style={pStyle}>
        The Client agrees to indemnify, defend, and hold harmless the Service Provider, along with its affiliates, contractors, and representatives, from and against any and all claims, liabilities, damages, losses, costs, and expenses, including reasonable legal fees, arising out of or in connection with the Client's use or misuse of the hosting services or any breach of this Agreement.
      </p>

      <p style={pStyle}>
        This indemnity includes, but is not limited to, claims resulting from any content, data, or materials provided by the Client that infringe upon the intellectual property rights, privacy rights, or other legal rights of any third party. It also covers any claims or investigations arising from the Client's failure to comply with applicable laws, regulations, or third-party platform requirements related to advertising, data privacy, accessibility, or consumer protection.
      </p>

      <p style={pStyle}>
        In addition, the Client shall indemnify the Service Provider against any third-party disputes or claims arising from the content, functionality, or usage of the hosted website, including but not limited to form data collection, misleading statements, or operational failures under the Client's direction.
      </p>

      <p style={pStyle}>
        This indemnification obligation shall survive the termination or expiration of this Agreement and shall remain enforceable for any events occurring during the term of service.
      </p>

      {/* 14. CONFIDENTIALITY */}
      <h2 style={h2Style}>14. CONFIDENTIALITY</h2>

      <p style={pStyle}>
        The Service Provider agrees to maintain the confidentiality of all non-public information, materials, and credentials shared by the Client in connection with the hosting services. This includes but is not limited to website login credentials, administrative access, proprietary content, business strategies, unpublished media, and any other information marked or reasonably understood to be confidential in nature.
      </p>

      <p style={pStyle}>
        Such information shall be used solely for the purpose of delivering the services outlined in this Agreement and shall not be disclosed to any third party without the Client's prior written consent, except as required by law or by order of a competent authority.
      </p>

      <p style={pStyle}>
        The Service Provider shall take reasonable administrative, technical, and physical precautions to safeguard confidential information against unauthorized use, access, or disclosure. However, the Service Provider shall not be held liable for any breach resulting from causes beyond its reasonable control, including breaches affecting third-party tools, servers, or communication platforms not operated by the Service Provider.
      </p>

      <p style={pStyle}>
        This confidentiality obligation shall survive the termination of this Agreement and remain in effect for a period of two years following the completion of services.
      </p>

      {/* 15. FORCE MAJEURE */}
      <h2 style={h2Style}>15. FORCE MAJEURE</h2>

      <p style={pStyle}>
        The Service Provider shall not be held liable for any delay or failure in performance, including downtime, interruptions, or loss of data, resulting from causes beyond its reasonable control. These causes may include, but are not limited to, natural disasters, acts of war or terrorism, civil disturbances, labor disputes, government restrictions, utility outages, failures of internet service providers, third-party hosting or form processing outages, or any other events commonly classified as force majeure.
      </p>

      <p style={pStyle}>
        Such events shall not constitute a breach of this Agreement, and the affected Party shall be excused from performance for the duration of the event and a reasonable recovery period thereafter. The Service Provider shall make commercially reasonable efforts to resume services as soon as practicable following any such disruption.
      </p>

      {/* 16. NOTICES */}
      <h2 style={h2Style}>16. NOTICES</h2>

      <p style={pStyle}>
        All notices, requests, consents, and other communications required or permitted under this Agreement shall be in writing and shall be deemed properly given when delivered in person, sent by certified mail with return receipt requested, or sent via electronic mail with delivery confirmation to the addresses provided above or such other address as either Party may designate by written notice.
      </p>

      <p style={pStyle}>
        Notices delivered in person shall be effective immediately upon delivery. Notices sent by certified mail shall be effective three business days after mailing. Notices sent by electronic mail shall be effective upon confirmation of successful transmission.
      </p>

      <p style={pStyle}>
        Each Party agrees to keep its contact information current and to promptly notify the other Party of any changes.
      </p>

      {/* 17. CYBERSECURITY DISCLAIMER */}
      <h2 style={h2Style}>17. CYBERSECURITY DISCLAIMER</h2>

      <p style={pStyle}>
        The Service Provider is not a cybersecurity expert and does not offer professional security advice or services. However, the Service Provider <strong>may implement basic security-related configurations or precautions</strong> that it believes are appropriate for the nature of the services provided, particularly in connection with static websites hosted through third-party platforms. These optional actions are taken at the sole discretion of the Service Provider and are not intended to serve as comprehensive protection against cyber threats.
      </p>

      <p style={pStyle}>
        The Client understands and accepts that <strong>all websites and online systems are inherently vulnerable to cybersecurity risks</strong>, and that no guarantee can be made regarding complete protection from unauthorized access, malicious activity, data loss, service disruption, or other security-related incidents.
      </p>

      <p style={pStyle}>
        The Service Provider does not monitor for, detect, or respond to cybersecurity threats beyond the standard capabilities provided by the selected third-party hosting or form processing platforms. Furthermore, the Service Provider does not warrant or assume responsibility for the security of third-party systems, including but not limited to hosting providers, domain registrars, analytics tools, or contact form services.
      </p>

      <p style={pStyle}>
        To the fullest extent permitted by law, <strong>the Service Provider disclaims all liability for any losses, damages, claims, or disruptions resulting from cybersecurity incidents</strong>, unless such incidents result directly from the Service Provider's intentional misconduct.
      </p>

      {/* 18. GOVERNING LAW AND DISPUTE RESOLUTION */}
      <h2 style={h2Style}>18. GOVERNING LAW AND DISPUTE RESOLUTION</h2>

      <p style={pStyle}>
        This Agreement shall be governed by and construed in accordance with the laws of the State of New Jersey, without regard to its conflict of law principles. Any legal action or proceeding arising out of or relating to this Agreement shall be brought exclusively in the Superior Court of Monmouth County, New Jersey, and each party irrevocably submits to the personal and exclusive jurisdiction of such courts.
      </p>

      <p style={pStyle}>
        In the event of any dispute, claim, or disagreement arising out of or relating to this Agreement or the services provided, the parties agree to first attempt to resolve the matter through good-faith discussions. If the dispute cannot be resolved through direct negotiation within ten calendar days, either party may proceed to seek legal remedies in the designated court. Nothing in this section shall prevent the Service Provider from seeking injunctive or equitable relief in any court of competent jurisdiction to protect its intellectual property rights or confidential information.
      </p>

      {/* 19. MISCELLANEOUS PROVISIONS */}
      <h2 style={h2Style}>19. MISCELLANEOUS PROVISIONS</h2>

      <p style={pStyle}>
        Neither Party may assign or transfer its rights or obligations under this Agreement without the prior written consent of the other Party, except that the Service Provider may assign this Agreement to an affiliate or successor entity as part of a business transfer or reorganization.
      </p>

      <p style={pStyle}>
        No waiver of any term or condition of this Agreement shall be deemed a continuing waiver or a further waiver of the same or any other term. Any amendments or modifications must be made in writing and signed by both Parties.
      </p>

      <p style={pStyle}>
        If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
      </p>

      <p style={pStyle}>
        This Agreement may be executed in counterparts, each of which shall be deemed an original and all of which together shall constitute one and the same agreement. Electronic signatures shall have the same legal effect as original signatures.
      </p>

      <p style={pStyle}>
        This Agreement represents the entire understanding between the Parties with respect to the subject matter herein and supersedes all prior discussions, communications, or agreements, whether written or oral.
      </p>

      {/* EXHIBIT A */}
      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '2px solid #000' }}>
        <h2 style={{...h2Style, textAlign: 'center', fontSize: '14pt'}}>
          EXHIBIT A - SCOPE OF HOSTING AND MAINTENANCE
        </h2>

        <p style={pStyle}>
          This Exhibit outlines the specific hosting and maintenance services to be provided by the Service Provider under the Agreement. All services are limited to the scope described below. Any additional work or service beyond this Exhibit shall require a separate written agreement.
        </p>

        <h3 style={h3Style}>Website Type and Hosting Environment</h3>

        <p style={pStyle}>
          The Client's website will be hosted and maintained as described below, based on the selected configuration and service level.
        </p>

        <div style={{ marginLeft: '24px', marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              checked={websiteType === 'static'} 
              onChange={() => updateField('websiteType', 'static')}
              style={{ marginTop: '4px', marginRight: '8px', cursor: 'pointer' }} 
            />
            <span>Static Website (default)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              checked={websiteType === 'dynamic'} 
              onChange={() => updateField('websiteType', 'dynamic')}
              style={{ marginTop: '4px', marginRight: '8px', cursor: 'pointer' }} 
            />
            <span>Static Website with Minor Dynamic Features</span>
          </label>
          {websiteType === 'dynamic' && (
            <div style={{ marginLeft: '28px', marginTop: '8px' }}>
              <span>(specify): </span>
              <input
                type="text"
                value={dynamicFeatures}
                onChange={(e) => updateField('dynamicFeatures', e.target.value)}
                placeholder="e.g., contact form, basic animations"
                style={{
                  ...editableInputStyle,
                  width: '300px',
                  textAlign: 'left'
                }}
              />
            </div>
          )}
        </div>

        <p style={pStyle}>
          Hosting will be managed by the Service Provider using a selected third-party hosting platform. Hosting includes deployment, uptime monitoring, and server configuration. The Service Provider will coordinate any required account setup unless otherwise agreed.
        </p>

        <h3 style={h3Style}>Maintenance Services</h3>
        <p style={pStyle}>The following maintenance services are included:</p>

        <div style={{ marginLeft: '24px', marginBottom: '16px' }}>
          {[
            'Periodic testing of website uptime and form functionality',
            'Minor updates to existing content areas (e.g., text, images, video replacements)',
            'Addition of SEO tracking tags or metadata',
            'Domain and SSL monitoring (if applicable)',
            'Troubleshooting broken links or display issues',
            'Monthly software/package updates applicable to the static site stack'
          ].map((service, index) => (
            <label key={index} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={maintenanceServices?.[index] || false} 
                onChange={() => toggleMaintenanceService(index)}
                style={{ marginTop: '4px', marginRight: '8px', cursor: 'pointer' }} 
              />
              <span>{service}</span>
            </label>
          ))}
        </div>

        <h3 style={h3Style}>Content Updates</h3>
        <p style={pStyle}>Permitted updates under this Agreement include only the following:</p>

        <div style={{ marginLeft: '24px', marginBottom: '16px' }}>
          {[
            'Swapping or editing existing images and video',
            'Editing or replacing existing text',
            'Adding new content of the same type or layout (e.g., new city in a list of cities served)',
            'Replacing contact information or business details',
            'Adding embedded links or external resources'
          ].map((update, index) => (
            <label key={index} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={contentUpdates?.[index] || false} 
                onChange={() => toggleContentUpdate(index)}
                style={{ marginTop: '4px', marginRight: '8px', cursor: 'pointer' }} 
              />
              <span>{update}</span>
            </label>
          ))}
        </div>

        <h3 style={h3Style}>Excluded Services</h3>
        <p style={pStyle}>The following items are not included and will require a separate agreement:</p>
        <div style={{ marginLeft: '24px', marginBottom: '16px' }}>
          <p style={{ margin: '4px 0' }}>✘ New web pages</p>
          <p style={{ margin: '4px 0' }}>✘ Structural layout changes</p>
          <p style={{ margin: '4px 0' }}>✘ Custom integrations or third-party apps</p>
          <p style={{ margin: '4px 0' }}>✘ Complete redesign or rebranding</p>
          <p style={{ margin: '4px 0' }}>✘ Copywriting for new sections</p>
          <p style={{ margin: '4px 0' }}>✘ ADA accessibility audits or certifications</p>
          <p style={{ margin: '4px 0' }}>✘ Legal or compliance consulting</p>
          <p style={{ margin: '4px 0' }}>✘ Advanced analytics management or SEO campaigns</p>
          <p style={{ margin: '4px 0' }}>✘ Security monitoring beyond hosting platform defaults</p>
        </div>

        <h3 style={h3Style}>Form Management</h3>

        <div style={{ marginLeft: '24px', marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={formMonitoring || false} 
              onChange={(e) => updateField('formMonitoring', e.target.checked)}
              style={{ marginTop: '4px', marginRight: '8px', cursor: 'pointer' }} 
            />
            <span>Form monitoring and delivery testing (using Formspree or equivalent)</span>
          </label>

          <p style={{ marginTop: '12px', marginBottom: '8px' }}>Formspree account managed by:</p>
          <div style={{ marginLeft: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', cursor: 'pointer' }}>
              <input 
                type="radio" 
                checked={formspreeManagement === 'service-provider'} 
                onChange={() => updateField('formspreeManagement', 'service-provider')}
                style={{ marginTop: '4px', marginRight: '8px', cursor: 'pointer' }} 
              />
              <span>Service Provider</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', cursor: 'pointer' }}>
              <input 
                type="radio" 
                checked={formspreeManagement === 'client'} 
                onChange={() => updateField('formspreeManagement', 'client')}
                style={{ marginTop: '4px', marginRight: '8px', cursor: 'pointer' }} 
              />
              <span>Client</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', cursor: 'pointer' }}>
              <input 
                type="radio" 
                checked={formspreeManagement === 'joint'} 
                onChange={() => updateField('formspreeManagement', 'joint')}
                style={{ marginTop: '4px', marginRight: '8px', cursor: 'pointer' }} 
              />
              <span>Joint access</span>
            </label>
          </div>
        </div>

        <p style={pStyle}>
          <strong>Service Start Date:</strong>{' '}
          <input
            type="date"
            value={serviceStartDate}
            onChange={(e) => updateField('serviceStartDate', e.target.value)}
            style={{
              ...editableInputStyle,
              width: '140px'
            }}
          />
        </p>

        <p style={pStyle}><strong>Billing Period:</strong></p>
        <div style={{ marginLeft: '24px', marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              checked={billingPeriod === 'monthly'} 
              onChange={() => updateField('billingPeriod', 'monthly')}
              style={{ marginTop: '4px', marginRight: '8px', cursor: 'pointer' }} 
            />
            <span>Monthly</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              checked={billingPeriod === 'quarterly'} 
              onChange={() => updateField('billingPeriod', 'quarterly')}
              style={{ marginTop: '4px', marginRight: '8px', cursor: 'pointer' }} 
            />
            <span>Quarterly</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              checked={billingPeriod === 'annually'} 
              onChange={() => updateField('billingPeriod', 'annually')}
              style={{ marginTop: '4px', marginRight: '8px', cursor: 'pointer' }} 
            />
            <span>Annually</span>
          </label>
        </div>

        <p style={pStyle}><strong>Additional Notes or Customizations:</strong></p>
        <textarea
          value={additionalNotes}
          onChange={(e) => updateField('additionalNotes', e.target.value)}
          placeholder="Enter any additional notes..."
          style={{
            width: '100%',
            minHeight: '80px',
            marginLeft: '24px',
            marginBottom: '16px',
            padding: '8px',
            fontFamily: 'Times New Roman, serif',
            fontSize: '11pt',
            border: '1px solid #999',
            borderRadius: '4px',
            resize: 'vertical'
          }}
        />

        <h3 style={h3Style}>Fees and Payment Terms</h3>

        <p style={pStyle}>
          The Client agrees to pay the Service Provider the following fee for hosting and maintenance services:
        </p>

        <p style={pStyle}>
          <strong>Total Fee:</strong> $
          <input
            type="number"
            step="0.01"
            value={totalFee}
            onChange={(e) => updateField('totalFee', e.target.value)}
            placeholder="0.00"
            style={{
              ...editableInputStyle,
              width: '80px'
            }}
          />
          {' '}per{' '}
          <label style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              checked={feeFrequency === 'month'} 
              onChange={() => updateField('feeFrequency', 'month')}
              style={{ marginRight: '4px', cursor: 'pointer' }} 
            />
            month
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              checked={feeFrequency === 'quarter'} 
              onChange={() => updateField('feeFrequency', 'quarter')}
              style={{ marginRight: '4px', cursor: 'pointer' }} 
            />
            quarter
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              checked={feeFrequency === 'year'} 
              onChange={() => updateField('feeFrequency', 'year')}
              style={{ marginRight: '4px', cursor: 'pointer' }} 
            />
            year
          </label>
        </p>

        <p style={pStyle}><strong>Invoicing Method:</strong></p>
        <div style={{ marginLeft: '24px', marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              checked={invoicingMethod === 'upfront'} 
              onChange={() => updateField('invoicingMethod', 'upfront')}
              style={{ marginTop: '4px', marginRight: '8px', cursor: 'pointer' }} 
            />
            <span>Paid upfront on or before the service start date</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              checked={invoicingMethod === 'recurring'} 
              onChange={() => updateField('invoicingMethod', 'recurring')}
              style={{ marginTop: '4px', marginRight: '8px', cursor: 'pointer' }} 
            />
            <span>Recurring automatic payments</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              checked={invoicingMethod === 'other'} 
              onChange={() => updateField('invoicingMethod', 'other')}
              style={{ marginTop: '4px', marginRight: '8px', cursor: 'pointer' }} 
            />
            <span>Other: </span>
            {invoicingMethod === 'other' && (
              <input
                type="text"
                value={invoicingOther}
                onChange={(e) => updateField('invoicingOther', e.target.value)}
                placeholder="Specify method"
                style={{
                  ...editableInputStyle,
                  width: '200px',
                  marginLeft: '8px',
                  textAlign: 'left'
                }}
              />
            )}
          </label>
        </div>

        <p style={pStyle}>
          <strong>Late Payment Terms:</strong> A late fee of $
          <input
            type="number"
            step="0.01"
            value={lateFeeAmount}
            onChange={(e) => updateField('lateFeeAmount', e.target.value)}
            placeholder="0.00"
            style={{
              ...editableInputStyle,
              width: '60px'
            }}
          />
          {' '}or{' '}
          <input
            type="number"
            step="0.1"
            value={lateFeePercentage}
            onChange={(e) => updateField('lateFeePercentage', e.target.value)}
            placeholder="0"
            style={{
              ...editableInputStyle,
              width: '50px'
            }}
          />
          % of the outstanding balance may be applied for payments not received within{' '}
          <input
            type="number"
            value={lateFeeDays}
            onChange={(e) => updateField('lateFeeDays', e.target.value)}
            placeholder="0"
            style={{
              ...editableInputStyle,
              width: '50px'
            }}
          />
          {' '}days of the due date.
        </p>

       {/* SIGNATURES SECTION */}
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #000' }}>
          <h3 style={h3Style}>SIGNATURES</h3>
          
          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '16px' }}>FOR THE SERVICE PROVIDER</p>
            <p>{serviceProviderCompany}</p>
            <p style={{ marginTop: '24px' }}>Signature: _________________________</p>
            <p style={{ marginTop: '16px' }}>Name: {serviceProviderName}</p>
            <p style={{ marginTop: '16px' }}>Date: {day && month && year ? `${month} ${day}, ${year}` : ''}</p>
          </div>

          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '16px' }}>FOR THE CLIENT</p>
            <p>{clientCompanyName}</p>
            <p style={{ marginTop: '24px' }}>Signature: _________________________</p>
            <p style={{ marginTop: '16px' }}>Name: {clientFirstName}</p>
            <p style={{ marginTop: '16px' }}>Date: {day && month && year ? `${month} ${day}, ${year}` : ''}</p>
          </div>
        </div>
      </div>

      {/* DOWNLOAD BUTTONS */}
      <div style={{ 
        marginTop: '48px', 
        paddingTop: '24px', 
        borderTop: '2px solid #000',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={() => generateDocument(formData, 'pdf')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            📄 Download as PDF
          </button>
          <button
            onClick={() => generateDocument(formData, 'doc')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            📝 Download as DOC
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContractDocument