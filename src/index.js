import convert from "./convert";
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Dot, Beam, Stem } from "vexflow";

let positions = [];

function toSheet (songData, outputDiv){
    songData = songData.song;

    let song = [];
    let songInfo = {};

    //get rid of comments and store song info about clef etc.
    for (let key in songData){
        let symbol = songData[key]
        if (!symbol.hasOwnProperty('_comment')){
            song.push(symbol);
        }
        if (symbol.hasOwnProperty('song_info')){
            songInfo = symbol.song_info;
        }
    }  

    //convert song
    let songConverted = convert(song);

    draw(songConverted, songInfo, outputDiv);
}

function draw(songConverted, songInfo, div){
        
    const renderer = new Renderer(div, Renderer.Backends.SVG);

    renderer.resize(1300, 5000);
    const context = renderer.getContext();
    context.setFont('Arial', 10);

    var x = 10;
    var y = 40;
    var width = 400;

    let numBeats = songInfo.num_beats;
    let beatVal = songInfo.beat_value;

    let voice = new Voice({num_beats: numBeats,  beat_value: beatVal});

    let stave = new Stave(x, y, width);

    let timeSignature = numBeats.toString() + "/" + beatVal.toString();

    stave.addClef(songInfo.clef).addTimeSignature(timeSignature);

    let notesLeft = songConverted.length;
    let barCount = 0;
    let index = 0;
    let beams = [];
    let beam = [];
    let notes = [];
    let xPositions = [];
    let yPositions = [];
    let beamVal;
    let beamFlag = false;
    let key, duration, beatsLeft, note;
    let clef = songInfo.clef;

    while (notesLeft>0){
        notes = [];
        beatsLeft = numBeats/beatVal;

        while (beatsLeft>0 && notesLeft>0){

            if(songConverted[index].hasOwnProperty('clef')){
                clef = songConverted[index].clef;
                stave.addClef(clef);
                index++;
                notesLeft--; 
                continue;
            }
            else if (!songConverted[index].hasOwnProperty("pitch")){
                key = [songConverted[index][0].pitch, songConverted[index][1].pitch];
                duration = songConverted[index][0].duration;

                if(songConverted[index][0].hasOwnProperty('beam')){
                    beamVal = songConverted[index][0].beam;
                }
                else {
                    beamVal = "";
                }
            } else {
                key = [songConverted[index].pitch];
                duration = songConverted[index].duration;

                if(songConverted[index].hasOwnProperty('beam')){
                    beamVal = songConverted[index].beam;
                }
                else {
                    beamVal = "";
                }
            }
                
            note = new StaveNote({clef:clef, keys: key, duration: [duration], auto_stem: true});
                
            if(duration.includes("d")){
                duration = duration.replace('d', '');
                beatsLeft -=(1/(duration*2));

                Dot.buildAndAttach([note], {
                    all: true,
                });
            }         

            beatsLeft -= (1/duration);

            if (beamVal === "start"){
                beamFlag = true;
            } else if (beamVal === "end"){
                beamFlag = false;
                beam.push(note);

                let stem_direction = calculateStemDirection(beam);
                for (let i = 0; i < beam.length; ++i) {
                    note = beam[i];
                            
                    note.setStemDirection(stem_direction);
                        
                    note.setBeam(this);
                }
                beams.push(new Beam(beam));
                    
                beam = [];
            }

            if (beamFlag){
                beam.push(note);
            }

            index++;
            notes.push(note);
            notesLeft--;   
        }


        //add the notes from above
        voice.addTickables(notes);

        // Format and justify the notes to 300 pixels (50 pixels left for key and time signatures)
        new Formatter().joinVoices([voice]).format([voice], 300);

        // Connect stave to the rendering context and draw!
        stave.setContext(context).draw();

        // Render voice
        voice.draw(context, stave);

        //saving x-coordinate of each note
        notes.forEach(note => {
            xPositions.push(note.getAbsoluteX());
            yPositions.push(y);
        });

        // Draw the beams and stems.
        beams.forEach((b) => {
            b.setContext(context).draw();
        });

        barCount++;
        x+=width;

        if(barCount%3 == 0){
            x=10;
            y+=200;
        }

        stave = new Stave(x, y, width);
        if(songConverted[index] && songConverted[index].hasOwnProperty('num_beats')){
            numBeats = songConverted[index].num_beats;
            beatVal = songConverted[index].beat_value;
            
            timeSignature = numBeats.toString() + "/" + beatVal.toString();
            
            stave.addTimeSignature(timeSignature);

            if(!songConverted[index].hasOwnProperty('clef')){
            index++;
            notesLeft--;  
            }
        } 
        voice = new Voice({num_beats: numBeats,  beat_value: beatVal});
            
    }

    index = 0
    songConverted.forEach(note => {
        if(note.hasOwnProperty('pitch') || note.length > 1){
            if (note.isSymbol==false){
                xPositions.splice(index, 1);
                yPositions.splice(index, 1);
            } else {
                index++;
            }
        }
    });

    positions =[];
    positions.push(xPositions);
    positions.push(yPositions);

}   

//function from http://www.vexflow.com/build/docs/beam.html
function calculateStemDirection(notes) {
    let lineSum = 0;
    notes.forEach(note => {
        if (note.keyProps) {
        note.keyProps.forEach(keyProp => {
            lineSum += (keyProp.line - 3);
        });
        }
    });

    if (lineSum >= 0) {
        return Stem.DOWN;
    }
    return Stem.UP;
}


export {toSheet}
export{positions}
