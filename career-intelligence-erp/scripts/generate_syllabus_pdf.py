import sys
import json
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#7A7067"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "SANDIP UNIVERSITY · OFFICIAL PROGRAM CURRICULUM SYLLABUS")
            self.drawRightString(558, 750, "NEP 2020 / CBCS COMPLIANT")
            self.setStrokeColor(colors.HexColor("#DFD7CB"))
            self.setLineWidth(0.5)
            self.line(54, 744, 558, 744)

        # Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawString(54, 36, "Sandip University, Nashik · Career Intelligence ERP Curriculum Registry")
        self.drawRightString(558, 36, page_str)
        self.setStrokeColor(colors.HexColor("#DFD7CB"))
        self.setLineWidth(0.5)
        self.line(54, 46, 558, 46)
        self.restoreState()

def generate_pdf(program_data, output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    primary_color = colors.HexColor("#2C2621")
    accent_color = colors.HexColor("#A36B40")
    olive_color = colors.HexColor("#77734B")
    neutral_light = colors.HexColor("#FAF6F0")
    border_color = colors.HexColor("#DFD7CB")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=accent_color,
        spaceAfter=12
    )

    section_header = ParagraphStyle(
        'SectionHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#4A423B")
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    table_body = ParagraphStyle(
        'TableBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=primary_color
    )

    table_body_bold = ParagraphStyle(
        'TableBodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=primary_color
    )

    story = []

    # Title block
    story.append(Paragraph("SANDIP UNIVERSITY, NASHIK", subtitle_style))
    story.append(Paragraph(f"{program_data.get('name', 'Degree Program')}", title_style))
    story.append(Paragraph(f"Course Code: {program_data.get('code', 'SUN-000')} · {program_data.get('school', 'School')} · NAAC Grade 'A' Accredited", body_style))
    story.append(Spacer(1, 10))

    # Meta banner table
    meta_data = [
        [
            Paragraph("<b>Academic Level:</b> " + str(program_data.get('level', 'UG')), body_style),
            Paragraph("<b>Duration:</b> " + str(program_data.get('duration_years', 3)) + " Years (" + str(program_data.get('total_semesters', 6)) + " Semesters)", body_style),
            Paragraph("<b>Total Credits:</b> " + str(program_data.get('total_credits', 140)), body_style),
        ],
        [
            Paragraph("<b>Curriculum Framework:</b> " + str(program_data.get('academic_framework', 'NEP 2020 / CBCS Scheme')), body_style),
            Paragraph("<b>Academic Year:</b> " + str(program_data.get('academic_year', '2026-2027')), body_style),
            Paragraph("<b>Prerequisite:</b> " + str(program_data.get('suitable_stream', 'Eligible 10+2 / Graduation')), body_style),
        ]
    ]

    meta_table = Table(meta_data, colWidths=[168, 168, 168])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), neutral_light),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # Program Overview
    story.append(Paragraph("1. Programme Overview & Pedagogical Objectives", section_header))
    overview_text = program_data.get('overview', program_data.get('description', 'Comprehensive multi-disciplinary program curriculum designed to foster academic excellence, technical competencies, and professional industry readiness.'))
    story.append(Paragraph(overview_text, body_style))
    story.append(Spacer(1, 12))

    # Semesters & Course Units
    story.append(Paragraph("2. Course Structure & Semester-wise Syllabi", section_header))
    
    semesters = program_data.get('semesters', [])
    if not semesters:
        # Fallback sample structure
        semesters = [
            {
                "semesterNumber": 1,
                "title": "Semester I · Foundational Disciplines",
                "credits": 20,
                "courses": [
                    {"code": f"{program_data.get('code', 'CRS')}101", "title": "Core Foundations & Principles I", "type": "Core", "credits": 4, "ltp": "3-1-0", "units": ["Unit 1: Introduction & Principles", "Unit 2: Analytical Methods", "Unit 3: Applications & Case Studies"]},
                    {"code": f"{program_data.get('code', 'CRS')}102", "title": "Applied Methodologies & Modeling", "type": "Core", "credits": 4, "ltp": "3-1-0", "units": ["Unit 1: Fundamentals", "Unit 2: Practice Standards"]},
                    {"code": f"{program_data.get('code', 'CRS')}103", "title": "Practical Laboratory & Studio I", "type": "Laboratory", "credits": 2, "ltp": "0-0-4", "units": ["Hands-on experimentation and project development"]},
                    {"code": "ENG101", "title": "Professional Communication & Ethics", "type": "Humanities", "credits": 3, "ltp": "3-0-0", "units": ["Technical reporting, presentations, professional ethics"]},
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester II · Advanced Core & Applied Concepts",
                "credits": 22,
                "courses": [
                    {"code": f"{program_data.get('code', 'CRS')}201", "title": "Advanced Principles & Systems II", "type": "Core", "credits": 4, "ltp": "3-1-0", "units": ["Unit 1: Advanced Frameworks", "Unit 2: Modern Technologies"]},
                    {"code": f"{program_data.get('code', 'CRS')}202", "title": "Domain Elective I", "type": "Elective", "credits": 3, "ltp": "3-0-0", "units": ["Specialized tracks and contemporary topics"]},
                    {"code": f"{program_data.get('code', 'CRS')}203", "title": "Advanced Lab & Mini-Project", "type": "Project", "credits": 3, "ltp": "0-0-6", "units": ["Design, execution and peer evaluation"]},
                ]
            }
        ]

    for sem in semesters[:4]:  # Render first 4 semesters cleanly
        sem_num = sem.get('semesterNumber', 1)
        sem_title = sem.get('title', f'Semester {sem_num}')
        sem_credits = sem.get('credits', 20)

        sem_header_text = f"<b>Semester {sem_num}</b> — {sem_title} (Total Credits: {sem_credits})"
        story.append(Paragraph(sem_header_text, ParagraphStyle('SemHead', parent=body_style, fontName='Helvetica-Bold', textColor=accent_color, spaceBefore=8, spaceAfter=4)))

        # Course table
        table_rows = [
            [
                Paragraph("Course Code", table_header),
                Paragraph("Course Title", table_header),
                Paragraph("Type", table_header),
                Paragraph("L-T-P", table_header),
                Paragraph("Credits", table_header),
            ]
        ]

        for c in sem.get('courses', []):
            table_rows.append([
                Paragraph(c.get('code', '-'), table_body_bold),
                Paragraph(c.get('title', '-'), table_body),
                Paragraph(c.get('type', 'Core'), table_body),
                Paragraph(c.get('ltp', '3-0-0'), table_body),
                Paragraph(str(c.get('credits', 3)), table_body_bold),
            ])

        c_table = Table(table_rows, colWidths=[70, 244, 70, 60, 60])
        c_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), accent_color),
            ('BOX', (0,0), (-1,-1), 1, border_color),
            ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, neutral_light]),
        ]))
        story.append(c_table)
        story.append(Spacer(1, 8))

    # Career Alignment & Accreditation
    story.append(Spacer(1, 10))
    story.append(Paragraph("3. Industry Alignment & Career Pathways", section_header))
    outcomes = program_data.get('careerOutcomes', program_data.get('career_domains', []))
    if outcomes:
        outcome_str = " · ".join(outcomes[:6]) if isinstance(outcomes, list) else str(outcomes)
        story.append(Paragraph(f"<b>Key Career Domains:</b> {outcome_str}", body_style))
    
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Evaluation Scheme:</b> Continuous Internal Evaluation (ISE: 40%) and End-Semester Examination (ESE: 60%) in accordance with UGC and Sandip University examination regulations.", body_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    return output_path

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python generate_syllabus_pdf.py <input_json_file> <output_pdf_file>")
        sys.exit(1)

    json_file = sys.argv[1]
    out_file = sys.argv[2]

    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    generate_pdf(data, out_file)
    print("SUCCESS")
