import findPitch from "./findPitch";
import pressedStringTable from "./data/pressedTable";
import fanyinStringTable from "./data/fanyinTable";
import groups from "./data/groups";

function convert (song){
    let songConverted = [];

    let isFanyin = false;
    let stringTable = pressedStringTable;

    let pentatonicScale;

    for (let i in song){
        if(song[i].hasOwnProperty('num_beats') || song[i].hasOwnProperty('clef')){
            songConverted.push(song[i]);
        } else if (song[i].hasOwnProperty('song_info')){
            pentatonicScale = song[i].song_info.pentatonic;
        } else {
        let symbol = song[i];
        let symbolType = symbol.type;
        let group = findTypeGroup(symbolType);
        let pitch, convSymbol, combinations, index, isSymbol;

        switch(group){
            case "1P1D":
                combinations = symbol.combinations;
                isSymbol = true;

                index = 0;

                if(!symbol.hasOwnProperty('combinations')){
                    while(!song[i-index].hasOwnProperty('combinations')){
                        index++;
                    }
                    while(!song[i-index].combinations[0].hasOwnProperty('string') ){
                        index++;
                    }
                    combinations = song[i-index].combinations;
                    combinations[0].hui = "san3";
                } else if (!symbol.combinations[0].hasOwnProperty('string') || !symbol.combinations[0].hasOwnProperty('hui')){
                    combinations = symbol.combinations;
                    index++;
                    while(!song[i-index].hasOwnProperty('combinations')){
                        index++;
                    }
                    let tempIndex = index;

                    if(!symbol.combinations[0].hasOwnProperty('string')){
                        while(!song[i-index].combinations[0].hasOwnProperty('string') ){
                            index++;
                        }
                        combinations[0].string = song[i-index].combinations[0].string;
                    }

                    index = tempIndex;
                    if (!symbol.combinations[0].hasOwnProperty('hui')){
                        while(!song[i-index].combinations[0].hasOwnProperty('hui') ){
                            index++;
                        }
                        combinations[0].hui = song[i-index].combinations[0].hui;
                    }
                    
                }
                pitch = findPitch(combinations[0], isFanyin);
                
                if (symbol.beam == "start"){
                    convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol, beam: "start"}
                } else if (symbol.beam == "end"){
                    convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol, beam: "end"}
                } else {
                    convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol}
                }
                
                // console.log(convSymbol)
                songConverted.push(convSymbol);
                break;
            case "1P2D":
                index=0;
                let beamsIndex = 0;

                if (!symbol.combinations[0].hasOwnProperty('string') || !symbol.combinations[0].hasOwnProperty('hui')){
                    combinations = symbol.combinations;
                    index++;
                    while(!song[i-index].hasOwnProperty('combinations')){
                        index++;
                    }
                    let tempIndex = index;

                    if(!symbol.combinations[0].hasOwnProperty('string')){
                        while(!song[i-index].combinations[0].hasOwnProperty('string') ){
                            index++;
                        }
                        combinations[0].string = song[i-index].combinations[0].string;
                    }

                    index = tempIndex;
                    if (!symbol.combinations[0].hasOwnProperty('hui')){
                        while(!song[i-index].combinations[0].hasOwnProperty('hui') ){
                            index++;
                        }
                        combinations[0].hui = song[i-index].combinations[0].hui;
                    }
                }
                pitch = findPitch(symbol.combinations[0], isFanyin);
                isSymbol=true;
                index=0;

                symbol.durations.forEach(item=>{

                   
                    if ((symbol.beam == "start" || symbol.beam == "start-end")&& index == 0){
                        convSymbol = {"pitch": pitch, "duration": item, "isSymbol": isSymbol, beam: "start"}
                    } else if ((symbol.beam == "end" || symbol.beam == "start-end") && index == symbol.durations.length-1){
                        convSymbol = {"pitch": pitch, "duration": item, "isSymbol": isSymbol, beam: "end"}
                    } else if (symbol.hasOwnProperty('beams')){
                        if (symbol.beams[beamsIndex] == ""){
                            convSymbol = {"pitch": pitch, "duration": symbol.durations[index], "isSymbol": isSymbol}
                        } else {
                            convSymbol = {"pitch": pitch, "duration": symbol.durations[index], "isSymbol": isSymbol, beam: symbol.beams[beamsIndex]}
                        }
                        beamsIndex++;
                    } else {
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[index], "isSymbol": isSymbol}
                    }
                    songConverted.push(convSymbol);
                    isSymbol=false;
                    index++;
                })
                break;
            case "2P1D":
                index =0;
                let ultimatePitch = [];
                isSymbol = true;

                symbol.combinations.forEach(combination => {
                    pitch = findPitch(combination, isFanyin);

                    if (symbol.beam == "start"){
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[index], "isSymbol": isSymbol, beam: "start"}
                    } else if (symbol.beam == "end"){
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[index], "isSymbol": isSymbol, beam: "end"}
                    } else {
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[index], "isSymbol": isSymbol}
                    }

                    ultimatePitch.push(convSymbol);
                    index++;
                })
                songConverted.push(ultimatePitch);              
                break;
            case "2P2D":
                if(symbol.type == "die3juan1"){
                    pitch = findPitch(symbol.combinations[0], isFanyin);
                    
                    let pitch1 = findPitch(symbol.combinations[1], isFanyin);

                    convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": true, beam: "start"}
                    // console.log(convSymbol)
                    songConverted.push(convSymbol);

                    convSymbol = {"pitch": pitch1, "duration": symbol.durations[1], "isSymbol": false, beam: "end"}
                    // console.log(convSymbol)
                    songConverted.push(convSymbol);

                    convSymbol = {"pitch": pitch, "duration": symbol.durations[2], "isSymbol": false}
                    // console.log(convSymbol)
                    songConverted.push(convSymbol);

                    convSymbol = {"pitch": pitch1, "duration": symbol.durations[3], "isSymbol": false, beam: "start"}
                    // console.log(convSymbol)
                    songConverted.push(convSymbol);
                } else if (symbol.type == "li4"){
                    let combination = symbol.combinations[0];
                    isSymbol = true;
                    
                    pitch = findPitch(combination, isFanyin);
                    if(symbol.beam == "start" || symbol.beam == "start-end"){
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol, beam: "start"};
                    } else if (symbol.hasOwnProperty('beams')){
                        if (symbol.beams[0] == ""){
                            convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol}
                        } else {
                            convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol, beam: symbol.beams[0]}
                        }
                    } else {
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol};
                    }
                
                    songConverted.push(convSymbol);

                    isSymbol = false;
                    combination.string=combination.string2;
                    pitch = findPitch(combination, isFanyin);
                    if(symbol.beam == "end" || symbol.beam == "start-end"){
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[1], "isSymbol": isSymbol, beam: "end"};
                    } else if (symbol.hasOwnProperty('beams')){
                        if (symbol.beams[1] == ""){
                            convSymbol = {"pitch": pitch, "duration": symbol.durations[1], "isSymbol": isSymbol}
                        } else {
                            convSymbol = {"pitch": pitch, "duration": symbol.durations[1], "isSymbol": isSymbol, beam: symbol.beams[1]}
                        }
                    }  else {
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[1], "isSymbol": isSymbol};
                    }

                    songConverted.push(convSymbol);

                } else if (symbol.type == "da3yuan2"){
                    let daYuanPitch1 = songConverted[songConverted.length-2].pitch;
                    let daYuanPitch2 = songConverted[songConverted.length-1].pitch;
                    if(daYuanPitch1 == undefined){
                        daYuanPitch1 = daYuanPitch2;
                    }
                    if(daYuanPitch2 == undefined){
                        daYuanPitch2 = daYuanPitch1;
                    }
                    isSymbol = true;


                    index = 0;

                    for(index; index<symbol.durations.length; index++){
                        if(symbol.beams[index] == ""){
                            if(index%2==0){
                                convSymbol = {"pitch": daYuanPitch1, "duration": symbol.durations[index], "isSymbol": isSymbol};
                            } else {
                                convSymbol = {"pitch": daYuanPitch2, "duration": symbol.durations[index], "isSymbol": isSymbol};
                            }
                        } else {
                            if(index%2==0){
                                convSymbol = {"pitch": daYuanPitch1, "duration": symbol.durations[index], "isSymbol": isSymbol, beam: symbol.beams[index]};
                            } else {
                                convSymbol = {"pitch": daYuanPitch2, "duration": symbol.durations[index], "isSymbol": isSymbol, beam: symbol.beams[index]};
                            }
                        }
                        // console.log(convSymbol)
                        songConverted.push(convSymbol);
                        isSymbol=false;
                    }
                }
                break;
            case "Glissando":
                // combinations = JSON.parse(JSON.stringify(symbol.combinations));
                combinations = symbol.combinations;

                index = 0;

                if(symbol.type=="jin4fu4" || symbol.type=="zhuang4"){
                    let jinFuPitch2 = songConverted[songConverted.length-1].pitch;
                    let jinFuPitch1 = findOneHigher(jinFuPitch2, pentatonicScale);
                    isSymbol = true;

                    if (symbol.beam == "start" || symbol.beam == "start-end"){
                        convSymbol = {"pitch": jinFuPitch1, "duration": symbol.durations[0], "isSymbol": isSymbol, beam: "start"}
                    } else {
                        convSymbol = {"pitch": jinFuPitch1, "duration": symbol.durations[0], "isSymbol": isSymbol}
                    }
                    // console.log(convSymbol)
                    songConverted.push(convSymbol);
                    isSymbol=false;

                    
                    if (symbol.beam == "end" || symbol.beam == "start-end"){
                        convSymbol = {"pitch": jinFuPitch2, "duration": symbol.durations[1], "isSymbol": isSymbol, beam: "end"}
                    } else {
                        convSymbol = {"pitch": jinFuPitch2, "duration": symbol.durations[1], "isSymbol": isSymbol}
                    }
                    // console.log(convSymbol)
                    songConverted.push(convSymbol);
                } else if (symbol.type=="fu4"){
                    isSymbol=true;
                    pitch = findPitch(song[i-2].combinations[0], isFanyin);

                    if (symbol.beam == "start"){
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol, beam: "start"}
                    } else if (symbol.beam == "end"){
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol, beam: "end"}
                    } else {
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol}
                    }

                    // console.log(convSymbol)
                    songConverted.push(convSymbol);

                } else if (symbol.type == "jin4"){
                    let jinPitch = songConverted[songConverted.length-1].pitch;
                    if(jinPitch == undefined){
                        jinPitch = songConverted[songConverted.length-1][0].pitch;
                    }
                    pitch = findOneHigher(jinPitch, pentatonicScale);

                    isSymbol = true;

                    if (symbol.beam == "start"){
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol, beam: "start"}
                    } else if (symbol.beam == "end") {
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol, beam: "end"}
                    } else {
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol}
                    }
                    // console.log(convSymbol)
                    songConverted.push(convSymbol);

                } else if (symbol.type == "tui4" && !symbol.combinations[0].hasOwnProperty('hui')){
                    index=0;
                    while(!song[i-index].hasOwnProperty('combinations')){
                        index++;
                    }
                    while(!song[i-index].combinations[0].hasOwnProperty('string') ){
                        index++;
                    }
                    // combinations[0].string = song[i-index].combinations[0].string;

                    // index = 0;
                    while(!song[i-index].combinations[0].hasOwnProperty('hui')){
                        index++;
                    }
                    combinations[0] = song[i-index].combinations[0];

                    pitch = findPitch(combinations[0], isFanyin);

                    pitch = findOneLower(pitch, pentatonicScale);

                    isSymbol =true;

                    if (symbol.beam == "start"){
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol, beam: "start"}
                    } else if (symbol.beam == "end"){
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol, beam: "end"}
                    } else {
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol}
                    }
                

                    // console.log(convSymbol)
                    songConverted.push(convSymbol);

                } else {

                    while(!song[i-index].hasOwnProperty('combinations')){
                        index++;
                    }
                    while(!song[i-index].combinations[0].hasOwnProperty('string') ){
                        index++;
                    }
                    combinations[0].string = song[i-index].combinations[0].string;

                    index = 0;
                    while(!song[i-index].combinations[0].hasOwnProperty('hui')){
                        index++;
                    }
                    combinations[0].hui = song[i-index].combinations[0].hui;

                    pitch = findPitch(combinations[0], isFanyin);

                    isSymbol =true;

                    if (symbol.beam == "start"){
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol, beam: "start"}
                    } else if (symbol.beam == "end"){
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol, beam: "end"}
                    } else {
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol}
                    }
                

                    // console.log(convSymbol)
                    songConverted.push(convSymbol);
                }
                //add oblucik
                break;
            case "Tempo":
                // console.log(group);
                break;
            case "Other":
                if(symbol.type=="fan4qi3"){
                    isFanyin = true;
                    stringTable = fanyinStringTable;
                } else if (symbol.type=="zhi3"){
                    isFanyin = false;
                    stringTable = pressedStringTable;
                } else if (symbol.type=="fen1kai1"){
                    isSymbol=true;
                    pitch = songConverted[songConverted.length-1].pitch;
                    pitch = findOneHigher(pitch, pentatonicScale);
                    if (symbol.beam == "start"){
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol, beam: "start"}
                    } else if (symbol.beam == "end"){
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol, beam: "end"}
                    } else {
                        convSymbol = {"pitch": pitch, "duration": symbol.durations[0], "isSymbol": isSymbol}
                    }
                    songConverted.splice(songConverted.length-1, 0, convSymbol);
                }
                break;
            default:
                console.log(symbol);
        }
    }
    }
    return songConverted;
}

