/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/


'use strict';

var loggers = require('./loggers');
var plotcss = require('../../build/plotcss');

// Inject styling information into the document containing the graph div
exports.injectStyles = function injectStyles(gd) {

    // If the graph div has already been styled, bail
    if(plotlyStylesAdded(gd)) return;

    var targetStyleSheet = null;

    if(gd._document.getElementsByTagName('style').length === 0) {
        var style = gd._document.createElement('style');

        // WebKit hack :(
        style.appendChild(gd._document.createTextNode(''));
        gd._document.head.appendChild(style);
        targetStyleSheet = style.sheet;
    }
    else {
        // Just grab the first style element to append to
        targetStyleSheet = gd._document.getElementsByTagName('style')[0].sheet;
    }

    for(var selector in plotcss) {
        var fullSelector = exports.buildFullSelector(selector);

        if(targetStyleSheet.insertRule) {
            targetStyleSheet.insertRule(fullSelector + '{' + plotcss[selector] + '}', 0);
        }
        else if(targetStyleSheet.addRule) {
            targetStyleSheet.addRule(fullSelector, plotcss[selector], 0);
        }
        else loggers.warn('injectStyles failed');
    }
};

// Determines if the plotly styles are present in the graph div's parent
// document. This is done by adding a tester div as a child of the graph
// div, checking to see if it gets styled, and deleting it.
function plotlyStylesAdded(gd) {
    var parentWindow = gd._document.defaultView;

    var testerDiv = addStyleTester(gd);

    // See if the style tester has been styled
    var testerColor = parentWindow.getComputedStyle(testerDiv, null).getPropertyValue('color');
    var testerDisplay = parentWindow.getComputedStyle(testerDiv, null).getPropertyValue('display');

    if(testerColor !== 'rgb(11, 23, 13)' && testerDisplay !== 'none') {
        return finish(false); // Unstyled div, must not have loaded the CSS
    }
    else {
        return finish(true); // Tester div is styled
    }

    function finish(returnValue) {
        gd.removeChild(testerDiv); // Delete the tester div
        return returnValue;
    }
}

// Adds a hidden div to the graph div that we can use to see if plotly
// CSS has been loaded
function addStyleTester(gd) {
    var testerDiv = gd._document.createElement('div');

    // Add our tester class
    testerDiv.className = 'plotly-css-tester';

    // Append our tester
    gd.appendChild(testerDiv);

    return testerDiv;
}

// expands a plotcss selector
exports.buildFullSelector = function buildFullSelector(selector) {
    var fullSelector = selector.replace(/,/, ', ')
        .replace(/:after/g, '::after')
        .replace(/:before/g, '::before')
        .replace(/X/g, '.js-plotly-plot .plotly')
        .replace(/Y/g, '.plotly-notifier');

    return fullSelector;
};
