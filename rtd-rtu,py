#!/usr/bin/env python
"""
 ************************************************************************************************
 *
 * Sample Routine for decoding RTD modbus values
 *
 * Example use :
 *
 *                  pi@raspberrypi:~# ./rtu-rtd.py 8945
 *
 *                  RTD Temperature is :
 *                  23.6012135177
 * 
 * Equations from pages 2 & 4 here :
 * http://www.analog.com/media/en/technical-documentation/application-notes/AN709_0.pdf  
 *
 *********************************************************************************************
 """
import sys
import math
import time
from string import *

def decodeModbus(modbusValue):
    # This math originates from:
    # http://www.analog.com/media/en/technical-documentation/application-notes/AN709_0.pdf
    # To match the naming from the app note we tell lint to ignore the Z1-4
    # naming.
    # pylint: disable=invalid-name

    rtdNominal = 1000;
    refResistor = 4000.0;
    _RTD_A = 3.9083e-3
    _RTD_B = -5.775e-7

    rtdRes = modbusValue
    rtdRes /= 32768.0
    rtdRes *= refResistor

    raw_reading = rtdRes
    Z1 = -_RTD_A
    Z2 = _RTD_A * _RTD_A - (4 * _RTD_B)
    Z3 = (4 * _RTD_B) / rtdNominal
    Z4 = 2 * _RTD_B
    temp = Z2 + (Z3 * raw_reading)
    temp = (math.sqrt(temp) + Z1) / Z4
    if temp >= 0:
        return temp

    # For the following math to work, nominal RTD resistance must be normalized to 100 ohms
    raw_reading /= rtdNominal
    raw_reading *= 100

    rpoly = raw_reading
    temp = -242.02
    temp += 2.2228 * rpoly
    rpoly *= raw_reading  # square
    temp += 2.5859e-3 * rpoly
    rpoly *= raw_reading  # ^3
    temp -= 4.8260e-6 * rpoly
    rpoly *= raw_reading  # ^4
    temp -= 2.8183e-8 * rpoly
    rpoly *= raw_reading  # ^5
    temp += 1.5243e-10 * rpoly
    return temp


modbusReading=atoi(sys.argv[1])
rtdTemp=decodeModbus(modbusReading)
print( "RTD Temperature is :")
print(rtdTemp)
