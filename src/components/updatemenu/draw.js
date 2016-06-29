/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/


'use strict';

var d3 = require('d3');

var Plotly = require('../../plotly');
var Plots = require('../../plots/plots');
var Lib = require('../../lib');
var Color = require('../color');
var Drawing = require('../drawing');
var svgTextUtils = require('../../lib/svg_text_utils');
var anchorUtils = require('../legend/anchor_utils');

var constants = require('./constants');


module.exports = function draw(gd) {
    var fullLayout = gd._fullLayout,
        opts = fullLayout.updatemenu;

    var updateMenu = fullLayout._infolayer.selectAll('g.' + constants.containerClassName)
        .data(opts.visible ? [0] : []);

    updateMenu.enter().append('g')
        .classed(constants.containerClassName, true);

    updateMenu.style({
        cursor: 'pointer',
        'pointer-events': 'visible'
    });

    updateMenu.exit().remove();

    if(!opts.visible) return;

    updateMenu
        .call(drawHeader, gd, opts)
        .call(drawButtons, gd, opts)
        .call(reposition, gd, opts);
};

/*
 * <g updatemenu />
 *   <g item header />
 *   <g item button />
 *   <g item button />
 *       ...
 */

function drawHeader(updateMenu, gd, opts) {
    var header = updateMenu.selectAll('g.' + constants.headerClassName)
        .data([0]);

    header.enter().append('g')
        .classed(constants.headerClassName, true)
        .classed(constants.itemClassName, true);

    // grab index of button corresponding to header
    var headerIndex = getHeaderIndex(updateMenu),
        headerOpts = opts.buttons[headerIndex];

    // header gets a few special addition in drawItem
    header._isHeader = true;
    header.call(drawItem, opts, headerOpts);

    header.on('click', function() {
        updateMenu.call(updateDropFold);
    });
}

function drawButtons(updateMenu, gd, opts) {
    var buttons = updateMenu.selectAll('g.' + constants.buttonClassName)
        .data(opts.buttons);

    buttons.enter().append('g')
        .classed(constants.buttonClassName, true)
        .classed(constants.itemClassName, true)
        .attr('visibility', 'hidden');

    buttons.exit().remove();

    buttons.each(function(buttonOpts) {
        var button = d3.select(this);

        button.on('click', function() {
            buttons.classed(constants.buttonActiveClassName, false);
            button.classed(constants.buttonActiveClassName, true);

            updateMenu
                .call(drawHeader, gd, opts)
                .call(updateDropFold)
                .call(styleButtons, opts);

            var args = buttonOpts.args;
            Plotly[buttonOpts.method](gd, args[0], args[1], args[2]);
        });

        button.on('mouseover', function() {
            button.call(styleHover);
        });

        button.on('mouseout', function() {
            button.call(drawItemRect, opts, buttonOpts);
            updateMenu.call(styleButtons, opts);
        });
    });

    updateMenu.call(styleButtons, opts);
}

function styleButtons(updateMenu, opts) {
    var buttons = updateMenu.selectAll('g.' + constants.buttonClassName),
        headerIndex = getHeaderIndex(updateMenu);

    buttons.each(function(buttonOpts, i) {
        var button = d3.select(this);

        button.call(drawItem, opts, buttonOpts);

        if(i === headerIndex) {
            button.select('rect.' + constants.itemRectClassName)
                .call(Color.fill, constants.activeColor);
        }
    });
}

function drawItem(item, contOpts, itemOpts) {
    item.call(drawItemRect, contOpts);
    item.call(drawItemText, contOpts, itemOpts);
}

function drawItemRect(item, contOpts) {
    var rect = item.selectAll('rect')
        .data([0]);

    rect.enter().append('rect')
        .classed(constants.itemRectClassName, true)
        .attr({
            rx: constants.rx,
            ry: constants.ry,
            'shape-rendering': 'crispEdges'
        });

    var borderWidth = contOpts.borderwidth;

    if(item._isHeader) borderWidth += 2;

    rect.call(Color.stroke, contOpts.bordercolor)
        .call(Color.fill, contOpts.bgcolor)
        .style('stroke-width', borderWidth + 'px');
}

function drawItemText(item, contOpts, itemOpts) {

    function textLayout(s) {
        svgTextUtils.convertToTspans(s);

        // convertToTspans sets visibility to 'visible',
        // here, we need it to respect the parent visibility.
        s.style('visibility', null);
    }

    var text = item.selectAll('text')
        .data([0]);

    text.enter().append('text')
        .classed(constants.itemTextClassName, true)
        .classed('user-select-none', true)
        .attr('text-anchor', 'middle');

    var label = itemOpts.label;

    if(item._isHeader) label += '  ▼';

    text.call(Drawing.font, contOpts.font)
        .text(label)
        .call(textLayout);
}

