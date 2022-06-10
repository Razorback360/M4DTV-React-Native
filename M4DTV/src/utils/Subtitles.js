import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';
// import vttToJson from 'vtt-to-json';
// import {getSubtitles} from './Requests';

const Subtitles = ({currentTime, hasSeeked, textStyle, subtitlesArray}) => {
  const [subtitles, setSubtitles] = useState(null);
  const [parsedSubtitles, setParsedSubtitles] = useState(null);
  const [text, setText] = useState(null);
  const [isSubtitlesSynced, setIsSubtitlesSynced] = useState(true);
  // const [videoTime, setVideoTime] = useState(0);

  // console.log(subtitlesArray);

  useEffect(() => {
    setSubtitles(subtitlesArray);
    setParsedSubtitles(subtitlesArray);
  }, [subtitlesArray]);

  /*   useEffect(() => {
    //we get the vtt file. then we convert and map the file to the array "result". then we setSubtitle to aforementioned "results"
    // rerun function each time the subtitles change or when seeked
    getSubtitles(mediaTitle, mediaYear, season, episode, isShow)
      .then(response => {
        const openedSubtitle = response.data;

        //conversion:
        vttToJson(openedSubtitle).then(parsedSubtitle => {
          let result = [];

          //mapping
          parsedSubtitle.map(subtitle => {
            // For some reason this library adds the index of the subtitle at the end of the part, so we cut it

            result.push({
              start: subtitle.start / 1000,
              end: subtitle.endTime / 1000,
              part: subtitle.part.slice(
                0,
                subtitle.part.length -
                  subtitle.part.split(' ')[subtitle.part.split(' ').length - 1]
                    .length,
              ),
              index: subtitle.part.slice(
                subtitle.part.length -
                  subtitle.part.split(' ')[subtitle.part.split(' ').length - 1]
                    .length,
              ),
            });
          });

          setSubtitles(result);
          setParsedSubtitles(result);
          setIsSubtitlesSynced(false);
          //console.log(result[860]);
        });
      })
      .catch(err => {
        console.error(`error fetchin subtitles ${err}`);
      });
  }, [mediaTitle, mediaYear, season, episode, isShow]);
 */
  /*  useEffect(() => {
    setText('');
    setSubtitles(parsedSubtitles);
    setIsSubtitlesSynced(false);
    //console.log('parsed Subs: ', parsedSubtitles);
  }, [hasSeeked, parsedSubtitles]); */

  useEffect(() => {
    // since subtitle files average 1500 line(i think), using array.filter would take forever.
    // so we run this loop to decrease the length of the array to less than 5 objects, making the filter method much faster
    // we use exponential decay to achieve that result, using the formula x * (1/2)^10 x being the length of the original subtitles array
    if (!isNaN(currentTime)) {
      if (currentTime !== 0) {
        if (subtitles) {
          // console.log(currentTime);

          if (!isSubtitlesSynced) {
            let subtitlesCopy = subtitles;
            for (let i = 0; i < 10; i++) {
              if (subtitlesCopy.length > 5) {
                let middleOfSubtiltesArray = Math.floor(
                  subtitlesCopy.length / 2,
                );
                console.log(
                  'middleOfSubtiltesArray: ',
                  middleOfSubtiltesArray,
                  subtitles[middleOfSubtiltesArray].endTime,
                );
                if (currentTime <= subtitles[middleOfSubtiltesArray].endTime) {
                  subtitlesCopy = subtitlesCopy.slice(
                    0,
                    middleOfSubtiltesArray + 1,
                  );
                  console.log(
                    `current Time: ${currentTime} is less than the ${middleOfSubtiltesArray}'s subtitle's end time: ${subtitles[middleOfSubtiltesArray].endTime}`,
                  );
                } else {
                  subtitlesCopy = subtitlesCopy.slice(middleOfSubtiltesArray);
                  console.log(
                    `current Time: ${currentTime} is more than the ${middleOfSubtiltesArray}'s subtitle's end time: ${subtitles[middleOfSubtiltesArray].endTime}`,
                  );
                }
                console.log('subtitlesCopy.length: ', subtitlesCopy.length);
              }
            }
            //console.log('subtitlesCopy: ', subtitlesCopy);
            let indexOfCurrentSubtitle = 0;
            for (let index = 0; index < subtitlesCopy.length; index++) {
              let subtitle = subtitlesCopy[index];
              if (
                subtitle.start <= currentTime &&
                currentTime <= subtitle.endTime
              ) {
                indexOfCurrentSubtitle = subtitle.index;
                console.log(subtitle, indexOfCurrentSubtitle);
                subtitlesCopy = subtitles.slice(indexOfCurrentSubtitle);
                setSubtitles(subtitlesCopy);
                setIsSubtitlesSynced(true);
                // setVideoTime(currentTime);
                break;
              } else if (index === subtitlesCopy.length - 1) {
                setIsSubtitlesSynced(false);
              }
            }
          }

          // now that the only subtitles remaniing are ones to be played; we take the first one and read its values
          if (subtitles[0]) {
            let currentSubtitleStart = subtitles[0].startTime;
            let currentSubtitleEnd = subtitles[0].endTime;
            let currentSubtitleText = subtitles[0].text;

            //if the current time equal or more than that subtitle's start time we display that subtitle
            if (
              currentTime >= currentSubtitleStart &&
              text !== currentSubtitleText
            ) {
              setText(currentSubtitleText);
            }

            // if the current time surpasses the subtitle's end time we revert the displayed text and remove that subtitle from the array
            // causing a change in subtitles array which reruns the entire useEffect
            if (currentTime >= currentSubtitleEnd) {
              setText('');
              //console.log(text);

              let subtitlesCopy = subtitles;
              subtitlesCopy.shift();
              setSubtitles(subtitlesCopy);
            }
          }
        }
      }
    }
  }, [isSubtitlesSynced, subtitles, text, currentTime]);
  //console.log(text);

  return <Text style={textStyle}>{text}</Text>;
};

export default Subtitles;

//now on why i have to rerun the entire function everytime we seek:
//will as you just read in the syncing useEffect: i use a for loop to check which subtitle is yet to be played;
//deleting the ones that has been already played
//so if i were to rerun only that useEffect i would only be able to fast forward and not to rewind since past subtitles has been deleted
//now regarding if there is a way around this maybe maybe not but the code is still inefficient so i think it would be better to find another way altogether
//please feel free ask/suggest/request anything i am all ears.
