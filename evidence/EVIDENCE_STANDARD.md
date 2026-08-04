# Evidence Standard

Convergence Architecture uses an evidence ladder so that one source cannot silently support a stronger claim than it contains.

## Evidence states

| State | Meaning |
|---|---|
| `E0` | Question, testimony, raw observation, or integration hypothesis |
| `E1` | Physical or formal mechanism established |
| `E2` | Laboratory or controlled capability demonstrated |
| `E3` | Patent, named product, or commercial capability documented |
| `E4` | Institutional procurement, fielding, deployment, or normative adoption documented |
| `E5` | Cross-domain integration documented in a bounded system |
| `E6` | Scale, persistence, identity linkage, or retention documented |
| `E7` | Strategic intent, command, coordination, or mission directly evidenced |

Evidence state is not confidence. A highly reliable patent record may still support only `E3`. A low-confidence deployment report does not automatically become `E4` merely because it describes deployment.

## Claim decomposition

A source should be decomposed into atomic claims. Each claim records:

- the exact proposition;
- the source supporting it;
- modality and operating conditions;
- evidence state;
- deployment status;
- limits and excluded interpretations;
- alternative explanations;
- contradictory evidence;
- the next record required for advancement.

## Reachability is separate

Technical reachability asks whether a pathway is physically and systemically possible under stated assumptions. Evidence state asks what has actually been documented.

A pathway may have high technical reachability and low deployment evidence. It may also have documented deployment in one application while remaining technically unsuitable for another.

## Advancement rules

### To `E2`

Require controlled results, operating conditions, instrumentation, measured outputs, and limitations.

### To `E3`

Require a patent, named product, commercial specification, or equivalent documented capability. Vendor descriptions remain vendor claims unless independently tested.

### To `E4`

Require procurement, fielding, institutional deployment, normative adoption, or comparable records identifying an operator and use context.

### To `E5`

Require synchronized proof that named sensing, identity or linkage, inference, actuation, response measurement, and updating stages operated together in one bounded system.

### To `E6`

Require records establishing persistent operation, scale, identity linkage, retention, or repeated use across time.

### To `E7`

Require direct evidence of operator intent, command, coordination, mission, payment, access, targeting direction, or strategic purpose.

## Prohibited shortcuts

- A mechanism paper does not prove a product.
- A patent does not prove implementation or fielding.
- A product page does not prove every advertised operating condition.
- Several compatible components do not prove integration.
- Integration does not prove identity linkage or persistence.
- Scale does not prove intent.
- General capability does not prove a specific event.
- Lack of public documentation does not prove nonexistence.
- Preserving a claim does not independently corroborate it.

## Bounded-case rule

Architecture-level research maps the possible system. Event attribution requires a bounded case defined by time, place, operator, platform, records, measurements, custody, alternatives, and falsification criteria.

The architecture can justify what evidence to seek. It cannot substitute for that evidence.
