import emailjs from "@emailjs/browser"

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || ""
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ""

export const TEMPLATE_IDS = {
  order: process.env.NEXT_PUBLIC_EMAILJS_ORDER_TEMPLATE_ID || "",
  contact: process.env.NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID || "",
  seller: process.env.NEXT_PUBLIC_EMAILJS_SELLER_TEMPLATE_ID || "",
}

interface CartItem {
  productName: string
  productPrice: number
  quantity: number
  subtotal: number
}

interface OrderEmailData {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  items: CartItem[]
  totalAmount: number
}

interface ContactEmailData {
  name: string
  email: string
  phone?: string
  message: string
}

interface SellerEmailData {
  name: string
  email: string
  phone: string
  farmLocation: string
  products: string
  farmSize: string
  message: string
}

export async function sendOrderEmail(data: OrderEmailData) {
  if (!SERVICE_ID || !PUBLIC_KEY || !TEMPLATE_IDS.order) {
    console.warn("[v0] EmailJS not configured - order email skipped")
    return { success: true, mock: true }
  }

  // Format items as a readable list
  const itemsList = data.items
    .map(
      (item) =>
        `${item.productName} x ${item.quantity} = ₹${item.subtotal}`
    )
    .join("\n")

  const response = await emailjs.send(
    SERVICE_ID,
    TEMPLATE_IDS.order,
    {
      to_email: "aruthvik4@gmail.com",
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
      customer_address: data.customerAddress,
      order_items: itemsList,
      total_amount: `₹${data.totalAmount}`,
    },
    PUBLIC_KEY
  )
  return { success: response.status === 200, response }
}

export async function sendContactEmail(data: ContactEmailData) {
  if (!SERVICE_ID || !PUBLIC_KEY || !TEMPLATE_IDS.contact) {
    console.warn("[v0] EmailJS not configured - contact email skipped")
    return { success: true, mock: true }
  }

  const response = await emailjs.send(
    SERVICE_ID,
    TEMPLATE_IDS.contact,
    {
      to_email: "aruthvik4@gmail.com",
      from_name: data.name,
      from_email: data.email,
      from_phone: data.phone || "Not provided",
      message: data.message,
    },
    PUBLIC_KEY
  )
  return { success: response.status === 200, response }
}

export async function sendSellerEmail(data: SellerEmailData) {
  if (!SERVICE_ID || !PUBLIC_KEY || !TEMPLATE_IDS.seller) {
    console.warn("[v0] EmailJS not configured - seller email skipped")
    return { success: true, mock: true }
  }

  const response = await emailjs.send(
    SERVICE_ID,
    TEMPLATE_IDS.seller,
    {
      to_email: "aruthvik4@gmail.com",
      seller_name: data.name,
      seller_email: data.email,
      seller_phone: data.phone,
      farm_location: data.farmLocation,
      products: data.products,
      farm_size: data.farmSize,
      message: data.message,
    },
    PUBLIC_KEY
  )
  return { success: response.status === 200, response }
}
