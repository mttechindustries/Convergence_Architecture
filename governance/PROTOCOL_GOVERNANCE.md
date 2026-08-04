# Protocol Governance for Ambient Sensing

## Design Requirements After the Representation Gap

**Status:** Public governance proposal  
**Date:** 2026-08-04

## Abstract

Ambient sensing systems can measure people who are not entities in the protocols performing the measurement. Person-level notification, consent, termination, and audit cannot simply be inserted into such systems because those operations require an addressable subject.

This document treats that limitation as a design constraint and proposes four mechanism families whose policy bearer is not a person:

1. device disclosure and active-sensing indication;
2. space-scoped sensing policy;
3. session attestation and measurement provenance;
4. retention limits and capability-triggered reassessment.

The proposals govern compliant infrastructure. They do not stop passive external observers executing no protocol.

---

## 1. Design constraints

### C1 — No protected-person identifier required

A mechanism should not require persistent identification of every person who may enter a sensing volume.

### C2 — Protection cannot depend on enrolment

Non-registrants cannot be excluded from protection. Presence, not subscription, must be sufficient.

### C3 — Compliance must be independently verifiable

Operator self-declaration is insufficient. Controls should produce attestations, logs, testable indicators, or certification evidence.

### C4 — Failure must be honest

A device unable to honor a policy must expose that state. Silent failure creates false assurance.

### C5 — Capability and activity remain separate

A device may be capable of sensing without actively sensing. Disclosure and indication must represent different facts.

### S1 — Compliance boundary

Every mechanism below binds only systems that execute it or are legally required to honor it.

---

## 2. Device capability disclosure and sensing indication

### Capability disclosure

A machine-readable declaration should state:

- sensing modalities;
- supported resolution classes;
- bands and measurement types;
- proxy capabilities;
- storage and reporting modes;
- whether sensing can occur without association;
- whether raw channel data can be retained or exported.

Disclosure serves auditors, procurement, regulators, and other devices. It should be retrievable without joining the network.

### Active-sensing indication

A human-perceptible signal should identify when measurement is active.

Minimum requirements:

| Requirement | Rule |
|---|---|
| Perceptibility | Visible without opening an application or management console |
| Activity binding | Indicates current measurement, not installed capability |
| Proxy distinction | Distinguishes first-party from proxy-requested sessions |
| Tamper resistance | Cannot be disabled independently of sensing |
| Failure behavior | Indicator failure disables sensing or exposes noncompliance |

Indication is weaker than notification. It cannot guarantee receipt and may not reach someone across a wall. It remains useful because it requires no subject identifier.

---

## 3. Space-scoped sensing policy

### Concept

A physical volume carries a signed, machine-readable policy. Compliant devices discover the policy and constrain sensing operations whose measurement volume intersects the protected space.

Protection attaches to the place, so occupants inherit it by presence.

### Minimum policy vocabulary

| Element | Example values | Function |
|---|---|---|
| `sensing` | prohibit / first-party-only / permit | Baseline rule |
| `proxy` | prohibit / permit | Controls sensing-by-proxy |
| `resolution-ceiling` | occupancy / motion / vitals / fine | Maximum permitted discrimination |
| `retention-max` | duration | Maximum storage period |
| `off-volume-report` | prohibit / permit | Controls external reporting |
| `purpose` | enumerated categories | Declared permissible purpose |
| `authority` | signed identity | Party asserting the rule |
| `validity` | time interval | Policy lifetime |

The resolution ceiling permits practical distinctions. A building may allow coarse occupancy sensing for climate control while prohibiting vitals-grade or identity-grade inference.

### Discovery paths

1. **Infrastructure-advertised** — access points or local devices broadcast the policy.
2. **Independent beacon** — a separate low-power device controlled by the space owner or occupant broadcasts it.
3. **Registry resolution** — devices query a signed geospatial policy registry.

An independent beacon is the strongest general design because the party seeking protection may not control the sensing infrastructure.

### Conflicts

Nested spaces may assert conflicting rules. A safe default is:

```text
MOST RESTRICTIVE VALID POLICY WINS WITHIN THE INTERSECTION
```

The protocol should verify assertions but should not decide property law, tenancy, employment, or authority disputes. Those remain legal questions.

### Hard problem: volume binding

RF and acoustic sensing volumes do not respect walls or property boundaries. A policy for one apartment can intersect a sensor in another.

Devices should therefore be responsible for operations whose estimated measurement volume intersects the asserted volume. Exact intersection may be impossible, so compliant systems must expose uncertainty rather than silently assuming no intersection.

