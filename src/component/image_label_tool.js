import React, { Component } from 'react';
import boundingbox from './boundingbox.js';
import pcdLabelTool from './pcd_label_tool.js';
import baseBabelTools from './base_label_tool.js';
import $ from 'jquery';
window.$ = $;

export default class ImageLabelTools extends Component {
  constructor(props){
    super(props);
    this.state ={
      canvasArray : [],
      canvasParamsArray : [{}, {}, {}, {}, {}, {}],
      paperArray : [],
      paperArrayAll : [],
      imageArray : [],
      imageArrayAll : [],
      fontSize : 20,
      isDragging : false, // For distinguishing click and drag.
      action : "add",
      mouseX : 0,
      mouseY : 0,
    };
  }

  remove = (index) => {
    // TODO: highlight 12 lines (draw 4 transparent (0.5) parallelograms and 2 transparent rectangles (front and rear))
    // removeBoundingBoxHighlight(index);
    this.removeTextBox(index);
  }

  /*********** Event handlers **************/

  // annotationObjects.onRemove("CAMERA", function (index) {
  //     this.remove(index);
  // });

  select = (newIndex, channel) => {

      for (let i = 0; i < this.props.contents[this.state.currentFileIndex].length; i++) {
          // if (annotationObjects.contents[i]["rect"] !== undefined) {
          //     removeBoundingBoxHighlight(i);
          // }
          if (this.props.contents[this.state.currentFileIndex][i]["text"] !== undefined) {
              this.removeTextBox(i);
          }

      }
      if (this.props.contents[this.state.currentFileIndex][newIndex]["channels"][0].channel === channel) {
          if (this.props.contents[this.state.currentFileIndex][newIndex]["channels"][0]["lines"] !== undefined && this.props.contents[this.state.currentFileIndex][newIndex]["channels"][0]["lines"][0] !== undefined
              && !isNaN(this.props.contents[this.state.currentFileIndex][newIndex]["channels"][0]["lines"][0]) && isFinite(this.props.contents[this.state.currentFileIndex][newIndex]["channels"][0]["lines"][0])) {
              // if (annotationObjects.contents[newIndex]["rect"] !== undefined) {
              // emphasize only possible if 2D bb exists
              this.addTextBox(newIndex, channel);
              // emphasizeBBox(newIndex, channel);
          }
      } else {
          if (this.props.contents[this.state.currentFileIndex][newIndex]["channels"][1]["lines"] !== undefined && this.props.contents[this.state.currentFileIndex][newIndex]["channels"][1]["lines"][0] !== undefined
              && !isNaN(this.props.contents[this.state.currentFileIndex][newIndex]["channels"][1]["lines"][0]) && isFinite(this.props.contents[this.state.currentFileIndex][newIndex]["channels"][1]["lines"][0])) {
              this.addTextBox(newIndex, channel);
          }
      }

      // unhighlight bb in BEV
      for (let mesh in this.props.cubeArray[this.state.currentFileIndex]) {
          let meshObject = this.props.cubeArray[this.state.currentFileIndex][mesh];
          meshObject.material.opacity = 0.9;
      }
      // highlight selected bb in BEV
      if (this.props.cubeArray[this.state.currentFileIndex][newIndex] !== undefined) {
        this.props.cubeArray[this.state.currentFileIndex][newIndex].material.opacity = 0.1;
      }
  }

  // annotationObjects.onSelect("CAM_FRONT_LEFT", function (newIndex) {
  //     select(newIndex, "CAM_FRONT_LEFT");
  // });

  // annotationObjects.onSelect("CAM_FRONT", function (newIndex) {
  //     select(newIndex, "CAM_FRONT");
  // });

  // annotationObjects.onSelect("CAM_FRONT_RIGHT", function (newIndex) {
  //     select(newIndex, "CAM_FRONT_RIGHT");
  // });

  // annotationObjects.onSelect("CAM_BACK_RIGHT", function (newIndex) {
  //     select(newIndex, "CAM_BACK_RIGHT");
  // });

  // annotationObjects.onSelect("CAM_BACK", function (newIndex) {
  //     select(newIndex, "CAM_BACK");
  // });

