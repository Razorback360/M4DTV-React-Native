import React, {useEffect, useState} from 'react';
import {Text, StyleSheet} from 'react-native';
import axios from 'axios';
import {M4D_API_URL} from '../../Secrets';
import vttToJson from 'vtt-to-json';
import {getSubtitles} from '../utils/Requests';

const Subtitles = ({currentTime, selectedSubtitle}) => {
  const [subtitles, setSubtitles] = useState(null);
  const [text, setText] = useState('');

  //const selectedSubtitle =
  // 'https://movies4discord.xyz/api/subtitles?t=movie&&q=The Lost City&language=en&year=2022';
  //console.log(selectedSubtitle);

  useEffect(() => {
    //get the srt file converters and maps it to array "result" then setSubtitle to aforementioned "results"
    // rerun function each time the subtitles change or when seeked
    axios
      .get(selectedSubtitle)
      .then(response => {
        const openedSubtitle = response.data;

        //console.log(openedSubtitle);
        vttToJson(openedSubtitle).then(parsedSubtitle => {
          let result = [];

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
          //console.log(result);
        });
      })
      .catch(err => {
        console.error(`error fetchin subtitles ${err}`);
      });
  }); //[selectedSubtitle];
  //})[(selectedSubtitle, hasSeeked)];

  useEffect(() => {
    // !!read carefully becuase this is where the magic happens!!
    // everytime the current time changes we do the following:
    // run a for loop for each subtitle in our subtitles array(check line 39)
    // check if the end time for that subtitle has already been past
    // make a copy of the array and delete the subtitle from the copy if that subtitle has already been past
    if (subtitles) {
      let videoTime = Math.floor(currentTime);
      console.log(videoTime);

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
        //console.log(videoTime);
        //if the current time equal or more the the subtitle's start time we display that subtitle
        if (videoTime >= currentSubtitleStart) {
          setText(currentSubtitleText);
          //console.log(currentSubtitleText,currentSubtitleStart,currentSubtitleEnd,);
        }

        // if the current time surprasses the subtitle's end time we revert the display and remove that subtitle from the array
        // causing a change in subtitles array which reruns the entire function
        if (videoTime >= currentSubtitleEnd) {
          setText('');

          let subtitlesCopy = subtitles;
          subtitlesCopy.shift();
          setSubtitles(subtitlesCopy);
        }
      }
    }
  }, [currentTime, subtitles]);

  //useEffect(() => {
  //  setText('');
  //}, [hasSeeked]);

  const styles = StyleSheet.create({
    subtitlesTextStyle: {
      textAlign: 'center',
      color: 'white',
      fontSize: 30,
      padding: 5,
      textShadowColor: '#000000',
      textShadowOffset: {width: 1, height: 1},
      textShadowRadius: 5,
    },
  });

  //console.log(text);

  return <Text style={styles.subtitlesTextStyle}>{text}</Text>;
};

export default Subtitles;
