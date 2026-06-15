/* @ds-bundle: {"format":3,"namespace":"UrbanLoftDesignSystem_6db930","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"Chip","sourcePath":"components/display/Chip.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"8f0cec9a49a5","components/display/Card.jsx":"027c8819a63f","components/display/Chip.jsx":"385e3231afe0","components/feedback/Tooltip.jsx":"f7d12e1a6502","components/forms/Checkbox.jsx":"b2ac0a52a8b3","components/forms/Input.jsx":"ef7fd3216470","components/forms/Radio.jsx":"287e5f0d6700","ui_kits/marketplace/FilterSidebar.jsx":"ac3930449282","ui_kits/marketplace/Header.jsx":"34166db7c6e8","ui_kits/marketplace/ListingsScreen.jsx":"26bdc8172527","ui_kits/marketplace/PropertyDetail.jsx":"508daa5e5055","ui_kits/marketplace/data.jsx":"5ae41eeb4ebe"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.UrbanLoftDesignSystem_6db930 = window.UrbanLoftDesignSystem_6db930 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    padding: '6px 12px',
    fontSize: '14px',
    height: '32px'
  },
  md: {
    padding: '8px 20px',
    fontSize: '14px',
    height: '40px'
  },
  lg: {
    padding: '12px 28px',
    fontSize: '16px',
    height: '48px'
  }
};
const VARIANTS = {
  primary: {
    base: {
      background: 'var(--color-charcoal)',
      color: 'var(--color-white)',
      border: '1px solid transparent',
      boxShadow: 'var(--shadow-sm)'
    },
    hover: {
      background: 'var(--color-charcoal-hover)'
    }
  },
  secondary: {
    base: {
      background: 'transparent',
      color: 'var(--color-charcoal)',
      border: '1px solid var(--color-charcoal)'
    },
    hover: {
      background: 'rgba(28,25,23,0.04)'
    }
  },
  ghost: {
    base: {
      background: 'transparent',
      color: 'var(--color-stone-600)',
      border: '1px solid transparent'
    },
    hover: {
      background: 'var(--color-stone-100)'
    }
  },
  destructive: {
    base: {
      background: 'var(--color-error)',
      color: 'var(--color-white)',
      border: '1px solid transparent',
      boxShadow: 'var(--shadow-sm)'
    },
    hover: {
      background: '#B91C1C'
    }
  }
};

/**
 * UrbanLoft primary button. Charcoal-led, subtle radius, architectural restraint.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  iconLeft = null,
  iconRight = null,
  type = 'button',
  onClick,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const composed = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-sm)',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    lineHeight: 1,
    height: s.height,
    padding: s.padding,
    fontSize: s.fontSize,
    borderRadius: 'var(--radius-default)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'background 150ms ease, box-shadow 150ms ease',
    whiteSpace: 'nowrap',
    ...v.base,
    ...(hover && !disabled ? v.hover : null),
    ...style
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: disabled ? undefined : onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: composed
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/display/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * UrbanLoft card — container for property listings and grouped content.
 * Composes an optional dark header strip, an image slot, and a body.
 */