  // annotationObjects.onSelect("CAM_BACK_LEFT", function (newIndex) {
  //     select(newIndex, "CAM_BACK_LEFT");
  // });

  initialize = (camChannel) => {
      let canvas = this.state.canvasArray[this.getChannelIndexByName(camChannel)];
      this.state.canvasParamsArray[this.getChannelIndexByName(camChannel)] = {
          x: canvas.offsetLeft,
          y: canvas.offsetTop,
          width: canvas.offsetWidth,
          height: canvas.offsetHeight,
          center: {x: canvas.offsetWidth / 2, y: canvas.offsetHeight / 2}
      };
      let width;
      let height;
      if (this.state.currentDataset === this.state.datasets.NuScenes) {
          width = 320;
          height = 180;
      }
      this.changeCanvasSize(width, height, camChannel);
      this.props.addResizeEventForImage();
  }

  // labelTool.onInitialize("CAM_FRONT_LEFT", function () {
  //     initialize("CAM_FRONT_LEFT");
  // });

  // labelTool.onInitialize("CAM_FRONT", function () {
  //     initialize("CAM_FRONT");
  // });

  // labelTool.onInitialize("CAM_FRONT_RIGHT", function () {
  //     initialize("CAM_FRONT_RIGHT");
  // });

  // labelTool.onInitialize("CAM_BACK_RIGHT", function () {
  //     initialize("CAM_BACK_RIGHT");
  // });

  // labelTool.onInitialize("CAM_BACK", function () {
  //     initialize("CAM_BACK");
  // });

  // labelTool.onInitialize("CAM_BACK_LEFT", function () {
  //     initialize("CAM_BACK_LEFT");
  // });

  loadCameraImages = (camChannel, fileIndex) => {

    const imageArray = this.state.imageArray;

      let imgPath = "input/" + this.state.currentDataset + "/" + this.state.currentSequence + "/images/" + camChannel + "/" + this.state.fileNames[fileIndex] + ".jpg";
      let channelIdx = this.getChannelIndexByName(camChannel);
      let paper = this.state.paperArrayAll[fileIndex][channelIdx];
      this.state.imageArray[channelIdx] = paper.image(imgPath, 0, 0, "100%", "100%");
  }

  changeClass = (bbIndex, newClass) => {
      let annotation = this.props.contents[this.state.currentFileIndex][bbIndex];
      let color = this.props.BoundingBoxClassify[newClass].color;
      // update color in all 6 channels
      for (let i = 0; i < annotation["channels"].length; i++) {
          if (annotation["channels"][i]["lines"] !== undefined && annotation["channels"][i]["lines"][0] !== undefined) {
              for (let lineObj in annotation["channels"][i]["lines"]) {
                  if (annotation["channels"][i]["lines"].hasOwnProperty(lineObj)) {
                      let line = annotation["channels"][i]["lines"][lineObj];
                      line.attr({stroke: color});
                  }
              }
          }
      }
  }

  // annotationObjects.onChangeClass("CAM_FRONT_LEFT", function (bbIndex, newClass) {
  //     changeClass(bbIndex, newClass);
  // });

  // annotationObjects.onChangeClass("CAM_FRONT", function (bbIndex, newClass) {
  //     changeClass(bbIndex, newClass);
  // });

  // annotationObjects.onChangeClass("CAM_FRONT_RIGHT", function (bbIndex, newClass) {
  //     changeClass(bbIndex, newClass);
  // });

  // annotationObjects.onChangeClass("CAM_BACK_RIGHT", function (bbIndex, newClass) {
  //     changeClass(bbIndex, newClass);
  // });

  // annotationObjects.onChangeClass("CAM_BACK", function (bbIndex, newClass) {
  //     changeClass(bbIndex, newClass);
  // });

  // annotationObjects.onChangeClass("CAM_BACK_LEFT", function (bbIndex, newClass) {
  //     changeClass(bbIndex, newClass);
  // });

  // $(window).keydown(function (e) {
  //     let keyCode = e.which.toString();
  //     if (e.shiftKey) {
  //         keyCode += "SHIFT";
  //     }
  //     switch (keyCode) {
  //         case "78": // N
  //             labelTool.nextFrame();
  //             break;
  //         case "66": // B
  //             labelTool.previousFrame();
  //             break;
  //     }
  //     setAction(e);
  // });

