/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var fontAttrs = require('../../plots/font_attributes');
var colorAttrs = require('../color/attributes');
var extendFlat = require('../../lib/extend').extendFlat;

var buttonsAttrs = {
    _isLinkedToArray: true,

    method: {
        valType: 'enumerated',
        values: ['restyle', 'relayout', 'filter'],
        dflt: 'restyle',
        role: 'info',
        description: ''
    },
    args: {
        valType: 'info_array',
        role: 'info',
        items: [
            { valType: 'any' },
            { valType: 'any' },
            { valType: 'any' }
        ]
    },

    label: {
        valType: 'string',
        role: 'info',
        description: 'Sets the text label to appear on the button.'
    }
};

module.exports = {
    visible: {
        valType: 'boolean',
        role: 'info',
        description: [
            'Determines whether or not the update menu is visible.'
        ].join(' ')
    },

    buttons: buttonsAttrs,

    x: {
        valType: 'number',
        min: -2,
        max: 3,
        role: 'style',
        description: 'Sets the x position (in normalized coordinates) of the update menu.'
    },
    xanchor: {
        valType: 'enumerated',
        values: ['auto', 'left', 'center', 'right'],
        dflt: 'left',
        role: 'info',
        description: [
            'Sets the update menu\'s horizontal position anchor.',
            'This anchor binds the `x` position to the *left*, *center*',
            'or *right* of the range selector.'
        ].join(' ')
    },
    y: {
        valType: 'number',
        min: -2,
        max: 3,
        role: 'style',
        description: 'Sets the y position (in normalized coordinates) of the update memu.'
    },
    yanchor: {
        valType: 'enumerated',
        values: ['auto', 'top', 'middle', 'bottom'],
        dflt: 'bottom',
        role: 'info',
        description: [
            'Sets the update menu\'s vertical position anchor',
            'This anchor binds the `y` position to the *top*, *middle*',
            'or *bottom* of the range selector.'
        ].join(' ')
    },

    font: extendFlat({}, fontAttrs, {
        description: 'Sets the font of the update menu button text.'
    }),

    bgcolor: {
        valType: 'color',
        dflt: colorAttrs.lightLine,
        role: 'style',
        description: 'Sets the background color of the update menu buttons.'
    },
    bordercolor: {
        valType: 'color',
        dflt: colorAttrs.defaultLine,
        role: 'style',
        description: 'Sets the color of the border enclosing the update menu.'
    },
    borderwidth: {
        valType: 'number',
        min: 0,
        dflt: 0,
        role: 'style',
        description: 'Sets the width (in px) of the border enclosing the update menu.'
    }
};
