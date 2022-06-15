import pressedStringTable from "./data/pressedTable";
import fanyinStringTable from "./data/fanyinTable";

function findPitch (combination, isFanyin){    
    let hui = combination.hui;

    if(hui == undefined){
        hui = "san3"
    }

    if(!isFanyin){
        return getPressedPitch(hui, combination.string);
    } else {
        return getFanyinPitch(hui, combination.string);
    }
}

function getFanyinPitch(hui, stringNum){
    isHuiCorrect = false;
    round(hui, 1);
        if(hui == "Wai4"){
        hui = 13.1;
    }

    let i = 1;
    let index = 0;
    while (!isHuiCorrect){
        index = 0;
        for (huiNum of fanyinStringTable.huiNums){
            if(hui === huiNum){
                isHuiCorrect = true;
                break;
            }
            index++;
        }

        hui += i * 0.1;
        hui = round(hui, 1);
        
        if (hui > 13.6 && hui < 1){
            console.log("invalid hui number: " + originalHui);
            break;
        }

        if(i>=0){
            i = -1 * (Math.abs(i) + 1);
        } else {
            i = (Math.abs(i) + 1);
        }
    }
    
    stringNum = "string" + stringNum.toString();
    if(isHuiCorrect){
        return fanyinStringTable[stringNum][index];
    } else {
        return fanyinStringTable[stringNum][0];
    }

}

function getPressedPitch(hui, stringNum) {
    let huiNums = pressedStringTable.huiNums;
    let pitches = pressedStringTable.pitch;
    let pitch, huiIndex, octave;
    let originalHui = hui;
    
    round(hui, 1);
        if(hui == "Wai4"){
        hui = 13.1;
        originalHui = 13.1;
    }
    

    huiIndex = getHuiIndex(huiNums, hui);
    

    //ZAOKRUHLI HUI
    let i = 1;
    let max = 0;
    let min = 14;
    while (huiIndex == undefined){

        hui += i * 0.1;
        hui = round(hui, 1);

         
        if (hui > max){
            max = hui;
        }

        if (hui < min){
            min = hui;
        }

        huiIndex = getHuiIndex(huiNums, hui);

        if(i>=0){
            i = -1 * (Math.abs(i) + 1);
        } else {
            i = (Math.abs(i) + 1);
        }
        
        if (max > 13.6 && min < 1){
            console.log("invalid hui number: " + originalHui);
            break;
        }
    }


    //ZISTI PITCH a OKTAVU
    switch (stringNum){
        case 1:
            octave = findOctave(7.0, 4.0, 1.0, originalHui);
            break;
        case 2:
            octave = findOctave(7.7, 4.4, 1.4, originalHui);
            huiIndex += 2;
            break;
        case 3:
            octave = findOctave(9.0, 5.0, 2.0, originalHui);
            huiIndex += 5;
            break;
        case 4:
            octave = findOctave(10.0, 5.6, 2.6, originalHui);
            huiIndex += 7;
            break;
        case 5:
            octave = findOctave(12.2, 6.2, 3.2, originalHui);
            huiIndex += 9;
            break;
        case 6:
            octave = findOctave(7.0, 4.0, 1.0, originalHui) + 1;
            break;
        case 7:
            octave = findOctave(7.7, 4.4, 1.4, originalHui) + 1;
            huiIndex += 2;
            break;
        default:
            console.log("invalid string number: "+ stringNum);
            break;
    }
    huiIndex = huiIndex % 12;

    if(huiIndex == 0){
        pitch = pitches [11] + "/" + octave ;
    }else {
        
        pitch = pitches [huiIndex-1] + "/" + octave ;
    }

    return pitch;
}

function getHuiIndex(huiNums, hui){
    let huiIndex;
    let index = 0;
    huiNums.forEach(huiNum => {
        index++;
        if (huiNum == hui){
            huiIndex = index;
        }
    });
    return huiIndex;
}

function findOctave(num1, num2, num3, hui){
    if( (hui>num1)|| (hui == "san3")){
    // if( (hui>num1)|| (hui == "open")){
        return 2;
    } else if (hui>num2){
        return 3;
    } else if (hui>num3){
        return 4;
    } else {
        return 5;
    }
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

export default findPitch;