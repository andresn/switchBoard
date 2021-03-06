/*jslint white: true */
/*global module, String, require, console */

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
 * @fileoverview Unit test for loadMarkup.js
 */

exports.runCommandTest = {
  parseCommands : function(test) {
    'use strict';

    var runCommand   = require('../../../lib/runCommand'),
        controllers  = { samsung : { config     : { deviceId : 'TEST-deviceId',
                                                    title : 'TEST-title' },
                                     markup     : '<span>{{DEVICE_ID}} {{TEST_KEY}}</span>',
                                     controller : { inputs : ['command'],
                                                    keymap : ['VOLUP'],
                                                    send   : function(request) { return request; } } } },
        response     = { end : function(msg) {} },
        emptyCommand = runCommand.parseCommands('samsung', '', controllers, null, response),
        badCommand   = runCommand.parseCommands('samsung', 'VOLMUTE', controllers, null, response),
        goodCommand  = runCommand.parseCommands('samsung', 'VOLUP', controllers, null, response);

    test.equal(emptyCommand, '', 'Empty reply if there is no command issued');
    test.deepEqual(badCommand, { device : 'samsung', command : 'VOLMUTE', message : 'invalid' }, 'Bad command should be invalidated');
    test.deepEqual(goodCommand, { device : 'samsung', command : 'VOLUP', message : 'valid' }, 'Good command should be validated');

    test.done();
  },

  stripTypePrefix : function(test) {
    'use strict';

    var runCommand = require('../../../lib/runCommand'),
        text       = runCommand.stripTypePrefix('text-TEST', 'text'),
        launch     = runCommand.stripTypePrefix('launch-TEST', 'launch'),
        list       = runCommand.stripTypePrefix('list', 'list'),
        command    = runCommand.stripTypePrefix('TEST', 'command');

    test.equal(text, 'TEST', 'Text should be returned without prefix');
    test.equal(launch, 'TEST', 'Launch should be returned without prefix');
    test.equal(list, '', 'List should return empty, as it acts as a flag, not a value');
    test.equal(command, 'TEST', 'Commands should be returned without change');

    test.done();
  },

  getCommandType : function(test) {
    'use strict';

    var runCommand = require('../../../lib/runCommand'),
        text       = runCommand.getCommandType(null, 'text-TEST'),
        launch     = runCommand.getCommandType(null, 'launch-TEST'),
        list       = runCommand.getCommandType(null, 'list'),
        command    = runCommand.getCommandType(null, 'TEST');

    test.equal(text, 'text', 'Should return text');
    test.equal(launch, 'launch', 'Should return launch');
    test.equal(list, 'list', 'Should return list');
    test.equal(command, 'command', 'Should return command');

    test.done();
  },

  validateCommand : function(test) {
    'use strict';

    var runCommand     = require('../../../lib/runCommand'),
        controllers    = { samsung : { config     : { deviceId : 'TEST-deviceId',
                                                      title : 'TEST-title' },
                                       markup     : '<span>{{DEVICE_ID}} {{TEST_KEY}}</span>',
                                       controller : { inputs : ['command', 'text'],
                                                      keymap : ['VOLUP'],
                                                      send   : function(request) { return request; } } } },
        validCommand   = runCommand.validateCommand('samsung', 'VOLUP', controllers),
        validtext      = runCommand.validateCommand('samsung', 'text-TEST', controllers),
        invalidLaunch  = runCommand.validateCommand('samsung', 'launch-TEST', controllers),
        invalidList    = runCommand.validateCommand('samsung', 'launch', controllers),
        invalidCommand = runCommand.validateCommand('samsung', 'TEST', controllers);

    test.ok(validCommand, 'Good command should be validated');
    test.ok(validtext, 'Text should be validated');
    test.ok(!invalidLaunch, 'This device is not configured to support launch shortcuts');
    test.ok(!invalidList, 'This device is not configured to support list shortcuts');
    test.ok(!invalidCommand, 'Bad command should be invalidated');

    test.done();
  },

  runCommand : function(test) {
    'use strict';

    var runCommand     = require('../../../lib/runCommand'),
        controllers    = { samsung : { config     : { deviceId : 'TEST-deviceId',
                                                      title : 'TEST-title' },
                                       markup     : '<span>{{DEVICE_ID}} {{TEST_KEY}}</span>',
                                       controller : { inputs : ['command', 'text'],
                                                      keymap : ['VOLUP'],
                                                      send   : function(request) { return request; } } } },
        response       = { end : function(msg) { return msg; } },
        validCommand   = runCommand.runCommand('samsung', 'VOLUP', controllers, null, response),
        invalidCommand = runCommand.runCommand('samsung', 'TEST', controllers, null, response);

    test.deepEqual(validCommand, { device: 'samsung', command: 'VOLUP', message: 'valid' }, 'Good command should be validated');
    test.deepEqual(invalidCommand, { device: 'samsung', command: 'TEST', message: 'invalid' }, 'Bad command should be invalidated');

    test.done();
  }
};