import BigNumber from "bignumber.js";
import moveDecimal from "move-decimal-point";
import {MAX_NUMBER_LENGTH} from "../constant";

let formatBigNumber = {
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: ' ',
    fractionGroupSize: 0
}
BigNumber.config({ FORMAT: formatBigNumber })

export default class Tools {
	static bigNumberAdd(num1, num2) {
	  return new BigNumber(num1).plus(num2).toString();
	}
	static bigNumberSubtract(num1, num2) {
	  return new BigNumber(num1).minus(num2).toString();
	}
 
	static bigNumberMultiply(num1, num2) {
	  if (isNaN(new BigNumber(num1).multipliedBy(num2).toString())) {
		return 0;
	  } else {
		return new BigNumber(num1).multipliedBy(num2).toString();
	  }
	}
	static bigNumberDivide(num1, num2) {
	  return new BigNumber(num1).div(num2).toString();
	}

	static bigNumberDivideToString(num1, num2) {
		return new BigNumber(num1).div(num2).toFixed();
	}

	static bigNumberDivideToInteger(num1, num2) {
	  return new BigNumber(num1).dividedToIntegerBy(num2).toNumber();
	}
	static getFractionalExpression(value, threshold) {
	  let i = 1,j = 1;
	  while (Math.abs(i / j - value) > threshold) {
		if (i / j > value) {
		  j++;
		} else if (i / j < value) {
		  i++;
		}
	  }
	  return { numerator: i, denominator: j };
	}
	static formatAddress (address) {
		return`${ address.toString().substr(0,4)}...${address.toString().substr(address.length - 4,address.length)}`
	}

	static formatBigNumber (value, num) {
		if (value == 0) {
			return value
		}
		return new BigNumber(value).toFormat(num)
	}

	static formatPercent (param) {
		return ((Math.floor(param*10000))/100).toFixed(2)+'%'
	}

	static formatDecimal (value, n) {
		if (value == '--' || !value) return ''
		if (typeof value == "string") {
			const index = value.indexOf(".");
			if (value.indexOf(".") == -1) {
				return value
			}
			if (n != 0) {
				return value.substring(0, index + n + 1);
			} else {
				return value.substring(0, index)
			}
		}
		return Math.floor(value * Math.pow(10, n)) / Math.pow(10, n);
	}

	static formatInt (value, n) {
		if (typeof value == "string") {
			const index = value.indexOf(".");
			if (value.indexOf(".") == -1) {
				return value
			}
			return value.substring(0, index);
		}
	}

	static formatPrice(ratio,scale){
		let str = ratio.toString()
		let  num = moveDecimal(str,scale * -1)
		return num
	}
	static maxToMin(tokenObj,value){
        let num = moveDecimal(value,Number(tokenObj.scale) * -1)
		return num
	}
	static minToMax (tokenObj, value) {
		let num = moveDecimal(value, Number(tokenObj.scale))
		return num
	}
    static formatPoolId(poolId) {
        if(poolId) {
            return poolId.indexOf('-') !== -1 ? `#${poolId.split('-')[1]}`: `#${poolId}`;
        }
        return '';
    }
    static formatWeth(tokenObj,value) {
        let num = moveDecimal(value,Number(tokenObj.scale) * -1)
        if(num.indexOf('.') !== -1) {
            if(num.split('.')[1].length > 8) {
                return `${num.split('.')[0]}.${num.split('.')[1].slice(0,8)}`
            }
        }
		return num
    }
	static formatDecimalPartToLong(number){
		if(number?.toString()?.includes('.')){
			const splitStr =  number?.toString()?.split('.')
			if(splitStr[1]?.length > MAX_NUMBER_LENGTH) {
				const decimalPart = `${splitStr[1].substring(0,MAX_NUMBER_LENGTH).replace(/(0+)$/g,"")}`
				return decimalPart ? `${splitStr[0]}.${decimalPart}` : `${splitStr[0]}`
			}
		}
		return number
	}
}

