"""
Task templates — pre-built prompts for common bank staff workflows.

Each template specifies:
  - which LLM to use (a = primary, b = secondary/fast)
  - the system prompt that sets the AI's role for that task
  - a user_prompt_template with {content} and optionally {extra} placeholders
  - suggested output formats
"""
from dataclasses import dataclass, field


@dataclass
class TaskTemplate:
    id: str
    name: str
    description: str
    icon: str
    llm: str                        # "a" or "b"
    system_prompt: str
    user_prompt_template: str       # use {content} for main input, {extra} for optional context
    accepts_file: bool
    suggested_formats: list[str]
    category: str


TASK_TEMPLATES: list[TaskTemplate] = [

    TaskTemplate(
        id="summarize",
        name="Summarize Document",
        description="Upload or paste any document — policy, circular, report — and get a clear, structured summary.",
        icon="summarize",
        llm="b",
        category="Documents",
        accepts_file=True,
        suggested_formats=["pdf", "docx", "txt"],
        system_prompt=(
            "You are a professional document summarizer for a bank. "
            "Produce concise, well-structured summaries. Use bullet points for key facts. "
            "Never add information that is not in the source document."
        ),
        user_prompt_template=(
            "Summarize the following document clearly and concisely.\n"
            "Structure your response with: Executive Summary, Key Points, Action Items (if any).\n\n"
            "Document:\n{content}"
        ),
    ),

    TaskTemplate(
        id="draft_letter",
        name="Draft Letter",
        description="Describe the purpose and recipient — get a professional bank letter ready to print.",
        icon="edit_note",
        llm="b",
        category="Writing",
        accepts_file=False,
        suggested_formats=["docx", "pdf", "txt"],
        system_prompt=(
            "You are a professional banking correspondence writer. "
            "Draft formal letters following standard banking conventions. "
            "Include proper salutation, body, and closing. "
            "Use formal Nepali banking tone when requested."
        ),
        user_prompt_template=(
            "Draft a formal bank letter based on the following instructions:\n\n"
            "{content}\n\n"
            "Additional context (if any): {extra}\n\n"
            "Format the output as a complete, print-ready letter."
        ),
    ),

    TaskTemplate(
        id="meeting_minutes",
        name="Meeting Minutes",
        description="Paste raw meeting notes or a transcript — get formatted, professional minutes.",
        icon="event_note",
        llm="b",
        category="Writing",
        accepts_file=True,
        suggested_formats=["docx", "pdf", "txt"],
        system_prompt=(
            "You are a professional minute-taker for a bank. "
            "Convert raw notes into structured meeting minutes with: "
            "Date/Time/Attendees, Agenda Items, Decisions Made, Action Items with owners and deadlines."
        ),
        user_prompt_template=(
            "Convert the following meeting notes into formal meeting minutes:\n\n"
            "{content}\n\n"
            "Meeting context: {extra}"
        ),
    ),

    TaskTemplate(
        id="analyze_data",
        name="Analyze Data",
        description="Upload a spreadsheet or paste tabular data — get insights, trends, and a narrative summary.",
        icon="bar_chart",
        llm="a",
        category="Data",
        accepts_file=True,
        suggested_formats=["pdf", "xlsx", "docx", "txt"],
        system_prompt=(
            "You are a data analyst for a bank. "
            "Analyze the provided data and produce clear insights. "
            "Identify trends, anomalies, and key figures. "
            "Present findings in a structured format suitable for a management report."
        ),
        user_prompt_template=(
            "Analyze the following data and provide:\n"
            "1. Key Findings\n"
            "2. Trends or Patterns\n"
            "3. Anomalies or Concerns\n"
            "4. Recommendations\n\n"
            "Data:\n{content}\n\n"
            "Focus area: {extra}"
        ),
    ),

    TaskTemplate(
        id="translate",
        name="Translate",
        description="Translate documents or text between Nepali and English while preserving banking terminology.",
        icon="translate",
        llm="b",
        category="Language",
        accepts_file=True,
        suggested_formats=["docx", "pdf", "txt"],
        system_prompt=(
            "You are a professional translator specializing in banking and financial documents. "
            "Preserve technical banking terms accurately. "
            "Maintain the formal register appropriate for banking communications."
        ),
        user_prompt_template=(
            "Translate the following text to {extra}. "
            "Preserve all banking terminology, headings, and structure.\n\n"
            "{content}"
        ),
    ),

    TaskTemplate(
        id="write_report",
        name="Write Report",
        description="Provide data, findings, or notes — get a formatted management or compliance report.",
        icon="description",
        llm="a",
        category="Documents",
        accepts_file=True,
        suggested_formats=["pdf", "docx", "pptx", "txt"],
        system_prompt=(
            "You are a senior banking professional writing formal reports. "
            "Structure reports with: Title, Executive Summary, Background, Findings, "
            "Analysis, Recommendations, and Conclusion. "
            "Use formal language appropriate for bank management and regulators."
        ),
        user_prompt_template=(
            "Write a formal {extra} report based on the following information:\n\n"
            "{content}\n\n"
            "Ensure the report is professional, well-structured, and ready for management review."
        ),
    ),

    TaskTemplate(
        id="compose_email",
        name="Compose Email",
        description="Describe what you need to communicate — get a professional banking email ready to send.",
        icon="mail",
        llm="b",
        category="Writing",
        accepts_file=False,
        suggested_formats=["txt", "docx"],
        system_prompt=(
            "You are a professional banking communicator. "
            "Write clear, concise, and appropriately formal emails. "
            "Match the tone to the recipient (internal staff vs. customer vs. regulator)."
        ),
        user_prompt_template=(
            "Compose a professional email based on these instructions:\n\n"
            "{content}\n\n"
            "Recipient type / additional context: {extra}\n\n"
            "Include: Subject line, greeting, body, closing."
        ),
    ),

    TaskTemplate(
        id="explain_circular",
        name="Explain Regulation / Circular",
        description="Paste an NRB circular or regulatory document — get a plain-language explanation for staff.",
        icon="policy",
        llm="a",
        category="Compliance",
        accepts_file=True,
        suggested_formats=["pdf", "docx", "txt"],
        system_prompt=(
            "You are a banking compliance expert. "
            "Explain regulatory circulars and guidelines in simple, plain language "
            "that non-specialist bank staff can understand and act on. "
            "Always highlight: what changed, who is affected, what staff must do, and the deadline."
        ),
        user_prompt_template=(
            "Explain the following regulatory circular or policy in plain language for bank staff:\n\n"
            "{content}\n\n"
            "Additional focus: {extra}\n\n"
            "Structure your response as: What This Says, Who Is Affected, What You Must Do, Key Dates."
        ),
    ),
]

TEMPLATE_MAP: dict[str, TaskTemplate] = {t.id: t for t in TASK_TEMPLATES}


def get_all_templates() -> list[dict]:
    return [
        {
            "id": t.id,
            "name": t.name,
            "description": t.description,
            "icon": t.icon,
            "category": t.category,
            "accepts_file": t.accepts_file,
            "suggested_formats": t.suggested_formats,
        }
        for t in TASK_TEMPLATES
    ]


def get_template(template_id: str) -> TaskTemplate | None:
    return TEMPLATE_MAP.get(template_id)