  setCursor(cursorType) {
      for (let img in this.state.this.state.imageArray) {
          let imgObj = this.state.imageArray[img];
          imgObj.attr({cursor: cursorType});
      }
  }

  convertPositionToPaper(e) {
      return {
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          pageX: e.pageX,
          pageY: e.pageY,
          which: e.which
      };
  }

  setAction(e) {
      if (this.state.isDragging) {
          return;
      }
      this.setCursor("hand");//crosshair
      // action = "add";
      // let bbox = undefined;
      // let selectedBoundingBox = annotationObjects.getSelectedBoundingBox();
      // if (selectedBoundingBox !== undefined) {
      //     bbox = selectedBoundingBox;
      // } else {
      //     return;
      // }

      // var targetRect = bbox["rect"];
      // if (e.offsetX < targetRect.attr("x") - 5 ||
      //     e.offsetX > targetRect.attr("x") + targetRect.attr("width") + 5 ||
      //     e.offsetY < targetRect.attr("y") - 5 ||
      //     e.offsetY > targetRect.attr("y") + targetRect.attr("height") + 5) {
      //     return;
      // }
      // grabbedSide = "";
      // if (e.offsetX <= targetRect.attr("x") + 2) {
      //     grabbedSide += "left";
      // }
      // if (e.offsetX >= targetRect.attr("x") + targetRect.attr("width") - 2) {
      //     grabbedSide += "right";
      // }
      // if (e.offsetY <= targetRect.attr("y") + 2) {
      //     grabbedSide += "top";
      // }
      // if (e.offsetY >= targetRect.attr("y") + targetRect.attr("height") - 2) {
      //     grabbedSide += "bottom";
      // }
      // if (grabbedSide == "") {
      //     setCursor("all-scroll");
      //     action = "move";
      // } else {
      //     action = "resize";
      //     if (grabbedSide == "left" || grabbedSide == "right") {
      //         setCursor("ew-resize");
      //     } else if (grabbedSide == "top" || grabbedSide == "bottom") {
      //         setCursor("ns-resize");
      //     } else if (grabbedSide == "lefttop" || grabbedSide == "rightbottom") {
      //         setCursor("nwse-resize");
      //     } else {
      //         setCursor("nesw-resize");
      //     }
      // }
  }

