/*jslint white: true */
/*global State, module, require, console */

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

module.exports = (function () {
  'use strict';

  /**
   * @author brian@bevey.org
   * @fileoverview Basic control of Panasonic Smart TV
   * @requires http
   * @note This is a full-scale rip-off of the fine work done here:
   *       http://cocoontech.com/forums/topic/21266-panasonic-viera-plasma-ip-control/page-2
   */
  return {
    version : 20140720,

    inputs  : ['command', 'text'],

    /**
     * Whitelist of available key codes to use.
     */
    keymap  : ['30S_SKIP', '3D', 'BD', 'BLUE', 'CANCEL', 'CC', 'CHG_INPUT', 'CHG_NETWORK', 'CH_DOWN', 'CH_UP', 'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'DATA', 'DIGA_CTL', 'DISP_MODE', 'DMS_CH_DOWN', 'DMS_CH_UP', 'DOWN', 'DRIVE', 'ECO', 'ENTER', 'EPG', 'EZ_SYNC', 'FAVORITE', 'FF', 'GAME', 'GREEN', 'HOLD', 'INDEX', 'INFO', 'INTERNET', 'LEFT', 'MENU', 'MPX', 'MUTE', 'OFFTIMER', 'PAUSE', 'PICTAI', 'PLAY', 'POWER', 'PROG', 'P_NR', 'REC', 'RECLIST', 'RED', 'RETURN', 'REW', 'RIGHT', 'R_SCREEN', 'R_TUNE', 'R_TUNE', 'SAP', 'SD_CARD', 'SKIP_NEXT', 'SKIP_PREV', 'SPLIT', 'STOP', 'STTL', 'SUBMENU', 'SWAP', 'TEXT', 'TV', 'TV_MUTE_OFF', 'TV_MUTE_ON', 'UP', 'VIERA_LINK', 'VOD', 'VOLDOWN', 'VOLUP', 'VTOOLS', 'YELLOW'],

    /**
     * Prepare a POST request for a command.
     */
    postPrepare : function (panasonic) {
      var path    = '/',
          method  = 'POST';

      if(panasonic.command || panasonic.text) {
        path += 'nrc/control_0';
      }

      else {
        path += 'dmr/control_0';
      }

      return {
        host    : panasonic.deviceIp,
        port    : panasonic.devicePort,
        path    : path,
        method  : method,
        headers : { 'content-type'  : 'text/xml',
                    'accept'        : 'text/xml',
                    'cache-control' : 'no-cache',
                    'pragma'        : 'no-cache',
                    'soapaction'    : '"urn:panasonic-com:service:p00NetworkControl:1#X_SendKey"' }
      };
    },

    /**
     * Prepare a POST data the request.
     */
    postData : function (panasonic) {
      var response = '',
          action   = 'X_SendKey',
          urn      = 'panasonic-com:service:p00NetworkControl:1',
          value    = '<X_KeyEvent>NRC_' + panasonic.command + '-ONOFF</X_KeyEvent>';

      if(panasonic.text) {
        action = 'X_SendString';
        urn    = 'panasonic-com:service:p00NetworkControl:1';
        value  = '<X_String>' + panasonic.text + '</X_String>';
      }

      response += '<?xml version="1.0" encoding="utf-8"?>';
      response += '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
      response += '<s:Body>';
      response += '  <u:' + action + ' xmlns:u="urn:' + urn + '">';
      response += '    ' + value;
      response += '  </u:' + action + '>';
      response += '</s:Body>';
      response += '</s:Envelope>';

      return response;
    },

    state : function (controller, callback, config) {
      var panasonic = { device : {}};

      panasonic.device.deviceId = controller.config.deviceId;
      panasonic.device.deviceIp = controller.config.deviceIp;

      panasonic.callback = function (err, reply) {
        var message = '';

        if(reply) {
          callback(panasonic.device.deviceId, null, 'ok');
        }

        else if(err) {
          callback(panasonic.device.deviceId, 'err');
        }
      };

      this.send(panasonic);
    },

    send : function (config) {
      var http             = require('http'),
          panasonic        = {},
          dataReply        = '',
          request;

      panasonic.deviceIp   = config.device.deviceIp;
      panasonic.command    = config.command    || '';
      panasonic.text       = config.text       || '';
      panasonic.devicePort = config.devicePort || 55000;
      panasonic.callback   = config.callback   || function () {};

      request = http.request(this.postPrepare(panasonic), function(response) {
                  console.log('\x1b[32mPanasonic\x1b[0m: Connected');

                  response.on('data', function(response) {
                    dataReply += response;
                  });

                  response.once('end', function() {
                    panasonic.callback(null, dataReply);
                  });
                });


      request.once('error', function(error) {
        var errorMsg = '';

        if(error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
          errorMsg = '\x1b[31mPanasonic\x1b[0m: Device is off or unreachable';
        }

        else {
          errorMsg = '\x1b[31mPanasonic\x1b[0m: ' + error.code;
        }

        console.log(errorMsg);

        panasonic.callback(errorMsg);
      });

      request.write(this.postData(panasonic));
      request.end();

      return dataReply;
    }
  };
}());
