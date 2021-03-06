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

/**
 * @author brian@bevey.org
 * @fileoverview Simple script to fire on interval.
 */

module.exports = (function () {
  'use strict';

  return {
    version : 20140418,

    fire : function(controllers, type) {
      var runCommand = require(__dirname + '/../lib/runCommand'),
          deviceId,
          callback;

      callback = function(deviceId, err, reply, params) {
        var deviceState = require('../lib/deviceState'),
            message     = 'err';

        params = params || {};

        if(reply) {
          message = 'ok';
        }

        params.state = message;

        deviceState.updateState(deviceId, controllers[deviceId].config.typeClass, params);
      };

      for(deviceId in controllers) {
        if(deviceId !== 'config') {
          switch(controllers[deviceId].config.typeClass) {
            // Specify typeClass of controllers that should be fired on interval.
            case 'weather'     :
            case 'stocks'      :
            case 'smartthings' :
            case 'nest'        :
              if(type === 'long') {
                if(typeof controllers[deviceId].event === 'object') {
                  controllers[deviceId].event.poll(deviceId, 'schedule', controllers);
                }
              }
            break;

            default :
              if(type === 'short') {
                if((typeof controllers[deviceId].controller === 'object') && (typeof controllers[deviceId].controller.state === 'function')) {
                  controllers[deviceId].controller.state(controllers[deviceId], callback, controllers.config);
                }
              }
            break;
          }
        }
      }

      return true;
    }
  };
}());
