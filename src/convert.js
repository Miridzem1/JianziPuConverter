import findPitch from "./findPitch";
import groups from "./data/groups";

function convert (song){
    let songConverted = [];

    let isFanyin = false;

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
        let pitch, convSymbol, combinations, combination, index, isSymbol;

        switch(group){
            case "1P1D":
                pitch = findPitch(checkCombination(song, symbol, i), isFanyin);
                songConverted.push(createNote(symbol, pitch, 0, true));
                break;
            case "1P2D":
                index=0;
                isSymbol=true;
                pitch = findPitch(checkCombination(song, symbol, i), isFanyin);
                
                symbol.durations.forEach(()=>{
                    songConverted.push(createNote(symbol, pitch, index, isSymbol));
                    isSymbol=false;
                    index++;
                })
                break;
            case "2P1D":
                index =0;
                isSymbol = true;
                let ultimatePitch = [];

                symbol.combinations.forEach(combination => {
                    pitch = findPitch(completeCombination (song, combination, i, 0), isFanyin);
                    ultimatePitch.push(createNote(symbol, pitch, 0, isSymbol))
                    isSymbol=false;
                    index++;
                })
                songConverted.push(ultimatePitch);              
                break;
            case "2P2D":
                if(symbol.type == "die3juan1"){
                    isSymbol=true;
                    index = 0;

                    let pitch2 = findPitch(symbol.combinations[0], isFanyin);
                    let pitch1 = findPitch(symbol.combinations[1], isFanyin);

                    pitch = pitch2;

                    symbol.durations.forEach(()=>{
                        songConverted.push(createNote(symbol, pitch, index, isSymbol));
                        isSymbol=false;
                        index++;

                        if(pitch == pitch2){
                            pitch = pitch1;
                        } else if (pitch == pitch1){
                            pitch = pitch2;
                        }
                    })
                } else if (symbol.type == "li4"){
                    index=0;
                    isSymbol=true;

                    combination = symbol.combinations[0];
                    pitch = findPitch(completeCombination (song, combination, i, 0), isFanyin);
                    
                    symbol.durations.forEach(()=>{
                        songConverted.push(createNote(symbol, pitch, index, isSymbol))
                        isSymbol=false;
                        index++;
                        combination.string=combination.string2;
                        pitch = findPitch(completeCombination (song, combination, i, 0), isFanyin);
                    })
                } else if (symbol.type == "da3yuan2"){
                    index=0;
                    isSymbol = true;

                    let pitch1 = songConverted[songConverted.length-2].pitch;
                    let pitch2 = songConverted[songConverted.length-1].pitch;

                    if(pitch1 == undefined){
                        pitch1 = pitch2;
                    }
                    if(pitch2 == undefined){
                        pitch2 = pitch1;
                    }

                    pitch = pitch1;
                    symbol.durations.forEach(()=>{
                        songConverted.push(createNote(symbol, pitch, index, isSymbol));
                        isSymbol=false;
                        index++;

                        if(pitch == pitch2){
                            pitch = pitch1;
                        } else if (pitch == pitch1){
                            pitch = pitch2;
                        }
                    })
                }
                break;
            case "Glissando":
                if(symbol.type=="jin4fu4" || symbol.type=="zhuang4"){
                    let pitch2 = songConverted[songConverted.length-1].pitch;
                    let pitch1 = findOneHigher(pitch2, pentatonicScale);
                    isSymbol = true;
                    index = 0;

                    pitch = pitch1;
                    symbol.durations.forEach(()=>{
                        
                        songConverted.push(createNote(symbol, pitch, index, isSymbol))
                        isSymbol=false;
                        index++;

                        if(pitch == pitch2){
                            pitch = pitch1;
                        } else if (pitch == pitch1){
                            pitch = pitch2;
                        }
                    })
                } else if (symbol.type=="fu4"){
                    pitch = findPitch(completeCombination (song, song[i-2].combinations[0], i, 0), isFanyin);
                    songConverted.push(createNote(symbol, pitch, 0, true))
                } else if (symbol.type == "jin4"){
                    let pitch = songConverted[songConverted.length-1].pitch;
                    if(pitch == undefined){
                        pitch = songConverted[songConverted.length-1][0].pitch;
                    }
                    pitch = findOneHigher(pitch, pentatonicScale);

                    songConverted.push(createNote(symbol,pitch,0,true));
                    
                } else if (symbol.type == "tui4" && !symbol.combinations[0].hasOwnProperty('hui')){
                    pitch = findPitch(checkCombination(song, symbol, i), isFanyin);
                    pitch = findOneLower(pitch, pentatonicScale);

                    songConverted.push(createNote(symbol,pitch,0,true))
                } else {
                    pitch = findPitch(checkCombination(song, symbol, i), isFanyin);
                    songConverted.push(createNote(symbol,pitch,0,true));
                }
                break;
            case "Tempo":
                break;
            case "Other":
                if(symbol.type=="fan4qi3"){
                    isFanyin = true;
                } else if (symbol.type=="zhi3"){
                    isFanyin = false;
                } else if (symbol.type=="fen1kai1"){
                    pitch = songConverted[songConverted.length-1].pitch;
                    pitch = findOneHigher(pitch, pentatonicScale);
                    songConverted.splice(songConverted.length-1, 0, createNote(symbol,pitch,0,true));
                }
                break;
            default:
                console.log("symbol does not belong to group: ")
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

function completeCombination (song, combination, i, combIndex){
    let index = combIndex;
    
    if(!combination.hasOwnProperty('string')){
        while(!song[i-index].combinations[0].hasOwnProperty('string') ){
            index++;
            while(!song[i-index].hasOwnProperty('combinations')){
                index++;
            }
        }
        combination.string = song[i-index].combinations[0].string;
    }

    index = combIndex;
    if (!combination.hasOwnProperty('hui')){
        while(!song[i-index].combinations[0].hasOwnProperty('hui') ){
            index++;
            while(!song[i-index].hasOwnProperty('combinations')){
                index++;
            }
        }
        combination.hui = song[i-index].combinations[0].hui;
    }
    return combination;
}

function checkCombination (song, symbol, i){
    let index = 0;
    let combination;
    
    while (!song[i-index].hasOwnProperty('combinations')){
        index++;
    }
    combination = song[i-index].combinations[0];
    return completeCombination(song, combination, i, index, symbol);
}

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
}

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
}

function createNote(symbol, pitch, index, isSymbol){
    if (symbol.hasOwnProperty("beams")){
        return {pitch: pitch, duration: symbol.durations[index], isSymbol: isSymbol, beam: symbol.beams[index]}
    } else {
        return {pitch: pitch, duration: symbol.durations[index], isSymbol: isSymbol}
    }
}

export default convert;
