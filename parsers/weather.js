/*jslint white: true */
/*global module, console */

/**
 * Copyright (c) 2014 brian@bevey.org
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

(function(exports){
  'use strict';

  exports.weather = function (deviceId, markup, state, value, fragments) {
    var template   = fragments.forecast,
        i          = 0,
        className  = '',
        tempMarkup = '',
        translateCode;

    // https://developer.yahoo.com/weather/#codes
    translateCode = function(code) {
      var icon = '';

      code = parseInt(code, 10);

      if(code <= 2) {
        icon = 'warning';
      }

      else if(code <= 4) {
        icon = 'bolt';
      }

      else if(code <= 8) {
        icon = 'asterik';
      }

      else if(code <= 12) {
        icon = 'umbrella';
      }

      else if(code <= 18) {
        icon = 'asterik';
      }

      else if(code <= 22) {
        icon = 'fire';
      }

      else if(code <= 24) {
        icon = 'flag';
      }

      else if(code === 25 ||
              code === 35) {
        icon = 'asterik';
      }

      else if(code <= 30) {
        icon = 'cloud';
      }

      else if(code === 31 ||
              code === 33) {
        icon = 'moon-o';
      }

      else if(code === 32 ||
              code === 34 ||
              code === 36) {
        icon = 'sun-o';
      }

      else if(code <= 39) {
        icon = 'bolt';
      }

      else if(code === 40) {
        icon = 'umbrella';
      }

      else if(code <= 43) {
        icon = 'asterik';
      }

      else if(code === 44) {
        icon = 'cloud';
      }

      else if(code === 45) {
        icon = 'bolt';
      }

      else if(code === 46) {
        icon = 'asterik';
      }

      else if(code === 47) {
        icon = 'bolt';
      }

      else {
        icon = 'question';
      }

      return icon;
    };

    if(state === 'ok') {
      className = ' device-on';
    }

    else if(state === 'err') {
      className = ' device-off';
    }

    if(value) {
      markup = markup.replace('{{DEVICE_STATE}}', className);
      markup = markup.replace('{{WEATHER_CURRENT}}', '<span class="fa fa-' + translateCode(value.code) + '"></span> ' + value.city + ' Current Weather: ' + value.temp + '&deg; ' + value.text);

      for(i in value.forecast) {
        tempMarkup = tempMarkup + template.split('{{WEATHER_ICON}}').join('<span class="fa fa-' + translateCode(value.forecast[i].code) + '"></span>');
        tempMarkup = tempMarkup.split('{{WEATHER_DAY}}').join(value.forecast[i].day + ':');
        tempMarkup = tempMarkup.split('{{WEATHER_TEXT}}').join(value.forecast[i].text);
        tempMarkup = tempMarkup.split('{{WEATHER_HIGH}}').join(value.forecast[i].high + '&deg;');
        tempMarkup = tempMarkup.split('{{WEATHER_LOW}}').join(value.forecast[i].low + '&deg;');
      }
    }

    return markup.replace('{{WEATHER_FORECAST}}', tempMarkup);
  };
})(typeof exports === 'undefined' ? this.Switchboard.parsers : exports);
