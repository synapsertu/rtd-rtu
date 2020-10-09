#!/usr/bin/env node
/*
  Modbus RTD Value Decoder for node.js
  
  Follwing instruction from : https://developer.okta.com/blog/2019/06/18/command-line-app-with-nodejs
  
  Install using this index.js file
  
  Installation Steps :
  
	mkdir rtu-rtd
	cd rtu-rtd
    npm init 
	(accept all defaults)
	mkdir bin
	cd bin
	<copy this file here>
	cd ..
	
	Alter package.json to the following :
	
	START ============================================
	{
	 "name": "rtu-rtd",
	 "version": "1.0.0",
	 "description": "Demo Program",
	 "main": "bin/index.js",
	 "scripts": {"test": "echo \"Error: no test specified\" && exit 1" },
	 "keywords": [],
	 "author": "",
	 "license": "MIT",
	 "bin": { "rtu-rtd": "./bin/index.js" }
	}
	END  ============================================
	
	Result :
	
	pi@raspberrypi:~/node/hello-cli# node . 8951
	Modbus Value : 8951
	RTD Value    : 23.7899
    
*/

var modbusValue = parseInt(process.argv[2]);
var rtdValue=0;

if (process.argv[2] == null)
{
        console.log("Please supply a value to decode");
        process.exit(1);
}

rtdValue=decodeModbus(modbusValue);

console.log( "Modbus Value : " + modbusValue);
console.log( "RTD Value    : " + rtdValue );



function decodeModbus(modbusValue)
{
  //  This math originates from: http://www.analog.com/media/en/technical-documentation/application-notes/AN709_0.pdf

  const RTD_A = 3.9083e-3;
  const RTD_B = -5.775e-7;

  const nominalResistance = 1000; // PT1000
  const referenceResistor = 4000; // PT1000

  let resistance = modbusValue / 32768;
  resistance    *= referenceResistor;

  const z1 = -RTD_A;
  const z2 = RTD_A * RTD_A - (4 * RTD_B);
  const z3 = (4 * RTD_B) / nominalResistance;
  const z4 = 2 * RTD_B;

  let temp = z2 + (z3 * resistance);
  temp = (Math.sqrt(temp) + z1) / z4;
  
  // if temperature is >0degC then return calculated value
  if (temp >= 0)
  {
    return Number.parseFloat(temp).toPrecision(6);
  }

  // else re-calculate more accurate value for sub zero temperatures using alternate fifth order polynomial expression
  
  let rpoly = resistance;
  // For the following math to work, nominal RTD resistance must be normalized to 100 ohms
  rpoly /= nominalResistance;
  rpoly *= 100;

  temp = -242.02;
  temp += 2.2228 * rpoly;
  rpoly *= resistance; // square
  temp += 2.5859e-3 * rpoly;
  rpoly *= resistance; // ^3
  temp -= 4.8260e-6 * rpoly;
  rpoly *= resistance; // ^4
  temp -= 2.8183e-8 * rpoly;
  rpoly *= resistance; // ^5
  temp += 1.5243e-10 * rpoly;
  return Number.parseFloat(temp).toPrecision(6);
};
