import { SerialPort } from "serialport";
import ReadLine from "@serialport/parser-readline";
import axios from "axios";


const port = new SerialPort({
  path: "/dev/ttyUSB0",
  baudRate: 9600,
});

export async function readMessage (){
const parser = port.pipe(new ReadLine.ReadlineParser({ delimiter: "\r\n" }));

port.write('AT+CMGF=1\r'); // Set SMS text mode

setInterval(() => {
  port.write('AT+CMGL="REC UNREAD"\r'); // Read unread messages
}, 5000);

parser.on('data', async (line:any) => {
  console.log('Received:', line);
  if (line.includes('+CMGL:')) {
    const parts = line.split(',');
    const sender = parts[2].replace(/"/g, '');
    const messageIndex = parts[0].split(':')[1];

    parser.once('data', async (msg:string) => {
      console.log(`📩 From ${sender}: ${msg}`);
      try {
        // 🔼 Push to Express backend
        console.log(msg);
        
        await axios.post('https://your-server.com/api/sms', {
          sender,
          message: msg,
          receivedAt: new Date().toISOString()
        });

        // ✅ Delete message from SIM after syncing
        port.write(`AT+CMGD=${messageIndex}\r`);
      } catch (err:any) {
        console.error('❌ Server push failed:', err.message);
      }
    });
  }
});
}