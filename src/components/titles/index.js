'use strict';

var d3 = require('@plotly/d3');
var isNumeric = require('fast-isnumeric');

var Plots = require('../../plots/plots');
var Registry = require('../../registry');
var Lib = require('../../lib');
var strTranslate = Lib.strTranslate;
var Drawing = require('../drawing');
var Color = require('../color');
var svgTextUtils = require('../../lib/svg_text_utils');
var interactConstants = require('../../constants/interactions');

var OPPOSITE_SIDE = require('../../constants/alignment').OPPOSITE_SIDE;
var numStripRE = / [XY][0-9]* /;

/**
 * Titles - (re)draw titles on the axes and plot:
 * @param {DOM element} gd - the graphDiv
 * @param {string} titleClass - the css class of this title
 * @param {object} options - how and what to draw
 *      propContainer - the layout object containing `title` and `titlefont`
 *          attributes that apply to this title
 *      propName - the full name of the title property (for Plotly.relayout)
 *      [traceIndex] - include only if this property applies to one trace
 *          (such as a colorbar title) - then editing pipes to Plotly.restyle
 *          instead of Plotly.relayout
 *      placeholder - placeholder text for an empty editable title
 *      [avoid] {object} - include if this title should move to avoid other elements
 *          selection - d3 selection of elements to avoid
 *          side - which direction to move if there is a conflict
 *          [offsetLeft] - if these elements are subject to a translation
 *              wrt the title element
 *          [offsetTop]
 *      attributes {object} - position and alignment attributes
 *          x - pixels
 *          y - pixels
 *          text-anchor - start|middle|end
 *      transform {object} - how to transform the title after positioning
 *          rotate - degrees
 *          offset - shift up/down in the rotated frame (unused?)
 *      containerGroup - if an svg <g> element already exists to hold this
 *          title, include here. Otherwise it will go in fullLayout._infolayer
 *      _meta {object (optional} - meta key-value to for title with
 *          Lib.templateString, default to fullLayout._meta, if not provided
 *
 *  @return {selection} d3 selection of title container group
 */
