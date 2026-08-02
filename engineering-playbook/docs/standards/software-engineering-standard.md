# Professional Software Engineering Standard

Version 1.0 - July 14, 2026

## Purpose

This is the organization- and project-neutral index for the 200-control software engineering baseline. Company names, project names, accounts, repositories, vendors, domains, deadlines, and implementation decisions belong in project-specific instructions and specifications, never in these reusable modules.

The standard is split into small parts so a task can load only what its current phase requires. A complete initial or quarterly audit must still evaluate controls 1-200 without omissions or duplicates.

## Instruction precedence

1. Applicable law, contract, and explicit organization policy
2. Confirmed project state and decisions in the project's `AGENTS.md` and linked project-state files
3. This standard and its control modules
4. Specialized standards such as the Website Engineering Standard
5. How-to guides, checklists, and tool-specific suggestions

Project instructions may strengthen the baseline. They may not silently weaken it, invent evidence, or label missing work Not Applicable.

## Required modules

- [Review method, evidence vocabulary, and professional minimum](software/review-method.md)
- [Critical controls 1-20](software/controls-001-020-critical.md)
- [Data controls 21-50](software/controls-021-050-data.md)
- [Security controls 51-85](software/controls-051-085-security.md)
- [Reliability controls 86-120](software/controls-086-120-reliability.md)
- [Product and workflow controls 121-150](software/controls-121-150-product-workflow.md)
- [Operational controls 151-180](software/controls-151-180-operations.md)
- [AI-specific controls 181-200](software/controls-181-200-ai.md)

## What to load by task

- **New-project intake:** This index, review method, critical controls, and the modules implicated by the proposed data, users, integrations, and risks.
- **Architecture and threat modeling:** Critical, data, security, reliability, operations, and AI modules as applicable.
- **Implementation or pull-request review:** Every module containing a control affected by the change.
- **Release review:** Critical controls 1-20 plus every affected control module.
- **Incident response:** Critical controls plus the modules implicated by the failure.
- **Initial or quarterly audit:** Every module, controls 1-200 in order.

The project `AGENTS.md` records which modules are currently applicable, where evidence is stored, and the next incomplete lifecycle phase.
