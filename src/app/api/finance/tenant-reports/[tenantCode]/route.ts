import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, addDoc } from "firebase/firestore"
import PDFDocument from "pdfkit"
import nodemailer from "nodemailer"

export async function POST(
  request: Request,
  { params }: { params: { tenantCode: string } }
) {
  try {
    const tenantCode = params.tenantCode

    // Get student data (reuse logic from student route)
    const studentsRef = collection(db, "users")
    const studentQuery = query(studentsRef, where("tenantCode", "==", tenantCode))
    const studentSnap = await getDocs(studentQuery)

    if (studentSnap.empty) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }

    const studentDoc = studentSnap.docs[0]
    const studentData = studentDoc.data()

    // Get payment history
    const paymentsRef = collection(db, "payments")
    const paymentsQuery = query(paymentsRef, where("userId", "==", studentDoc.id))
    const paymentsSnap = await getDocs(paymentsQuery)

    const paymentHistory = paymentsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }))

    // Generate PDF
    const doc = new PDFDocument()
    let buffers: any[] = []
    doc.on('data', buffers.push.bind(buffers))
    
    // Add content to PDF
    doc
      .fontSize(20)
      .text('Financial Report', { align: 'center' })
      .moveDown()
      
    doc
      .fontSize(14)
      .text(`Student: ${studentData.fullName}`)
      .text(`Tenant Code: ${studentData.tenantCode}`)
      .text(`Room Number: ${studentData.roomNumber}`)
      .moveDown()

    doc
      .fontSize(16)
      .text('Payment History')
      .moveDown()

    paymentHistory.forEach(payment => {
      doc
        .fontSize(12)
        .text(`Date: ${payment.date.toLocaleDateString()}`)
        .text(`Amount: $${payment.amount.toFixed(2)}`)
        .text(`Status: ${payment.status}`)
        .text(`Description: ${payment.description}`)
        .moveDown()
    })

    doc.end()

    // Convert PDF to buffer
    const pdfBuffer = Buffer.concat(buffers)

    // Configure email transport
    const transporter = nodemailer.createTransport({
      // Configure your email service here
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    // Send email with PDF attachment
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: studentData.email,
      subject: 'Your Financial Report',
      text: 'Please find attached your financial report.',
      attachments: [
        {
          filename: 'financial-report.pdf',
          content: pdfBuffer
        }
      ]
    })

    // Store the PDF in Firestore for student portal access
    const reportsRef = collection(db, "financial_reports")
    await addDoc(reportsRef, {
      userId: studentDoc.id,
      tenantCode: studentData.tenantCode,
      reportDate: new Date(),
      reportUrl: '', // You would typically upload this to cloud storage and store the URL
      reportData: pdfBuffer.toString('base64')
    })

    return NextResponse.json({ 
      message: "Report generated and sent successfully" 
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
} 