  addEventsToImage(img) {

      const mouseX = this.state.mouseX;
      const mouseY = this.state.mouseY;

      img.mousemove(function (e) {
          let e2 = this.convertPositionToPaper(e);
          mouseX = e.offsetX;
          mouseY = e.offsetY;
          this.setAction(e2);
      });

      img.mousedown(function (e) {
          let e2 = this.convertPositionToPaper(e);
          // 3: rightclick
          if (e2.which != 3 || this.state.isDragging) {
              return;
          }
          let clickedBBIndex = this.getClickedIndex(e2);
          if (clickedBBIndex != -1) {
            this.props.remove(clickedBBIndex);
            this.props.selectEmpty();
          } else {
              // no bounding box was selected
              // remove selection from current target
              let selectedBBIndex = this.props.getSelectionIndex();
              // removeBoundingBoxHighlight(selectedBBIndex);
              this.removeTextBox(selectedBBIndex);
          }
      });

      // imgLeft.drag(
      //     //on drag
      //     function (dx, dy, x, y, e) {
      //         $("#label-tool-log").val("2. Activate current bounding box");
      //         $("#label-tool-log").css("color", "#969696");
      //         var e2 = convertPositionToPaper(e);
      //         if (e2.which != 1) {
      //             isDragging = false;
      //         }
      //         if (e2.which == 0) {
      //             // return if right click and in drag mode
      //             return;
      //         }
      //         if (isOutOfCanvas(e2.pageX, e2.pageY)) {
      //             return;
      //         }
      //         var minSize = classesBoundingBox.target().minSize;
      //         var minX = minSize.x;
      //         var minY = minSize.y;
      //         switch (action) {
      //             case "add":
      //                 var rect = drawingRectLeft;
      //                 var width = e2.offsetX - startX;
      //                 var height = e2.offsetY - startY;
      //                 if (!isDragging && (Math.abs(width) > 1 || Math.abs(height) > 1)) {
      //                     isDragging = true;
      //                 }
      //                 if (width < 0) {
      //                     rect.attr({width: -width, x: e2.offsetX});
      //                 } else {
      //                     rect.attr({width: width, x: startX});
      //                 }
      //                 if (height < 0) {
      //                     rect.attr({height: -height, y: e2.offsetY});
      //                 } else {
      //                     rect.attr({height: height, y: startY});
      //                 }
      //                 break;
      //             case "resize":
      //                 var bbox = annotationObjects.getSelectedBoundingBox("ImageLeft");
      //                 var rect = bbox["rect"];
      //                 if (grabbedSide.match(/left/)) {
      //                     var validX = Math.min(e2.offsetX, rect.attr("x") + rect.attr("width") - minX);
      //                     rect.attr({x: validX, width: rect.attr("x") + rect.attr("width") - validX});
      //                     var textBoxDict = annotationObjects.getSelectedBoundingBox("ImageLeft")["textBox"];
      //                     textBoxDict["text"].attr({x: rect.attr("x")});
      //                     textBoxDict["box"].attr({x: rect.attr("x")});
      //                 }
      //                 if (grabbedSide.match(/right/)) {
      //                     var validX = Math.max(e2.offsetX, rect.attr("x") + minX);
      //                     rect.attr({width: validX - rect.attr("x")});
      //                 }
      //                 if (grabbedSide.match(/top/)) {
      //                     var validY = Math.min(e2.offsetY, rect.attr("y") + rect.attr("height") - minY);
      //                     rect.attr({y: validY, height: rect.attr("y") + rect.attr("height") - validY});
      //                     var textBoxDict = annotationObjects.getSelectedBoundingBox("ImageLeft")["textBox"];
      //                     textBoxDict["text"].attr({y: rect.attr("y") - fontSize / 2});
      //                     textBoxDict["box"].attr({y: rect.attr("y") - fontSize});
      //                 }
      //                 if (grabbedSide.match(/bottom/)) {
      //                     var validY = Math.max(e2.offsetY, rect.attr("y") + minY);
      //                     rect.attr({height: validY - rect.attr("y")});
      //                 }
      //                 emphasizeBBox(annotationObjects.getSelectionIndex(), "ImageLeft");
      //                 break;
      //             case "move":
      //                 var rect = annotationObjects.getSelectedBoundingBox("ImageLeft")["rect"];
      //                 var newRectX = e2.offsetX - grabbedPosition.x;
      //                 var newRectY = e2.offsetY - grabbedPosition.y;
      //                 if (newRectX + rect.attr("width") > canvasLeftParams.width) {
      //                     newRectX = canvasLeftParams.width - rect.attr("width");
      //                 } else if (newRectX < 0) {
      //                     newRectX = 0;
      //                 }
      //                 if (newRectY + rect.attr("height") > canvasLeftParams.height) {
      //                     newRectY = canvasLeftParams.height - rect.attr("height");
      //                 } else if (newRectY < 0) {
      //                     newRectY = 0;
      //                 }
      //                 rect.attr({x: newRectX, y: newRectY});
      //                 var textBox = annotationObjects.getSelectedBoundingBox("ImageLeft")["textBox"];
      //                 textBox["text"].attr({x: newRectX, y: newRectY - fontSize / 2});
      //                 textBox["box"].attr({x: newRectX, y: newRectY - fontSize});
      //                 emphasizeBBox(annotationObjects.getSelectionIndex(), "ImageLeft");
      //                 break;
      //         }
      //
      //     },

      // //on click
      // function (x, y, e) {
      //     var e2 = convertPositionToPaper(e);
      //     if (e2.which != 1) {
      //         return;
      //     }
      //     switch (action) {
      //         case "add":
      //             drawingRectLeft = paperLeft.rect(e2.offsetX, e2.offsetY, 0, 0);
      //             drawingRectLeft.attr({
      //                 stroke: classesBoundingBox.target().color,
      //                 "stroke-width": 3
      //             });
      //             drawingRectLeft.node.setAttribute("pointer-events", "none");
      //             startX = e2.offsetX;
      //             startY = e2.offsetY;
      //             break;
      //         case "resize":
      //             isDragging = true;
      //             break;
      //         case "move":
      //             isDragging = true;
      //             if (annotationObjects.getSelectedBoundingBox("ImageLeft") == undefined) {
      //                 return;
      //             }
      //             grabbedPosition.x = e2.offsetX - annotationObjects.getSelectedBoundingBox("ImageLeft")["rect"].attr("x");
      //             grabbedPosition.y = e2.offsetY - annotationObjects.getSelectedBoundingBox("ImageLeft")["rect"].attr("y");
      //             break;
      //     }
      // },
      //
      // //on end
      // function (e) {
      //     var e2 = convertPositionToPaper(e);
      //     var rectX;
      //     var rectY;
      //     var rectHeight;
      //     var rectWidth;
      //     if (drawingRectLeft != undefined && drawingRectLeft != null) {
      //         rectX = drawingRectLeft.attr("x");
      //         rectY = drawingRectLeft.attr("y");
      //         rectWidth = drawingRectLeft.attr("width");
      //         rectHeight = drawingRectLeft.attr("height");
      //         drawingRectLeft.remove();
      //     } else {
      //         return;
      //     }
      //     if (e2.which != 1) {
      //         return;
      //     }
      //     if (!isDragging) {
      //         // remove all previous selections in camera image
      //         for (var i = 0; i < annotationObjects.contents.length; i++) {
      //             removeBoundingBoxHighlight(i,"ImageLeft");
      //             removeTextBox(i,"ImageLeft");
      //         }
      //         // remove all previous selections in birds eye view (lower opacity)
      //         for (var mesh in labelTool.cubeArray[this.state.currentFileIndex][this.state.currentCameraChannelIndex]) {
      //             var meshObject = labelTool.cubeArray[this.state.currentFileIndex][this.state.currentCameraChannelIndex][mesh];
      //             meshObject.material.opacity = 0.1;
      //         }
      //         var selectedBoundingBoxIndex = getClickedIndex(e2,"ImageLeft");
      //         annotationObjects.select(selectedBoundingBoxIndex);
      //         if (selectedBoundingBoxIndex !== -1) {
      //             // select class in class selection list
      //             var label = annotationObjects.contents[selectedBoundingBoxIndex]["class"];
      //             var selectedClassIndex = classesBoundingBox[label].index;
      //             $('#class-picker ul li').css('background-color', '#323232');
      //             $($('#class-picker ul li')[selectedClassIndex]).css('background-color', '#525252');
      //         }
      //         setAction(e2);
      //         return;
      //     }
      //     isDragging = false;
      //     switch (action) {
      //         case "add":
      //             if (rectWidth < classesBoundingBox.target().minSize.x ||
      //                 rectHeight < classesBoundingBox.target().minSize.y) {
      //                 return;
      //             }
      //
      //
      //             var params = {
      //                 x: rectX,
      //                 y: rectY,
      //                 width: rectWidth,
      //                 height: rectHeight,
      //                 trackId: -1
      //             };
      //             var selectedBoundingBoxIndex = annotationObjects.getSelectionIndex();
      //             if (selectedBoundingBoxIndex !== -1) {
      //                 // a bounding box was already selected
      //                 // replace the selected bounding box with the new one
      //                 // use track id of that selected bounding box
      //                 var label = classesBoundingBox.targetName();
      //                 var trackId = annotationObjects.contents[selectedBoundingBoxIndex]["trackId"];
      //                 params.trackId = trackId;
      //                 annotationObjects.remove(selectedBoundingBoxIndex, "ImageLeft");
      //
      //                 annotationObjects.setSelection(selectedBoundingBoxIndex, "ImageLeft", params, label, false);
      //                 // select class in class selection list
      //                 var selectedClassIndex = classesBoundingBox[label].index;
      //                 $('#class-picker ul li').css('background-color', '#323232');
      //                 $($('#class-picker ul li')[selectedClassIndex]).css('background-color', '#525252');
      //                 // annotationObjects.select(selectedBoundingBoxIndex);
      //             } else {
      //                 // insert new object (bounding box)
      //                 var insertIndex = annotationObjects.__insertIndex;
      //                 var trackId = classesBoundingBox.target().nextTrackId;
      //                 params.trackId = trackId;
      //                 annotationObjects.setSelection(insertIndex, "ImageLeft", params, classesBoundingBox.targetName(), false);
      //                 // annotationObjects.selectTail();
      //                 classesBoundingBox.target().nextTrackId++;
      //             }
      //             annotationObjects.selectEmpty();
      //             drawingRectLeft.remove();
      //             break;
      //         case "resize":
      //             break;
      //         case "move":
      //             break;
      //     }
      //     setAction(e2);
      // }
      // );
  }

