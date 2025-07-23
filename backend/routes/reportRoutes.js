const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { jsPDF } = require('jspdf');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const Meeting = require('../models/Meeting');

const router = express.Router();

// Helper function to generate PDF report
async function generatePDFReport(meeting) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('Meeting Summary Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Meeting Info
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Meeting Information', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Title: ${meeting.title}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Date: ${new Date(meeting.date).toLocaleDateString()}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Participants: ${meeting.participants.map(p => p.name).join(', ')}`, 20, yPosition);
  yPosition += 15;

  // Key Points
  if (meeting.processedData.minutesOfMeeting?.keyPoints?.length > 0) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Key Discussion Points', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    meeting.processedData.minutesOfMeeting.keyPoints.forEach((point, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${point}`, pageWidth - 40);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 5;
    });
    yPosition += 10;
  }

  // Decisions
  if (meeting.processedData.minutesOfMeeting?.decisions?.length > 0) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Decisions Made', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    meeting.processedData.minutesOfMeeting.decisions.forEach((decision, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${decision}`, pageWidth - 40);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 5;
    });
    yPosition += 10;
  }

  // Action Items
  if (meeting.processedData.actionItems?.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Action Items', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    meeting.processedData.actionItems.forEach((item, index) => {
      const text = `${index + 1}. ${item.task} (Assigned to: ${item.assignedTo}, Priority: ${item.priority}${item.deadline ? `, Deadline: ${new Date(item.deadline).toLocaleDateString()}` : ''})`;
      const lines = doc.splitTextToSize(text, pageWidth - 40);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 5;
    });
  }

  return doc.output('arraybuffer');
}

// Helper function to generate DOCX report
async function generateDOCXReport(meeting) {
  const doc = new Document({
    sections: [{
      children: [
        // Title
        new Paragraph({
          children: [
            new TextRun({
              text: 'Meeting Summary Report',
              bold: true,
              size: 32
            })
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER
        }),

        // Meeting Info
        new Paragraph({
          children: [
            new TextRun({
              text: 'Meeting Information',
              bold: true,
              size: 24
            })
          ],
          heading: HeadingLevel.HEADING_1
        }),

        new Paragraph({
          children: [
            new TextRun({ text: 'Title: ', bold: true }),
            new TextRun({ text: meeting.title })
          ]
        }),

        new Paragraph({
          children: [
            new TextRun({ text: 'Date: ', bold: true }),
            new TextRun({ text: new Date(meeting.date).toLocaleDateString() })
          ]
        }),

        new Paragraph({
          children: [
            new TextRun({ text: 'Participants: ', bold: true }),
            new TextRun({ text: meeting.participants.map(p => p.name).join(', ') })
          ]
        }),

        // Key Points
        ...(meeting.processedData.minutesOfMeeting?.keyPoints?.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'Key Discussion Points',
                bold: true,
                size: 24
              })
            ],
            heading: HeadingLevel.HEADING_1
          }),
          ...meeting.processedData.minutesOfMeeting.keyPoints.map((point, index) =>
            new Paragraph({
              children: [
                new TextRun({ text: `${index + 1}. ${point}` })
              ]
            })
          )
        ] : []),

        // Decisions
        ...(meeting.processedData.minutesOfMeeting?.decisions?.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'Decisions Made',
                bold: true,
                size: 24
              })
            ],
            heading: HeadingLevel.HEADING_1
          }),
          ...meeting.processedData.minutesOfMeeting.decisions.map((decision, index) =>
            new Paragraph({
              children: [
                new TextRun({ text: `${index + 1}. ${decision}` })
              ]
            })
          )
        ] : []),

        // Action Items
        ...(meeting.processedData.actionItems?.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'Action Items',
                bold: true,
                size: 24
              })
            ],
            heading: HeadingLevel.HEADING_1
          }),
          ...meeting.processedData.actionItems.map((item, index) =>
            new Paragraph({
              children: [
                new TextRun({
                  text: `${index + 1}. ${item.task} (Assigned to: ${item.assignedTo}, Priority: ${item.priority}${item.deadline ? `, Deadline: ${new Date(item.deadline).toLocaleDateString()}` : ''})`
                })
              ]
            })
          )
        ] : [])
      ]
    }]
  });

  return await Packer.toBuffer(doc);
}