function updateDropFold(updateMenu) {
    var buttons = updateMenu.selectAll('g.' + constants.buttonClassName),
        oldVisibility = buttons.attr('visibility'),
        newVisibility;

    switch(oldVisibility) {
        case null:
            newVisibility = 'hidden';
            break;
        case 'hidden':
            newVisibility = 'visible';
            break;
        case 'visible':
            newVisibility = 'hidden';
            break;
    }

    buttons.attr('visibility', newVisibility);
}

function styleHover(button) {
    button.select('rect.' + constants.itemRectClassName)
        .call(Color.fill, constants.hoverColor);
}

function getHeaderIndex(updateMenu) {
    var buttons = updateMenu.selectAll('g.' + constants.buttonClassName);

    // the 'first render' case
    if(buttons.size() === 0) return 0;

    var headerIndex;
    buttons.each(function(_, i) {
        var button = d3.select(this);

        if(button.classed(constants.buttonActiveClassName)) {
            headerIndex = i;
            return;
        }
    });

    return headerIndex || 0;
}

function reposition(updateMenu, gd, opts) {
    opts.width = 0;
    opts.height = 0;

    var buttons = updateMenu.selectAll('g.' + constants.buttonClassName),
        items = updateMenu.selectAll('g.' + constants.itemClassName),
        borderWidth = opts.borderwidth;

    // consider only buttons to compute width
    buttons.each(function() {
        var button = d3.select(this),
            text = button.select('.' + constants.itemTextClassName);

        // width is given by max width of all buttons

        // Hmm. I think all buttons should of the same dimensions !!!

        var tWidth = text.node() && Drawing.bBox(text.node()).width,
            wEff = Math.max(tWidth + 40, 30);

//         console.log(tWidth)

        opts.width = Math.max(opts.width, wEff);
    });

//     console.log(opts.width)

    // set both header and button
    items.each(function() {
        var item = d3.select(this),
            isHeader = item.classed(constants.headerClassName),
            rect = item.select('.' + constants.itemRectClassName),
            text = item.select('.' + constants.itemTextClassName),
            tspans = text.selectAll('tspan');

        // height is determined by item

        var tHeight = opts.font.size * 1.3,
            tLines = tspans[0].length || 1,
            hEff = Math.max(tHeight * tLines, 16) + 3;

//         console.log(isHeader, hEff, opts.height)

        Lib.setTranslate(item, borderWidth, borderWidth + opts.height);

        rect.attr({
            x: 0,
            y: 0,
            width: opts.width,
            height: hEff
        });

        var textAttrs = {
            x: opts.width / 2,
            y: hEff / 2 - ((tLines - 1) * tHeight / 2) + 3
        };

        text.attr(textAttrs);
        tspans.attr(textAttrs);

        opts.height += hEff + (isHeader ? 10 : 2);
    });

    var graphSize = gd._fullLayout._size;
    opts.lx = graphSize.l + graphSize.w * opts.x;
    opts.ly = graphSize.t + graphSize.h * (1 - opts.y);

//     console.log(graphSize, opts.x, opts.y, opts.xanchor, opts.yanchor)

    var xanchor = 'left';
    if(anchorUtils.isRightAnchor(opts)) {
        opts.lx -= opts.width;
        xanchor = 'right';
    }
    if(anchorUtils.isCenterAnchor(opts)) {
        opts.lx -= opts.width / 2;
        xanchor = 'center';
    }

    var yanchor = 'top';
    if(anchorUtils.isBottomAnchor(opts)) {
        opts.ly -= opts.height;
        yanchor = 'bottom';
    }
    if(anchorUtils.isMiddleAnchor(opts)) {
        opts.ly -= opts.height / 2;
        yanchor = 'middle';
    }

    opts.width = Math.ceil(opts.width);
    opts.height = Math.ceil(opts.height);
    opts.lx = Math.round(opts.lx);
    opts.ly = Math.round(opts.ly);

//     console.log('lx/ly', opts.lx, opts.ly);

    Lib.setTranslate(updateMenu, opts.lx, opts.ly);

    Plots.autoMargin(gd, '-update-mneu', {
        x: opts.x,
        y: opts.y,
        l: opts.width * ({right: 1, center: 0.5}[xanchor] || 0),
        r: opts.width * ({left: 1, center: 0.5}[xanchor] || 0),
        b: opts.height * ({top: 1, middle: 0.5}[yanchor] || 0),
        t: opts.height * ({bottom: 1, middle: 0.5}[yanchor] || 0)
    });
}
