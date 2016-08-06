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

    gd._document._plotCSSLoaded = true;
};

// Determines if the plotly styles are present in the graph div's parent
// document. This is done by adding a tester div as a child of the graph
// div, checking to see if it gets styled, and deleting it.
function plotlyStylesAdded(gd) {
    var parentWindow = gd._document.defaultView;

    addStyleTester(gd);

    // Find a style tester, and see if it's been styled
    var testerDivs = gd.getElementsByClassName('plotly-css-tester');

    for(var i = 0; i < testerDivs.length; i++) {
        var testerDiv = testerDivs[i];

        var testerColor = parentWindow.getComputedStyle(testerDiv, null).getPropertyValue('color');
        var testerDisplay = parentWindow.getComputedStyle(testerDiv, null).getPropertyValue('display');

        if(testerColor !== 'rgb(11, 23, 13)' && testerDisplay !== 'none') {
            return finish(false); // Bail, unstyled div, must not have loaded the CSS
        }
    }

    return finish(true); // If we got this far, we fell through, tester divs are styled

    function finish(returnValue) {
        deleteStyleTesters(gd);
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
}

// Deletes any CSS tester divs that are children of the graph div
function deleteStyleTesters(gd) {
    var testerDivs = gd.getElementsByClassName('plotly-css-tester');

    // Loop and delete
    while(testerDivs[0]) {
        gd.removeChild(testerDivs[0]);
    }
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
