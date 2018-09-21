// Last time updated: 2018-09-21 3:49:33 AM UTC

// _______________
// Canvas-Designer

// https://github.com/muaz-khan/Canvas-Designer

'use strict';

(function() {

    var is = {
        isLine: false,
        isArrow: false,
        isArc: false,
        isDragLastPath: false,
        isDragAllPaths: false,
        isRectangle: false,
        isQuadraticCurve: false,
        isBezierCurve: false,
        isPencil: false,
        isMarker: true,
        isEraser: false,
        isText: false,
        isImage: false,
        isPdf: false,

        set: function(shape) {
            var cache = this;

            cache.isLine = cache.isArrow = cache.isArc = cache.isDragLastPath = cache.isDragAllPaths = cache.isRectangle = cache.isQuadraticCurve = cache.isBezierCurve = cache.isPencil = cache.isMarker = cache.isEraser = cache.isText = cache.isImage = cache.isPdf = false;
            cache['is' + shape] = true;
        }
    };

    function addEvent(element, eventType, callback) {
        if (eventType.split(' ').length > 1) {
            var events = eventType.split(' ');
            for (var i = 0; i < events.length; i++) {
                addEvent(element, events[i], callback);
            }
            return;
        }

        if (element.addEventListener) {
            element.addEventListener(eventType, callback, !1);
            return true;
        } else if (element.attachEvent) {
            return element.attachEvent('on' + eventType, callback);
        } else {
            element['on' + eventType] = callback;
        }
        return this;
    }

    function find(selector) {
        return document.getElementById(selector);
    }

    var points = [],
        textarea = find('code-text'),
        lineWidth = 2,
        strokeStyle = '#6c96c8',
        fillStyle = 'rgba(0,0,0,0)',
        globalAlpha = 1,
        globalCompositeOperation = 'source-over',
        lineCap = 'round',
        font = '15px "Arial"',
        lineJoin = 'round';

    function getContext(id) {
        var canv = find(id),
            ctx = canv.getContext('2d');

        canv.setAttribute('width', innerWidth);
        canv.setAttribute('height', innerHeight);

        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.fillStyle = fillStyle;
        ctx.font = font;

        return ctx;
    }

    var context = getContext('main-canvas'),
        tempContext = getContext('temp-canvas');

    var common = {
        updateTextArea: function() {
            var c = common,
                toFixed = c.toFixed,
                getPoint = c.getPoint,

                isAbsolutePoints = find('is-absolute-points').checked,
                isShortenCode = find('is-shorten-code').checked;

            if (isAbsolutePoints && isShortenCode) c.absoluteShortened();
            if (isAbsolutePoints && !isShortenCode) c.absoluteNOTShortened(toFixed);
            if (!isAbsolutePoints && isShortenCode) c.relativeShortened(toFixed, getPoint);
            if (!isAbsolutePoints && !isShortenCode) c.relativeNOTShortened(toFixed, getPoint);
        },
        toFixed: function(input) {
            return Number(input).toFixed(1);
        },
        getPoint: function(pointToCompare, compareWith, prefix) {
            if (pointToCompare > compareWith) pointToCompare = prefix + ' + ' + (pointToCompare - compareWith);
            else if (pointToCompare < compareWith) pointToCompare = prefix + ' - ' + (compareWith - pointToCompare);
            else pointToCompare = prefix;

            return pointToCompare;
        },
        absoluteShortened: function() {
            var output = '',
                length = points.length,
                i = 0,
                point;
            for (i; i < length; i++) {
                point = points[i];
                output += this.shortenHelper(point[0], point[1], point[2]);
            }

            output = output.substr(0, output.length - 2);
            textarea.value = 'var points = [' + output + '], length = points.length, point, p, i = 0;\n\n' + drawArrow.toString() + '\n\n' + this.forLoop;

            this.prevProps = null;
        },
        absoluteNOTShortened: function(toFixed) {
            var tempArray = [],
                i, point, p;

            for (i = 0; i < points.length; i++) {
                p = points[i];
                point = p[1];

                if (p[0] === 'pencil') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'marker') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'eraser') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'line') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'text') {
                    tempArray[i] = [this.strokeOrFill(p[2]) + '\ncontext.fillText(' + point[0] + ', ' + point[1] + ', ' + point[2] + ');'];
                }

                if (p[0] === 'arrow') {
                    tempArray[i] = ['drawArrow(' + point[0] + ', ' + point[1] + ', ' + point[2] + ', ' + point[3] + ', \'' + p[2].join('\',\'') + '\');'];
                }

                if (p[0] === 'arc') {
                    tempArray[i] = ['context.beginPath(); \n' + 'context.arc(' + toFixed(point[0]) + ',' + toFixed(point[1]) + ',' + toFixed(point[2]) + ',' + toFixed(point[3]) + ', 0,' + point[4] + '); \n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'rect') {
                    tempArray[i] = [this.strokeOrFill(p[2]) + '\n' + 'context.strokeRect(' + point[0] + ', ' + point[1] + ',' + point[2] + ',' + point[3] + ');\n' + 'context.fillRect(' + point[0] + ', ' + point[1] + ',' + point[2] + ',' + point[3] + ');'];
                }

                if (p[0] === 'quadratic') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.quadraticCurveTo(' + point[2] + ', ' + point[3] + ', ' + point[4] + ', ' + point[5] + ');\n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'bezier') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.bezierCurveTo(' + point[2] + ', ' + point[3] + ', ' + point[4] + ', ' + point[5] + ', ' + point[6] + ', ' + point[7] + ');\n' + this.strokeOrFill(p[2])];
                }

            }
            textarea.value = tempArray.join('\n\n') + this.strokeFillText + '\n\n' + drawArrow.toString();

            this.prevProps = null;
        },
        relativeShortened: function(toFixed, getPoint) {
            var i = 0,
                point, p, length = points.length,
                output = '',
                x = 0,
                y = 0;

            for (i; i < length; i++) {
                p = points[i];
                point = p[1];

                if (i === 0) {
                    x = point[0];
                    y = point[1];
                }

                if (p[0] === 'text') {
                    x = point[1];
                    y = point[2];
                }

                if (p[0] === 'pencil') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'marker') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'eraser') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'line') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'arrow') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'text') {
                    output += this.shortenHelper(p[0], [
                        point[0],
                        getPoint(point[1], x, 'x'),
                        getPoint(point[2], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'arc') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        point[2],
                        point[3],
                        point[4]
                    ], p[2]);
                }

                if (p[0] === 'rect') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'quadratic') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y'),
                        getPoint(point[4], x, 'x'),
                        getPoint(point[5], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'bezier') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y'),
                        getPoint(point[4], x, 'x'),
                        getPoint(point[5], y, 'y'),
                        getPoint(point[6], x, 'x'),
                        getPoint(point[7], y, 'y')
                    ], p[2]);
                }
            }

            output = output.substr(0, output.length - 2);
            textarea.value = 'var x = ' + x + ', y = ' + y + ', points = [' + output + '], length = points.length, point, p, i = 0;\n\n' + drawArrow.toString() + '\n\n' + this.forLoop;

            this.prevProps = null;
        },
        relativeNOTShortened: function(toFixed, getPoint) {
            var i, point, p, length = points.length,
                output = '',
                x = 0,
                y = 0;

            for (i = 0; i < length; i++) {
                p = points[i];
                point = p[1];

                if (i === 0) {
                    x = point[0];
                    y = point[1];

                    if (p[0] === 'text') {
                        x = point[1];
                        y = point[2];
                    }

                    output = 'var x = ' + x + ', y = ' + y + ';\n\n';
                }

                if (p[0] === 'arc') {
                    output += 'context.beginPath();\n' + 'context.arc(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + point[2] + ', ' + point[3] + ', 0, ' + point[4] + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (p[0] === 'pencil') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (p[0] === 'marker') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (p[0] === 'eraser') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (p[0] === 'line') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (p[0] === 'arrow') {
                    output += 'drawArrow(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ', \'' + p[2].join('\',\'') + '\');\n';
                }

                if (p[0] === 'text') {
                    output += this.strokeOrFill(p[2]) + '\n' + 'context.fillText(' + point[0] + ', ' + getPoint(point[1], x, 'x') + ', ' + getPoint(point[2], y, 'y') + ');';
                }

                if (p[0] === 'rect') {
                    output += this.strokeOrFill(p[2]) + '\n' + 'context.strokeRect(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n' + 'context.fillRect(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');';
                }

                if (p[0] === 'quadratic') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.quadraticCurveTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ', ' + getPoint(point[4], x, 'x') + ', ' + getPoint(point[5], y, 'y') + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (p[0] === 'bezier') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.bezierCurveTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ', ' + getPoint(point[4], x, 'x') + ', ' + getPoint(point[5], y, 'y') + ', ' + getPoint(point[6], x, 'x') + ', ' + getPoint(point[7], y, 'y') + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (i !== length - 1) output += '\n\n';
            }
            textarea.value = output + this.strokeFillText + '\n\n' + drawArrow.toString();

            this.prevProps = null;
        },
        forLoop: 'for(i; i < length; i++) {\n' + '    p = points[i];\n' + '    point = p[1];\n' + '    context.beginPath();\n\n'

            // globals
            +
            '    if(p[2]) { \n' + '\tcontext.lineWidth = p[2][0];\n' + '\tcontext.strokeStyle = p[2][1];\n' + '\tcontext.fillStyle = p[2][2];\n'

            +
            '\tcontext.globalAlpha = p[2][3];\n' + '\tcontext.globalCompositeOperation = p[2][4];\n' + '\tcontext.lineCap = p[2][5];\n' + '\tcontext.lineJoin = p[2][6];\n' + '\tcontext.font = p[2][7];\n' + '    }\n\n'

            // line

            +
            '    if(p[0] === "line") { \n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.lineTo(point[2], point[3]);\n' + '    }\n\n'

            // arrow

            +
            '    if(p[0] === "arrow") { \n' + '\tdrawArrow(point[0], point[1], point[2], point[3], p[2]);\n' + '    }\n\n'

            // pencil

            +
            '    if(p[0] === "pencil") { \n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.lineTo(point[2], point[3]);\n' + '    }\n\n'

            // marker

            +
            '    if(p[0] === "marker") { \n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.lineTo(point[2], point[3]);\n' + '    }\n\n'


            // text

            +
            '    if(p[0] === "text") { \n' + '\tcontext.fillText(point[0], point[1], point[2]);\n' + '    }\n\n'

            // eraser

            +
            '    if(p[0] === "eraser") { \n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.lineTo(point[2], point[3]);\n' + '    }\n\n'

            // arc

            +
            '    if(p[0] === "arc") context.arc(point[0], point[1], point[2], point[3], 0, point[4]); \n\n'

            // rect

            +
            '    if(p[0] === "rect") {\n' + '\tcontext.strokeRect(point[0], point[1], point[2], point[3]);\n' + '\tcontext.fillRect(point[0], point[1], point[2], point[3]);\n'

            +
            '    }\n\n'

            // quadratic

            +
            '    if(p[0] === "quadratic") {\n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.quadraticCurveTo(point[2], point[3], point[4], point[5]);\n' + '    }\n\n'

            // bezier

            +
            '    if(p[0] === "bezier") {\n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.bezierCurveTo(point[2], point[3], point[4], point[5], point[6], point[7]);\n' + '    }\n\n'

            // end-fill

            +
            '    context.stroke();\n' + '    context.fill();\n'

            +
            '}',

        strokeFillText: '\n\nfunction strokeOrFill(lineWidth, strokeStyle, fillStyle, globalAlpha, globalCompositeOperation, lineCap, lineJoin, font) { \n' + '    if(lineWidth) { \n' + '\tcontext.globalAlpha = globalAlpha;\n' + '\tcontext.globalCompositeOperation = globalCompositeOperation;\n' + '\tcontext.lineCap = lineCap;\n' + '\tcontext.lineJoin = lineJoin;\n'

            +
            '\tcontext.lineWidth = lineWidth;\n' + '\tcontext.strokeStyle = strokeStyle;\n' + '\tcontext.fillStyle = fillStyle;\n' + '\tcontext.font = font;\n' + '    } \n\n'

            +
            '    context.stroke();\n' + '    context.fill();\n'

            +
            '}',
        strokeOrFill: function(p) {
            if (!this.prevProps || this.prevProps !== p.join(',')) {
                this.prevProps = p.join(',');

                return 'strokeOrFill(\'' + p.join('\', \'') + '\');';
            }

            return 'strokeOrFill();';
        },
        prevProps: null,
        shortenHelper: function(name, p1, p2) {
            var result = '[\'' + name + '\', [' + p1.join(', ') + ']';

            if (!this.prevProps || this.prevProps !== p2.join(',')) {
                this.prevProps = p2.join(',');
                result += ', [\'' + p2.join('\', \'') + '\']';
            }

            return result + '], ';
        }
    };

    function drawArrow(mx, my, lx, ly, options) {
        function getOptions(opt) {
            opt = opt || {};

            return [
                opt.lineWidth || 2,
                opt.strokeStyle || '#6c96c8',
                opt.fillStyle || 'rgba(0,0,0,0)',
                opt.globalAlpha || 1,
                opt.globalCompositeOperation || 'source-over',
                opt.lineCap || 'round',
                opt.lineJoin || 'round',
                opt.font || '15px "Arial"'
            ];
        }

        function handleOptions(opt, isNoFillStroke) {
            opt = opt || getOptions();

            context.globalAlpha = opt[3];
            context.globalCompositeOperation = opt[4];

            context.lineCap = opt[5];
            context.lineJoin = opt[6];
            context.lineWidth = opt[0];

            context.strokeStyle = opt[1];
            context.fillStyle = opt[2];

            context.font = opt[7];

            if (!isNoFillStroke) {
                context.stroke();
                context.fill();
            }
        }

        var arrowSize = 10;
        var angle = Math.atan2(ly - my, lx - mx);

        context.beginPath();
        context.moveTo(mx, my);
        context.lineTo(lx, ly);

        handleOptions();

        context.beginPath();
        context.moveTo(lx, ly);
        context.lineTo(lx - arrowSize * Math.cos(angle - Math.PI / 7), ly - arrowSize * Math.sin(angle - Math.PI / 7));
        context.lineTo(lx - arrowSize * Math.cos(angle + Math.PI / 7), ly - arrowSize * Math.sin(angle + Math.PI / 7));
        context.lineTo(lx, ly);
        context.lineTo(lx - arrowSize * Math.cos(angle - Math.PI / 7), ly - arrowSize * Math.sin(angle - Math.PI / 7));

        handleOptions();
    }

    function endLastPath() {
        var cache = is;

        if (cache.isArc) arcHandler.end();
        else if (cache.isQuadraticCurve) quadraticHandler.end();
        else if (cache.isBezierCurve) bezierHandler.end();

        drawHelper.redraw();

        if (textHandler.text && textHandler.text.length) {
            textHandler.appendPoints();
            textHandler.onShapeUnSelected();
        }
        textHandler.showOrHideTextTools('hide');
    }

    var copiedStuff = [],
        isControlKeyPressed;

    function copy() {
        endLastPath();

        dragHelper.global.startingIndex = 0;

        if (find('copy-last').checked) {
            copiedStuff = points[points.length - 1];
            setSelection(find('drag-last-path'), 'DragLastPath');
        } else {
            copiedStuff = points;
            setSelection(find('drag-all-paths'), 'DragAllPaths');
        }
    }

    function paste() {
        endLastPath();

        dragHelper.global.startingIndex = 0;

        if (find('copy-last').checked) {
            points[points.length] = copiedStuff;

            dragHelper.global = {
                prevX: 0,
                prevY: 0,
                startingIndex: points.length - 1
            };

            dragHelper.dragAllPaths(0, 0);
            setSelection(find('drag-last-path'), 'DragLastPath');
        } else {

            dragHelper.global.startingIndex = points.length;
            points = points.concat(copiedStuff);
            setSelection(find('drag-all-paths'), 'DragAllPaths');
        }
    }

    // marker + pencil
    function hexToR(h) {
        return parseInt((cutHex(h)).substring(0, 2), 16)
    }

    function hexToG(h) {
        return parseInt((cutHex(h)).substring(2, 4), 16)
    }

    function hexToB(h) {
        return parseInt((cutHex(h)).substring(4, 6), 16)
    }

    function cutHex(h) {
        return (h.charAt(0) == "#") ? h.substring(1, 7) : h
    }

    function clone(obj) {
        if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
            return obj;

        if (obj instanceof Date)
            var temp = new obj.constructor(); //or new Date(obj);
        else
            var temp = obj.constructor();

        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                obj['isActiveClone'] = null;
                temp[key] = clone(obj[key]);
                delete obj['isActiveClone'];
            }
        }

        return temp;
    }

    function hexToRGB(h) {
        return [
            hexToR(h),
            hexToG(h),
            hexToB(h)
        ]
    }

    var drawHelper = {
        redraw: function() {
            tempContext.clearRect(0, 0, innerWidth, innerHeight);
            context.clearRect(0, 0, innerWidth, innerHeight);

            var i, point, length = points.length;
            for (i = 0; i < length; i++) {
                point = points[i];
                // point[0] != 'pdf' && 
                if (point && point.length && this[point[0]]) {
                    this[point[0]](context, point[1], point[2]);
                }
                // else warn
            }
        },
        getOptions: function(opt) {
            opt = opt || {};
            return [
                opt.lineWidth || lineWidth,
                opt.strokeStyle || strokeStyle,
                opt.fillStyle || fillStyle,
                opt.globalAlpha || globalAlpha,
                opt.globalCompositeOperation || globalCompositeOperation,
                opt.lineCap || lineCap,
                opt.lineJoin || lineJoin,
                opt.font || font
            ];
        },
        handleOptions: function(context, opt, isNoFillStroke) {
            opt = opt || this.getOptions();

            context.globalAlpha = opt[3];
            context.globalCompositeOperation = opt[4];

            context.lineCap = opt[5];
            context.lineJoin = opt[6];
            context.lineWidth = opt[0];

            context.strokeStyle = opt[1];
            context.fillStyle = opt[2];

            context.font = opt[7];

            if (!isNoFillStroke) {
                context.stroke();
                context.fill();
            }
        },
        line: function(context, point, options) {
            context.beginPath();
            context.moveTo(point[0], point[1]);
            context.lineTo(point[2], point[3]);

            this.handleOptions(context, options);
        },
        marker: function(context, point, options) {
            context.beginPath();
            context.moveTo(point[0], point[1]);
            context.lineTo(point[2], point[3]);

            this.handleOptions(context, options);
        },
        arrow: function(context, point, options) {
            var mx = point[0];
            var my = point[1];

            var lx = point[2];
            var ly = point[3];

            var arrowSize = arrowHandler.arrowSize;

            if (arrowSize == 10) {
                arrowSize = (options ? options[0] : lineWidth) * 5;
            }

            var angle = Math.atan2(ly - my, lx - mx);

            context.beginPath();
            context.moveTo(mx, my);
            context.lineTo(lx, ly);

            this.handleOptions(context, options);

            context.beginPath();
            context.moveTo(lx, ly);
            context.lineTo(lx - arrowSize * Math.cos(angle - Math.PI / 7), ly - arrowSize * Math.sin(angle - Math.PI / 7));
            context.lineTo(lx - arrowSize * Math.cos(angle + Math.PI / 7), ly - arrowSize * Math.sin(angle + Math.PI / 7));
            context.lineTo(lx, ly);
            context.lineTo(lx - arrowSize * Math.cos(angle - Math.PI / 7), ly - arrowSize * Math.sin(angle - Math.PI / 7));

            this.handleOptions(context, options);
        },
        text: function(context, point, options) {
            this.handleOptions(context, options);
            context.fillStyle = textHandler.getFillColor(options[2]);
            context.fillText(point[0].substr(1, point[0].length - 2), point[1], point[2]);
        },
        arc: function(context, point, options) {
            context.beginPath();
            context.arc(point[0], point[1], point[2], point[3], 0, point[4]);

            this.handleOptions(context, options);
        },
        rect: function(context, point, options) {
            this.handleOptions(context, options, true);

            context.strokeRect(point[0], point[1], point[2], point[3]);
            context.fillRect(point[0], point[1], point[2], point[3]);
        },
        image: function(context, point, options) {
            this.handleOptions(context, options, true);

            var image = imageHandler.images[point[5]];
            if (!image) {
                var image = new Image();
                image.onload = function() {
                    var index = imageHandler.images.length;

                    imageHandler.lastImageURL = image.src;
                    imageHandler.lastImageIndex = index;

                    imageHandler.images.push(image);
                    context.drawImage(image, point[1], point[2], point[3], point[4]);
                };
                image.src = point[0];
                return;
            }

            context.drawImage(image, point[1], point[2], point[3], point[4]);
        },
        pdf: function(context, point, options) {
            this.handleOptions(context, options, true);

            var image = pdfHandler.images[point[5]];
            if (!image) {
                var image = new Image();
                image.onload = function() {
                    var index = imageHandler.images.length;

                    pdfHandler.lastPage = image.src;
                    pdfHandler.lastIndex = index;

                    pdfHandler.images.push(image);
                    context.drawImage(image, point[1], point[2], point[3], point[4]);
                };
                image.src = point[0];
                return;
            }

            context.drawImage(image, point[1], point[2], point[3], point[4]);
            pdfHandler.reset_pos(point[1], point[2]);
        },
        quadratic: function(context, point, options) {
            context.beginPath();
            context.moveTo(point[0], point[1]);
            context.quadraticCurveTo(point[2], point[3], point[4], point[5]);

            this.handleOptions(context, options);
        },
        bezier: function(context, point, options) {
            context.beginPath();
            context.moveTo(point[0], point[1]);
            context.bezierCurveTo(point[2], point[3], point[4], point[5], point[6], point[7]);

            this.handleOptions(context, options);
        }
    };

    var dragHelper = {
        global: {
            prevX: 0,
            prevY: 0,
            ismousedown: false,
            pointsToMove: 'all',
            startingIndex: 0
        },
        mousedown: function(e) {
            if (isControlKeyPressed) {
                copy();
                paste();
                isControlKeyPressed = false;
            }

            var dHelper = dragHelper,
                g = dHelper.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            g.prevX = x;
            g.prevY = y;

            g.pointsToMove = 'all';

            if (points.length) {
                var p = points[points.length - 1],
                    point = p[1];

                if (p[0] === 'line') {

                    if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                        g.pointsToMove = 'head';
                    }

                    if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                        g.pointsToMove = 'tail';
                    }
                }

                if (p[0] === 'arrow') {

                    if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                        g.pointsToMove = 'head';
                    }

                    if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                        g.pointsToMove = 'tail';
                    }
                }

                if (p[0] === 'rect') {

                    if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                        g.pointsToMove = 'stretch-first';
                    }

                    if (dHelper.isPointInPath(x, y, point[0] + point[2], point[1])) {
                        g.pointsToMove = 'stretch-second';
                    }

                    if (dHelper.isPointInPath(x, y, point[0], point[1] + point[3])) {
                        g.pointsToMove = 'stretch-third';
                    }

                    if (dHelper.isPointInPath(x, y, point[0] + point[2], point[1] + point[3])) {
                        g.pointsToMove = 'stretch-last';
                    }
                }

                if (p[0] === 'image') {

                    if (dHelper.isPointInPath(x, y, point[1], point[2])) {
                        g.pointsToMove = 'stretch-first';
                    }

                    if (dHelper.isPointInPath(x, y, point[1] + point[3], point[2])) {
                        g.pointsToMove = 'stretch-second';
                    }

                    if (dHelper.isPointInPath(x, y, point[1], point[2] + point[4])) {
                        g.pointsToMove = 'stretch-third';
                    }

                    if (dHelper.isPointInPath(x, y, point[1] + point[3], point[2] + point[4])) {
                        g.pointsToMove = 'stretch-last';
                    }
                }

                if (p[0] === 'pdf') {

                    if (dHelper.isPointInPath(x, y, point[1], point[2])) {
                        g.pointsToMove = 'stretch-first';
                    }

                    if (dHelper.isPointInPath(x, y, point[1] + point[3], point[2])) {
                        g.pointsToMove = 'stretch-second';
                    }

                    if (dHelper.isPointInPath(x, y, point[1], point[2] + point[4])) {
                        g.pointsToMove = 'stretch-third';
                    }

                    if (dHelper.isPointInPath(x, y, point[1] + point[3], point[2] + point[4])) {
                        g.pointsToMove = 'stretch-last';
                    }
                }

                if (p[0] === 'quadratic') {

                    if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                        g.pointsToMove = 'starting-points';
                    }

                    if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                        g.pointsToMove = 'control-points';
                    }

                    if (dHelper.isPointInPath(x, y, point[4], point[5])) {
                        g.pointsToMove = 'ending-points';
                    }
                }

                if (p[0] === 'bezier') {

                    if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                        g.pointsToMove = 'starting-points';
                    }

                    if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                        g.pointsToMove = '1st-control-points';
                    }

                    if (dHelper.isPointInPath(x, y, point[4], point[5])) {
                        g.pointsToMove = '2nd-control-points';
                    }

                    if (dHelper.isPointInPath(x, y, point[6], point[7])) {
                        g.pointsToMove = 'ending-points';
                    }
                }
            }

            g.ismousedown = true;
        },
        mouseup: function() {
            var g = this.global;

            if (is.isDragLastPath) {
                tempContext.clearRect(0, 0, innerWidth, innerHeight);
                context.clearRect(0, 0, innerWidth, innerHeight);
                this.end();
            }

            g.ismousedown = false;
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop,
                g = this.global;

            drawHelper.redraw();

            if (g.ismousedown) {
                this.dragShape(x, y);
            }

            if (is.isDragLastPath) this.init();
        },
        init: function() {
            if (!points.length) return;

            var p = points[points.length - 1],
                point = p[1],
                g = this.global;

            if (g.ismousedown) tempContext.fillStyle = 'rgba(255,85 ,154,.9)';
            else tempContext.fillStyle = 'rgba(255,85 ,154,.4)';

            if (p[0] === 'quadratic') {

                tempContext.beginPath();

                tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[4], point[5], 10, Math.PI * 2, 0, !1);

                tempContext.fill();
            }

            if (p[0] === 'bezier') {

                tempContext.beginPath();

                tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[4], point[5], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[6], point[7], 10, Math.PI * 2, 0, !1);

                tempContext.fill();
            }

            if (p[0] === 'line') {

                tempContext.beginPath();

                tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);

                tempContext.fill();
            }

            if (p[0] === 'arrow') {

                tempContext.beginPath();

                tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);

                tempContext.fill();
            }

            if (p[0] === 'text') {
                tempContext.font = "15px Verdana";
                tempContext.fillText(point[0], point[1], point[2]);
            }

            if (p[0] === 'rect') {

                tempContext.beginPath();
                tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[0] + point[2], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[0], point[1] + point[3], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[0] + point[2], point[1] + point[3], 10, Math.PI * 2, 0, !1);
                tempContext.fill();
            }

            if (p[0] === 'image') {
                tempContext.beginPath();
                tempContext.arc(point[1], point[2], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[1] + point[3], point[2], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[1], point[2] + point[4], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[1] + point[3], point[2] + point[4], 10, Math.PI * 2, 0, !1);
                tempContext.fill();
            }

            if (p[0] === 'pdf') {
                tempContext.beginPath();
                tempContext.arc(point[1], point[2], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[1] + point[3], point[2], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[1], point[2] + point[4], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[1] + point[3], point[2] + point[4], 10, Math.PI * 2, 0, !1);
                tempContext.fill();
            }
        },
        isPointInPath: function(x, y, first, second) {
            return x > first - 10 && x < first + 10 && y > second - 10 && y < second + 10;
        },
        getPoint: function(point, prev, otherPoint) {
            if (point > prev) {
                point = otherPoint + (point - prev);
            } else {
                point = otherPoint - (prev - point);
            }

            return point;
        },
        getXYWidthHeight: function(x, y, prevX, prevY, oldPoints) {
            if (oldPoints.pointsToMove == 'stretch-first') {
                if (x > prevX) {
                    oldPoints.x = oldPoints.x + (x - prevX);
                    oldPoints.width = oldPoints.width - (x - prevX);
                } else {
                    oldPoints.x = oldPoints.x - (prevX - x);
                    oldPoints.width = oldPoints.width + (prevX - x);
                }

                if (y > prevY) {
                    oldPoints.y = oldPoints.y + (y - prevY);
                    oldPoints.height = oldPoints.height - (y - prevY);
                } else {
                    oldPoints.y = oldPoints.y - (prevY - y);
                    oldPoints.height = oldPoints.height + (prevY - y);
                }
            }

            if (oldPoints.pointsToMove == 'stretch-second') {
                if (x > prevX) {
                    oldPoints.width = oldPoints.width + (x - prevX);
                } else {
                    oldPoints.width = oldPoints.width - (prevX - x);
                }

                if (y < prevY) {
                    oldPoints.y = oldPoints.y + (y - prevY);
                    oldPoints.height = oldPoints.height - (y - prevY);
                } else {
                    oldPoints.y = oldPoints.y - (prevY - y);
                    oldPoints.height = oldPoints.height + (prevY - y);
                }
            }

            if (oldPoints.pointsToMove == 'stretch-third') {
                if (x > prevX) {
                    oldPoints.x = oldPoints.x + (x - prevX);
                    oldPoints.width = oldPoints.width - (x - prevX);
                } else {
                    oldPoints.x = oldPoints.x - (prevX - x);
                    oldPoints.width = oldPoints.width + (prevX - x);
                }

                if (y < prevY) {
                    oldPoints.height = oldPoints.height + (y - prevY);
                } else {
                    oldPoints.height = oldPoints.height - (prevY - y);
                }
            }

            return oldPoints;
        },
        dragShape: function(x, y) {
            if (!this.global.ismousedown) return;

            tempContext.clearRect(0, 0, innerWidth, innerHeight);

            if (is.isDragLastPath) {
                this.dragLastPath(x, y);
            }

            if (is.isDragAllPaths) {
                this.dragAllPaths(x, y);
            }

            var g = this.global;

            g.prevX = x;
            g.prevY = y;
        },
        end: function() {
            if (!points.length) return;

            tempContext.clearRect(0, 0, innerWidth, innerHeight);

            var point = points[points.length - 1];
            drawHelper[point[0]](context, point[1], point[2]);
        },
        dragAllPaths: function(x, y) {
            var g = this.global,
                prevX = g.prevX,
                prevY = g.prevY,
                p, point,
                length = points.length,
                getPoint = this.getPoint,
                i = g.startingIndex;

            for (i; i < length; i++) {
                p = points[i];
                point = p[1];

                if (p[0] === 'line') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            getPoint(x, prevX, point[2]),
                            getPoint(y, prevY, point[3])
                        ], p[2]
                    ];
                }

                if (p[0] === 'arrow') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            getPoint(x, prevX, point[2]),
                            getPoint(y, prevY, point[3])
                        ], p[2]
                    ];
                }

                if (p[0] === 'text') {
                    points[i] = [p[0],
                        [
                            point[0],
                            getPoint(x, prevX, point[1]),
                            getPoint(y, prevY, point[2])
                        ], p[2]
                    ];
                }

                if (p[0] === 'arc') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            point[2],
                            point[3],
                            point[4]
                        ], p[2]
                    ];
                }

                if (p[0] === 'rect') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            point[2],
                            point[3]
                        ], p[2]
                    ];
                }

                if (p[0] === 'image') {
                    points[i] = [p[0],
                        [
                            point[0],
                            getPoint(x, prevX, point[1]),
                            getPoint(y, prevY, point[2]),
                            point[3],
                            point[4],
                            point[5]
                        ], p[2]
                    ];
                }

                if (p[0] === 'pdf') {
                    points[i] = [p[0],
                        [
                            point[0],
                            getPoint(x, prevX, point[1]),
                            getPoint(y, prevY, point[2]),
                            point[3],
                            point[4],
                            point[5]
                        ], p[2]
                    ];
                }

                if (p[0] === 'quadratic') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            getPoint(x, prevX, point[2]),
                            getPoint(y, prevY, point[3]),
                            getPoint(x, prevX, point[4]),
                            getPoint(y, prevY, point[5])
                        ], p[2]
                    ];
                }

                if (p[0] === 'bezier') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            getPoint(x, prevX, point[2]),
                            getPoint(y, prevY, point[3]),
                            getPoint(x, prevX, point[4]),
                            getPoint(y, prevY, point[5]),
                            getPoint(x, prevX, point[6]),
                            getPoint(y, prevY, point[7])
                        ], p[2]
                    ];
                }
            }
        },
        dragLastPath: function(x, y) {
            // if last past is undefined?
            if (!points[points.length - 1]) return;

            var g = this.global,
                prevX = g.prevX,
                prevY = g.prevY,
                p = points[points.length - 1],
                point = p[1],
                getPoint = this.getPoint,
                getXYWidthHeight = this.getXYWidthHeight,
                isMoveAllPoints = g.pointsToMove === 'all';

            if (p[0] === 'line') {

                if (g.pointsToMove === 'head' || isMoveAllPoints) {
                    point[0] = getPoint(x, prevX, point[0]);
                    point[1] = getPoint(y, prevY, point[1]);
                }

                if (g.pointsToMove === 'tail' || isMoveAllPoints) {
                    point[2] = getPoint(x, prevX, point[2]);
                    point[3] = getPoint(y, prevY, point[3]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'arrow') {

                if (g.pointsToMove === 'head' || isMoveAllPoints) {
                    point[0] = getPoint(x, prevX, point[0]);
                    point[1] = getPoint(y, prevY, point[1]);
                }

                if (g.pointsToMove === 'tail' || isMoveAllPoints) {
                    point[2] = getPoint(x, prevX, point[2]);
                    point[3] = getPoint(y, prevY, point[3]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'text') {

                if (g.pointsToMove === 'head' || isMoveAllPoints) {
                    point[1] = getPoint(x, prevX, point[1]);
                    point[2] = getPoint(y, prevY, point[2]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'arc') {
                point[0] = getPoint(x, prevX, point[0]);
                point[1] = getPoint(y, prevY, point[1]);

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'rect') {

                if (isMoveAllPoints) {
                    point[0] = getPoint(x, prevX, point[0]);
                    point[1] = getPoint(y, prevY, point[1]);
                }

                if (g.pointsToMove === 'stretch-first') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[0],
                        y: point[1],
                        width: point[2],
                        height: point[3],
                        pointsToMove: g.pointsToMove
                    });

                    point[0] = newPoints.x;
                    point[1] = newPoints.y;
                    point[2] = newPoints.width;
                    point[3] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-second') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[0],
                        y: point[1],
                        width: point[2],
                        height: point[3],
                        pointsToMove: g.pointsToMove
                    });

                    point[1] = newPoints.y;
                    point[2] = newPoints.width;
                    point[3] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-third') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[0],
                        y: point[1],
                        width: point[2],
                        height: point[3],
                        pointsToMove: g.pointsToMove
                    });

                    point[0] = newPoints.x;
                    point[2] = newPoints.width;
                    point[3] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-last') {
                    point[2] = getPoint(x, prevX, point[2]);
                    point[3] = getPoint(y, prevY, point[3]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'image') {

                if (isMoveAllPoints) {
                    point[1] = getPoint(x, prevX, point[1]);
                    point[2] = getPoint(y, prevY, point[2]);
                }

                if (g.pointsToMove === 'stretch-first') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[1],
                        y: point[2],
                        width: point[3],
                        height: point[4],
                        pointsToMove: g.pointsToMove
                    });

                    point[1] = newPoints.x;
                    point[2] = newPoints.y;
                    point[3] = newPoints.width;
                    point[4] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-second') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[1],
                        y: point[2],
                        width: point[3],
                        height: point[4],
                        pointsToMove: g.pointsToMove
                    });

                    point[2] = newPoints.y;
                    point[3] = newPoints.width;
                    point[4] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-third') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[1],
                        y: point[2],
                        width: point[3],
                        height: point[4],
                        pointsToMove: g.pointsToMove
                    });

                    point[1] = newPoints.x;
                    point[3] = newPoints.width;
                    point[4] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-last') {
                    point[3] = getPoint(x, prevX, point[3]);
                    point[4] = getPoint(y, prevY, point[4]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'pdf') {

                if (isMoveAllPoints) {
                    point[1] = getPoint(x, prevX, point[1]);
                    point[2] = getPoint(y, prevY, point[2]);
                }

                if (g.pointsToMove === 'stretch-first') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[1],
                        y: point[2],
                        width: point[3],
                        height: point[4],
                        pointsToMove: g.pointsToMove
                    });

                    point[1] = newPoints.x;
                    point[2] = newPoints.y;
                    point[3] = newPoints.width;
                    point[4] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-second') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[1],
                        y: point[2],
                        width: point[3],
                        height: point[4],
                        pointsToMove: g.pointsToMove
                    });

                    point[2] = newPoints.y;
                    point[3] = newPoints.width;
                    point[4] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-third') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[1],
                        y: point[2],
                        width: point[3],
                        height: point[4],
                        pointsToMove: g.pointsToMove
                    });

                    point[1] = newPoints.x;
                    point[3] = newPoints.width;
                    point[4] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-last') {
                    point[3] = getPoint(x, prevX, point[3]);
                    point[4] = getPoint(y, prevY, point[4]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'quadratic') {

                if (g.pointsToMove === 'starting-points' || isMoveAllPoints) {
                    point[0] = getPoint(x, prevX, point[0]);
                    point[1] = getPoint(y, prevY, point[1]);
                }

                if (g.pointsToMove === 'control-points' || isMoveAllPoints) {
                    point[2] = getPoint(x, prevX, point[2]);
                    point[3] = getPoint(y, prevY, point[3]);
                }

                if (g.pointsToMove === 'ending-points' || isMoveAllPoints) {
                    point[4] = getPoint(x, prevX, point[4]);
                    point[5] = getPoint(y, prevY, point[5]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'bezier') {

                if (g.pointsToMove === 'starting-points' || isMoveAllPoints) {
                    point[0] = getPoint(x, prevX, point[0]);
                    point[1] = getPoint(y, prevY, point[1]);
                }

                if (g.pointsToMove === '1st-control-points' || isMoveAllPoints) {
                    point[2] = getPoint(x, prevX, point[2]);
                    point[3] = getPoint(y, prevY, point[3]);
                }

                if (g.pointsToMove === '2nd-control-points' || isMoveAllPoints) {
                    point[4] = getPoint(x, prevX, point[4]);
                    point[5] = getPoint(y, prevY, point[5]);
                }

                if (g.pointsToMove === 'ending-points' || isMoveAllPoints) {
                    point[6] = getPoint(x, prevX, point[6]);
                    point[7] = getPoint(y, prevY, point[7]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }
        }
    };

    var pencilHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;

            // make sure that pencil is drawing shapes even 
            // if mouse is down but mouse isn't moving
            tempContext.lineCap = 'round';
            pencilDrawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

            points[points.length] = ['line', [t.prevX, t.prevY, x, y], pencilDrawHelper.getOptions()];

            t.prevX = x;
            t.prevY = y;
        },
        mouseup: function(e) {
            this.ismousedown = false;
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            if (t.ismousedown) {
                tempContext.lineCap = 'round';
                pencilDrawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

                points[points.length] = ['line', [t.prevX, t.prevY, x, y], pencilDrawHelper.getOptions()];

                t.prevX = x;
                t.prevY = y;
            }
        }
    }

    var pencilLineWidth = document.getElementById('pencil-stroke-style').value,
        pencilStrokeStyle = '#' + document.getElementById('pencil-fill-style').value;

    var pencilDrawHelper = clone(drawHelper);

    pencilDrawHelper.getOptions = function() {
        return [pencilLineWidth, pencilStrokeStyle, fillStyle, globalAlpha, globalCompositeOperation, lineCap, lineJoin, font];
    }

    var markerHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;

            // make sure that pencil is drawing shapes even 
            // if mouse is down but mouse isn't moving
            tempContext.lineCap = 'round';
            markerDrawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

            points[points.length] = ['line', [t.prevX, t.prevY, x, y], markerDrawHelper.getOptions()];

            t.prevX = x;
            t.prevY = y;
        },
        mouseup: function(e) {
            this.ismousedown = false;
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            if (t.ismousedown) {
                tempContext.lineCap = 'round';
                markerDrawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

                points[points.length] = ['line', [t.prevX, t.prevY, x, y], markerDrawHelper.getOptions()];

                t.prevX = x;
                t.prevY = y;
            }
        }
    }

    var markerLineWidth = document.getElementById('marker-stroke-style').value,
        markerStrokeStyle = '#' + document.getElementById('marker-fill-style').value,
        markerGlobalAlpha = 0.7;

    var markerDrawHelper = clone(drawHelper);

    markerDrawHelper.getOptions = function() {
        return [markerLineWidth, markerStrokeStyle, fillStyle, markerGlobalAlpha, globalCompositeOperation, lineCap, lineJoin, font];
    }

    var eraserHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;

            tempContext.lineCap = 'round';
            drawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

            points[points.length] = ['line', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

            t.prevX = x;
            t.prevY = y;
        },
        mouseup: function(e) {
            this.ismousedown = false;
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            if (t.ismousedown) {
                tempContext.lineCap = 'round';
                drawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

                points[points.length] = ['line', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

                t.prevX = x;
                t.prevY = y;
            }
        }
    };

    var textHandler = {
        text: '',
        selectedFontFamily: 'Arial',
        selectedFontSize: '15',
        onShapeSelected: function() {
            tempContext.canvas.style.cursor = 'text';
            this.x = this.y = this.pageX = this.pageY = 0;
            this.text = '';
        },
        onShapeUnSelected: function() {
            this.text = '';
            this.showOrHideTextTools('hide');
            tempContext.canvas.style.cursor = 'default';

            if (typeof this.blinkCursorInterval !== 'undefined') {
                clearInterval(this.blinkCursorInterval);
            }
        },
        getFillColor: function(color) {
            color = (color || fillStyle).toLowerCase();

            if (color == 'rgba(255, 255, 255, 0)' || color == 'transparent' || color === 'white') {
                return 'black';
            }

            return color;
        },
        writeText: function(keyPressed, isBackKeyPressed) {
            if (!is.isText) return;

            if (isBackKeyPressed) {
                textHandler.text = textHandler.text.substr(0, textHandler.text.length - 1);
                textHandler.fillText(textHandler.text);
                return;
            }

            textHandler.text += keyPressed;
            textHandler.fillText(textHandler.text);
        },
        fillText: function(text) {
            if (!is.isText) return;

            tempContext.clearRect(0, 0, tempContext.canvas.width, tempContext.canvas.height);

            var options = textHandler.getOptions();
            drawHelper.handleOptions(tempContext, options);
            tempContext.fillStyle = textHandler.getFillColor(options[2]);
            tempContext.font = textHandler.selectedFontSize + 'px "' + textHandler.selectedFontFamily + '"';

            tempContext.fillText(text, textHandler.x, textHandler.y);
        },
        blinkCursorInterval: null,
        index: 0,
        blinkCursor: function() {
            textHandler.index++;
            if (textHandler.index % 2 == 0) {
                textHandler.fillText(textHandler.text + '|');
            } else {
                textHandler.fillText(textHandler.text);
            }
        },
        getOptions: function() {
            var options = {
                font: textHandler.selectedFontSize + 'px "' + textHandler.selectedFontFamily + '"',
                fillStyle: textHandler.getFillColor(),
                strokeStyle: '#6c96c8',
                globalCompositeOperation: 'source-over',
                globalAlpha: 1,
                lineJoin: 'round',
                lineCap: 'round',
                lineWidth: 2
            };
            font = options.font;
            return options;
        },
        appendPoints: function() {
            var options = textHandler.getOptions();
            points[points.length] = ['text', ['"' + textHandler.text + '"', textHandler.x, textHandler.y], drawHelper.getOptions(options)];
        },
        mousedown: function(e) {
            if (!is.isText) return;

            if (textHandler.text.length) {
                this.appendPoints();
            }

            textHandler.x = textHandler.y = 0;
            textHandler.text = '';

            textHandler.pageX = e.pageX;
            textHandler.pageY = e.pageY;

            textHandler.x = e.pageX - canvas.offsetLeft - 5;
            textHandler.y = e.pageY - canvas.offsetTop + 10;

            if (typeof textHandler.blinkCursorInterval !== 'undefined') {
                clearInterval(textHandler.blinkCursorInterval);
            }

            textHandler.blinkCursor();
            textHandler.blinkCursorInterval = setInterval(textHandler.blinkCursor, 700);

            this.showTextTools();
        },
        mouseup: function(e) {},
        mousemove: function(e) {},
        showOrHideTextTools: function(show) {
            this.fontFamilyBox.style.display = show == 'show' ? 'block' : 'none';
            this.fontSizeBox.style.display = show == 'show' ? 'block' : 'none';

            this.fontSizeBox.style.left = this.x + 'px';
            this.fontFamilyBox.style.left = (this.fontSizeBox.clientWidth + this.x) + 'px';

            this.fontSizeBox.style.top = this.y + 'px';
            this.fontFamilyBox.style.top = this.y + 'px';
        },
        showTextTools: function() {
            if (!this.fontFamilyBox || !this.fontSizeBox) return;

            this.unselectAllFontFamilies();
            this.unselectAllFontSizes();

            this.showOrHideTextTools('show');

            this.eachFontFamily(function(child) {
                child.onclick = function(e) {
                    e.preventDefault();

                    textHandler.showOrHideTextTools('hide');

                    textHandler.selectedFontFamily = this.innerHTML;
                    this.className = 'font-family-selected';
                };
                child.style.fontFamily = child.innerHTML;
            });

            this.eachFontSize(function(child) {
                child.onclick = function(e) {
                    e.preventDefault();

                    textHandler.showOrHideTextTools('hide');

                    textHandler.selectedFontSize = this.innerHTML;
                    this.className = 'font-family-selected';
                };
                // child.style.fontSize = child.innerHTML + 'px';
            });
        },
        eachFontFamily: function(callback) {
            var childs = this.fontFamilyBox.querySelectorAll('li');
            for (var i = 0; i < childs.length; i++) {
                callback(childs[i]);
            }
        },
        unselectAllFontFamilies: function() {
            this.eachFontFamily(function(child) {
                child.className = '';
                if (child.innerHTML === textHandler.selectedFontFamily) {
                    child.className = 'font-family-selected';
                }
            });
        },
        eachFontSize: function(callback) {
            var childs = this.fontSizeBox.querySelectorAll('li');
            for (var i = 0; i < childs.length; i++) {
                callback(childs[i]);
            }
        },
        unselectAllFontSizes: function() {
            this.eachFontSize(function(child) {
                child.className = '';
                if (child.innerHTML === textHandler.selectedFontSize) {
                    child.className = 'font-size-selected';
                }
            });
        },
        onReturnKeyPressed: function() {
            if (!textHandler.text || !textHandler.text.length) return;
            var fontSize = parseInt(textHandler.selectedFontSize) || 15;
            this.mousedown({
                pageX: this.pageX,
                // pageY: parseInt(tempContext.measureText(textHandler.text).height * 2) + 10
                pageY: this.pageY + fontSize + 5
            });
            drawHelper.redraw();
        },
        fontFamilyBox: document.querySelector('.fontSelectUl'),
        fontSizeBox: document.querySelector('.fontSizeUl')
    };

    var arcHandler = {
        global: {
            ismousedown: false,
            prevX: 0,
            prevY: 0,
            prevRadius: 0,
            isCircleDrawn: false,
            isCircledEnded: true,
            isClockwise: false,
            arcRangeContainer: null,
            arcRange: null
        },
        mousedown: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            g.prevX = x;
            g.prevY = y;

            g.ismousedown = true;
        },
        mouseup: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            if (g.ismousedown) {
                if (!g.isCircleDrawn && g.isCircledEnded) {
                    var prevX = g.prevX,
                        prevY = g.prevY,
                        radius = ((x - prevX) + (y - prevY)) / 3;

                    g.prevRadius = radius;
                    g.isCircleDrawn = true;
                    g.isCircleEnded = false;

                    var c = (2 * Math.PI * radius) / 21,
                        angle,
                        xx = prevX > x ? prevX - x : x - prevX,
                        yy = prevY > y ? prevY - y : y - prevY;

                    angle = (xx + yy) / (2 * c);
                    points[points.length] = ['arc', [prevX + radius, prevY + radius, radius, angle, 1], drawHelper.getOptions()];

                    var arcRange = g.arcRange,
                        arcRangeContainer = g.arcRangeContainer;

                    arcRangeContainer.style.display = 'block';
                    arcRange.focus();

                    arcRangeContainer.style.top = (y + canvas.offsetTop + 20) + 'px';
                    arcRangeContainer.style.left = x + 'px';

                    arcRange.value = 2;
                } else if (g.isCircleDrawn && !g.isCircleEnded) {
                    this.end();
                }
            }

            g.ismousedown = false;

            this.fixAllPoints();
        },
        mousemove: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var ismousedown = g.ismousedown,
                isCircleDrawn = g.isCircleDrawn,
                isCircleEnded = g.isCircledEnded;

            if (ismousedown) {
                if (!isCircleDrawn && isCircleEnded) {
                    var prevX = g.prevX,
                        prevY = g.prevY,
                        radius = ((x - prevX) + (y - prevY)) / 3;

                    tempContext.clearRect(0, 0, 2000, 2000);

                    drawHelper.arc(tempContext, [prevX + radius, prevY + radius, radius, Math.PI * 2, true]);
                }
            }
        },
        fixAllPoints: function() {
            var toFixed = this.toFixed;

            for (var i = 0; i < points.length; i++) {
                var p = points[i],
                    point;
                if (p[0] === 'arc') {
                    point = p[1];
                    points[i] = ['arc', [toFixed(point[0]), toFixed(point[1]), toFixed(point[2]), toFixed(point[3]), point[4]],
                        p[2]
                    ];
                }
            }
        },
        init: function() {
            var markIsClockwise = find('is-clockwise'),
                g = this.global;

            g.arcRangeContainer = find('arc-range-container');
            g.arcRange = find('arc-range');

            addEvent(markIsClockwise, 'change', function(e) {
                g.isClockwise = markIsClockwise.checked;

                g.arcRange.value = arcHandler.toFixed(g.arcRange.value);
                g.arcRange.focus();

                arcHandler.arcRangeHandler(e);

                if (!points.length) return;

                var p = points[points.length - 1],
                    point = p[1];

                tempContext.clearRect(0, 0, innerWidth, innerHeight);
                drawHelper.arc(tempContext, [point[0], point[1], point[2], point[3], point[4]]);
            });

            var arcRange = g.arcRange;
            addEvent(arcRange, 'keydown', this.arcRangeHandler);
            addEvent(arcRange, 'focus', this.arcRangeHandler);
        },
        arcRangeHandler: function(e) {
            var g = arcHandler.global,
                arcRange = g.arcRange;

            var key = e.keyCode,
                value = +arcRange.value;
            if (key == 39 || key == 40) arcRange.value = (value < 2 ? value : 1.98) + .02;
            if (key == 37 || key == 38) arcRange.value = (value > 0 ? value : .02) - .02;

            if (!key || key == 13 || key == 39 || key == 40 || key == 37 || key == 38) {
                var range = Math.PI * arcHandler.toFixed(value);
                var p = points[points.length - 1];

                if (p[0] === 'arc') {
                    var point = p[1];
                    points[points.length - 1] = ['arc', [point[0], point[1], point[2], range, g.isClockwise ? 1 : 0],
                        p[2]
                    ];

                    drawHelper.redraw();
                }
            }
        },
        toFixed: function(input) {
            return Number(input).toFixed(1);
        },
        end: function() {
            var g = this.global;

            g.arcRangeContainer.style.display = 'none';
            g.arcRange.value = 2;

            g.isCircleDrawn = false;
            g.isCircleEnded = true;

            drawHelper.redraw();
        }
    };

    arcHandler.init();

    var lineHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;
        },
        mouseup: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                points[points.length] = ['line', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

                t.ismousedown = false;
            }
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            if (t.ismousedown) {
                tempContext.clearRect(0, 0, innerWidth, innerHeight);

                drawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);
            }
        }
    };

    var arrowHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        arrowSize: 10,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;
        },
        mouseup: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                points[points.length] = ['arrow', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

                t.ismousedown = false;
            }
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            if (t.ismousedown) {
                tempContext.clearRect(0, 0, innerWidth, innerHeight);

                drawHelper.arrow(tempContext, [t.prevX, t.prevY, x, y]);
            }
        }
    };

    var rectHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;
        },
        mouseup: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                points[points.length] = ['rect', [t.prevX, t.prevY, x - t.prevX, y - t.prevY], drawHelper.getOptions()];

                t.ismousedown = false;
            }

        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                tempContext.clearRect(0, 0, innerWidth, innerHeight);

                drawHelper.rect(tempContext, [t.prevX, t.prevY, x - t.prevX, y - t.prevY]);
            }
        }
    };

    var quadraticHandler = {
        global: {
            ismousedown: false,
            prevX: 0,
            prevY: 0,
            controlPointX: 0,
            controlPointY: 0,
            isFirstStep: true,
            isLastStep: false
        },
        mousedown: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            if (!g.isLastStep) {
                g.prevX = x;
                g.prevY = y;
            }

            g.ismousedown = true;

            if (g.isLastStep && g.ismousedown) {
                this.end(x, y);
            }
        },
        mouseup: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            if (g.ismousedown && g.isFirstStep) {
                g.controlPointX = x;
                g.controlPointY = y;

                g.isFirstStep = false;
                g.isLastStep = true;
            }
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var g = this.global;

            tempContext.clearRect(0, 0, innerWidth, innerHeight);

            if (g.ismousedown && g.isFirstStep) {
                drawHelper.quadratic(tempContext, [g.prevX, g.prevY, x, y, x, y]);
            }

            if (g.isLastStep) {
                drawHelper.quadratic(tempContext, [g.prevX, g.prevY, g.controlPointX, g.controlPointY, x, y]);
            }
        },
        end: function(x, y) {
            var g = this.global;

            if (!g.ismousedown) return;

            g.isLastStep = false;

            g.isFirstStep = true;
            g.ismousedown = false;

            x = x || g.controlPointX || g.prevX;
            y = y || g.controlPointY || g.prevY;

            points[points.length] = ['quadratic', [g.prevX, g.prevY, g.controlPointX, g.controlPointY, x, y], drawHelper.getOptions()];
        }
    };

    var bezierHandler = {
        global: {
            ismousedown: false,
            prevX: 0,
            prevY: 0,

            firstControlPointX: 0,
            firstControlPointY: 0,
            secondControlPointX: 0,
            secondControlPointY: 0,

            isFirstStep: true,
            isSecondStep: false,
            isLastStep: false
        },
        mousedown: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            if (!g.isLastStep && !g.isSecondStep) {
                g.prevX = x;
                g.prevY = y;
            }

            g.ismousedown = true;

            if (g.isLastStep && g.ismousedown) {
                this.end(x, y);
            }

            if (g.ismousedown && g.isSecondStep) {
                g.secondControlPointX = x;
                g.secondControlPointY = y;

                g.isSecondStep = false;
                g.isLastStep = true;
            }
        },
        mouseup: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            if (g.ismousedown && g.isFirstStep) {
                g.firstControlPointX = x;
                g.firstControlPointY = y;

                g.isFirstStep = false;
                g.isSecondStep = true;
            }
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var g = this.global;

            tempContext.clearRect(0, 0, innerWidth, innerHeight);

            if (g.ismousedown && g.isFirstStep) {
                drawHelper.bezier(tempContext, [g.prevX, g.prevY, x, y, x, y, x, y]);
            }

            if (g.ismousedown && g.isSecondStep) {
                drawHelper.bezier(tempContext, [g.prevX, g.prevY, g.firstControlPointX, g.firstControlPointY, x, y, x, y]);
            }

            if (g.isLastStep) {
                drawHelper.bezier(tempContext, [g.prevX, g.prevY, g.firstControlPointX, g.firstControlPointY, g.secondControlPointX, g.secondControlPointY, x, y]);
            }
        },
        end: function(x, y) {
            var g = this.global;

            if (!g.ismousedown) return;

            g.isLastStep = g.isSecondStep = false;

            g.isFirstStep = true;
            g.ismousedown = false;

            g.secondControlPointX = g.secondControlPointX || g.firstControlPointX;
            g.secondControlPointY = g.secondControlPointY || g.firstControlPointY;

            x = x || g.secondControlPointX;
            y = y || g.secondControlPointY;

            points[points.length] = ['bezier', [g.prevX, g.prevY, g.firstControlPointX, g.firstControlPointY, g.secondControlPointX, g.secondControlPointY, x, y], drawHelper.getOptions()];
        }
    };

    var zoomHandler = {
        scale: 1.0,
        up: function(e) {
            this.scale += .01;
            this.apply();
        },
        down: function(e) {
            this.scale -= .01;
            this.apply();
        },
        apply: function() {
            tempContext.scale(this.scale, this.scale);
            context.scale(this.scale, this.scale);
            drawHelper.redraw();
        },
        icons: {
            up: function(ctx) {
                ctx.font = '22px Verdana';
                ctx.strokeText('+', 10, 30);
            },
            down: function(ctx) {
                ctx.font = '22px Verdana';
                ctx.strokeText('-', 15, 30);
            }
        }
    };

    var FileSelector = function() {
        var selector = this;

        selector.selectSingleFile = selectFile;
        selector.selectMultipleFiles = function(callback) {
            selectFile(callback, true);
        };

        function selectFile(callback, multiple, accept) {
            var file = document.createElement('input');
            file.type = 'file';

            if (multiple) {
                file.multiple = true;
            }

            file.accept = accept || 'image/*';

            file.onchange = function() {
                if (multiple) {
                    if (!file.files.length) {
                        console.error('No file selected.');
                        return;
                    }
                    callback(file.files);
                    return;
                }

                if (!file.files[0]) {
                    console.error('No file selected.');
                    return;
                }

                callback(file.files[0]);

                file.parentNode.removeChild(file);
            };
            file.style.display = 'none';
            (document.body || document.documentElement).appendChild(file);
            fireClickEvent(file);
        }

        function fireClickEvent(element) {
            var evt = new window.MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                button: 0,
                buttons: 0,
                mozInputSource: 1
            });

            var fired = element.dispatchEvent(evt);
        }
    };

    var imageHandler = {
        lastImageURL: null,
        lastImageIndex: 0,
        images: [],

        ismousedown: false,
        prevX: 0,
        prevY: 0,
        load: function(width, height) {
            var t = imageHandler;
            points[points.length] = ['image', [imageHandler.lastImageURL, t.prevX, t.prevY, width, height, imageHandler.lastImageIndex], drawHelper.getOptions()];
            document.getElementById('drag-last-path').click();

            // share to webrtc
            syncPoints(true);
        },
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;
        },
        mouseup: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                points[points.length] = ['image', [imageHandler.lastImageURL, t.prevX, t.prevY, x - t.prevX, y - t.prevY, imageHandler.lastImageIndex], drawHelper.getOptions()];

                t.ismousedown = false;
            }

        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                tempContext.clearRect(0, 0, innerWidth, innerHeight);

                drawHelper.image(tempContext, [imageHandler.lastImageURL, t.prevX, t.prevY, x - t.prevX, y - t.prevY, imageHandler.lastImageIndex]);
            }
        }
    };

    var pdfHandler = {
        lastPdfURL: null,
        lastIndex: 0,
        lastPageIndex: null,
        removeWhiteBackground: true,
        pdfPageContainer: document.getElementById('pdf-page-container'),
        pdfPagesList: document.getElementById('pdf-pages-list'),
        pageNumber: 1,

        images: [],
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        getPage: function(pageNumber, callback) {
            pageNumber = parseInt(pageNumber) || 1;

            if (!pdfHandler.pdf) {
                pdfjsLib.disableWorker = false;
                pdfjsLib.getDocument(pdfHandler.lastPdfURL).then(function(pdf) {
                    pdfHandler.pdf = pdf;
                    pdfHandler.getPage(pageNumber, callback);
                });
                return;
            }

            var pdf = pdfHandler.pdf;
            pdf.getPage(pageNumber).then(function(page) {
                pdfHandler.pageNumber = pageNumber;

                var scale = 1.5;
                var viewport = page.getViewport(scale);

                var cav = document.createElement('canvas');
                var ctx = cav.getContext('2d');
                cav.height = viewport.height;
                cav.width = viewport.width;

                var renderContext = {
                    canvasContext: ctx,
                    viewport: viewport,
                    background: 'rgba(0,0,0,0)'
                };

                page.render(renderContext).then(function() {
                    if (pdfHandler.removeWhiteBackground === true) {
                        var imgd = ctx.getImageData(0, 0, cav.width, cav.height);
                        var pix = imgd.data;
                        var newColor = {
                            r: 0,
                            g: 0,
                            b: 0,
                            a: 0
                        };

                        for (var i = 0, n = pix.length; i < n; i += 4) {
                            var r = pix[i],
                                g = pix[i + 1],
                                b = pix[i + 2];

                            if (r == 255 && g == 255 && b == 255) {
                                pix[i] = newColor.r;
                                pix[i + 1] = newColor.g;
                                pix[i + 2] = newColor.b;
                                pix[i + 3] = newColor.a;
                            }
                        }
                        ctx.putImageData(imgd, 0, 0);
                    }

                    pdfHandler.lastPage = cav.toDataURL('image/png');
                    callback(pdfHandler.lastPage, cav.width, cav.height, pdf.numPages);
                });
            });
        },
        load: function(lastPdfURL) {
            pdfHandler.lastPdfURL = lastPdfURL;
            pdfHandler.getPage(parseInt(pdfHandler.pdfPagesList.value || 1), function(lastPage, width, height, numPages) {
                pdfHandler.prevX = canvas.width - width - parseInt(width / 2);

                var t = pdfHandler;
                pdfHandler.lastIndex = pdfHandler.images.length;
                var point = [lastPage, 60, 20, width, height, pdfHandler.lastIndex];
                points[points.length] = ['pdf', point, drawHelper.getOptions()];

                pdfHandler.pdfPagesList.innerHTML = '';
                for (var i = 1; i <= numPages; i++) {
                    var option = document.createElement('option');
                    option.value = i;
                    option.innerHTML = 'Page #' + i;
                    pdfHandler.pdfPagesList.appendChild(option);

                    if (pdfHandler.pageNumber.toString() == i.toString()) {
                        option.selected = true;
                    }
                }
                pdfHandler.pdfPageContainer.style.top = '20px';
                pdfHandler.pdfPageContainer.style.left = point[2] + 'px';

                pdfHandler.pdfPagesList.onchange = function() {
                    pdfHandler.load(lastPdfURL);
                };

                document.getElementById('drag-last-path').click();
                pdfHandler.pdfPageContainer.style.display = 'block';

                // share to webrtc
                syncPoints(true);
            });
        },
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;
        },
        mouseup: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                points[points.length] = ['pdf', [pdfHandler.lastPage, t.prevX, t.prevY, x - t.prevX, y - t.prevY, pdfHandler.lastIndex], drawHelper.getOptions()];

                t.ismousedown = false;
            }
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                tempContext.clearRect(0, 0, innerWidth, innerHeight);
                drawHelper.pdf(tempContext, [pdfHandler.lastPage, t.prevX, t.prevY, x - t.prevX, y - t.prevY, pdfHandler.lastIndex]);
            }
        },
        reset_pos: function(x, y) {
            pdfHandler.pdfPageContainer.style.top = y + 'px';
            pdfHandler.pdfPageContainer.style.left = x + 'px';
        },
        end: function() {
            pdfHandler.pdfPageContainer.style.display = 'none';
        }
    };

    var data_uris = {
        line: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAEHklEQVR4nO3aMWgbVwDG8T8aRDDFk0eRSWQIpmPIGDwHz8FjhuKxU9AUKCUYTx1K8BQyBE8mg4cQQjEhlA4eSikZMmQowZRQQgcTTDAmOMPT492dFUWST3e6+74f3GDJdzz4P07v6QRmZmbWQANgu+5BWD22gPPhsVXzWKxi2fjxGNQ6IqvMQ1L0D8PDk0DEDin2e2AVuAEcZ17frG10Njcd4Akp8hHQz7yfnQSf8SRolQ6wS4r/D/n40RpwQpoEG1UN0OanC+yT4r8FemP+fw34NPzfMzwJGq0Y/w3j40frwOnwnNPh39YwS8ABKf5rYGWK89cJdwBPggYqxv+L6eJHG4S1wDnhY2GtrAHa/CwDh6T4h8PXZpWdBCd4Eiy8+6T4Z4xe7U9rkLnmMXC9hGvanHSAPfK3/8vcAXqEnUO83j5hcWkLrLj6n/VjoBh/D8dvjC7wghTvd8LicFJ9wreF8fxdwt3FGmQJeEWKeMBkk+Aa+fiPcPxG6gP/kn/k+5zxt/FV8k8Hd+Y8RpuTUfG/tZD7nnz8XyoZqZVuXPzsgi57Wy8+EvbPxBpqkvjFhd1N8vF/qnzUVopp4sfjGekRsH8R1GDTxH9Ffn8fjx8rH7WVYpr4Lwlbwavkt3r+BVBDzRI/e+474G6F47USXSZ+dKWSkVrpyohvDeX4whxfmOMLc3xhji/M8YU5vjDHF+b4whxfmOMLc3xhji/M8YU5vjDHF+b4whxfmOMLc3xhji/M8YU5vjDHF+b4whxfmOMLc3xhji/M8YU5vjDHF+b4whxfmOMLc3xhji/M8YU5vjDHF+b4whxfmOMLc3xhji/M8YU5vjDHF+b4whxfmOMLc3xhji/M8YU5vjDHF+b4whxfmOMLc3xhji/M8YU5vjDHF+b4whxfmOMLc3xhjt9yV8a85/gttwm8I4QucvyW2wQ+EwIeAb3Me47fcvdI8ePxljAJHL/lBqSAJ8AL8pPA8VvsZ1LAY+AG0AF2mSy64zfYFhfjRx1gD8dvrV9JAT8AqyP+pwvs4/its8O340dd4DmO3wod4DEp4BGj9/tFS8ABjt9oxYXdpPGjJeCPzPm/Ee4O1gBd4CkX9/fTWgYOM9fZx5Ng4RUXcrPGj5aBvzPXe0q4u9iCuk7Y4sVggxKu2QfOMte8X8I1bY5uEb7hOyd83btxiWsVPwYOh6/ZglsjTYIzZpsEK8CfpPgHwHdlDdDm7zZwSpoE61OcuwK8Jh/f28AGWidNglMmmwQ94A1e/bfGHdKj30+Ej4ev6RF2Do7fMhukSXDC6EnQJ/w6KMbfxVu+VvmBFPcj+aeBfcK3hY7fcptcfCS8CvyXeX2nttFZJe6RYv9PeELo+GKyPwuLx3atI7LKPSDF36p5LFaTbcp5XmBmZmbV+gImKL3Ca1hflAAAAABJRU5ErkJggg==',
        arrow: 'data:image/png;base64,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',
        pencil: 'data:image/png;base64,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',
        marker: 'data:image/png;base64,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',
        dragSingle: 'data:image/png;base64,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',
        dragMultiple: 'data:image/png;base64,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',
        eraser: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAN2AAADdgF91YLMAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAW5QTFRF////S7ns/wAA/08ZS7ns/08ZS7ns/08ZS7ns/08Z/1UV/1AgS7ns/08ZS7ns/08ZS7ns/08ZS7ns/08Z/1EX/1AY4wAc/08X8iUd/08a/04a7iUd/04Y5QAe/08a4QAe/04a/1AaS7ns/08Z/1AYS7ns/08Z/1EX/04a/08Y/04ZS7ns/08ZS7ns/08Z/08aS7ns/08Z/1AaS7ns/08ZS7ns/08ZS7ns/08ZS7ns/08Zym5X4wAe/08Z/08Z/04Z/08ZS7ns/08Z4wAe/08Y/08a/08Z/1AZS7ns/08Z/08Z/1AZ4wAe/08Z/08Z4wAd/08Y/08aS7ns4wAe/08ZS7ns/08Z/08Z/08Z4wAe/1AZ/08aS7ns/08ZS7ns/08Z6xQdS7ns/08ZS7nsS7ns/08Z/04Z/08ZS7nsS7ns/08ZS7ns/08Z/08aS7ns/08ZS7ns5gkd/08Z/08ZS7ns/08ZS7ns4wAe5AId/08Z+HxngQAAAHZ0Uk5TAAEBAQYGCAgLCwwQFxccHCAgLCwsNjc3Ojo7PEFEREVFRklJSUpKTE5UW2lpd3d4eXmAlpaXl7CwsrK/wcHCw8TFxcbGx8nKy8vMzc7Oz9DR0tTU1NXV1tfY2tzf3+Dg4eLi4+jo6uvs7e3v7/D4+Pn7+/z9/ftMQNoAAALjSURBVHja7dXpX0xhGMbxu0WSJFmSJUS2pJhJQhQh29gTsiVr2Wp6uP57L5qWD+Y8232d88K53s2r72/O88wZkXz58uVTXkPXwPibr58eD/W0ZME39s+alQ22pe53z5i1Kxfq0/V7y+aPjTanyNcUzN+bas3WN+Zla7Z+agVV/ZQKEvxUChL9FAosPr3A6pMLHHxqgZNPLHD0aQXOPqnAw6cUePmEAk9fvcDbVy4I8FULgnzFgkBfrSDYVyqI8FUKonyFgkg/uiDajyxQ8KMKVPyIAiU/uEDNDyxQ9I2Zas7WN2a0PlvfmELGvim3ZesbM5ixb0xLxr7pcQ7g+GbIka8rnucEPHD1AU7BR2efVPDd3ecUvPXwKQXjPj6jYMDLJxR0+fnqBbMNnr52Qb+3r1sw0+jvaxaUu0N8xYLeMF+toBDqKxUUaoJ9lYIoX6Eg0o8uiPYjCxT8qAIVP6JAyQ8uUPMDCxT9oAJVP6BA2fcuUPc9Cwi+VwHF9ygg+c4FNN+xgOg7FVB9hwKyby2g+5aCFPzEAosvKn5Cgc0/CVALbP7hRVALbP6GdwCzwObLKYBZYPXXz4FZYPXlIEAssPtyBsQCB19ugFfg4ss0aAUr/q6rpf1VA76BVbD6/UeAydpqAZ9BKljz/IeBiaoBE+AUrD3/9pHSnqpHcI4TUBTXneD4dc4Bm4n+oWulTnvBWZp/bB64bw/YukjyD8wDuOdwCEWOL5cALBx1CFh3mXP/hoGF4yIi0nHxeuJd2PSCcv/bx24dcXgTiohsecX9/SW+CXUL/v37T3wTqhYs+019pSfbxWsqBRW/qe8DgElJvaDib3sPAHi+dBGBO50pFSw//5sAgLn2yvUDHqXzDFbu3xiAL6c3indAXMHq/e94Nl3h/Y4grsDj/5dSoOQHF6j5gQWKvsjuHz8Ju71XRGTHlaVPd/elX/BQROTC8qentakX+ATIzte/sjyCfPny/W/7Df2DVRNDpJc6AAAAAElFTkSuQmCC',
        rectangle: 'data:image/png;base64,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',
        arc: 'data:image/png;base64,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',
        bezier: 'data:image/png;base64,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',
        quadratic: 'data:image/png;base64,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',
        text: 'data:image/png;base64,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',
        image: 'data:image/png;base64,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',
        pdf: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAW7AAAFuwHJqm8tAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAexQTFRF////4ldM4ldM4ldM4ldMyEM3yEM4yEQ4yEQ4yEQ4yEQ54ldMyEQ5yEQ5yEU44ldMyEU4yEU4yUU4ykQ4ykQ5ykU5ykU5ykU5ykU5ykY6ykY6ykY6zEc6zEc7zEc7zEc74ldM4ldMtTYptzcruToswj8zwkA0y0c6zEY7zkk921JH4ldM4lhN41pQ41tQ41xR41xS411S415T419U42BV5GBW5GJX5GJY5GNZ5GVb5WZc5Wdd5Whe5Wlf5Wth5mxi5m1k5m9l5m9m53Vs6Hhv6Hty6Hxz6X116X516YF56YJ66oR86oV964iB642G7I6H7JGK7JKK7ZeQ7ZmS7pqU7puU7p2W7p2X7p6Y7p+Z76Gb76Kc8Kag8Kei8Kul8aum8ayn8a2n8a+q8bCr8bGr8rGs8rKt8rOu8rWw8rax8rey87ey87iz87m087q187q287y39L259MC89MK+9cXB9cbC9sjF9snF9srG9srH9svI9szI9s3K9s7K987L99DM99DN99HO+NbT+NnW+drY+dvY+d3a+d/d+uHf+uPh+uXj++bk++fl++jm++nn++no++rp++vp/Ovq/O3r/O3s/O7t/O/t/O/u/PDv/PHw/fLx/fTz/fT0/fX0/vr6/vv7/vz7//z8//7+////v4mUtQAAACJ0Uk5TAAEmcICwsLGys7OztLW1tba4uLi5uru8vb6/wMDBwsPm9vQJaUIAAAMOSURBVHja7dvpU9NAGAfgpq1nVbwVz3ZVFFYURRGtJ8UT79taxZMiKsUDUDyq4o2iqLViQaH5R82uJGmamjSd3ew48/4+dd/Z6fvMbo72w3o8OfH6A0HMIOM8JUXyhTCboPEl9S/DrIJKEvgwQwCa4Li/N8QUgCY6BfgxWwCa5BAQYA1wKggyB6DJjgCYPQBNEQ1wJOACQFNFA9A00QA0XTSgaAE3AJohGoBmigagWaIBaLZoAJojGlCEgDMAzRUNsBVwB6B5ogE2AhcAaL5ogKXAFQAqFw1A5ZIbgOUWggWSC4AKVIKAJWClFQAtlLgDqpZZChZJvAG40hKAFku8AXiFcwFbAK603oUlEm8ArlpVYXU3LuUOsAsAAAAAAAAAAAAAAAD+L8D2ttQwSV/XxYha23ylf4jkSzJ+fHeNPjccTw//zZMIM0C7rGX02liz63JO0mfXqHMTevUZM0Aqt9nbdbT2TTbk1Rbz3EFmgF+GXq0FarL8ud409x5TwPtoNNr6iXxvdq/W6GlPz4vMWLuEPvddJ8npGqYAuqEbXpNWLRqgjnzadilLXY3a3GbWd4EGwCdIq+dGAMZNdBVernYBUD9Crvl8AI7STWhyCzBoAqz9SkbnXQCc1O5vAwDHyegOf0DdG9Loqhlwhox6uQL6YrFYgq50dp8ZcIiMMmq966iSCGOAnnZsBhyksmrD3IecAB9rCwBOkdGHvLm7eACyNzfiAoAWMuo2zs2GmQJGlRfswKPLjQaUCqimz+hmA2CkjcdtmLcqKoA+IOUjav3ufiVbsXuAPT/o23eTCw+iQoBw9DddgGPYfYDyOk6qv0ySWAAgJ0M7OALSypd25tUyxv4P1GuOXA5R1oDb2g7reZzb/vthrd6hDBtYA3beT91Yn1cL3+qnP75/9nacO1Cr1xu6By7APyMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACUBgu72D3I98llEAlwPvRYRP9djv/YJebkefLaPj+/Rb9uUSXwPv9utv+9fpyxYHf+3vP8CfsP+/wEtLRb0bq9JTwAAAABJRU5ErkJggg==',
        zoom_in: 'data:image/png;base64,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',
        zoom_out: 'data:image/png;base64,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',
        lineWidth: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAE1SURBVHhe7dzBaYVAGEbRKSUVBPU5ugrpM6TObA0PrMJ7DtwOPmYhPw4AAAAAAADgqdZ1/VK3Mee81G28Xq9L3QwgngHEM4B4BhDPAOIZQLxxnuelbmPbtl91uz8IAwAAAAAAAM+zbduPujkIieckLJ4BxDOAeAYQzwDiGUA8A4hnAPEMIJ4BxDOAeAYQzwDiGUA8A4hnAPHGvu+Xur1Pwv7UbRzH8aFu92koAAAAAAAAj7Qsy6e6uQiK5yIonhcgngHEM4B4BhDPAOIZQDwDiGcA8QwgngHEM4B4BhDPAOIZQDwDiGcA8QwgngHEM4B4BhDPAOIZQDwDiGcA8QwgngHEM4B4BhDPAOIZQDwDiGcA8QwgngHEM4B4BhBvzDkvdXu/AN/qdv8uEgAAAAAAAHiYMf4Bq+87SfdLsB0AAAAASUVORK5CYII=',
        colorsPicker: 'data:image/png;base64,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',
        extraOptions: 'data:image/png;base64,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',
        undo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABPxJREFUeNrsnVuIVVUYx9dpQiIdvOBtDGa8RILSQz4koWYvRZeXEkRztJd8ExGkSPBRSxDMB0ESxBBpSnyLMCGJChV6SSURpEkcZia8RjqpmTTT97HXYQYcZ87Za5+z917f7wd/BhT1eNZvfWutvdbeuzI0NOTALk/wFSAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAlBq9LyAkJeY5yWeSmabbz6gA70n6JX9LplkWwNoQME/yleSwZI7ktn6HzAFsoL3+R8kaBv5hnjTS63fR8DYrAL3eaAWg1xuuAPR6oxWAXm+4AtDrjVYA7fWfSNbSlPYqQLXX0/jGKgC93nAFoNcbrQD0esMVgF5vtALQ6w1XAHq90QqQR6//jwpgt9dXJE9LWqwKUAk91lWpVEI/Q4fkY0lnDv9/7f2/Sf5yyfEw/XlLck3SI+mT9PqfA0VswOD2y1mATt/4HQXuJPcl170oFyVnJeckl/zvIUDKsV4b/t2SVs5/Jb9Lzki+l/wg+aOMAuRxKniDL69DEUUrxDE/f5nWbAHKcix8ruTLyBp+tFyW7JY8jwDDrI+w14+Xu5IjkhctCzDPSK8fK/9IDrrkTiRTAmww2OvHii4tt/nrDlELoGP9FzT4Y6Mrh5diFaCTXl9T9KLShzEJMJexPlW6JDPKLsBGfxGEBk2XXyQL8xIgi82gQQchvCA5IVma27XkDIaADiZ+mawSXolhEniFxkydm5KVLANt56pkSQwXgqgG6dMtaY/hUjBzg/TR01ETY9kMWkc1SJW9sW0HUw3qiy6x34lFAOYG6aLf1eyYBGBuUH8OxCYAc4P6omcQl8UoQN5zg0G/M6enex8WXILv3Cj3cYS2XxHuCxh5gGRnrevfjPhT8qo/tTPJZ6pLnh/c7uXU4WqBZLrL/0aatyTHy34qeLxq0NXEXqWneVvH+UwtXoiXJZslR3M883DSJXczRTUEPG6l0Iwv+Ybv2fUyRfKGZJ9L7g9olgB6J9MKCwI0a26QVoCRTJa87ZL7AgaaIMEhKwJUWd/AlUIWAoxkkZ/HXG7wjmGbJQEaWQ2yFqCKHvPa6jd1GiHBRmsCNGpu0CgBqsxyydNL72UswNdWBci6GjRagCp6DPznDAXQW9jnWBUgy7lBswSorhz2ZyjBKusCZFENmilAlS2SBxkIsAcBwncY8xBAWe2G31eUNj/plUkECNthzEsA5U1/KTrkFPFMBAirBnkKoLwuuROwkbWc18Y9ilaBlX5PoejoDSHv++3euvfhXHL7fRCxvjSqx1eC6oMpioxeQv4g5Z99NvhfN/Dm0LFWCnkPASPZk2IY+Jw5QNjcoEgCTJB8W6cA3yBA2EqhSAIoz7j6NpJOI0D6atDnL8jMKNhne81PCmsR4FcESM98l7w+vq2An21HjQJ0I0A4RVwJPSU5VYMAvVwHCKeID7jQQ6qbXPIA67FoidF+SDjvkrME5sofDPOpS84RNKx6IUCx0aFgq1+tUAGMog+WPIAAttFl4ZVRfr2CADbQo+DbEcA2+iTW4whgF73w85HL+OVVCFAuLjh/GNQzIfQvLNLt4VAbrX4o0FfS9Ev7Lc5VACg3DAEIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgApeN/AQYAUjtq/Zx6jVYAAAAASUVORK5CYII='
    };

    var tools = {
        line: true,
        arrow: true,
        pencil: true,
        marker: true,
        dragSingle: true,
        dragMultiple: true,
        eraser: true,
        rectangle: true,
        arc: true,
        bezier: true,
        quadratic: true,
        text: true,
        image: true,
        pdf: true,
        zoom: true,
        lineWidth: true,
        colorsPicker: true,
        extraOptions: true,
        code: true,
        undo: true
    };

    if (params.tools) {
        try {
            var t = JSON.parse(params.tools);
            tools = t;
        } catch (e) {}
    }

    if (tools.code === true) {
        document.querySelector('.preview-panel').style.display = 'block';
    }

    function setSelection(element, prop) {
        endLastPath();
        hideContainers();

        is.set(prop);

        var selected = document.getElementsByClassName('selected-shape')[0];
        if (selected) selected.className = selected.className.replace(/selected-shape/g, '');

        if (!element.className) {
            element.className = '';
        }

        element.className += ' selected-shape';
    }

    /* Default: setting default selected shape!! */
    is.set(window.selectedIcon);

    window.addEventListener('load', function() {
        var toolBox = document.getElementById('tool-box');
        var canvasElements = toolBox.getElementsByTagName('canvas');
        var shape = window.selectedIcon.toLowerCase();


        var firstMatch;
        for (var i = 0; i < canvasElements.length; i++) {
            if (!firstMatch && (canvasElements[i].id || '').indexOf(shape) !== -1) {
                firstMatch = canvasElements[i];
            }
        }
        if (!firstMatch) {
            window.selectedIcon = 'Pencil';
            firstMatch = document.getElementById('pencil-icon');
        }

        setSelection(firstMatch, window.selectedIcon);
    }, false);

    (function() {
        var cache = {};

        var lineCapSelect = find('lineCap-select');
        var lineJoinSelect = find('lineJoin-select');

        function getContext(id) {
            var context = find(id).getContext('2d');
            context.lineWidth = 2;
            context.strokeStyle = '#6c96c8';
            return context;
        }

        function bindEvent(context, shape) {
            if (shape === 'Pencil' || shape === 'Marker') {
                lineCap = lineJoin = 'round';
            }

            addEvent(context.canvas, 'click', function() {
                pdfHandler.pdfPageContainer.style.display = 'none';

                if (textHandler.text.length) {
                    textHandler.appendPoints();
                }

                if (shape === 'Text') {
                    textHandler.onShapeSelected();
                } else {
                    textHandler.onShapeUnSelected();
                }

                if (shape === 'Pencil' || shape === 'Marker') {
                    lineCap = lineJoin = 'round';
                }

                dragHelper.global.startingIndex = 0;

                setSelection(this, shape);

                if (this.id === 'drag-last-path') {
                    find('copy-last').checked = true;
                    find('copy-all').checked = false;
                } else if (this.id === 'drag-all-paths') {
                    find('copy-all').checked = true;
                    find('copy-last').checked = false;
                }

                if (this.id === 'image-icon') {
                    var selector = new FileSelector();
                    selector.accept = 'image/*';
                    selector.selectSingleFile(function(file) {
                        if (!file) return;

                        var reader = new FileReader();
                        reader.onload = function(event) {
                            var image = new Image();
                            image.onload = function() {
                                var index = imageHandler.images.length;

                                imageHandler.lastImageURL = image.src;
                                imageHandler.lastImageIndex = index;

                                imageHandler.images.push(image);
                                imageHandler.load(image.clientWidth, image.clientHeight);
                            };
                            image.style = 'position: absolute; top: -99999999999; left: -999999999;'
                            document.body.appendChild(image);
                            image.src = event.target.result;
                        };
                        reader.readAsDataURL(file);
                    });
                }

                if (this.id === 'pdf-icon') {
                    var selector = new FileSelector();
                    selector.selectSingleFile(function(file) {
                        if (!file) return;

                        function onGettingPdf() {
                            var reader = new FileReader();
                            reader.onload = function(event) {
                                pdfHandler.pdf = null; // to make sure we call "getDocument" again
                                pdfHandler.load(event.target.result);
                            };
                            reader.readAsDataURL(file);
                        }
                        onGettingPdf();
                    }, null, 'application/pdf');
                }

                if (this.id === 'pencil-icon' || this.id === 'eraser-icon' || this.id === 'marker-icon') {
                    cache.lineCap = lineCap;
                    cache.lineJoin = lineJoin;

                    lineCap = lineJoin = 'round';
                } else if (cache.lineCap && cache.lineJoin) {
                    lineCap = cache.lineCap;
                    lineJoin = cache.lineJoin;
                }

                if (this.id === 'eraser-icon') {
                    cache.strokeStyle = strokeStyle;
                    cache.fillStyle = fillStyle;
                    cache.lineWidth = lineWidth;

                    strokeStyle = 'White';
                    fillStyle = 'White';
                    lineWidth = 10;
                } else if (cache.strokeStyle && cache.fillStyle && typeof cache.lineWidth !== 'undefined') {
                    strokeStyle = cache.strokeStyle;
                    fillStyle = cache.fillStyle;
                    lineWidth = cache.lineWidth;
                }
            });
        }

        var toolBox = find('tool-box');
        toolBox.style.height = (innerHeight) + 'px'; // -toolBox.offsetTop - 77

        function decorateDragLastPath() {
            var context = getContext('drag-last-path');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'DragLastPath');
            };
            image.src = data_uris.dragSingle;
        }

        if (tools.dragSingle === true) {
            decorateDragLastPath();
            document.getElementById('drag-last-path').style.display = 'block';
        }

        function decorateDragAllPaths() {
            var context = getContext('drag-all-paths');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'DragAllPaths');
            };
            image.src = data_uris.dragMultiple;
        }

        if (tools.dragMultiple === true) {
            decorateDragAllPaths();
            document.getElementById('drag-all-paths').style.display = 'block';
        }

        function decorateLine() {
            var context = getContext('line');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Line');
            };
            image.src = data_uris.line;
        }

        if (tools.line === true) {
            decorateLine();
            document.getElementById('line').style.display = 'block';
        }

        function decorateUndo() {
            var context = getContext('undo');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);

                document.querySelector('#undo').onclick = function() {
                    if (points.length) {
                        points.length = points.length - 1;
                        drawHelper.redraw();

                        syncPoints(is.isDragAllPaths || is.isDragLastPath ? true : false);
                    }
                };
            };
            image.src = data_uris.undo;
        }

        if (tools.undo === true) {
            decorateUndo();
            document.getElementById('undo').style.display = 'block';
        }

        function decorateArrow() {
            var context = getContext('arrow');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Arrow');
            };
            image.src = data_uris.arrow;
        }

        if (tools.arrow === true) {
            decorateArrow();
            document.getElementById('arrow').style.display = 'block';
        }

        function decoreZoomUp() {
            var context = getContext('zoom-up');
            // zoomHandler.icons.up(context);
            addEvent(context.canvas, 'click', function() {
                zoomHandler.up();
            });

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
            };
            image.src = data_uris.zoom_in;
        }

        function decoreZoomDown() {
            var context = getContext('zoom-down');
            // zoomHandler.icons.down(context);
            addEvent(context.canvas, 'click', function() {
                zoomHandler.down();
            });

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
            };
            image.src = data_uris.zoom_out;
        }

        if (tools.zoom === true) {
            decoreZoomUp();
            decoreZoomDown();

            document.getElementById('zoom-up').style.display = 'block';
            document.getElementById('zoom-down').style.display = 'block';
        }

        function decoratePencil() {

            function hexToRGBA(h, alpha) {
                return 'rgba(' + hexToRGB(h).join(',') + ',1)';
            }

            var colors = [
                ['FFFFFF', '006600', '000099', 'CC0000', '8C4600'],
                ['CCCCCC', '00CC00', '6633CC', 'FF0000', 'B28500'],
                ['666666', '66FFB2', '006DD9', 'FF7373', 'FF9933'],
                ['333333', '26FF26', '6699FF', 'CC33FF', 'FFCC99'],
                ['000000', 'CCFF99', 'BFDFFF', 'FFBFBF', 'FFFF33']
            ];

            var context = getContext('pencil-icon');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Pencil');
            };
            image.src = data_uris.pencil;

            var pencilContainer = find('pencil-container'),
                pencilColorContainer = find('pencil-fill-colors'),
                strokeStyleText = find('pencil-stroke-style'),
                pencilColorsList = find("pencil-colors-list"),
                fillStyleText = find('pencil-fill-style'),
                pencilSelectedColor = find('pencil-selected-color'),
                pencilSelectedColor2 = find('pencil-selected-color-2'),
                btnPencilDone = find('pencil-done'),
                canvas = context.canvas,
                alpha = 0.2;

            // START INIT PENCIL



            pencilStrokeStyle = hexToRGBA(fillStyleText.value, alpha)

            pencilSelectedColor.style.backgroundColor =
                pencilSelectedColor2.style.backgroundColor = '#' + fillStyleText.value;

            colors.forEach(function(colorRow) {
                var row = '<tr>';

                colorRow.forEach(function(color) {
                    row += '<td style="background-color:#' + color + '" data-color="' + color + '"></td>';
                })
                row += '</tr>';

                pencilColorsList.innerHTML += row;
            })

            Array.prototype.slice.call(pencilColorsList.getElementsByTagName('td')).forEach(function(td) {
                addEvent(td, 'mouseover', function() {
                    var elColor = td.getAttribute('data-color');
                    pencilSelectedColor2.style.backgroundColor = '#' + elColor;
                    fillStyleText.value = elColor
                });

                addEvent(td, 'click', function() {
                    var elColor = td.getAttribute('data-color');
                    pencilSelectedColor.style.backgroundColor =
                        pencilSelectedColor2.style.backgroundColor = '#' + elColor;

                    fillStyleText.value = elColor;


                    pencilColorContainer.style.display = 'none';
                });
            })

            // END INIT PENCIL

            addEvent(canvas, 'click', function() {
                hideContainers();

                pencilContainer.style.display = 'block';
                pencilContainer.style.top = (canvas.offsetTop + 1) + 'px';
                pencilContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';

                fillStyleText.focus();
            });

            addEvent(btnPencilDone, 'click', function() {
                pencilContainer.style.display = 'none';
                pencilColorContainer.style.display = 'none';

                pencilLineWidth = strokeStyleText.value;
                pencilStrokeStyle = hexToRGBA(fillStyleText.value, alpha);
            });

            addEvent(pencilSelectedColor, 'click', function() {
                pencilColorContainer.style.display = 'block';
            });
        }

        if (tools.pencil === true) {
            decoratePencil();
            document.getElementById('pencil-icon').style.display = 'block';
        }

        function decorateMarker() {

            function hexToRGBA(h, alpha) {
                return 'rgba(' + hexToRGB(h).join(',') + ',' + alpha + ')';
            }
            var colors = [
                ['FFFFFF', '006600', '000099', 'CC0000', '8C4600'],
                ['CCCCCC', '00CC00', '6633CC', 'FF0000', 'B28500'],
                ['666666', '66FFB2', '006DD9', 'FF7373', 'FF9933'],
                ['333333', '26FF26', '6699FF', 'CC33FF', 'FFCC99'],
                ['000000', 'CCFF99', 'BFDFFF', 'FFBFBF', 'FFFF33']
            ];

            var context = getContext('marker-icon');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Marker');
            };
            image.src = data_uris.marker;

            var markerContainer = find('marker-container'),
                markerColorContainer = find('marker-fill-colors'),
                strokeStyleText = find('marker-stroke-style'),
                markerColorsList = find("marker-colors-list"),
                fillStyleText = find('marker-fill-style'),
                markerSelectedColor = find('marker-selected-color'),
                markerSelectedColor2 = find('marker-selected-color-2'),
                btnMarkerDone = find('marker-done'),
                canvas = context.canvas,
                alpha = 0.2;

            // START INIT MARKER



            markerStrokeStyle = hexToRGBA(fillStyleText.value, alpha)

            markerSelectedColor.style.backgroundColor =
                markerSelectedColor2.style.backgroundColor = '#' + fillStyleText.value;

            colors.forEach(function(colorRow) {
                var row = '<tr>';

                colorRow.forEach(function(color) {
                    row += '<td style="background-color:#' + color + '" data-color="' + color + '"></td>';
                })
                row += '</tr>';

                markerColorsList.innerHTML += row;
            })

            Array.prototype.slice.call(markerColorsList.getElementsByTagName('td')).forEach(function(td) {
                addEvent(td, 'mouseover', function() {
                    var elColor = td.getAttribute('data-color');
                    markerSelectedColor2.style.backgroundColor = '#' + elColor;
                    fillStyleText.value = elColor
                });

                addEvent(td, 'click', function() {
                    var elColor = td.getAttribute('data-color');
                    markerSelectedColor.style.backgroundColor =
                        markerSelectedColor2.style.backgroundColor = '#' + elColor;

                    fillStyleText.value = elColor;


                    markerColorContainer.style.display = 'none';
                });
            })

            // END INIT MARKER

            addEvent(canvas, 'click', function() {
                hideContainers();

                markerContainer.style.display = 'block';
                markerContainer.style.top = (canvas.offsetTop + 1) + 'px';
                markerContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';

                fillStyleText.focus();
            });

            addEvent(btnMarkerDone, 'click', function() {
                markerContainer.style.display = 'none';
                markerColorContainer.style.display = 'none';

                markerLineWidth = strokeStyleText.value;
                markerStrokeStyle = hexToRGBA(fillStyleText.value, alpha);
            });

            addEvent(markerSelectedColor, 'click', function() {
                markerColorContainer.style.display = 'block';
            });
        }

        if (tools.marker === true) {
            decorateMarker();
            document.getElementById('marker-icon').style.display = 'block';
        }

        function decorateEraser() {
            var context = getContext('eraser-icon');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Eraser');
            };
            image.src = data_uris.eraser;
        }

        if (tools.eraser === true) {
            decorateEraser();
            document.getElementById('eraser-icon').style.display = 'block';
        }

        function decorateText() {
            var context = getContext('text-icon');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Text');
            };
            image.src = data_uris.text;
        }

        if (tools.text === true) {
            decorateText();
            document.getElementById('text-icon').style.display = 'block';
        }

        function decorateImage() {
            var context = getContext('image-icon');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Image');
            };
            image.src = data_uris.image;
        }

        if (tools.image === true) {
            decorateImage();
            document.getElementById('image-icon').style.display = 'block';
        }


        function decoratePDF() {
            var context = getContext('pdf-icon');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Pdf');
            };
            image.src = data_uris.pdf;
        }

        if (tools.pdf === true) {
            decoratePDF();
            document.getElementById('pdf-icon').style.display = 'block';
        }

        function decorateArc() {
            var context = getContext('arc');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Arc');
            };
            image.src = data_uris.arc;
        }

        if (tools.arc === true) {
            decorateArc();
            document.getElementById('arc').style.display = 'block';
        }

        function decorateRect() {
            var context = getContext('rectangle');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Rectangle');
            };
            image.src = data_uris.rectangle;
        }

        if (tools.rectangle === true) {
            decorateRect();
            document.getElementById('rectangle').style.display = 'block';
        }

        function decorateQuadratic() {
            var context = getContext('quadratic-curve');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'QuadraticCurve');
            };
            image.src = data_uris.quadratic;
        }

        if (tools.quadratic === true) {
            decorateQuadratic();
            document.getElementById('quadratic-curve').style.display = 'block';
        }

        function decorateBezier() {
            var context = getContext('bezier-curve');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Bezier');
            };
            image.src = data_uris.bezier;
        }

        if (tools.bezier === true) {
            decorateBezier();
            document.getElementById('bezier-curve').style.display = 'block';
        }

        function tempStrokeTheLine(context, width, mx, my, lx, ly) {
            context.beginPath();
            context.lineWidth = width;
            context.moveTo(mx, my);
            context.lineTo(lx, ly);
            context.stroke();
        }

        function decorateLineWidth() {
            var context = getContext('line-width');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
            };
            image.src = data_uris.lineWidth;

            var lineWidthContainer = find('line-width-container'),
                lineWidthText = find('line-width-text'),
                btnLineWidthDone = find('line-width-done'),
                h1 = document.getElementsByTagName('h1')[0],
                canvas = context.canvas;

            addEvent(canvas, 'click', function() {
                hideContainers();

                lineWidthContainer.style.display = 'block';
                lineWidthContainer.style.top = (canvas.offsetTop + 1) + 'px';
                lineWidthContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';

                lineWidthText.focus();
            });

            addEvent(btnLineWidthDone, 'click', function() {
                lineWidthContainer.style.display = 'none';
                lineWidth = lineWidthText.value;
            });
        }

        if (tools.lineWidth === true) {
            decorateLineWidth();
            document.getElementById('line-width').style.display = 'block';
        }

        function decorateColors() {
            var context = getContext('colors');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
            };
            image.src = data_uris.colorsPicker;

            var colorsContainer = find('colors-container'),
                strokeStyleText = find('stroke-style'),
                fillStyleText = find('fill-style'),
                btnColorsDone = find('colors-done'),
                h1 = document.getElementsByTagName('h1')[0],
                canvas = context.canvas;

            addEvent(canvas, 'click', function() {
                hideContainers();

                colorsContainer.style.display = 'block';
                colorsContainer.style.top = (canvas.offsetTop + 1) + 'px';
                colorsContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';

                strokeStyleText.focus();
            });

            addEvent(btnColorsDone, 'click', function() {
                colorsContainer.style.display = 'none';
                strokeStyle = strokeStyleText.value;
                fillStyle = fillStyleText.value;
            });
        }

        if (tools.colorsPicker === true) {
            decorateColors();
            document.getElementById('colors').style.display = 'block';
        }

        function decorateAdditionalOptions() {
            var context = getContext('additional');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
            };
            image.src = data_uris.extraOptions;

            var additionalContainer = find('additional-container'),
                btnAdditionalClose = find('additional-close'),
                h1 = document.getElementsByTagName('h1')[0],
                canvas = context.canvas,
                globalAlphaSelect = find('globalAlpha-select'),
                globalCompositeOperationSelect = find('globalCompositeOperation-select');

            addEvent(canvas, 'click', function() {
                hideContainers();

                additionalContainer.style.display = 'block';
                additionalContainer.style.top = (canvas.offsetTop + 1) + 'px';
                additionalContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';
            });

            addEvent(btnAdditionalClose, 'click', function() {
                additionalContainer.style.display = 'none';

                globalAlpha = globalAlphaSelect.value;
                globalCompositeOperation = globalCompositeOperationSelect.value;
                lineCap = lineCapSelect.value;
                lineJoin = lineJoinSelect.value;
            });
        }

        if (tools.extraOptions === true) {
            decorateAdditionalOptions();
            document.getElementById('additional').style.display = 'block';
        }

        var designPreview = find('design-preview'),
            codePreview = find('code-preview');

        // todo: use this function in share-drawings.js
        // to sync buttons' states
        window.selectBtn = function(btn, isSkipWebRTCMessage) {
            codePreview.className = designPreview.className = '';

            if (btn == designPreview) designPreview.className = 'preview-selected';
            else codePreview.className = 'preview-selected';

            if (!isSkipWebRTCMessage && window.connection && connection.numberOfConnectedUsers >= 1) {
                connection.send({
                    btnSelected: btn.id
                });
            } else {
                // to sync buttons' UI-states
                if (btn == designPreview) btnDesignerPreviewClicked();
                else btnCodePreviewClicked();
            }
        };

        addEvent(designPreview, 'click', function() {
            selectBtn(designPreview);
            btnDesignerPreviewClicked();
        });

        function btnDesignerPreviewClicked() {
            codeText.parentNode.style.display = 'none';
            optionsContainer.style.display = 'none';

            hideContainers();
            endLastPath();
        }

        addEvent(codePreview, 'click', function() {
            selectBtn(codePreview);
            btnCodePreviewClicked();
        });

        function btnCodePreviewClicked() {
            codeText.parentNode.style.display = 'block';
            optionsContainer.style.display = 'block';

            codeText.focus();
            common.updateTextArea();

            setHeightForCodeAndOptionsContainer();

            hideContainers();
            endLastPath();
        }

        var codeText = find('code-text'),
            optionsContainer = find('options-container');

        function setHeightForCodeAndOptionsContainer() {
            codeText.style.width = (innerWidth - optionsContainer.clientWidth - 30) + 'px';
            codeText.style.height = (innerHeight - 40) + 'px';

            codeText.style.marginLeft = (optionsContainer.clientWidth) + 'px';
            optionsContainer.style.height = (innerHeight) + 'px';
        }

        var isAbsolute = find('is-absolute-points'),
            isShorten = find('is-shorten-code');

        addEvent(isShorten, 'change', common.updateTextArea);
        addEvent(isAbsolute, 'change', common.updateTextArea);
    })();

    function hideContainers() {
        var additionalContainer = find('additional-container'),
            colorsContainer = find('colors-container'),
            markerContainer = find('marker-container'),
            markerColorContainer = find('marker-fill-colors'),
            pencilContainer = find('pencil-container'),
            pencilColorContainer = find('pencil-fill-colors'),
            lineWidthContainer = find('line-width-container');

        additionalContainer.style.display =
            colorsContainer.style.display =
            markerColorContainer.style.display =
            markerContainer.style.display =
            pencilColorContainer.style.display =
            pencilContainer.style.display =
            lineWidthContainer.style.display = 'none';
    }

    var canvas = tempContext.canvas,
        isTouch = 'createTouch' in document;

    addEvent(canvas, isTouch ? 'touchstart mousedown' : 'mousedown', function(e) {
        if (isTouch) e = e.pageX ? e : e.touches.length ? e.touches[0] : {
            pageX: 0,
            pageY: 0
        };

        var cache = is;

        if (cache.isLine) lineHandler.mousedown(e);
        else if (cache.isArc) arcHandler.mousedown(e);
        else if (cache.isRectangle) rectHandler.mousedown(e);
        else if (cache.isQuadraticCurve) quadraticHandler.mousedown(e);
        else if (cache.isBezierCurve) bezierHandler.mousedown(e);
        else if (cache.isDragLastPath || cache.isDragAllPaths) dragHelper.mousedown(e);
        else if (cache.isPencil) pencilHandler.mousedown(e);
        else if (cache.isEraser) eraserHandler.mousedown(e);
        else if (cache.isText) textHandler.mousedown(e);
        else if (cache.isImage) imageHandler.mousedown(e);
        else if (cache.isPdf) pdfHandler.mousedown(e);
        else if (cache.isArrow) arrowHandler.mousedown(e);
        else if (cache.isMarker) markerHandler.mousedown(e);

        !cache.isPdf && drawHelper.redraw();

        preventStopEvent(e);
    });

    function preventStopEvent(e) {
        if (!e) {
            return;
        }

        if (typeof e.preventDefault === 'function') {
            e.preventDefault();
        }

        if (typeof e.stopPropagation === 'function') {
            e.stopPropagation();
        }
    }

    addEvent(canvas, isTouch ? 'touchend touchcancel mouseup' : 'mouseup', function(e) {
        if (isTouch && (!e || !('pageX' in e))) {
            if (e && e.touches && e.touches.length) {
                e = e.touches[0];
            } else if (e && e.changedTouches && e.changedTouches.length) {
                e = e.changedTouches[0];
            } else {
                e = {
                    pageX: 0,
                    pageY: 0
                }
            }
        }

        var cache = is;

        if (cache.isLine) lineHandler.mouseup(e);
        else if (cache.isArc) arcHandler.mouseup(e);
        else if (cache.isRectangle) rectHandler.mouseup(e);
        else if (cache.isQuadraticCurve) quadraticHandler.mouseup(e);
        else if (cache.isBezierCurve) bezierHandler.mouseup(e);
        else if (cache.isDragLastPath || cache.isDragAllPaths) dragHelper.mouseup(e);
        else if (cache.isPencil) pencilHandler.mouseup(e);
        else if (cache.isEraser) eraserHandler.mouseup(e);
        else if (cache.isText) textHandler.mouseup(e);
        else if (cache.isImage) imageHandler.mouseup(e);
        else if (cache.isPdf) pdfHandler.mousedown(e);
        else if (cache.isArrow) arrowHandler.mouseup(e);
        else if (cache.isMarker) markerHandler.mouseup(e);

        !cache.isPdf && drawHelper.redraw();

        syncPoints(is.isDragAllPaths || is.isDragLastPath ? true : false);

        preventStopEvent(e);
    });

    addEvent(canvas, isTouch ? 'touchmove mousemove' : 'mousemove', function(e) {
        if (isTouch) e = e.pageX ? e : e.touches.length ? e.touches[0] : {
            pageX: 0,
            pageY: 0
        };

        var cache = is;

        if (cache.isLine) lineHandler.mousemove(e);
        else if (cache.isArc) arcHandler.mousemove(e);
        else if (cache.isRectangle) rectHandler.mousemove(e);
        else if (cache.isQuadraticCurve) quadraticHandler.mousemove(e);
        else if (cache.isBezierCurve) bezierHandler.mousemove(e);
        else if (cache.isDragLastPath || cache.isDragAllPaths) dragHelper.mousemove(e);
        else if (cache.isPencil) pencilHandler.mousemove(e);
        else if (cache.isEraser) eraserHandler.mousemove(e);
        else if (cache.isText) textHandler.mousemove(e);
        else if (cache.isImage) imageHandler.mousemove(e);
        else if (cache.isPdf) pdfHandler.mousedown(e);
        else if (cache.isArrow) arrowHandler.mousemove(e);
        else if (cache.isMarker) markerHandler.mousemove(e);

        preventStopEvent(e);
    });

    var keyCode;

    function onkeydown(e) {
        keyCode = e.which || e.keyCode || 0;

        if (keyCode == 8 || keyCode == 46) {
            if (isBackKey(e, keyCode)) {
                // back key pressed
            }
            return;
        }

        if (e.metaKey) {
            isControlKeyPressed = true;
            keyCode = 17;
        }

        if (!isControlKeyPressed && keyCode === 17) {
            isControlKeyPressed = true;
        }
    }

    function isBackKey(e, keyCode) {
        var doPrevent = false;
        var d = e.srcElement || e.target;
        if ((d.tagName.toUpperCase() === 'INPUT' &&
                (
                    d.type.toUpperCase() === 'TEXT' ||
                    d.type.toUpperCase() === 'PASSWORD' ||
                    d.type.toUpperCase() === 'FILE' ||
                    d.type.toUpperCase() === 'SEARCH' ||
                    d.type.toUpperCase() === 'EMAIL' ||
                    d.type.toUpperCase() === 'NUMBER' ||
                    d.type.toUpperCase() === 'DATE')
            ) ||
            d.tagName.toUpperCase() === 'TEXTAREA') {
            doPrevent = d.readOnly || d.disabled;
        } else {
            doPrevent = true;
        }

        if (doPrevent) {
            e.preventDefault();
        }
        return doPrevent;
    }

    addEvent(document, 'keydown', onkeydown);

    function onkeyup(e) {
        if (e.which == null && (e.charCode != null || e.keyCode != null)) {
            e.which = e.charCode != null ? e.charCode : e.keyCode;
        }

        keyCode = e.which || e.keyCode || 0;

        if (keyCode === 13 && is.isText) {
            textHandler.onReturnKeyPressed();
            return;
        }

        if (keyCode == 8 || keyCode == 46) {
            if (isBackKey(e, keyCode)) {
                textHandler.writeText(textHandler.lastKeyPress, true);
            }
            return;
        }

        // Ctrl + t
        if (isControlKeyPressed && keyCode === 84 && is.isText) {
            textHandler.showTextTools();
            return;
        }

        // Ctrl + z
        if (isControlKeyPressed && keyCode === 90) {
            if (points.length) {
                points.length = points.length - 1;
                drawHelper.redraw();

                syncPoints(is.isDragAllPaths || is.isDragLastPath ? true : false);
            }
        }

        // Ctrl + a
        if (isControlKeyPressed && keyCode === 65) {
            dragHelper.global.startingIndex = 0;

            endLastPath();

            setSelection(find('drag-all-paths'), 'DragAllPaths');
        }

        // Ctrl + c
        if (isControlKeyPressed && keyCode === 67 && points.length) {
            copy();
        }

        // Ctrl + v
        if (isControlKeyPressed && keyCode === 86 && copiedStuff.length) {
            paste();

            syncPoints(is.isDragAllPaths || is.isDragLastPath ? true : false);
        }

        // Ending the Control Key
        if (typeof e.metaKey !== 'undefined' && e.metaKey === false) {
            isControlKeyPressed = false;
            keyCode = 17;
        }

        if (keyCode === 17) {
            isControlKeyPressed = false;
        }
    }

    addEvent(document, 'keyup', onkeyup);

    function onkeypress(e) {
        if (e.which == null && (e.charCode != null || e.keyCode != null)) {
            e.which = e.charCode != null ? e.charCode : e.keyCode;
        }

        keyCode = e.which || e.keyCode || 0;

        var inp = String.fromCharCode(keyCode);
        if (/[a-zA-Z0-9-_ !?|\/'",.=:;(){}\[\]`~@#$%^&*+-]/.test(inp)) {
            textHandler.writeText(String.fromCharCode(keyCode));
        }
    }

    addEvent(document, 'keypress', onkeypress);

    function onTextFromClipboard(e) {
        if (!is.isText) return;
        var pastedText = undefined;
        if (window.clipboardData && window.clipboardData.getData) { // IE
            pastedText = window.clipboardData.getData('Text');
        } else if (e.clipboardData && e.clipboardData.getData) {
            pastedText = e.clipboardData.getData('text/plain');
        }
        if (pastedText && pastedText.length) {
            textHandler.writeText(pastedText);
        }
    }

    addEvent(document, 'paste', onTextFromClipboard);

    // scripts on this page directly touches DOM-elements
    // removing or altering anything may cause failures in the UI event handlers
    // it is used only to bring collaboration for canvas-surface
    var lastPointIndex = 0;

    var uid;

    window.addEventListener('message', function(event) {
        if (!event.data) return;

        if (!uid) {
            uid = event.data.uid;
        }

        if (event.data.captureStream) {
            webrtcHandler.createOffer(function(sdp) {
                sdp.uid = uid;
                window.parent.postMessage(sdp, '*');
            });
            return;
        }

        if (event.data.sdp) {
            webrtcHandler.setRemoteDescription(event.data);
            return;
        }

        if (event.data.genDataURL) {
            var dataURL = context.canvas.toDataURL(event.data.format, 1);
            window.parent.postMessage({
                dataURL: dataURL,
                uid: uid
            }, '*');
            return;
        }

        if (event.data.undo && points.length) {
            var index = event.data.index;

            if (index === 'all') {
                points = [];
                drawHelper.redraw();
                syncPoints(true);
                return;
            }

            if (index.numberOfLastShapes) {
                try {
                    points.length -= index.numberOfLastShapes;
                } catch (e) {
                    points = [];
                }

                drawHelper.redraw();
                syncPoints(true);
                return;
            }

            if (index === -1) {
                points.length = points.length - 1;
                drawHelper.redraw();
                syncPoints(true);
                return;
            }

            if (points[index]) {
                var newPoints = [];
                for (var i = 0; i < points.length; i++) {
                    if (i !== index) {
                        newPoints.push(points[i]);
                    }
                }
                points = newPoints;
                drawHelper.redraw();
                syncPoints(true);
            }
            return;
        }

        if (event.data.syncPoints) {
            syncPoints(true);
            return;
        }

        if (!event.data.canvasDesignerSyncData) return;

        // drawing is shared here (array of points)
        var d = event.data.canvasDesignerSyncData;

        if (d.startIndex !== 0) {
            for (var i = 0; i < d.points.length; i++) {
                points[i + d.startIndex] = d.points[i];
            }
        } else {
            points = d.points;
        }

        lastPointIndex = points.length;

        // redraw the <canvas> surfaces
        drawHelper.redraw();
    }, false);

    function syncPoints(isSyncAll) {
        if (isSyncAll) {
            lastPointIndex = 0;
        }

        if (lastPointIndex == points.length) return;

        var pointsToShare = [];
        for (var i = lastPointIndex; i < points.length; i++) {
            pointsToShare[i - lastPointIndex] = points[i];
        }

        if (pointsToShare.length) {
            syncData({
                points: pointsToShare || [],
                startIndex: lastPointIndex
            });
        }

        if (!pointsToShare.length && points.length) return;

        lastPointIndex = points.length;
    }

    function syncData(data) {
        window.parent.postMessage({
            canvasDesignerSyncData: data,
            uid: uid
        }, '*');
    }

    var webrtcHandler = {
        createOffer: function(callback) {
            var captureStream = document.getElementById('main-canvas').captureStream(15);

            var peer = this.getPeer();
            if ('addStream' in peer) {
                peer.addStream(captureStream);
            } else {
                peer.addTrack(captureStream.getVideoTracks()[0], captureStream);
            }

            peer.onicecandidate = function(event) {
                if (!event || !!event.candidate) {
                    return;
                }

                callback({
                    sdp: peer.localDescription.sdp,
                    type: peer.localDescription.type
                });
            };
            peer.createOffer({
                OfferToReceiveAudio: false,
                OfferToReceiveVideo: false
            }).then(function(sdp) {
                peer.setLocalDescription(sdp);
            });
        },
        setRemoteDescription: function(sdp) {
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
        },
        createAnswer: function(sdp, callback) {
            var peer = this.getPeer();
            peer.onicecandidate = function(event) {
                if (!event || !!event.candidate) {
                    return;
                }

                callback({
                    sdp: peer.localDescription.sdp,
                    type: peer.localDescription.type
                });
            };
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp)).then(function() {
                peer.createAnswer({
                    OfferToReceiveAudio: false,
                    OfferToReceiveVideo: true
                }).then(function(sdp) {
                    peer.setLocalDescription(sdp);
                });
            });

            if ('onaddstream' in peer) {
                peer.onaddstream = function(event) {
                    callback({
                        stream: event.stream
                    });
                };
            } else {
                peer.onaddtrack = function(event) {
                    callback({
                        stream: event.streams[0]
                    });
                };
            }
        },
        getPeer: function() {
            var WebRTC_Native_Peer = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
            var peer = new WebRTC_Native_Peer(null);
            this.peer = peer;
            return peer;
        }
    };

})();
