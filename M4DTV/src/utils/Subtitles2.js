import {useState, useEffect} from 'react';
import vttToJson from 'vtt-to-json';
import {getSubtitles} from './Requests';

const Subtitles = ({mediaTitle, mediaYear, season, episode, isShow}) => {
  const convertMsToTime = milliseconds => {
    //converts millieseconds to hh:mm:ss,SSS
    const padTo2Digits = num => {
      return num.toString().padStart(2, '0');
    };
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    milliseconds = milliseconds % 1000;
    seconds = seconds % 60;
    minutes = minutes % 60;

    return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(
      seconds,
    )},${padTo2Digits(milliseconds)}`;
  };
  useEffect(() => {
    let result = [];

    getSubtitles(mediaTitle, mediaYear, season, episode, isShow).then(
      response => {
        const openedSubtitle = response.data;

        //conversion:
        vttToJson(openedSubtitle).then(parsedSubtitle => {
          //mapping
          parsedSubtitle.map(subtitle => {
            // For some reason this library adds the index of the subtitle at the end of the part, so we cut it

            result.push({
              startTime: convertMsToTime(subtitle.start),
              endTime: convertMsToTime(subtitle.end),
              text: subtitle.part.slice(
                0,
                subtitle.part.length -
                  subtitle.part.split(' ')[subtitle.part.split(' ').length - 1]
                    .length,
              ),
            });
          });
        });
      },
    );
    console.log(result);
    return result;
  }, [episode, isShow, mediaTitle, mediaYear, season]);
};
export default Subtitles;
