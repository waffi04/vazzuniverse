import axios from 'axios';
import { templatesWaMessageAdmin, WaMessage } from '@/data/template/wa-admin';
import { templatesWaCustMessage } from '@/data/template/wa-cust';

const fonteClient = {
  sendWhatsAppMessage: async ({
    to,
    message,
  }: {
    to: string;
    message: string;
  }) => {
    const payload = {
      chatId: `62${to}@c.us`,
      text: message,
      session : "default"
    };
    const url = 'http://103.127.98.128:4000/api/sendText'
    try {
      const response = await axios.post(url,payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Function to send message to customer
export async function sendCustomerNotification({
  orderData,
}: {
  orderData: WaMessage;
}) {
  try {
    const messageContent = templatesWaMessageAdmin(orderData);

    // Replace placeholders with actual data
    const formattedMessage = messageContent
      .replace('{{productName}}', orderData.productName)
      .replace('{{amount}}', orderData.amount.toLocaleString())
      .replace('{{link}}', orderData.link)
      .replace('{{orderId}}', orderData.orderId || '');



    // Send message using Fonnte API
    const response = await fonteClient.sendWhatsAppMessage({
      to: orderData.whatsapp as string,
      message: formattedMessage,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

// Function to handle order status changes
export async function handleOrderStatusChange({
  orderData,
}: {
  orderData: WaMessage;
}) {
  try {
    // Send notification to customer
    await sendCustomerNotification({ orderData });
    return true;
  } catch (error) {
    throw error;
  }
}


// // Function to send message to admin
// export async function sendAdminNotification({
//   orderData,
// }: {
//   orderData: WaMessage;
// }) {
//   try {
//     const messageContent = templatesWaMessageAdmin(orderData);

//     // Replace placeholders with actual data
//     const formattedMessage = messageContent
//       .replace('{{productName}}', orderData.productName)
//       .replace('{{amount}}', orderData.amount.toLocaleString())
//       .replace('{{link}}', orderData.link)
//       .replace('{{customerName}}', orderData.customerName || 'Customer')
//       .replace('{{orderId}}', orderData.orderId || '');

//     const response = await fonteClient.sendWhatsAppMessage({
//       to: process.env.NEXT_PUBLIC_NOMOR_ADMIN as string,
//       message: formattedMessage,
//       type: 'text',
//     });

//     return response;
//   } catch (error) {
//     throw error;
//   }
// }