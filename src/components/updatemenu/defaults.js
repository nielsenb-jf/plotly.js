/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var Lib = require('../../lib');

var attributes = require('./attributes');
var buttonAttrs = attributes.buttons;


module.exports = function updateMenuDefaults(layoutIn, layoutOut) {
    var contIn = layoutIn.updatemenu || {},
        contOut = layoutOut.updatemenu = {};

    function coerce(attr, dflt) {
        return Lib.coerce(contIn, contOut, attributes, attr, dflt);
    }

    var buttons = buttonsDefaults(contIn, contOut);

    var visible = coerce('visible', buttons.length > 0);
    if(!visible) return;

    coerce('x', 0);
    coerce('y', 1);
    Lib.noneOrAll(contIn, contOut, ['x', 'y']);

    coerce('xanchor');
    coerce('yanchor');

    Lib.coerceFont(coerce, 'font', layoutOut.font);

    coerce('bgcolor');
    coerce('bordercolor');
    coerce('borderwidth');
};

function buttonsDefaults(contIn, contOut) {
    var buttonsIn = contIn.buttons || [],
        buttonsOut = contOut.buttons = [];

    var buttonIn, buttonOut;

    function coerce(attr, dflt) {
        return Lib.coerce(buttonIn, buttonOut, buttonAttrs, attr, dflt);
    }

    for(var i = 0; i < buttonsIn.length; i++) {
        buttonIn = buttonsIn[i];
        buttonOut = {};

        coerce('method');
        coerce('args');
        coerce('label');

        buttonsOut.push(buttonOut);
    }

    return buttonsOut;
}
