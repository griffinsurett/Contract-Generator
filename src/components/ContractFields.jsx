import React from "react";

/**
 * ContractField - Shows editable input in admin view, static text in client view
 * @param {boolean} hideIfEmpty - If true (default), hides the field in client view when empty
 */
export const ContractField = ({
  value,
  onChange,
  placeholder,
  className,
  type = "text",
  isClientView,
  step,
  min,
  max,
  hideIfEmpty = true
}) => {
  if (isClientView) {
    if (hideIfEmpty && !value) return null;
    return (
      <span className="font-medium text-gray-900 border-b border-gray-400 px-1">
        {value || placeholder || "___________"}
      </span>
    );
  }
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      step={step}
      min={min}
      max={max}
    />
  );
};

/**
 * ContractTextarea - Shows editable textarea in admin view, static text in client view
 * Hides automatically in client view when empty
 */
export const ContractTextarea = ({
  value,
  onChange,
  placeholder,
  className,
  isClientView
}) => {
  if (isClientView) {
    if (!value) return null;
    return <p className="contract-p whitespace-pre-wrap">{value}</p>;
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

/**
 * ContractRadioGroup - Shows radio buttons in admin view, selected option text in client view
 * @param {boolean} hideIfEmpty - If true (default), hides in client view when nothing selected
 */
export const ContractRadioGroup = ({
  options,
  selectedValue,
  onChange,
  isClientView,
  name,
  className = "flex flex-col ml-6 mb-4",
  hideIfEmpty = true
}) => {
  if (isClientView) {
    const selected = options.find(opt => opt.value === selectedValue);
    if (hideIfEmpty && !selected) return null;
    return (
      <span className="font-medium text-gray-900">
        {selected?.label || selectedValue || "Not specified"}
      </span>
    );
  }
  return (
    <div className={className}>
      {options.map((option) => (
        <label key={option.value} className="contract-checkbox-label">
          <input
            type="radio"
            name={name}
            checked={selectedValue === option.value}
            onChange={() => onChange(option.value)}
            className="contract-checkbox"
          />
          <span>{option.label}</span>
          {option.extra && selectedValue === option.value && option.extra}
        </label>
      ))}
    </div>
  );
};

/**
 * ContractCheckbox - Shows checkbox in admin view, checkmark + text if checked in client view
 * @param {boolean} hideIfUnchecked - If true (default), hides in client view when unchecked
 */
export const ContractCheckbox = ({
  checked,
  onChange,
  label,
  isClientView,
  hideIfUnchecked = true
}) => {
  if (isClientView) {
    if (hideIfUnchecked && !checked) return null;
    return (
      <p className="flex items-start gap-2">
        <span className="text-green-600">✓</span>
        <span>{label}</span>
      </p>
    );
  }
  return (
    <label className="contract-checkbox-label">
      <input
        type="checkbox"
        checked={checked || false}
        onChange={onChange}
        className="contract-checkbox"
      />
      <span>{label}</span>
    </label>
  );
};

/**
 * ContractCheckboxList - Shows checkboxes in admin view, checked items as list in client view
 * @param {boolean} hideIfEmpty - If true (default), hides entire section in client view when nothing checked
 */
export const ContractCheckboxList = ({
  items,
  checkedArray,
  onToggle,
  isClientView,
  hideIfEmpty = true
}) => {
  if (isClientView) {
    const checkedItems = items.filter((_, idx) => checkedArray?.[idx]);
    if (checkedItems.length === 0) {
      if (hideIfEmpty) return null;
      // Show "None selected" message if hideIfEmpty is false
      return (
        <p className="ml-6 mb-4 text-gray-500 italic">None selected</p>
      );
    }
    return (
      <ul className="ml-6 mb-4 space-y-1">
        {checkedItems.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="flex flex-col ml-6 mb-4">
      {items.map((item, index) => (
        <label key={index} className="contract-checkbox-label">
          <input
            type="checkbox"
            checked={checkedArray?.[index] || false}
            onChange={() => onToggle(index)}
            className="contract-checkbox"
          />
          <span>{item}</span>
        </label>
      ))}
    </div>
  );
};

/**
 * ContractSection - Wrapper that hides entire section in client view if content is empty
 * @param {boolean} hideIfEmpty - If true (default), hides section when hasContent is false
 * @param {boolean} hasContent - Whether the section has meaningful content to display
 */
export const ContractSection = ({
  children,
  isClientView,
  hideIfEmpty = true,
  hasContent = true,
  title,
  titleClassName = "contract-h3"
}) => {
  if (isClientView && hideIfEmpty && !hasContent) return null;
  return (
    <>
      {title && <h3 className={titleClassName}>{title}</h3>}
      {children}
    </>
  );
};

/**
 * AdminOnly - Only renders children in admin view
 */
export const AdminOnly = ({ isClientView, children }) => {
  if (isClientView) return null;
  return <>{children}</>;
};

/**
 * ClientOnly - Only renders children in client view
 */
export const ClientOnly = ({ isClientView, children }) => {
  if (!isClientView) return null;
  return <>{children}</>;
};

/**
 * ConditionalContent - Renders different content based on view
 */
export const ConditionalContent = ({ isClientView, adminContent, clientContent }) => {
  return isClientView ? clientContent : adminContent;
};
