import type { Metadata } from "next"
import ContactContent from "./ContactContent"

export const metadata: Metadata = {
  title: "Contact Us | Kanharaj - Get in Touch for Property Inquiries",
  description: "Contact Kanharaj for the best real estate deals in Dwarka. Reach out to us via phone, WhatsApp, or email for property buying and renting inquiries.",
  keywords: "contact real estate, Kanharaj phone, Dwarka real estate office, property inquiry, WhatsApp real estate",
}

export default function ContactPage() {
  return <ContactContent />
}