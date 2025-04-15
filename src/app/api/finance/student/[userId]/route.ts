import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore"

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId

    // Get student profile
    const studentsRef = collection(db, "users")
    const studentDoc = await getDoc(doc(db, "users", userId))

    if (!studentDoc.exists()) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }

    const studentData = studentDoc.data()

    // Get payment history
    const paymentsRef = collection(db, "payments")
    const paymentsQuery = query(paymentsRef, where("userId", "==", userId))
    const paymentsSnap = await getDocs(paymentsQuery)

    const paymentHistory = paymentsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }))

    // Calculate outstanding balance
    const totalDue = paymentHistory.reduce((acc, payment) => {
      if (payment.status === "pending" || payment.status === "overdue") {
        return acc + payment.amount
      }
      return acc
    }, 0)

    // Find next payment due
    const nextPayment = paymentHistory
      .filter(payment => payment.status === "pending")
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0]

    return NextResponse.json({
      fullName: studentData.fullName,
      tenantCode: studentData.tenantCode,
      roomNumber: studentData.roomNumber,
      email: studentData.email,
      phone: studentData.phone,
      paymentHistory,
      outstandingBalance: totalDue,
      nextPaymentDue: nextPayment?.date || new Date()
    })
  } catch (error) {
    console.error("Error fetching student data:", error)
    return NextResponse.json(
      { error: "Failed to fetch student data" },
      { status: 500 }
    )
  }
} 