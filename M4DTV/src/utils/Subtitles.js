import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';
import vttToJson from 'vtt-to-json';
import {getSubtitles} from '../utils/Requests';

const Subtitles = ({
  currentTime,
  type,
  mediaTitle,
  mediaYear,
  hasSeeked,
  textStyle,
  season,
  episode,
  isShow,
}) => {
  const [subtitles, setSubtitles] = useState(null);
  const [text, setText] = useState(null);

  useEffect(() => {
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
              start: subtitle.start, // 1000,
              end: subtitle.end, // 1000,
              part: subtitle.part.slice(
                0,
                subtitle.part.length -
                  subtitle.part.split(' ')[subtitle.part.split(' ').length - 1]
                    .length,
              ),
            });
          });

          setSubtitles(result);
        });
      })
      .catch(err => {
        console.error(`error fetchin subtitles ${err}`);
      });
  }, [mediaTitle, mediaYear, hasSeeked, season, episode, isShow]);

  useEffect(() => {
    setText('');
  }, [hasSeeked]);

  useEffect(() => {
    // !!read carefully becuase this is where the magic happens!!
    // everytime the current time changes we do the following:
    // run a for loop for each subtitle in our subtitles array(that we set in line 45)
    // check if we have already ran past the end time for that subtitle
    // make a copy of the array and delete that subtitle from the copy if we have already past that subtitle
    // set the subtitles array to that new copy
    if (subtitles) {
      let videoTime = Math.floor(currentTime);

      for (let index = 0; index < subtitles.length; index++) {
        const subtitle = subtitles[index];
        if (videoTime >= subtitle.end) {
          let subtitlesCopy = subtitles;
          subtitlesCopy.shift();
          setSubtitles(subtitlesCopy);
        }
      }

      // now that the only subtitles remaniing are ones to be played; we take the first one and read its values
      if (subtitles[0]) {
        let currentSubtitleStart = subtitles[0].start;
        let currentSubtitleEnd = subtitles[0].end;
        let currentSubtitleText = subtitles[0].part;

        //if the current time equal or more than that subtitle's start time we display that subtitle
        if (videoTime >= currentSubtitleStart) {
          setText(currentSubtitleText);
        }

        // if the current time surpasses the subtitle's end time we revert the displayed text and remove that subtitle from the array
        // causing a change in subtitles array which reruns the entire useEffect
        if (videoTime >= currentSubtitleEnd) {
          setText('');

          let subtitlesCopy = subtitles;
          subtitlesCopy.shift();
          setSubtitles(subtitlesCopy);
        }
      }
    }
  }, [currentTime, subtitles]);

  return <Text style={textStyle}>{text}</Text>;
};

export default Subtitles;

//now on why i have to rerun the entire function everytime we seek:
//will as you just read in the syncing useEffect: i use a for loop to check which subtitle is yet to be played;
//deleting the ones that has been already played
//so if i were to rerun only that useEffect i would only be able to fast forward and not to rewind since past subtitles has been deleted
//now regarding if there is a way around this maybe maybe not but the code is still inefficient so i think it would be better to find another way altogether
//please feel free ask/suggest/request anything i am all ears.