  // function toggleIsolation() {
  //     if (isIsolated) {
  //         showAllBoundingBoxes();
  //     } else {
  //         hideAllBoundingBoxes();
  //     }
  //     isIsolated = !isIsolated;
  // }

  // function hideAllBoundingBoxes(index) {
  //     var targetIndex;
  //     if (index == undefined) {
  //         targetIndex = annotationObjects.getSelectionIndex();
  //     } else {
  //         targetIndex = index;
  //     }
  //     for (var i = 0; i < annotationObjects.length(); ++i) {
  //         if (i != targetIndex) {
  //             hideImageBBox(i);
  //         } else {
  //             showImageBBox(i);
  //         }
  //     }
  // }

  // function showAllBoundingBoxes() {
  //     for (var i = 0; i < annotationObjects.length(); ++i) {
  //         if (i != annotationObjects.getSelectionIndex()) {
  //             showImageBBox(i);
  //         }
  //     }
  // }

  isWithinPolygon(numVertices, xPosArray, yPosArray, mouseXPos, mouseYPos) {
      let i, j, c = false;
      for (i = 0, j = numVertices - 1; i < numVertices; j = i++) {
          if (((yPosArray[i] > mouseYPos) != (yPosArray[j] > mouseYPos)) &&
              (mouseXPos < (xPosArray[j] - xPosArray[i]) * (mouseYPos - yPosArray[i]) / (yPosArray[j] - yPosArray[i]) + xPosArray[i])) {
              c = !c;
          }
      }
      return c;
  }