// POST /api/reports/generate/:meetingId - Generate meeting summary report
router.post('/generate/:meetingId', async (req, res) => {
  try {
    const { format = 'pdf' } = req.body; // 'pdf' or 'docx'

    const meeting = await Meeting.findById(req.params.meetingId);

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    if (!meeting.processedData ||
      (!meeting.processedData.minutesOfMeeting &&
        !meeting.processedData.actionItems &&
        !meeting.processedData.todos)) {
      return res.status(400).json({
        error: 'No processed data available. Please run NLP extraction first.'
      });
    }

    // Create reports directory if it doesn't exist
    const reportsDir = path.join(__dirname, '../downloads/reports');
    try {
      await fs.access(reportsDir);
    } catch {
      await fs.mkdir(reportsDir, { recursive: true });
    }

    let fileName, filePath, fileBuffer;

    if (format === 'pdf') {
      fileName = `meeting-report-${meeting._id}.pdf`;
      filePath = path.join(reportsDir, fileName);
      fileBuffer = await generatePDFReport(meeting);
    } else if (format === 'docx') {
      fileName = `meeting-report-${meeting._id}.docx`;
      filePath = path.join(reportsDir, fileName);
      fileBuffer = await generateDOCXReport(meeting);
    } else {
      return res.status(400).json({ error: 'Invalid format. Use "pdf" or "docx"' });
    }

    // Save file
    await fs.writeFile(filePath, fileBuffer);

    // Update meeting record
    meeting.reports = {
      summaryGenerated: true,
      reportPath: filePath,
      generatedAt: new Date()
    };
    await meeting.save();

    res.json({
      success: true,
      meetingId: meeting._id,
      fileName: fileName,
      format: format,
      downloadUrl: `/api/reports/download/${fileName}`,
      generatedAt: new Date().toISOString(),
      message: `${format.toUpperCase()} report generated successfully`
    });

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      error: 'Failed to generate report',
      details: error.message
    });
  }
});

// GET /api/reports/download/:fileName - Download report file
router.get('/download/:fileName', async (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, '../downloads/reports', fileName);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'Report file not found' });
    }

    const ext = path.extname(fileName).toLowerCase();
    let contentType = 'application/octet-stream';

    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.sendFile(filePath);

  } catch (error) {
    console.error('Report download error:', error);
    res.status(500).json({
      error: 'Failed to download report',
      details: error.message
    });
  }
});

// GET /api/reports/list/:meetingId - Get list of generated reports for a meeting
router.get('/list/:meetingId', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId)
      .select('title reports');

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({
      success: true,
      meetingId: meeting._id,
      meetingTitle: meeting.title,
      reports: meeting.reports || { summaryGenerated: false }
    });

  } catch (error) {
    console.error('List reports error:', error);
    res.status(500).json({
      error: 'Failed to retrieve reports list',
      details: error.message
    });
  }
});

// POST /api/reports/email-summary/:meetingId - Generate email summary
router.post('/email-summary/:meetingId', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId);

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    if (!meeting.processedData) {
      return res.status(400).json({
        error: 'No processed data available. Please run NLP extraction first.'
      });
    }

    // Generate email content
    const emailSubject = `Meeting Summary: ${meeting.title}`;

    const emailBody = `
Dear Team,

Please find below the summary of our meeting "${meeting.title}" held on ${new Date(meeting.date).toLocaleDateString()}.

=== KEY DISCUSSION POINTS ===
${meeting.processedData.minutesOfMeeting?.keyPoints?.map((point, index) => `${index + 1}. ${point}`).join('\n') || 'None recorded'}

=== DECISIONS MADE ===
${meeting.processedData.minutesOfMeeting?.decisions?.map((decision, index) => `${index + 1}. ${decision}`).join('\n') || 'None recorded'}

=== ACTION ITEMS ===
${meeting.processedData.actionItems?.map((item, index) =>
      `${index + 1}. ${item.task}
   - Assigned to: ${item.assignedTo}
   - Priority: ${item.priority}
   - Deadline: ${item.deadline ? new Date(item.deadline).toLocaleDateString() : 'Not specified'}`
    ).join('\n\n') || 'None recorded'}

=== TO-DO ITEMS ===
${meeting.processedData.todos?.map((todo, index) => `${index + 1}. ${todo.item} (${todo.category}, Priority: ${todo.priority})`).join('\n') || 'None recorded'}

This summary was automatically generated by Smart Meeting Assistant.

Best regards,
Meeting Assistant
    `.trim();

    res.json({
      success: true,
      meetingId: meeting._id,
      emailSummary: {
        subject: emailSubject,
        body: emailBody,
        recipients: meeting.participants.map(p => p.email).filter(Boolean)
      },
      message: 'Email summary generated successfully'
    });

  } catch (error) {
    console.error('Email summary error:', error);
    res.status(500).json({
      error: 'Failed to generate email summary',
      details: error.message
    });
  }
});

module.exports = router;
