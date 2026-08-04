# Measurement Without Representation

## Protocol Entities, Non-Participants, and Ambient Sensing

**Status:** Public research brief  
**Date:** 2026-08-04

## Abstract

Communication protocols coordinate entities they can name: stations, devices, sessions, addresses, credentials, and measurements. Ambient sensing systems measure people who may not be entities in that operational namespace.

This creates the **Representation Gap**: the set of entities a system can physically measure but cannot address as protocol participants.

```text
M = physically measurable entities
R = represented protocol entities
G = M \ R
```

Members of `G` can affect measurements while having no protocol address, session membership, credential, consent object, termination right, or subject entry in the audit log.

The gap produces a second result, the **Representation Paradox**: persistent person-level protection requires persistent person-level representation, but that representation constructs the identity infrastructure the protection was intended to prevent.

The resulting governance strategy is not to identify every measured person. It is to relocate policy to devices, spaces, sessions, operators, and retained records.

---

## 1. Protocol representation is not signal representation

Sensing pipelines often create computational objects such as tracks, blobs, targets, clusters, or occupancy counts. A tracker may distinguish Target A from Target B.

Those internal estimator objects are not necessarily protocol entities.

A track usually cannot:

- receive a notification;
- hold a credential;
- authenticate a policy request;
- join or leave a sensing session;
- authorize collection;
- terminate measurement;
- appear as a legally meaningful subject in a protocol log.

The system may model a body extremely well while still containing no entity through which that person can exercise governance.

## 2. Degrees of representation

| Level | Property | Example |
|---|---|---|
| `L0` | Not modelled as an entity | Person altering an ambient RF field |
| `L1` | Modelled as environment | Static clutter or obstruction |
| `L2` | Counted, not distinguished | Occupancy count |
| `L3` | Distinguished, not identified | Target A and Target B |
| `L4` | Persistently pseudonymous | Durable randomized reference |
| `L5` | Identified | Authenticated device or enrolled person |

Levels `L2-L3` are signal-processing achievements. Levels `L4-L5` create persistent namespace references.

The critical transition is `L3 → L4`: a transient track becomes a durable linkage key.

## 3. Six governance failures from one missing argument

A governance operation requiring an argument of type `protocol entity` is undefined for a measured person absent from the protocol namespace.

### Notification

Direct notification requires an address. A broadcast indicator is possible, but it cannot be targeted, acknowledged, or verified as received.

### Consent

Consent must bind an authorizing party to an operation. Without a represented party, there is no object to which consent can attach.

### Termination

The right to terminate a session presupposes membership in that session. A measured non-participant is not a member.

### Subject-level audit

The system can log that sensing occurred, which devices participated, and what configuration was used. It cannot necessarily log the operation against the person measured because no subject object exists.

### Enumeration

The affected population may be defined by propagation geometry rather than membership. The system may estimate how many people were present without enumerating who they were.

### Authenticated policy expression

A person may express a preference, but the system cannot authenticate that the request came from a represented party with standing unless it first creates a persistent representation.

These are not six unrelated omissions. They arise from one structural cause.

## 4. The Representation Paradox

The obvious remedy is to represent every person who might be measured.

That remedy creates the harm.

To remember an objection, the system must recognize the objector later. To bind consent across occasions, it must retain a durable reference. To log measurements against a subject, it must link measurements to that reference.

```text
INDIVIDUAL PROTECTION
  requires
PERSISTENT INDIVIDUAL REPRESENTATION
  creates
IDENTITY AND LINKAGE INFRASTRUCTURE
```

A registry also makes protection conditional on enrolment. Non-registrants remain unprotected, and the registry becomes a high-value target.

Person-level protection is therefore not impossible in every context, but it is not a general solution for ambient sensing of non-participants.

## 5. Identity-indeterminate measurement

Ambient sensing records may be neither anonymous nor identifying at collection.

They are **identity-indeterminate** when:

1. the subject was not represented in the collection protocol;
2. the record contains no explicit subject identifier;
3. identifying potential depends on later analytical capability;
4. that capability may be held by a party other than the collector.

A respiration trace, motion pattern, channel measurement, thermal sequence, or gait representation may be unattributed at collection and become linkable later through improved models or auxiliary data.

The governance implication is that collection-time assessment occurs when the data may be least identifying. Retention and later reuse become central control surfaces.

## 6. Cross-modality generalization

The Representation Gap is not specific to Wi-Fi or radio frequency.

| Modality | Represented objects | Measured non-participants |
|---|---|---|
| Wi-Fi sensing | Stations, access points, sessions, measurements | Occupants altering propagation |
| UWB ranging | Ranging devices and sessions | Bodies in the ranging volume |
| BLE observation | Advertising devices and addresses | Carriers and nearby non-carriers |
| Millimetre-wave radar | Radar configuration and tracks | Reflecting bodies |
| Passive radar | Receiver and illuminators | Bodies modifying third-party signals |
| Optical analytics | Camera and zone definitions | People in frame |
| Thermal analytics | Sensor and zones | People in the thermal field |

The shared property is **physical inference over entities absent from the operational namespace**.

## 7. Worked example: WLAN sensing

WLAN sensing coordinates participating devices. Its architecture can include initiators, responders, transmitters, receivers, measurement setup, reporting, and proxy execution.

The measured human may be none of those entities.

This creates several asymmetries:

- participating devices can advertise capability;
- initiators can configure measurement sensitivity;
- participants can negotiate or decline sessions;
- a proxy requester and RF executor can be separate parties;
- the person whose body changes the channel may be absent from all negotiations.

The gap is therefore not that protocols lack every control. They may provide substantial participant control while providing no direct non-participant control.

## 8. Policy relocation

The paradox applies when the person is the policy bearer. It does not apply when policy attaches to an object the system can represent without identifying every occupant.

Viable policy bearers include:

- **device** — capability disclosure and active-sensing indication;
- **space** — machine-readable rules attached to a physical volume;
- **session** — signed purpose, configuration, operator, and proxy records;
- **record** — retention limits, provenance, deletion, and reassessment;
- **operator** — certification, procurement, and legal responsibility.

This grants protection by presence, system operation, or record custody rather than by enrolment.

## 9. Limits

Protocol governance binds compliant implementations.

It does not reach a passive external observer that:

- operates outside the protected space;
- associates with no network;
- executes no sensing protocol;
- derives measurements from ambient traffic;
- keeps its own records.

That adversarial tail requires physical countermeasures, investigation, and legal prohibition. A consent field cannot govern an actor that never executes it.

## 10. Research consequences

The Representation Gap changes how ambient sensing should be evaluated.

Reviewers should ask:

1. Who or what exists in the system namespace?
2. Which physical entities can still affect measurements?
3. Which governance operations require a represented subject?
4. What persistent identity would a proposed remedy create?
5. Can policy be attached to a space, session, device, operator, or record instead?
6. How long are raw measurements retained?
7. Can later models change the identifying potential of retained data?
8. Which parties are outside the compliance boundary?

## Conclusion

Ambient sensing can measure people without representing them as participants. That mismatch explains why familiar notice, consent, termination, and subject-audit mechanisms fail when copied directly from device privacy.

The solution is not to pretend the person is already in the protocol, and not to build a universal identity registry merely to grant protection.

The more defensible path is policy relocation:

```text
PERSON-BOUND CONSENT
        ↓ replace with
DEVICE DISCLOSURE
SPACE POLICY
SESSION ATTESTATION
RECORD RETENTION
OPERATOR ACCOUNTABILITY
```

The Representation Gap is therefore both a diagnosis and a design constraint.