  /**
   * Iterate all bounding boxes and check which one was selected
   * @param e
   * @returns {*}
   */
  getClickedIndex(e) {
      let mouseXPos = e.offsetX;
      let mouseYPos = e.offsetY;
      let targetIndex = -1;
      for (let i = 0; i < this.props.contents[this.state.currentFileIndex].length; i++) {
          for (let j = 0; j < this.props.contents[this.state.currentFileIndex][i]["channels"].length; j++) {
              let points2D = this.props.contents[this.state.currentFileIndex][i]["channels"][j]["points2D"];
              let xPosArray = [];
              let yPosArray = [];
              for (let k = 0; k < points2D.length; k++) {
                  xPosArray.push(points2D[k].x);
                  yPosArray.push(points2D[k].y);
              }
              if (this.isWithinPolygon(points2D.length, xPosArray, yPosArray, mouseXPos, mouseYPos)) {
                  return i;
              }
          }
          // var rect = annotationObjects.contents[i]["rect"];
          // if (e.offsetX >= rect.attr("x") &&
          //     e.offsetX <= rect.attr("x") + rect.attr("width") &&
          //     e.offsetY >= rect.attr("y") &&
          //     e.offsetY <= rect.attr("y") + rect.attr("height")) {
          //     targetIndex = i;
          //     return i;
          // }
      }
      return targetIndex;
  }

  // 임시 주석
  // for (let canvasElem in canvasArray) {
  //     let canvas = canvasArray[canvasElem];
  //     addEvent(canvas, 'contextmenu', function (e) {
  //         return cancelDefault(e);
  //     });
  // }

  cancelDefault(e) {
      e = e || window.event;
      if (e.stopPropagation) e.stopPropagation();
      if (e.preventDefault) e.preventDefault();
      e.cancelBubble = false;
      return false;
  }

  addEvent(element, trigger, action) {
      if (typeof element === "string") {
          element = document.getElementById(element);
      }
      if (element.addEventListener) {
          element.addEventListener(trigger, action, false);
          return true;
      }
      else if (element.attachEvent) {
          element['e' + trigger + action] = action;
          element[trigger + action] = function () {
              element['e' + trigger + action](window.event);
          };
          let r = element.attachEvent('on' + trigger, element[trigger + action]);
          return r;
      }
      else {
          element['on' + trigger] = action;
          return true;
      }
  }