function draw(gd, titleClass, options) {
    var cont = options.propContainer;
    var prop = options.propName;
    var placeholder = options.placeholder;
    var traceIndex = options.traceIndex;
    var avoid = options.avoid || {};
    var attributes = options.attributes;
    var transform = options.transform;
    var group = options.containerGroup;

    var fullLayout = gd._fullLayout;

    var opacity = 1;
    var isplaceholder = false;
    var title = cont.title;
    var txt = (title && title.text ? title.text : '').trim();

    var font = title && title.font ? title.font : {};
    var fontFamily = font.family;
    var fontSize = font.size;
    var fontColor = font.color;

    // only make this title editable if we positively identify its property
    // as one that has editing enabled.
    var editAttr;
    if(prop === 'title.text') editAttr = 'titleText';
    else if(prop.indexOf('axis') !== -1) editAttr = 'axisTitleText';
    else if(prop.indexOf('colorbar' !== -1)) editAttr = 'colorbarTitleText';
    var editable = gd._context.edits[editAttr];

    if(txt === '') opacity = 0;
    // look for placeholder text while stripping out numbers from eg X2, Y3
    // this is just for backward compatibility with the old version that had
    // "Click to enter X2 title" and may have gotten saved in some old plots,
    // we don't want this to show up when these are displayed.
    else if(txt.replace(numStripRE, ' % ') === placeholder.replace(numStripRE, ' % ')) {
        opacity = 0.2;
        isplaceholder = true;
        if(!editable) txt = '';
    }

    if(options._meta) {
        txt = Lib.templateString(txt, options._meta);
    } else if(fullLayout._meta) {
        txt = Lib.templateString(txt, fullLayout._meta);
    }

    var elShouldExist = txt || editable;

    if (!group) {
        group = Lib.ensureSingle(
          fullLayout._infolayer,
          "g",
          "g-" + titleClass
        );
        var group_xboth = Lib.ensureSingle(
          fullLayout._infolayer,
          "g",
          "g-" + "xtitleboth"
        );

        var group_yboth = Lib.ensureSingle(
          fullLayout._infolayer,
          "g",
          "g-" + "ytitleboth"
        );
      }

      //Inpixon customisation - show axis title property
            //Previous code which shows Main title and X&Y title
            // var el = group.selectAll('text')
            //         .data(elShouldExist ? [0] : []);
            //     el.enter().append('text');
            //     el.text(txt)
            //         // this is hacky, but convertToTspans uses the class
            //         // to determine whether to rotate mathJax...
            //         // so we need to clear out any old class and put the
            //         // correct one (only relevant for colorbars, at least
            //         // for now) - ie don't use .classed
            //         .attr('class', titleClass);
            //     el.exit().remove();

            //Inpixon customisation - show axis title property
            var el = group.selectAll("text").data(elShouldExist ? [0] : []);
            el.enter().append("text");
            var xaxisSide = (gd.layout && gd.layout.xaxis && gd.layout.xaxis.side)
            var xtitleTop = (gd.layout && gd.layout.legend && gd.layout.legend.inpixonCustomAttribute && gd.layout.legend.inpixonCustomAttribute.xtitletop)
            var xtitleBottom = (gd.layout && gd.layout.legend && gd.layout.legend.inpixonCustomAttribute && gd.layout.legend.inpixonCustomAttribute.xtitlebottom)
            
            var yaxisSide = (gd.layout && gd.layout.yaxis && gd.layout.yaxis.side)
            var ytitleLeft = (gd.layout && gd.layout.legend && gd.layout.legend.inpixonCustomAttribute && gd.layout.legend.inpixonCustomAttribute.ytitleleft)
            var ytitleRight = (gd.layout && gd.layout.legend && gd.layout.legend.inpixonCustomAttribute && gd.layout.legend.inpixonCustomAttribute.ytitleright)

            
            if (titleClass == "gtitle") {
              el.text(txt).attr("class", "gtitle");
              el.exit().remove();
            }

            if (titleClass === "xtitle") {
              if ((xtitleTop === false && xaxisSide === "top") ||
                  (xtitleBottom === false && xaxisSide === "bottom") ||
                  (xtitleBottom === false && xaxisSide === "both") ||
                  (xaxisSide === "")
              ) {
                //top
                el.text("").attr("class", "xtitle");
                el.exit().remove();
              } else {
                el.text(txt).attr("class", "xtitle");
                el.exit().remove();
              }
            }
            if (titleClass === "ytitle") {
              if (
                (ytitleRight === false && yaxisSide === "right") ||
                (ytitleLeft === false && yaxisSide === "left") ||
                (ytitleLeft === false && yaxisSide === "both") ||
                (yaxisSide === "")
              ) {
                el.text("").attr("class", "ytitle");
                el.exit().remove();
              } else {
                el.text(txt).attr("class", "ytitle");
                el.exit().remove();
              }
            }
            if (titleClass === "polartitle") {
              if (
                ((gd.layout && gd.layout.legend && gd.layout.legend.inpixonCustomAttribute && gd.layout.legend.inpixonCustomAttribute.radartitleclockwise) === false &&
                  (gd.layout && gd.layout.polar && gd.layout.polar.radialaxis && gd.layout.polar.radialaxis.side) === "clockwise") ||
                ((gd.layout && gd.layout.legend && gd.layout.legend.inpixonCustomAttribute && gd.layout.legend.inpixonCustomAttribute.radartitlecounterclockwise)  === false &&
                (gd.layout && gd.layout.polar && gd.layout.polar.radialaxis && gd.layout.polar.radialaxis.side) === "counterclockwise")
              ) {
                el.text("").attr("class", "polartitle");
                el.exit().remove();
              } else {
                el.text(txt).attr("class", "polartitle");
                el.exit().remove();
              }
            }
            if (titleClass === "atitle") {
              if (
                (gd.layout && gd.layout.legend && gd.layout.legend.inpixonCustomAttribute && gd.layout.legend.inpixonCustomAttribute.disableternaryatitle) ===
                true
              ) {
                el.text(txt).attr("class", "atitle");
                el.exit().remove();
              } else {
                el.text("").attr("class", "atitle");
                el.exit().remove();
              }
            }
            if (titleClass === "btitle") {
              if (
                (gd.layout && gd.layout.legend && gd.layout.legend.inpixonCustomAttribute && gd.layout.legend.inpixonCustomAttribute.disableternarybtitle) ===
                true
              ) {
                el.text(txt).attr("class", "btitle");
                el.exit().remove();
              } else {
                el.text("").attr("class", "btitle");
                el.exit().remove();
              }
            }
            if (titleClass === "ctitle") {
              if (
                (gd.layout && gd.layout.legend && gd.layout.legend.inpixonCustomAttribute && gd.layout.legend.inpixonCustomAttribute.disableternaryctitle) ===
                true
              ) {
                el.text(txt).attr("class", "ctitle");
                el.exit().remove();
              } else {
                el.text("").attr("class", "ctitle");
                el.exit().remove();
              }
            }


            if (!elShouldExist) return group;
            if (!elShouldExist) return group_xboth;
            if(!elShouldExist) return group_yboth;

    function titleLayout(titleEl) {
        Lib.syncOrAsync([drawTitle, scootTitle], titleEl);
    }

    function drawTitle(titleEl) {
        var transformVal;

        if(transform) {
            transformVal = '';
            if(transform.rotate) {
                transformVal += 'rotate(' + [transform.rotate, attributes.x, attributes.y] + ')';
            }
            if(transform.offset) {
                transformVal += strTranslate(0, transform.offset);
            }
        } else {
            transformVal = null;
        }

        titleEl.attr('transform', transformVal);

        titleEl.style({
            'font-family': fontFamily,
            'font-size': d3.round(fontSize, 2) + 'px',
            fill: Color.rgb(fontColor),
            opacity: opacity * Color.opacity(fontColor),
            'font-weight': Plots.fontWeight
        })
        .attr(attributes)
        .call(svgTextUtils.convertToTspans, gd);

        return Plots.previousPromises(gd);
    }

    function scootTitle(titleElIn) {
        var titleGroup = d3.select(titleElIn.node().parentNode);

        if(avoid && avoid.selection && avoid.side && txt) {
            titleGroup.attr('transform', null);

            // move toward avoid.side (= left, right, top, bottom) if needed
            // can include pad (pixels, default 2)
            var backside = OPPOSITE_SIDE[avoid.side];
            var shiftSign = (avoid.side === 'left' || avoid.side === 'top') ? -1 : 1;
            var pad = isNumeric(avoid.pad) ? avoid.pad : 2;

            var titlebb = Drawing.bBox(titleGroup.node());
            var paperbb = {
                left: 0,
                top: 0,
                right: fullLayout.width,
                bottom: fullLayout.height
            };

            var maxshift = avoid.maxShift ||
                shiftSign * (paperbb[avoid.side] - titlebb[avoid.side]);
            var shift = 0;

            // Prevent the title going off the paper
            if(maxshift < 0) {
                shift = maxshift;
            } else {
                // so we don't have to offset each avoided element,
                // give the title the opposite offset
                var offsetLeft = avoid.offsetLeft || 0;
                var offsetTop = avoid.offsetTop || 0;
                titlebb.left -= offsetLeft;
                titlebb.right -= offsetLeft;
                titlebb.top -= offsetTop;
                titlebb.bottom -= offsetTop;

                // iterate over a set of elements (avoid.selection)
                // to avoid collisions with
                avoid.selection.each(function() {
                    var avoidbb = Drawing.bBox(this);

                    if(Lib.bBoxIntersect(titlebb, avoidbb, pad)) {
                        shift = Math.max(shift, shiftSign * (
                            avoidbb[avoid.side] - titlebb[backside]) + pad);
                    }
                });
                shift = Math.min(maxshift, shift);
            }

            if(shift > 0 || maxshift < 0) {
                var shiftTemplate = {
                    left: [-shift, 0],
                    right: [shift, 0],
                    top: [0, -shift],
                    bottom: [0, shift]
                }[avoid.side];
                titleGroup.attr('transform', strTranslate(shiftTemplate[0], shiftTemplate[1]));
            }
        }
    }

    el.call(titleLayout);
//Inpixon customisation - shows title when side=both for x-axis
if (
    xaxisSide === "both" ||
    xaxisSide === "bottom" ||
    xaxisSide === "top"
  ) {
    var ax = gd._fullLayout.xaxis;
    var axId = ax._id;
    var axLetter = axId.charAt(0);
    var fontSize = ax.title.font.size;
    var gs = gd._fullLayout._size;
    var side = ax.side;
    var anchorAxis;
    var titleStandoff;

    if (ax.title.hasOwnProperty("standoff")) {
      titleStandoff =
        ax._depth + ax.title.standoff + approxTitleDepth(ax);
    } else {
      var isInside = false;

      if (ax.type === "multicategory") {
        titleStandoff = ax._depth;
      } else {
        var offsetBase = 1.5 * fontSize;
        if (isInside) {
          offsetBase = 0.5 * fontSize;
          if (ax.ticks === "outside") {
            offsetBase += ax.ticklen;
          }
        }
        titleStandoff =
          10 + offsetBase + (ax.linewidth ? ax.linewidth - 1 : 0);
      }

      if (!isInside) {
        if (axLetter === "x") {
          titleStandoff +=
            ax.side === "top"
              ? fontSize * (ax.showticklabels ? 1 : 0)
              : fontSize * (ax.showticklabels ? 1.5 : 0.5);
        } else {
          titleStandoff +=
            ax.side === "right"
              ? fontSize * (ax.showticklabels ? 1 : 0.5)
              : fontSize * (ax.showticklabels ? 0.5 : 0);
        }
      }
    }
    if (ax.anchor !== "free") {
      anchorAxis = ax._anchorAxis;
    } else if (axLetter === "x") {
      anchorAxis = {
        _offset: gs.t + (1 - (ax.position || 0)) * gs.h,
        _length: 0,
      };
    } else if (axLetter === "y") {
      anchorAxis = {
        _offset: gs.l + (ax.position || 0) * gs.w,
        _length: 0,
      };
    }

    if (axLetter === "x") {
      var x, y;
      x = ax._offset + ax._length / 2;
      y = anchorAxis._offset - titleStandoff;
    } else {
      var x, y;
      y = ax._offset + ax._length / 2;
      x = anchorAxis._offset + titleStandoff;
      transform = { rotate: "-90", offset: 0 };
    }
    var xtitle_both = group_xboth
      .selectAll("text")
      .data(elShouldExist ? [0] : []);
    xtitle_both.enter().append("text");
    xtitleTop && xaxisSide === 'both'? xtitle_both.text(gd.layout.xaxis.title.text) :xtitle_both.text('') 
    xtitle_both
      .style({
        "font-family": fontFamily,
        "font-size": d3.round(fontSize, 2) + "px",
        fill: Color.rgb(fontColor),
        opacity:
          gd.layout.xaxis.side === "both"
            ? opacity * Color.opacity(fontColor)
            : "0",
        "font-weight": Plots.fontWeight,
      })
      .attr(attributes)
      .call(svgTextUtils.convertToTspans, gd);
    xtitle_both.attr("x", x);
    xtitle_both.attr("y", y);
    xtitle_both.exit().remove();

    var titleGroup = d3.select(xtitle_both.node().parentNode);

    if (avoid && avoid.selection && avoid.side && txt) {
      titleGroup.attr("transform", null);

      // move toward avoid.side (= left, right, top, bottom) if needed
      // can include pad (pixels, default 2)
      var backside = OPPOSITE_SIDE[avoid.side];
      var shiftSign =
        avoid.side === "left" || gd.layout.xaxis.side === "both"
          ? -1
          : 1;
      var pad = isNumeric(avoid.pad) ? avoid.pad : 2;

      var titlebb = Drawing.bBox(titleGroup.node());
      var paperbb = {
        left: 0,
        top: 0,
        right: fullLayout.width,
        bottom: fullLayout.height,
      };

      var maxshift =
        avoid.maxShift || shiftSign * (paperbb.top - titlebb.height);
      var shift = 0;

      // Prevent the title going off the paper
      if (maxshift < 0) {
        shift = maxshift;
      } else {
        // so we don't have to offset each avoided element,
        // give the title the opposite offset
        var offsetLeft = avoid.offsetLeft || 0;
        var offsetTop = avoid.offsetTop || 0;
        titlebb.left -= offsetLeft;
        titlebb.right -= offsetLeft;
        titlebb.top -= offsetTop;
        titlebb.bottom -= offsetTop;

        // iterate over a set of elements (avoid.selection)
        // to avoid collisions with
        avoid.selection.each(function () {
          var avoidbb = Drawing.bBox(this);

          if (Lib.bBoxIntersect(titlebb, avoidbb, pad)) {
            shift = Math.max(
              shift,
              shiftSign * (avoidbb[avoid.side] - titlebb[backside]) +
                pad
            );
          }
        });
        shift = Math.min(maxshift, shift);
      }

      titleGroup.attr("transform", strTranslate(shift, maxshift));
    }
  }
  //Inpixon customisation - shows title when side=both for y-axis
  if (
    yaxisSide === "both" ||
    yaxisSide === "left" ||
    yaxisSide === "right"
  ) {
    var ax = gd._fullLayout.yaxis;
    var axId = ax._id;
    var axLetter = axId.charAt(0);
    var fontSize = ax.title.font.size;
    var gs = gd._fullLayout._size;
    var side = ax.side;
    var anchorAxis;
    var titleStandoff;
    var avoid = options.avoid || {};
    if (ax.title.hasOwnProperty("standoff")) {
      titleStandoff =
        ax._depth + ax.title.standoff + approxTitleDepth(ax);
    } else {
      var isInside = false;

      if (ax.type === "multicategory") {
        titleStandoff = ax._depth;
      } else {
        var offsetBase = 1.5 * fontSize;
        if (isInside) {
          offsetBase = 0.5 * fontSize;
          if (ax.ticks === "outside") {
            offsetBase += ax.ticklen;
          }
        }
        titleStandoff =
          10 + offsetBase + (ax.linewidth ? ax.linewidth - 1 : 0);
      }

      if (!isInside) {
        if (axLetter === "x") {
          titleStandoff +=
            ax.side === "top"
              ? fontSize * (ax.showticklabels ? 1 : 0)
              : fontSize * (ax.showticklabels ? 1.5 : 0.5);
        } else {
          titleStandoff +=
            ax.side === "right"
              ? fontSize * (ax.showticklabels ? 1 : 0.5)
              : fontSize * (ax.showticklabels ? 0.5 : 0);
        }
      }
    }
    if (ax.anchor !== "free") {
      anchorAxis = ax._anchorAxis;
    } else if (axLetter === "y") {
      anchorAxis = {
        _offset: gs.l + (ax.position || 0) * gs.w,
        _length: 0,
      };
    }

    var x, y;
    y = ax._offset + ax._length / 2;
    x = anchorAxis._offset + anchorAxis._length + titleStandoff;
    var transform = { rotate: "-90", offset: 0 };

    var ytitle_both = group_yboth
      .selectAll("text")
      .data(elShouldExist ? [0] : []);
    ytitle_both.enter().append("text");
    ytitleRight && yaxisSide === 'both' ? ytitle_both.text(gd.layout.yaxis.title.text) : ytitle_both.text(''); 
    ytitle_both
      .style({
        "font-family": fontFamily,
        "font-size": d3.round(fontSize, 2) + "px",
        fill: Color.rgb(fontColor),
        opacity:
          gd.layout.yaxis.side === "both"
            ? opacity * Color.opacity(fontColor)
            : "0",
        "font-weight": Plots.fontWeight,
      })
      .attr(attributes)
      .call(svgTextUtils.convertToTspans, gd);
    ytitle_both.attr("transform", `rotate(-270 , ${x} , ${y})`); 
    ytitle_both.attr("x", x);
    ytitle_both.attr("y", y);
    ytitle_both.exit().remove();

    var titleGroup = d3.select(ytitle_both.node().parentNode);
    var avoid = options.avoid || {};
   
    
    if (avoid && avoid.selection && avoid.side && txt) {
      titleGroup.attr("transform", null);
      if (avoid.side === "left") {

        // move toward avoid.side (= left, right, top, bottom) if needed
        // can include pad (pixels, default 2)
        var backside = "left"; //left
        var shiftSign =
          avoid.side === "left" || avoid.side === "top" ? -1 : 1; //1
        var pad = isNumeric(avoid.pad) ? avoid.pad : 2;

        var titlebb = Drawing.bBox(titleGroup.node());
        var paperbb = {
          left: 0,
          top: 0,
          right: fullLayout.width,
          bottom: fullLayout.height,
        };
        var maxshift =
          avoid.maxShift ||
          shiftSign * (paperbb[avoid.side] - titlebb[avoid.side]); 
        var shift = 0;

        // Prevent the title going off the paper
        if (maxshift < 0) {
          shift = maxshift; 
        } else {
          // so we don't have to offset each avoided element,
          // give the title the opposite offset
          var offsetLeft = avoid.offsetLeft || 0;
          var offsetTop = avoid.offsetTop || 0;
          titlebb.left -= offsetLeft; 
          titlebb.right -= offsetLeft; 
          titlebb.top -= offsetTop; 
          titlebb.bottom -= offsetTop; 

          // iterate over a set of elements (avoid.selection)
          // to avoid collisions with
          avoid.selection.each(function () {
            
              var avoidbb = Drawing.bBox(this);
            shift = Math.max(
              shift,
              shiftSign * (avoidbb.right - titlebb.top)
            );
          });
          shift = Math.min(maxshift, shift); 
        }

        if (shift > 0 || maxshift < 0) {
          var shiftTemplate = {
            left: [-shift, 0],
            right: [shift, 0],
            top: [0, -shift],
            bottom: [0, shift],
          }["right"];
          titleGroup.attr(
            "transform",
            strTranslate(shiftTemplate[0], shiftTemplate[1])
          );
        }
      }
    }
  }
    function setPlaceholder() {
        opacity = 0;
        isplaceholder = true;
        el.text(placeholder)
            .on('mouseover.opacity', function() {
                d3.select(this).transition()
                    .duration(interactConstants.SHOW_PLACEHOLDER).style('opacity', 1);
            })
            .on('mouseout.opacity', function() {
                d3.select(this).transition()
                    .duration(interactConstants.HIDE_PLACEHOLDER).style('opacity', 0);
            });
    }

    if(editable) {
        if(!txt) setPlaceholder();
        else el.on('.opacity', null);

        el.call(svgTextUtils.makeEditable, {gd: gd})
            .on('edit', function(text) {
                if(traceIndex !== undefined) {
                    Registry.call('_guiRestyle', gd, prop, text, traceIndex);
                } else {
                    Registry.call('_guiRelayout', gd, prop, text);
                }
            })
            .on('cancel', function() {
                this.text(this.attr('data-unformatted'))
                    .call(titleLayout);
            })
            .on('input', function(d) {
                this.text(d || ' ')
                    .call(svgTextUtils.positionText, attributes.x, attributes.y);
            });
    }
    el.classed('js-placeholder', isplaceholder);

    return group;
}

module.exports = {
    draw: draw
};