function findTypeGroup (symbolType){
    let finalGroup;
    for (let group in groups){
        let typeGroup = groups[group];
        typeGroup.forEach(type => {
            if (symbolType == type){
                finalGroup = group;
            } 
        });
    }
    return finalGroup;
}
// function findOneLower (tone, stringTable){
function findOneLower (tone, pentatonicScale){
    let newPitch;
    let octave = parseInt(tone.substr(tone.length-1, tone.length));
    for (let pentaScaleIndex = 0; pentaScaleIndex < pentatonicScale.length; pentaScaleIndex++){
        if (tone.includes(pentatonicScale[pentaScaleIndex])){
            if(pentaScaleIndex == 0){
                octave = octave-1;
                newPitch = pentatonicScale[pentatonicScale.length-1];
            } else {
                newPitch = pentatonicScale[pentaScaleIndex-1]
            }
        }
    }
    return newPitch+ "/" + octave;
    // if(tone.includes("C")){
    //     let octave = tone.substr(tone.length-1, tone.length);
    //     octave = parseInt(octave)-1;
    //     let temp =  tone.replace("C", "Bb");
    //     temp = temp.substr(0, temp.length-1);
    //     temp += octave;
    //     return temp;
    // } else if (tone.includes("Db")){
    //     let octave = tone.substr(tone.length-1, tone.length);
    //     octave = parseInt(octave)-1;
    //     let temp = tone.replace("Db", "B");
    //     temp = temp.substr(0, temp.length-1);
    //     temp += octave;
    //     return temp;
    // } else {
    //     for (let pitchIndex = 0; pitchIndex< stringTable.pitch.length; pitchIndex++){
    //         if(tone.includes(stringTable.pitch[pitchIndex])){
    //             return tone.replace(stringTable.pitch[pitchIndex],stringTable.pitch[pitchIndex-2])
    //         }
    //     }
    // }
}
// function findOneHigher (tone, stringTable){
function findOneHigher (tone, pentatonicScale){
    let newPitch;
    let octave = parseInt(tone.substr(tone.length-1, tone.length));
    for (let pentaScaleIndex = 0; pentaScaleIndex < pentatonicScale.length; pentaScaleIndex++){
        if (tone.includes(pentatonicScale[pentaScaleIndex])){
            if(pentaScaleIndex == pentatonicScale.length-1){
                octave = octave+1;
                newPitch = pentatonicScale[0];
            } else {
                newPitch = pentatonicScale[pentaScaleIndex+1]
            }
        }
    }
    return newPitch+ "/" + octave;
    // if(tone.includes("Bb")){
    //     let octave = tone.substr(tone.length-1, tone.length);
    //     octave = parseInt(octave)+1;
    //     let temp =  tone.replace("Bb", "C");
    //     temp = temp.substr(0, temp.length-1);
    //     temp += octave;
    //     // console.log(temp)
    //     return temp;
    // } else if (tone.includes("B")){
    //     let octave = tone.substr(tone.length-1, tone.length);
    //     octave = parseInt(octave)+1;
    //     let temp = tone.replace("B", "Db");
    //     temp = temp.substr(0, temp.length-1);
    //     temp += octave;
    //     // console.log(temp)
    //     return temp;
    // } else {
    //     for (let pitchIndex = 0; pitchIndex< stringTable.pitch.length; pitchIndex++){
    //         if(tone.includes(stringTable.pitch[pitchIndex])){
    //             return tone.replace(stringTable.pitch[pitchIndex],stringTable.pitch[pitchIndex+2])
    //         }
    //     }
    // }
}
export default convert;