---

## 4. Session attestation and provenance

Accountability should attach to parties and objects the system does represent.

### Session attestation

Each sensing session should generate a signed record containing:

- initiator identity;
- executing device or responder set;
- requesting party where proxy operation is used;
- asserted purpose;
- modality and resolution class;
- measurement configuration;
- applicable space policies;
- start and end times;
- raw-data and reporting settings.

An auditor not present during the session should be able to verify the record.

### Measurement provenance

Measurements and derived features should retain:

- session identifier;
- source device;
- configuration;
- resolution class;
- transformation history;
- applicable retention ceiling;
- export or disclosure history.

Provenance must travel with the data. A log disconnected from exported measurements cannot govern downstream use.

### Proxy attribution

The requester and executor must be separate fields. Otherwise responsibility defaults to the visible radio rather than the party directing the operation.

### Configuration-change logging

Sensitivity, thresholds, beam selection, reporting rules, and other measurement controls can themselves become inference channels. Changes should be logged and, where appropriate, rate-limited.

---

## 5. Retention and reassessment

Raw ambient measurements may become more identifying as analytical capability improves.

### Required controls

| Control | Requirement |
|---|---|
| Raw-data lifetime | Short, explicit maximum distinct from derived event data |
| Purpose limitation | Retention tied to a stated and time-bounded purpose |
| Actual deletion | Expiry means deletion, not a hidden or reversible flag |
| Derivation inheritance | Derived features inherit the source retention ceiling unless demonstrably non-invertible |
| Export binding | Retention and purpose restrictions travel with exported data |
| Capability reassessment | Retained data periodically reassessed after material inference advances |

### Capability-triggered reassessment

The identifying potential of a record is not fixed at collection. New models, auxiliary datasets, or cross-modal linkage can change it.

A compliant controller should reassess retained corpora:

- on a defined schedule;
- after deployment of a materially stronger model;
- after acquisition of new linkage data;
- before a new use or external transfer.

The obligation attaches to the record and controller, not to a known data subject.

---

## 6. Certification and procurement

Voluntary semantics without verification reach only conscientious operators.

A sensing certification program should test:

- accuracy and completeness of capability disclosure;
- activity binding and tamper resistance of indicators;
- discovery and enforcement of space policies;
- conflict resolution;
- signed session attestation;
- proxy attribution;
- provenance propagation;
- actual retention expiry and deletion;
- honest degradation when a policy cannot be honored.

The realistic adoption sequence is:

```text
MECHANISM STANDARD
  → TEST PLAN
  → CERTIFICATION MARK
  → PROCUREMENT REQUIREMENT
  → REGULATORY REFERENCE
```

Procurement can move faster than universal legislation and gives institutions a practical lever before a full legal regime exists.

---

## 7. What protocol governance cannot solve

A passive external observer may:

- operate outside the protected space;
- execute no sensing protocol;
- use ambient transmissions it did not generate;
- produce no session attestation;
- ignore retention rules;
- remain unknown to the network operator.

Against that actor:

- space policy is not discovered;
- activity indication is not emitted;
- attestation is never produced;
- protocol retention rules do not bind.

This is not a defect that another protocol field repairs. Remedies must be physical, investigative, contractual, or legal.

Architectural governance should not claim to eliminate the adversarial tail. It should govern the substantial portion of sensing performed by identifiable manufacturers, infrastructure operators, service providers, employers, landlords, institutions, and public agencies.

---

## 8. Recommended public requirements

A minimum defensible ambient-sensing regime should require:

1. Published sensing capability declarations.
2. A tamper-resistant active-sensing indicator.
3. Space-scoped policies with resolution and retention ceilings.
4. Separate requester and executor attribution for proxy sensing.
5. Signed session records and measurement provenance.
6. Short raw-data retention and actual deletion.
7. Reassessment after material advances in inference capability.
8. Independent certification and procurement enforcement.
9. Public incident and misuse reporting.
10. Legal prohibition of non-consensual passive external sensing in protected contexts.

## Conclusion

The Representation Gap means that familiar person-bound privacy controls cannot simply be transplanted into ambient sensing.

A workable governance system relocates policy:

```text
PERSON → DEVICE, SPACE, SESSION, OPERATOR, RECORD
```

That relocation avoids mandatory identity enrolment, protects non-participants by presence, and creates auditable obligations for compliant infrastructure while honestly acknowledging what protocol governance cannot reach.
