/************************************************************************************************
 *
 * Sample Routine for decoding RTD modbus values
 * 
 * Compile with : 
 *                  gcc rtu-rtd.c -o rtu-rtd -lm
 *
 * Example use :
 *
 *                  pi@raspberrypi:~# ./rtu-rtd 8951
 *
 *                  RTD Temperature is :23.7899
 *
 *
 * 
 * Equations from pages 2 & 4 here :
 * http://www.analog.com/media/en/technical-documentation/application-notes/AN709_0.pdf  
 *
 *********************************************************************************************/


#include <stdio.h>
#include <math.h>
#include <stdlib.h>

float convertRtdReading(int modbusReading);

int main(int argc, char **argv)
{
        if (argc < 2) //Check enough arguments we're supplied
        {
                fprintf(stderr, "You didn't supply a value to decode");
                exit(1);
        }

        int modbusReading=atoi(argv[1]);
        float rtdTempReading=0;
        rtdTempReading=decodeModbus(modbusReading);
        printf("\r\n");
        printf("RTD Temperature is :%.4f", rtdTempReading);
        printf("\r\n");
	exit(0);
}


float decodeModbus(int modbusReading)
{
        const float RTD_A = 3.9083e-3;
        const float RTD_B = -5.775e-7;
        const float RTDnominal = 1000;   // PT1000
        const float refResistor = 4000;  // PT1000

        float Z1, Z2, Z3, Z4, Rt, temp;

        Rt = modbusReading;
        Rt /= 32768;
        Rt *= refResistor;


        Z1 = -RTD_A;
        Z2 = RTD_A * RTD_A - (4 * RTD_B);
        Z3 = (4 * RTD_B) / RTDnominal;
        Z4 = 2 * RTD_B;

        temp = Z2 + (Z3 * Rt);
        temp = (sqrt(temp) + Z1) / Z4;

        // if temperature is >0degC then return calculated value
        if (temp >= 0) return temp;

        // else re-calculate more accurate value for sub zero temperatures using alternate fifth order polynomial expression
        Rt /= RTDnominal;

        Rt *= 100;      // normalize to 100 ohm regardless of PT100/1000 type

        float rpoly = Rt;

        temp = -242.02;
        temp += 2.2228 * rpoly;
        rpoly *= Rt;  // square
        temp += 2.5859e-3 * rpoly;
        rpoly *= Rt;  // ^3
        temp -= 4.8260e-6 * rpoly;
        rpoly *= Rt;  // ^4
        temp -= 2.8183e-8 * rpoly;
        rpoly *= Rt;  // ^5
        temp += 1.5243e-10 * rpoly;

        // returns reading where temp <0degC
        return temp;
}
