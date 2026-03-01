/**
 * PASS / FAIL / MONITOR criteria for inspection status.
 * Edit these prompts to match your FieldIQ inspection standards.
 * The model uses these definitions when assigning status to inspection results.
 */

export const PASS_CRITERIA = `
PASS: Assign when the machine is in good operating condition with no significant issues.

GENERAL:
- No visible leaks (hydraulic, oil, coolant)
- No structural damage or missing guards
- Wear within acceptable limits
- No immediate safety hazards
- All critical systems appear functional

STEPS, HANDRAILS & ACCESS (GREEN - Acceptable):
- Secure step installation, tight mounting, proper alignment
- Adequate step surface condition, good grip, normal wear
- Secure handrail mounting, functional grip systems
- Clear glass condition, undamaged windshields and cab glass
- Functional mirror systems, properly positioned, secure mounting
- Effective access safety, complete access systems functional
- Engine access covers secure, hinges and latches functional
`;

export const FAIL_CRITERIA = `
FAIL: Assign when the machine has critical issues that require immediate attention or should not operate.

CRITICAL SAFETY ISSUES (RED INDICATORS) - Immediate Action Required, Equipment Should Not Operate:

COOLANT LEVEL CRITICAL:
- Critically low coolant levels (below minimum marks, empty reservoirs)
- Continuous coolant loss, daily coolant addition requirements
- Major coolant system leaks, visible coolant puddles, fluid streaming
- Radiator system damage, damaged guards, core damage
- Cooling system hose failures, damaged hoses, loose clamps, connection failures
- Water pump internal failures, seal failures, coolant contamination in oil
- Climate control system failure, non-functioning heating/cooling
- Cooling system component damage, broken radiator doors

STEPS, HANDRAILS & ACCESS (RED - Do Not Operate):
- Cracked or broken glass, windshield operation failure, cab structural glass damage
- Track frame/side step damage, cabin access step failures, access step structural damage (bent, broken mounting)
- Handrail system damage, safety rail mounting failures, access safety system compromise
- Broken mirror systems, mirror mounting damage
- Engine access cover damage, broken hinges/latches, access cover safety failure
- Cab structural damage, roof integrity compromise

HYDRAULIC / OIL / GENERAL:
- Active fluid leaks (hydraulic, oil, coolant)
- Structural damage, cracks, missing safety guards
- Severe wear that compromises function or safety
- Obvious safety hazards (exposed moving parts, unstable components)
- Critical system failures visible in the image
`;

export const MONITOR_CRITERIA = `
MONITOR: Assign when issues are present but not yet critical; machine can operate with planned follow-up.

MODERATE ISSUES (YELLOW INDICATORS) - Attention Required, Schedule Maintenance:
- Coolant level approaching service intervals, routine maintenance needs
- Coolant quality degradation, contamination indicators
- Radiator cleaning needs, debris accumulation, airflow restriction
- Cooling system hose monitoring, clamp maintenance, connection inspection
- Engine temperature trends, cooling efficiency monitoring
- Step wear and surface condition, step mounting monitoring, grip deterioration
- Handrail surface condition, handrail hardware monitoring
- Minor glass issues (chips, small cracks), mirror adjustment and maintenance needs
- Minor leaks or seepage
- Moderate wear that should be tracked
- Cosmetic damage or minor defects
- Items that need inspection or repair in the near term
`;

export const NORMAL_CONDITIONS = `
NORMAL (GREEN) - Acceptable Operating Condition:
- Adequate coolant level within proper range
- Clean coolant condition, proper quality
- Leak-free cooling system, dry components
- Functional radiator system, proper airflow
- Effective engine cooling, normal operating temperatures
- Functional climate control
- Secure steps and handrails, clear glass, functional mirrors, effective access systems
`;

export const ANOMALY_DETECTION_GUIDE = `
For each issue detected, output in the InspectionIssue format. Use the following mappings from detailed inspection:
- type: component_type or "Component - Anomaly" (e.g. "Step - Structural Damage", "Cooling System Hose - Hose Damage")
- severity: Map safety_impact_assessment/risk_level to "low" | "medium" | "high" (Critical -> high, Moderate -> medium, Low -> low)
- location: component_location (e.g. "Upper Step", "Lower Step", "Coolant system")
- description: Combine condition_description with safety_impact_assessment and operational_impact when relevant (clear, concise)
- recommendation: recommended_action (immediate repair, replace, schedule maintenance, inspect, etc.)

Examples:
Step/access: { "type": "Step - Structural Damage", "severity": "high", "location": "Upper Step", "description": "Step visibly bent outward, structural damage compromising safe access. Critical personnel access and fall hazard.", "recommendation": "Immediate replacement or repair of the damaged step." }
Step wear: { "type": "Step - Surface Wear", "severity": "medium", "location": "Lower Step", "description": "Surface wear and degradation reducing grip capability. Increased slipping risk during access.", "recommendation": "Schedule maintenance to restore surface grip and inspect structural integrity." }
Cooling: { "type": "Cooling System Hose - Hose Damage", "severity": "medium", "location": "Coolant system", "description": "Visible wear and possible damage on coolant system hoses. Potential risk of leaks or pressure loss.", "recommendation": "Inspect hoses for damage, replace if necessary to ensure system integrity." }
`;

export const ENGINE_COOLANT_INSPECTION_GUIDE = `
## ENGINE COOLANT & COOLING SYSTEM - DETECTION POINTS

When analyzing cooling system components (radiator, hoses, reservoir, water pump):

CRITICAL (FAIL): Critically low coolant, major leaks, radiator damage, hose failures, water pump leaks, coolant in oil, climate control failure.
MODERATE (MONITOR): Coolant approaching service interval, hose/clamp wear, radiator cleaning needs, temperature monitoring.
NORMAL (PASS): Adequate coolant level, clean coolant, leak-free system, functional radiator.

Common false positives to avoid: Water/condensation vs coolant leakage; environmental debris vs contamination; normal coolant expansion with temperature.
When coolant level is not clearly visible due to obstructed view, note "Limited reservoir visibility" as a low-severity issue with recommendation to ensure clear access for inspection.
`;

export const STEPS_HANDRAILS_INSPECTION_GUIDE = `
## STEPS, HANDRAILS & ACCESS - DETECTION POINTS

When analyzing steps, handrails, glass, mirrors, and access systems:

CRITICAL (FAIL): Cracked/broken glass, windshield failure, step/handrail structural damage (bent, broken, loose mounting), broken mirrors, engine access cover/hinge/latch failure, cab structural damage.
MODERATE (MONITOR): Step surface wear, grip deterioration, handrail surface/hardware wear, minor glass chips/cracks, mirror adjustment needs.
NORMAL (PASS): Secure steps and handrails, clear glass, functional mirrors, effective access, secure access covers.

Document component_location (e.g. Upper Step, Lower Step), condition_description, safety_impact_assessment, and recommended_action for each anomaly.
Common false positives: Dirt/debris obscuring condition; lighting/reflections; normal wear within limits vs structural damage.
`;

export const INSPECT_STATUS_PROMPT = `
When assigning status, use these definitions strictly:

${PASS_CRITERIA}

${FAIL_CRITERIA}

${MONITOR_CRITERIA}

${NORMAL_CONDITIONS}

${ANOMALY_DETECTION_GUIDE}

${ENGINE_COOLANT_INSPECTION_GUIDE}

${STEPS_HANDRAILS_INSPECTION_GUIDE}

Choose exactly one status (PASS, FAIL, or MONITOR) based on the most severe issue observed.
Map risk levels: Critical -> high severity, Moderate -> medium severity, Low -> low severity.
`;
