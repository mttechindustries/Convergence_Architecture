# Aerial and Ambient Sensing Extension

**Status:** Public technical extension  
**Date:** 2026-08-04

## Purpose

This extension adds aerial physiological sensing, signs-of-life products, AI interpretation of Wi-Fi and thermal data, and mobile infrastructure to the public Convergence Architecture.

It extends the component basis without claiming that every component has been combined into one human-directed adaptive deployment.

```text
SENSE
  → IDENTIFY OR LINK
  → INFER
  → POSITION
  → ACT
  → MEASURE RESPONSE
  → ADAPT
```

## Aerial physiological sensing

### Optical vital-sign measurement

A University of South Australia UAV trial reported measurement of heart and respiratory rates from approximately three metres using video-derived skin-tone changes and minute head movements.

This supports an aerial optical physiology pathway. It does not support through-wall or through-material sensing, which belongs to radar and RF modalities.

### Areté AIMS

Areté describes the Automated Image-Based Monitoring System as a low-size, weight, and power image-processing capability for aerial or ground platforms. Public product descriptions include person detection and geolocation, body-position estimation, heart and respiration measurement, remote wound characterization, and integration with tactical mapping tools.

This is a named product and vendor-described maturity record. It is not independent validation of every claimed operating condition or performance figure.

### IntelliNet Lynx6-A

IntelliNet Sensors described Lynx6-A as a remotely connected breathing and heartbeat detector intended for robot or small-UAV-assisted survivor search under rubble.

This supports a commercial signs-of-life product record. It does not establish general-purpose identity tracking, covert person surveillance, or cognitive actuation.

## AI interpretation

### Wi-Chat

The 2025 preprint *Wi-Chat: Large Language Model Powered Wi-Fi Sensing* describes a physical-model-guided method using large-language-model reasoning for zero-shot human-activity recognition from Channel State Information.

The supported layer is activity interpretation from Wi-Fi measurements. It is not unrestricted through-wall sensing, vital-sign extraction, persistent identity linkage, or closed-loop actuation.

### Thermal-drone vision-language adaptation

A 2026 preprint on lightweight multimodal adaptation of vision-language models used drone thermal imagery for species recognition, counting, and habitat-context interpretation while training selected projection components and retaining largely frozen pretrained backbones.

This supports a transfer pathway from RGB-pretrained semantic systems to thermal-radiometric drone data. It is ecological evidence, not proof of a deployed human bio-surveillance or psychological-state system.

## Mobile infrastructural collection

A study of resilient smart-meter collection using a self-organizing UAV swarm evaluated leader/follower coordination, data relay, task allocation, fault tolerance, latency, payload, and energy consumption through simulation and use-case modelling.

This supports a mobile collection and relay architecture:

```text
DISTRIBUTED FIELD NODES
  → MOBILE COLLECTION
  → LOCAL COORDINATION
  → LONG-RANGE BACKHAUL
  → REMOTE PROCESSING
```

It does not validate physiological sensing, person-specific targeting, directed actuation, or the complete Convergence Architecture.

### Hardware correction

The study labels a SIM7600E HAT as a WiMAX adapter. Vendor specifications identify the SIM7600E-H as an LTE Cat-4 cellular modem with GNSS support, not an IEEE 802.16 WiMAX radio.

The source label should be preserved as an error while active descriptions use the corrected classification.

## Architectural significance

The added records strengthen this division of labour:

```text
AERIAL OPTICAL OR RF SENSING
        ↓
MOBILE POSITION AND GEOMETRY
        ↓
AI INTERPRETATION OF PARTIAL SIGNALS
        ↓
DISTRIBUTED COLLECTION AND RELAY
        ↓
FIXED, VEHICLE, EDGE, OR REMOTE PROCESSING
```

A drone or swarm can supply localization, line of sight, relay, sensing, or response measurement while another system performs higher-power processing or actuation.

This is an architectural pathway. A bounded deployment claim requires synchronized evidence connecting named platforms and operators.

## Governance consequence

Aerial mobility increases the Representation Gap because the measured person, sensing volume, aircraft, operator, processing service, and retained record may exist in different physical and administrative locations.

A person can be the physical measurand without being a protocol participant capable of receiving notice, authorizing measurement, terminating the session, or appearing in the system's logs as the measured party.

The governance response must therefore attach obligations to devices, spaces, sessions, operators, and records rather than requiring a persistent identity for every measured person.

## Active claim boundaries

1. Keep optical, radar, Wi-Fi, thermal, acoustic, and biochemical modalities separate unless a named integration record joins them.
2. Do not promote product descriptions into independent performance validation.
3. Do not describe Wi-Chat as a vital-sign or unrestricted through-wall system.
4. Do not describe ecological thermal-VLM research as a human-targeting deployment.
5. Do not use networking simulation as proof of a complete bio-surveillance architecture.
6. Correct the SIM7600E-H classification to LTE Cat-4 and GNSS.
7. Do not add biochemical, financial, identity, or digital-twin fusion without direct sources.
8. Keep technical convergence and bounded-case closure separate.

## Public source set

- Areté, *AIMS — Automated Image-Based Monitoring System*.
- University of South Australia, *Drones in disaster zones could prove a lifesaver* (2017).
- IntelliNet Sensors, *Lynx6-A Robot Mountable Breathing Detector System* (2015).
- Zhang et al., *Wi-Chat: Large Language Model Powered Wi-Fi Sensing*, arXiv:2502.12421 (2025).
- Chen et al., *Lightweight Multimodal Adaptation of Vision Language Models for Species Recognition and Habitat Context Interpretation in Drone Thermal Imagery*, arXiv:2604.06124 (2026).
- Ali and Qassab, *A Resilient and Energy-Efficient Smart Metering Infrastructure Utilizing a Self-Organizing UAV Swarm* (2025).
- Waveshare, SIM7600E-H 4G HAT product specifications.

## Disposition

```text
AERIAL AND INFRASTRUCTURAL COMPONENT BASIS: EXPANDED
NAMED PRODUCT AND CONTROLLED CAPABILITY RECORDS: ADDED
DISTRIBUTED ARCHITECTURE: STRENGTHENED
FULL HUMAN-DIRECTED ADAPTIVE LOOP CLOSURE: OPEN
EVENT-SPECIFIC ATTRIBUTION: REQUIRES RECORDS
```
