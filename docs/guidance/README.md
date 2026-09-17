# Guidance Model (Problem Space)

**This folder is project-agnostic and is intended to be extracted.**
It contains no reference to any particular project, sprint, decision
outcome or piece of code. If you find one, it is a bug — it belongs in
the solution space, not here.

Method and terminology follow Zimmermann, Wegmann, Koziolek and
Goldschmidt, *Architectural Decision Guidance across Projects*,
WICSA 2015, pp. 85–94 (DOI 10.1109/WICSA.2015.29).

## Metamodel

Four structural elements, per Section III.A of the paper:

| Element | Lives in | Meaning |
|---|---|---|
| **Problem** | this folder | A recurring design question. No answer. |
| **Option** | this folder | A candidate answer to a problem. |
| **Problem Occurrence** | solution space | One instance of a problem in one project. |
| **Option Occurrence** | solution space | The state of one option within one occurrence. |

Problems and options are reusable and long-lived; occurrences are
project-specific and die with the project. This is the reach/lifetime
separation the method is built on.

## Link types in use

| Link | Between | Meaning |
|---|---|---|
| `addressedBy` | problem to option | implicit; every option listed under a problem |
| `raises` | problem or option to problem | answering this opens that |
| `boundTo` | problem to problem | the two answers must be consistent |
| `conflictsWith` | option to option | the two cannot both be chosen |
| `suggests` | option to option | choosing this makes that a natural fit |

## Refinement levels

`Executive` > `Conceptual` > `Technology` > `Vendor/Asset`

A child problem should not be answered before its parent. This is the
justification for deferring library selection until the conceptual
approach is settled.

## Meta-information: what we kept and what we dropped

Table 2 of the paper lists eight attributes. This is a small team project,
so most of them carry no information. Kept:

- **Level** — refinement level (above)
- **Viewpoint** — Functional / Information / Deployment
- **Trigger** — the condition that forces the decision

Dropped, with reason:

| Attribute | Why dropped |
|---|---|
| Intellectual Property Rights | No confidentiality or copyright concerns |
| Knowledge Provenance | Replaced by the `Refs` line on each problem |
| Project Stage | `Trigger` is more precise than a named phase |
| Organizational Reach | One person, one project |
| Owner Role | One person |
| Stakeholder Roles | One person |

The paper states this set is not meant to be complete and that
knowledge engineers should add and remove attributes to suit their
context (Section III.C).

## Entry format

```
### P-XXX-nn - *Question, phrased with no answer in it?*
- **Level:** Conceptual
- **Viewpoint:** Functional

- **Options:**
  - [ ] **First candidate**
    Brief explaination
  - [ ] **Second candidate**

- **Raises:** P-YYY-nn
- **Bound to:** P-ZZZ-nn
- **Trigger:** the condition under which this must be answered
- **Refs:** https://example.org
```

Keep entries terse. Section III.B advises linking out rather than
copying source material in.

## Packages

| File | Prefix | Scope |
|---|---|---|
| `P-ASS-assets.md` | P-DEV | Managing a catalogue of domain entities |
| `P-EXP-export.md` | P-EXP | Turning in-system data into downloadable files |
| `P-CUS-customization.md` | P-CUS | Letting end users shape generated output |
| `P-EVT-events.md` | P-EVT | Moving work off the request path |