function Card({
  children,
  elevated = false,
  header = null,
  image = null,
  imageHeight = 180,
  padding = 'var(--space-lg)',
  onClick,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: 'var(--surface-card)',
      border: elevated ? 'none' : '1px solid var(--color-stone-200)',
      borderRadius: 'var(--radius-default)',
      boxShadow: elevated ? hover ? 'var(--shadow-lg)' : 'var(--shadow-md)' : 'none',
      overflow: 'hidden',
      fontFamily: 'var(--font-body)',
      transition: 'box-shadow 150ms ease',
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }
  }, rest), header && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-charcoal)',
      color: 'var(--color-white)',
      padding: '8px 16px',
      fontSize: '12px',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-chip)'
    }
  }, header), image && /*#__PURE__*/React.createElement("div", {
    style: {
      height: typeof imageHeight === 'number' ? `${imageHeight}px` : imageHeight,
      background: 'var(--color-stone-100)',
      backgroundImage: typeof image === 'string' ? `url(${image})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }, typeof image !== 'string' ? image : null), /*#__PURE__*/React.createElement("div", {
    style: {
      padding
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/display/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLES = {
  filter: {
    background: 'var(--color-stone-50)',
    color: 'var(--color-charcoal)',
    border: '1px solid var(--color-stone-200)'
  },
  'filter-active': {
    background: 'var(--color-charcoal)',
    color: 'var(--color-white)',
    border: '1px solid transparent'
  },
  success: {
    background: 'var(--color-success-tint)',
    color: 'var(--color-success)',
    border: '1px solid transparent'
  },
  warning: {
    background: 'var(--color-warning-tint)',
    color: 'var(--color-warning)',
    border: '1px solid transparent'
  },
  error: {
    background: 'var(--color-error-tint)',
    color: 'var(--color-error)',
    border: '1px solid transparent'
  },
  info: {
    background: 'var(--color-info-tint)',
    color: 'var(--color-info)',
    border: '1px solid transparent'
  }
};

/**
 * UrbanLoft chip — filter pills and status labels. Always uppercase with tracking.
 */
function Chip({
  children,
  variant = 'filter',
  onClick,
  iconLeft = null,
  style = {},
  ...rest
}) {
  const v = STYLES[variant] || STYLES.filter;
  const interactive = variant === 'filter' || variant === 'filter-active';
  return /*#__PURE__*/React.createElement("span", _extends({
    onClick: onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-body)',
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: 1.4,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-chip)',
      cursor: interactive && onClick ? 'pointer' : 'default',
      userSelect: 'none',
      ...v,
      ...style
    }
  }, rest), iconLeft, children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Chip.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
/**
 * UrbanLoft tooltip — charcoal bubble with arrow. 150ms show, instant hide.
 */
function Tooltip({
  children,
  content,
  placement = 'top',
  style = {}
}) {
  const [open, setOpen] = React.useState(false);
  const timer = React.useRef(null);
  const show = () => {
    timer.current = setTimeout(() => setOpen(true), 150);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };
  const pos = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: '8px'
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: '8px'
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginRight: '8px'
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: '8px'
    }
  }[placement];
  const arrow = {
    top: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%) rotate(45deg)',
      marginTop: '-3px'
    },
    bottom: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%) rotate(45deg)',
      marginBottom: '-3px'
    },
    left: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%) rotate(45deg)',
      marginLeft: '-3px'
    },
    right: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%) rotate(45deg)',
      marginRight: '-3px'
    }
  }[placement];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex',
      ...style
    },
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide
  }, children, open && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: 'absolute',
      zIndex: 50,
      maxWidth: '220px',
      width: 'max-content',
      background: 'var(--color-charcoal)',
      color: 'var(--color-stone-50)',
      fontFamily: 'var(--font-body)',
      fontSize: '12px',
      lineHeight: 1.4,
      padding: '6px 10px',
      borderRadius: 'var(--radius-default)',
      boxShadow: 'var(--shadow-md)',
      pointerEvents: 'none',
      ...pos
    }
  }, content, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      width: '6px',
      height: '6px',
      background: 'var(--color-charcoal)',
      ...arrow
    }
  })));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * UrbanLoft checkbox. Supports checked, indeterminate and disabled.
 */
function Checkbox({
  checked = false,
  indeterminate = false,
  disabled = false,
  label,
  onChange,
  id,
  style = {},
  ...rest
}) {
  const inputId = id || React.useId();
  const active = checked || indeterminate;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      color: 'var(--color-charcoal)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: e => {
      if (disabled) return;
      e.preventDefault();
      onChange && onChange(!checked);
    },
    style: {
      width: '18px',
      height: '18px',
      flexShrink: 0,
      borderRadius: 'var(--radius-sm)',
      border: active ? 'none' : '1.5px solid var(--color-stone-300)',
      background: active ? 'var(--color-charcoal)' : 'var(--color-white)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 120ms ease, border 120ms ease'
    }
  }, indeterminate ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: '9px',
      height: '2px',
      background: 'var(--color-white)',
      borderRadius: '1px'
    }
  }) : checked ? /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2.5 6.2L4.8 8.5L9.5 3.5",
    stroke: "#fff",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })) : null), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: () => onChange && onChange(!checked),
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * UrbanLoft text input with label, helper and error messaging.
 */
function Input({
  label,
  helperText,
  error,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  id,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const inputId = id || React.useId();
  const hasError = Boolean(error);
  let border = '1px solid var(--color-stone-200)';
  let boxShadow = 'none';
  let background = 'var(--color-white)';
  if (disabled) {
    background = 'var(--color-stone-100)';
  } else if (hasError) {
    border = '2px solid var(--color-error)';
    boxShadow = '0 0 0 3px var(--error-ring)';
  } else if (focus) {
    border = '2px solid var(--color-charcoal)';
    boxShadow = '0 0 0 3px var(--focus-ring)';
  } else if (hover) {
    border = '1px solid var(--color-charcoal)';
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-body)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontSize: '14px',
      fontWeight: 500,
      color: 'var(--color-charcoal)',
      marginBottom: '6px'
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: type,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      boxSizing: 'border-box',
      height: '40px',
      padding: hasError || focus ? '8px 11px' : '8px 12px',
      borderRadius: 'var(--radius-default)',
      border,
      boxShadow,
      background,
      color: 'var(--color-charcoal)',
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      outline: 'none',
      transition: 'border 120ms ease, box-shadow 120ms ease'
    }
  }, rest)), hasError ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: 'var(--color-error)',
      marginTop: '4px'
    }
  }, error) : helperText ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: 'var(--color-stone-600)',
      marginTop: '4px'
    }
  }, helperText) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * UrbanLoft radio button. Use within a RadioGroup or standalone.
 */
function Radio({
  checked = false,
  disabled = false,
  label,
  name,
  value,
  onChange,
  id,
  style = {},
  ...rest
}) {
  const inputId = id || React.useId();
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      color: 'var(--color-charcoal)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: e => {
      if (disabled) return;
      e.preventDefault();
      onChange && onChange(value);
    },
    style: {
      width: '18px',
      height: '18px',
      flexShrink: 0,
      borderRadius: 'var(--radius-full)',
      border: checked ? '2px solid var(--color-charcoal)' : '1.5px solid var(--color-stone-300)',
      background: 'var(--color-white)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'border 120ms ease'
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: '8px',
      height: '8px',
      borderRadius: 'var(--radius-full)',
      background: 'var(--color-charcoal)'
    }
  })), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: "radio",
    name: name,
    value: value,
    checked: checked,
    disabled: disabled,
    onChange: () => onChange && onChange(value),
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketplace/FilterSidebar.jsx
try { (() => {
// UrbanLoft marketplace — filter sidebar (composes Input, Chip, Checkbox, Radio).
function FilterSidebar({
  typeFilter,
  onToggleType
}) {
  const {
    Input,
    Chip,
    Checkbox,
    Radio
  } = window.UrbanLoftDesignSystem_6db930;
  const [sort, setSort] = React.useState('newest');
  const [amenities, setAmenities] = React.useState({
    parking: true,
    hvac: false,
    freight: false
  });
  const Section = ({
    title,
    children
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 'var(--space-lg)',
      marginBottom: 'var(--space-lg)',
      borderBottom: '1px solid var(--divider)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-chip)',
      color: 'var(--text-secondary)',
      marginBottom: 'var(--space-md)'
    }
  }, title), children);
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 264,
      flexShrink: 0,
      padding: 'var(--space-xl)',
      background: 'var(--surface-card)',
      borderRight: '1px solid var(--border-default)',
      minHeight: '100%'
    }
  }, /*#__PURE__*/React.createElement(Section, {
    title: "Location"
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Neighborhood or ZIP",
    defaultValue: "Brooklyn, NY"
  })), /*#__PURE__*/React.createElement(Section, {
    title: "Property Type"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-sm)'
    }
  }, window.PROPERTY_TYPES.map(t => /*#__PURE__*/React.createElement(Chip, {
    key: t,
    variant: typeFilter.includes(t) ? 'filter-active' : 'filter',
    onClick: () => onToggleType(t)
  }, t)))), /*#__PURE__*/React.createElement(Section, {
    title: "Monthly Rent"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-sm)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Min",
    defaultValue: "$2,000"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, "\u2013"), /*#__PURE__*/React.createElement(Input, {
    placeholder: "Max",
    defaultValue: "$16,000"
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "Amenities"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-sm)'
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    checked: amenities.parking,
    onChange: v => setAmenities(a => ({
      ...a,
      parking: v
    })),
    label: "Parking"
  }), /*#__PURE__*/React.createElement(Checkbox, {
    checked: amenities.hvac,
    onChange: v => setAmenities(a => ({
      ...a,
      hvac: v
    })),
    label: "Central HVAC"
  }), /*#__PURE__*/React.createElement(Checkbox, {
    checked: amenities.freight,
    onChange: v => setAmenities(a => ({
      ...a,
      freight: v
    })),
    label: "Freight elevator"
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "Sort By"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-sm)'
    }
  }, /*#__PURE__*/React.createElement(Radio, {
    name: "sort",
    value: "newest",
    checked: sort === 'newest',
    onChange: setSort,
    label: "Newest listings"
  }), /*#__PURE__*/React.createElement(Radio, {
    name: "sort",
    value: "price",
    checked: sort === 'price',
    onChange: setSort,
    label: "Price: low to high"
  }), /*#__PURE__*/React.createElement(Radio, {
    name: "sort",
    value: "sqft",
    checked: sort === 'sqft',
    onChange: setSort,
    label: "Largest area"
  }))));
}
window.FilterSidebar = FilterSidebar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketplace/FilterSidebar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketplace/Header.jsx
try { (() => {
// UrbanLoft marketplace — top navigation header.
function Header({
  onHome
}) {
  const nav = ['Buy', 'Lease', 'New Development', 'Research'];
  const [active, setActive] = React.useState('Lease');
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2xl)',
      height: 64,
      padding: '0 var(--space-2xl)',
      background: 'var(--surface-card)',
      borderBottom: '1px solid var(--border-default)',
      position: 'sticky',
      top: 0,
      zIndex: 20
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo.svg",
    height: "28",
    alt: "UrbanLoft",
    style: {
      cursor: 'pointer'
    },
    onClick: onHome
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 'var(--space-xl)'
    }
  }, nav.map(n => /*#__PURE__*/React.createElement("a", {
    key: n,
    onClick: () => setActive(n),
    style: {
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
      textDecoration: 'none',
      color: active === n ? 'var(--text-strong)' : 'var(--text-muted)',
      borderBottom: active === n ? '2px solid var(--color-charcoal)' : '2px solid transparent',
      paddingBottom: 2
    }
  }, n))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-md)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--text-link)',
      textDecoration: 'none',
      cursor: 'pointer'
    }
  }, "List a Property"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 'var(--radius-full)',
      background: 'var(--color-charcoal)',
      color: 'var(--color-white)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13,
      fontWeight: 600,
      fontFamily: 'var(--font-headline)'
    }
  }, "JD")));
}
window.Header = Header;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketplace/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketplace/ListingsScreen.jsx
try { (() => {
// UrbanLoft marketplace — listing card + listings grid screen.
function ListingCard({
  item,
  onOpen
}) {
  const {
    Card,
    Chip
  } = window.UrbanLoftDesignSystem_6db930;
  const st = window.STATUS_MAP[item.status];
  return /*#__PURE__*/React.createElement(Card, {
    elevated: true,
    onClick: () => onOpen(item),
    imageHeight: 172,
    image: /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        height: '100%',
        position: 'relative',
        ...window.FACADE(item.g[0], item.g[1])
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 12,
        left: 12
      }
    }, /*#__PURE__*/React.createElement(Chip, {
      variant: st.variant
    }, st.label))),
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-headline)',
      fontSize: 20,
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, item.name)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 14,
      color: 'var(--text-muted)'
    }
  }, item.area), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      margin: '14px 0 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 18,
      fontWeight: 500,
      color: 'var(--text-strong)'
    }
  }, item.price), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)'
    }
  }, "/ mo")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-md)',
      marginTop: 12,
      paddingTop: 12,
      borderTop: '1px solid var(--divider)'
    }
  }, /*#__PURE__*/React.createElement(Meta, {
    label: "Area",
    value: `${item.sqft} sqft`
  }), /*#__PURE__*/React.createElement(Meta, {
    label: "Type",
    value: item.type
  })));
}
function Meta({
  label,
  value
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: 'var(--text-secondary)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: 'var(--text-body)'
    }
  }, value));
}
function ListingsScreen({
  onOpen
}) {
  const {
    Button
  } = window.UrbanLoftDesignSystem_6db930;
  const [typeFilter, setTypeFilter] = React.useState([]);
  const toggleType = t => setTypeFilter(f => f.includes(t) ? f.filter(x => x !== t) : [...f, t]);
  const visible = typeFilter.length ? window.LISTINGS.filter(l => typeFilter.includes(l.type)) : window.LISTINGS;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'stretch'
    }
  }, /*#__PURE__*/React.createElement(window.FilterSidebar, {
    typeFilter: typeFilter,
    onToggleType: toggleType
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      padding: 'var(--space-2xl)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: 'var(--space-xl)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-headline)',
      fontSize: 32,
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, "Commercial Lease \xB7 Brooklyn"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      fontSize: 16,
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      color: 'var(--text-strong)'
    }
  }, visible.length), " spaces available now")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-sm)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm"
  }, "Save Search"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm"
  }, "Map View"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: 'var(--space-xl)'
    }
  }, visible.map(item => /*#__PURE__*/React.createElement(ListingCard, {
    key: item.id,
    item: item,
    onOpen: onOpen
  })))));
}
window.ListingsScreen = ListingsScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketplace/ListingsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketplace/PropertyDetail.jsx
try { (() => {
// UrbanLoft marketplace — property detail screen with tabs + lease data table.
function PropertyDetail({
  item,
  onBack
}) {
  const {
    Button,
    Chip,
    Tooltip
  } = window.UrbanLoftDesignSystem_6db930;
  const [tab, setTab] = React.useState('Overview');
  const st = window.STATUS_MAP[item.status];
  const tabs = ['Overview', 'Lease Terms', 'Building', 'Location'];
  const rows = [{
    k: 'Asking Rent',
    v: `${item.price} / mo`,
    hint: null
  }, {
    k: 'Rentable Area',
    v: `${item.sqft} sqft`,
    hint: 'Net rentable area, excludes common space'
  }, {
    k: 'Lease Type',
    v: item.term,
    hint: 'NNN = tenant pays taxes, insurance & maintenance'
  }, {
    k: 'Floor',
    v: item.floor,
    hint: null
  }, {
    k: 'Cap Rate',
    v: item.cap,
    hint: 'Net operating income ÷ asset value'
  }, {
    k: 'Year Built',
    v: item.built,
    hint: null
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1000,
      margin: '0 auto',
      padding: 'var(--space-2xl)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--text-muted)',
      padding: 0,
      marginBottom: 'var(--space-md)'
    }
  }, "\u2190 Back to listings"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 340,
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      position: 'relative',
      marginBottom: 'var(--space-xl)',
      ...window.FACADE(item.g[0], item.g[1])
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 16,
      left: 16
    }
  }, /*#__PURE__*/React.createElement(Chip, {
    variant: st.variant
  }, st.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 'var(--space-xl)',
      marginBottom: 'var(--space-xl)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-sm)',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: 'var(--color-white)',
      background: 'var(--color-charcoal)',
      padding: '3px 8px',
      borderRadius: 'var(--radius-sm)'
    }
  }, item.type)), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-headline)',
      fontSize: 32,
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, item.name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      fontSize: 18,
      color: 'var(--text-muted)'
    }
  }, item.area)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 28,
      fontWeight: 500,
      color: 'var(--text-strong)'
    }
  }, item.price), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)',
      marginBottom: 'var(--space-md)'
    }
  }, "per month"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-sm)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "md"
  }, "Request Financials"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md"
  }, "Schedule a Tour")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-xl)',
      borderBottom: '1px solid var(--border-default)',
      marginBottom: 'var(--space-xl)'
    }
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setTab(t),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      fontWeight: 500,
      padding: '0 0 12px',
      color: tab === t ? 'var(--text-strong)' : 'var(--text-muted)',
      borderBottom: tab === t ? '2px solid var(--color-charcoal)' : '2px solid transparent',
      marginBottom: -1
    }
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr',
      gap: 'var(--space-2xl)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, tab === 'Overview' && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 18,
      lineHeight: 1.6,
      color: 'var(--text-body)'
    }
  }, "A column-free ", item.type.toLowerCase(), " space in ", item.area, ", delivered in turnkey condition with original ", item.built, " detailing \u2014 exposed brick, timber beams, and oversized industrial windows. Floor plate suits an open layout with private offices along the north wall."), tab === 'Lease Terms' && /*#__PURE__*/React.createElement(LeaseTable, {
    rows: rows,
    Tooltip: Tooltip
  }), tab === 'Building' && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 18,
      lineHeight: 1.6,
      color: 'var(--text-body)'
    }
  }, "Built in ", item.built, " and fully renovated, the building offers a freight elevator, central HVAC, and 24/7 keyed access. ", item.floor, " availability within a ", item.sqft, " sqft footprint."), tab === 'Location' && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 18,
      lineHeight: 1.6,
      color: 'var(--text-body)'
    }
  }, "Steps from transit in ", item.area, ", with ground-floor retail, cafes, and parking within a two-block radius. Walk Score 94.")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-default)',
      padding: 'var(--space-lg)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: 'var(--text-secondary)',
      marginBottom: 'var(--space-md)'
    }
  }, "Key Facts"), /*#__PURE__*/React.createElement(LeaseTable, {
    rows: rows,
    Tooltip: Tooltip,
    compact: true
  }))));
}
function LeaseTable({
  rows,
  Tooltip,
  compact
}) {
  return /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: r.k,
    style: {
      borderBottom: i < rows.length - 1 ? '1px solid var(--divider)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: compact ? '10px 0' : '12px 0',
      fontSize: 14,
      color: 'var(--text-muted)'
    }
  }, r.hint ? /*#__PURE__*/React.createElement(Tooltip, {
    content: r.hint
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      borderBottom: '1px dashed var(--border-control)',
      cursor: 'help'
    }
  }, r.k)) : r.k), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: compact ? '10px 0' : '12px 0',
      textAlign: 'right',
      fontFamily: 'var(--font-mono)',
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--text-strong)'
    }
  }, r.v)))));
}
window.PropertyDetail = PropertyDetail;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketplace/PropertyDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketplace/data.jsx
try { (() => {
// UrbanLoft marketplace — sample inventory + shared helpers.
const FACADE = (a, b) => ({
  background: `repeating-linear-gradient(0deg, ${a} 0 22px, ${b} 22px 24px), repeating-linear-gradient(90deg, ${a} 0 30px, ${b} 30px 32px), linear-gradient(135deg, ${a}, ${b})`,
  backgroundBlendMode: 'multiply, multiply, normal'
});
const LISTINGS = [{
  id: 'mott',
  name: '540 Mott Street',
  area: 'SoHo, Manhattan',
  type: 'Creative Office',
  status: 'available',
  price: '$4,250',
  sqft: '1,840',
  term: 'Annual / NNN',
  floor: '3rd Floor',
  built: '1908',
  cap: '5.2%',
  g: ['#57534E', '#1C1917']
}, {
  id: 'kent',
  name: '88 Kent Avenue',
  area: 'Williamsburg, Brooklyn',
  type: 'Retail',
  status: 'featured',
  price: '$9,800',
  sqft: '3,200',
  term: 'Annual / NNN',
  floor: 'Ground',
  built: '2019',
  cap: '4.8%',
  g: ['#9CA3AF', '#57534E']
}, {
  id: 'water',
  name: '215 Water Street',
  area: 'DUMBO, Brooklyn',
  type: 'Loft Office',
  status: 'pending',
  price: '$12,400',
  sqft: '5,100',
  term: 'Annual / Gross',
  floor: '5th–6th',
  built: '1893',
  cap: '5.0%',
  g: ['#78716C', '#292524']
}, {
  id: 'lex',
  name: '1100 Lexington',
  area: 'Upper East Side',
  type: 'Medical',
  status: 'available',
  price: '$7,600',
  sqft: '2,450',
  term: 'Annual / NNN',
  floor: '2nd Floor',
  built: '1974',
  cap: '5.5%',
  g: ['#A8A29E', '#44403C']
}, {
  id: 'bowery',
  name: '331 Bowery',
  area: 'NoHo, Manhattan',
  type: 'Mixed-use',
  status: 'available',
  price: '$15,900',
  sqft: '6,800',
  term: 'Annual / NNN',
  floor: 'Full Building',
  built: '1901',
  cap: '4.6%',
  g: ['#57534E', '#0C0A09']
}, {
  id: 'jay',
  name: '70 Jay Street',
  area: 'DUMBO, Brooklyn',
  type: 'Industrial',
  status: 'offmarket',
  price: '$6,200',
  sqft: '4,000',
  term: 'Annual / Gross',
  floor: 'Lower Level',
  built: '1920',
  cap: '5.8%',
  g: ['#9CA3AF', '#1C1917']
}];
const STATUS_MAP = {
  available: {
    variant: 'success',
    label: 'Available'
  },
  pending: {
    variant: 'warning',
    label: 'Pending'
  },
  offmarket: {
    variant: 'error',
    label: 'Off-market'
  },
  featured: {
    variant: 'info',
    label: 'Featured'
  }
};
const PROPERTY_TYPES = ['Creative Office', 'Retail', 'Loft Office', 'Industrial', 'Medical', 'Mixed-use'];
Object.assign(window, {
  FACADE,
  LISTINGS,
  STATUS_MAP,
  PROPERTY_TYPES
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketplace/data.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

})();