  getChannelIndexByName(camChannel) {
      for (let channelObj in this.props.camChannels) {
          if (this.props.camChannels.hasOwnProperty(channelObj)) {
              let channelObject = this.props.camChannels[channelObj];
              if (camChannel === channelObject.channel) {
                  return this.props.camChannels.indexOf(channelObject);
              }
          }
      }
  }

  changeCanvasSize(width, height, camChannel) {
      let channelIdx = this.getChannelIndexByName(camChannel);
      let paper = this.state.paperArray[channelIdx];
      let canvas = this.state.canvasArray[channelIdx];

      const fontSize = this.state.fontSize;

      // for (let canvasElem in canvasArray) {
      // let canvasElement = canvasArray[canvasElem];
      let element = $("#" + canvas.id);
      element.css('width', width + 'px');
      element.css('height', height + 'px');
      // }
      paper.setViewBox(0, 0, width, height, true);
      paper.setSize("100%", "100%");
      fontSize = canvas.offsetWidth / 50;
      if (fontSize < 15) {
          fontSize = 15;
      }

      this.state.canvasParamsArray[channelIdx] = {
          x: canvas.offsetLeft,
          y: canvas.offsetTop,
          width: canvas.offsetWidth,
          height: canvas.offsetHeight,
          center: {x: canvas.offsetWidth / 2, y: canvas.offsetHeight / 2}
      };
      console.log('resize');
      // redraw canvas
      // $('#image-' + camChannel.toLowerCase().replace(/_/g, '-')).hide().show(0);
  }

  adjustAllBBoxes(camChannel) {
  }

  addTextBox(bbIndex, camChannel) {
      let bbox = this.props.contents[this.state.currentFileIndex][bbIndex];
      let trackId = bbox["trackId"];
      let channelIdx = this.getChannelIndexByName(camChannel);
      let posX = bbox["channels"][channelIdx]["lines"][5].attr("x");
      let posY = bbox["rect"].attr("y");
      let label = bbox["class"];
      let firstLetterOfClass = label.charAt(0);
      let paper = this.state.paperArray[this.getChannelIndexByName(camChannel)];
      bbox["textBox"] =
          {
              text: paper.text(posX, posY - this.state.fontSize / 2, "#" + firstLetterOfClass + trackId + " " + label)
                  .attr({
                      fill: "black",
                      "font-size": this.state.fontSize,
                      "text-anchor": "start"
                  })
          };
      let box = bbox["textBox"]["text"].getBBox();
      bbox["textBox"]["box"] = paper.rect(box.x, box.y, box.width, box.height)
          .attr({
              fill: this.props.BoundingBoxClassify[label].color,
              stroke: "none"
          });
      bbox["textBox"]["box"].node.setAttribute("pointer-events", "none");
      bbox["textBox"]["text"].node.setAttribute("pointer-events", "none");
      bbox["textBox"]["text"].toFront();
  }

  removeTextBox = (index) => {
      let bbox = this.props.contents[this.state.currentFileIndex][index];
      if (bbox["textBox"] === undefined) {
          return;
      }
      bbox["textBox"]["text"].remove();
      bbox["textBox"]["box"].remove();
      delete bbox["textBox"];
  }

  bboxString = (index, label) => {
      let firstLetterOfClass = label.charAt(0);
      let trackId = index + 1;
      return "#" + firstLetterOfClass + trackId.toString() + " " + label;
      // TODO: adjust text length corresponding to font size
      // if (fontSize === 15) {
      // }
  }

  adjustTextBox = (index) => {
      let rect = this.props.contents[this.state.currentFileIndex][index]["rect"];
      let textBox = this.props.contents[this.state.currentFileIndex][index]["textBox"];
      textBox["text"].attr({x: rect.attr("x"), y: rect.attr("y") - this.state.fontSize / 2});
      textBox["box"].attr({x: rect.attr("x"), y: rect.attr("y") - this.state.fontSize - 1});
  }

  render(){ 
    return(
      <pcdLabelTool 
        getChannelIndexByName = {()=>this.getChannelIndexByName}
        paperArrayAll ={this.state.paperArrayAll}
      />

    )
  }
}

